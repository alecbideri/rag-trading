import React, { useEffect, useState } from 'react';
import StockTile from './StockTile';
import StockDetails from './StockDetails';
import { fetchStockQuote } from '../services/api';

const DEFAULT_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];

export default function Dashboard({ onSelectStock, onDataLoaded }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    async function loadData() {
      const promises = DEFAULT_TICKERS.map(async (ticker) => {
        try {
          // Attempt fetch, but fallback to STABLE mock data if needed
          const data = await fetchStockQuote(ticker);

          // Generate a stable-ish mock price based on ticker string char codes if no real data
          // This prevents "crazy" random jumping on every reload if API fails
          const seed = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const basePrice = (seed % 500) + 50;

          if (!data || !data.results || !data.results[0]) {
            // Use sin/cos of seed to create "random" but stable variations
            const stableRandom = Math.abs(Math.sin(seed));
            // Generate mock OHLC history
            const history = Array.from({ length: 20 }, (_, i) => {
              const prevC = i === 0 ? basePrice : basePrice * (1 + Math.sin(i + seed - 1) * 0.05);
              const currC = basePrice * (1 + Math.sin(i + seed) * 0.05);
              const open = prevC;
              const close = currC;
              const high = Math.max(open, close) * (1 + Math.random() * 0.01);
              const low = Math.min(open, close) * (1 - Math.random() * 0.01);
              return { o: open, h: high, l: low, c: close, time: i };
            });

            return {
              ticker,
              c: basePrice.toFixed(2),
              p: (basePrice * (1 + (stableRandom * 0.05 - 0.025))).toFixed(2),
              history
            };
          }
          return {
            ticker,
            ...data.results[0],
            // Mock OHLC if missing from real API
            history: Array.from({ length: 20 }, (_, i) => {
              const price = (data.results[0].c || 100) * (1 + Math.sin(i) * 0.02);
              return { o: price, h: price * 1.01, l: price * 0.99, c: price, time: i };
            })
          };
        } catch (e) {
          const seed = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const basePrice = (seed % 500) + 50;
          const history = Array.from({ length: 20 }, (_, i) => {
            const currC = basePrice * (1 + Math.sin(i + seed) * 0.05);
            return { o: currC, h: currC * 1.01, l: currC * 0.99, c: currC, time: i };
          });

          return {
            ticker,
            c: basePrice.toFixed(2),
            p: basePrice.toFixed(2),
            history
          };
        }
      });

      const results = await Promise.all(promises);
      const formatted = results.map(r => ({
        ticker: r.ticker,
        price: r.c || r.o || 0, // Close or Open
        change: r.c && r.p ? ((r.c - r.p) / r.p * 100).toFixed(2) : '0.00',
        history: r.history
      }));

      setStocks(formatted);
      setLoading(false);
      if (onDataLoaded) onDataLoaded(formatted);
    }

    loadData();
  }, [onDataLoaded]);

  return (
    <div className="p-8 max-w-7xl mx-auto relative z-10">
      {/* Hero Section */}
      <div className="mb-20 mt-10 text-center">
        <h1 className="text-6xl font-bold text-green-500 mb-6 drop-shadow-2xl tracking-tight">
          Testing RAG using trading data
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Real-time assessment of market trends powered by Massive data and DeepSeek AI analysis.
        </p>
      </div>

      <h2 className="text-3xl font-light text-white mb-8 border-l-4 border-green-500 pl-4">
        Market <span className="text-green-400 font-bold">Overview</span>
      </h2>

      {loading ? (
        <div className="text-green-400 animate-pulse">Scanning market data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stocks.map(stock => (
            <StockTile
              key={stock.ticker}
              ticker={stock.ticker}
              price={stock.price}
              change={stock.change}
              history={stock.history.map(h => h.c)} // Pass only closing prices to tile sparkline
              onClick={() => {
                setSelectedStock(stock);
                onSelectStock(stock);
              }}
            />
          ))}
        </div>
      )}

      {/* Detailed Analysis Section (Charts below cards) */}
      <div className="mt-12">
        <h2 className="text-2xl font-light text-white mb-6 border-l-4 border-green-500 pl-4">
          Detailed <span className="text-green-500 font-bold">Analysis</span>
        </h2>
        {/* We assume the first stock is selected by default or user selection state */}
        <StockDetails stock={selectedStock || stocks[0]} />
      </div>
    </div>
  );
}
