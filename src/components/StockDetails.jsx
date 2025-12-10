import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// Custom shape for Candlestick
const Candlestick = (props) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isGrowing = close > open;
  const color = isGrowing ? '#22c55e' : '#ef4444';
  const ratio = Math.abs(height / (open - close)); // Scaling factor

  // Calculate relative positions (simplified pixels)
  // Recharts passes generic props, we mostly need x + width/2 for center
  // But standard BarChart data mapping might be easier if we control the rendering fully.
  // Actually, we can use the props directly passed by Recharts if we map data correctly.

  // Alternative: Using standard SVG lines based on the payload (data point)
  // payload contains: { o, h, l, c, ... }
  const { payload } = props;

  // We need the Scaled values. Recharts "Bar" passes x, y, width, height for the *bar body*.
  // But for wicks (high/low), we need the scale. 
  // A cleaner way in Recharts custom shapes is to access the YAxis scale, but that's hard.
  // Workaround: We will stick to a simplified representation or use a Composed Chart with error bars if possible.
  // BUT, implementing a raw SVG candle is easier if we trust the "y" and "height" represent the [min, max] range if we configure the Bar that way.

  // Let's rely on a simpler approach: 
  // Use Bar for the Body (Open to Close).
  // Use ErrorBar or a separate Line for the Wick (High to Low).
  // However, getting them to align is tricky with standard Recharts components.

  // Let's use the Bar chart but purely custom shape that draws everything.
  // The 'y' and 'height' passed to this shape correspond to the value of the "dataKey".
  // If we set dataKey="h", the bar goes from 0 to High. That's not what we want.

  // Let's try the switch approach: Line Chart (Area) vs Bar Chart (Simple) for now, 
  // or a "Candle-like" Bar chart where we color it based on change.
  // User asked for "from graph to candlesticks".
  // Let's implement a robust custom shape.

  // To draw a candle correctly in Recharts, we usually need the coordinates of O, H, L, C.
  // The props `y` and `height` come from the axis scaling of the `dataKey`.
  // If we pass an array [min, max] to dataKey, Recharts (Bar) handles range bars.
  // Let's use that feature: dataKey={[low, high]} for the wick, and another for body?

  // Complexity reduction: We will render a BarChart where the Bar represents the [Low, High] range (the wick),
  // and we overlay a thicker Line or Rect for the body [Open, Close].

  const yBottom = props.y + props.height;
  const yTop = props.y;
  // This 'bar' represents the range [min, max] if we set dataKey to [low, high].

  const { cx, cy } = props; // Center if available? No.
  const center = x + width / 2;

  // We need to scale open and close manually or pass them as part of the 'data' tuple?
  // Recharts is fighting us here.

  // FAIL SAFE: Just render a Bar chart of "Close" prices colored by gain/loss?
  // No, user wants Candlesticks.

  // Let's use the composed chart trick:
  // Data: { ... min: low, max: high, bodyMin: min(o, c), bodyMax: max(o, c) }
  // We draw a "Wick" bar (thin) from Low to High.
  // We draw a "Body" bar (thick) from bodyMin to bodyMax.
  // Overlaid on same X.

  return (
    <g>
      {/* Wick */}
      <line
        x1={x + width / 2} y1={props.y}
        x2={x + width / 2} y2={props.y + props.height}
        stroke={color} strokeWidth="1"
      />
      {/* Body - We need coordinates for Open/Close. 
              The parent chart scales 'y' and 'height' for the current dataKey.
              If we bind this shape to a Bar that spans [Open, Close], we get the body rect for free!
          */}
      <rect
        x={x}
        y={props.y}
        width={width}
        height={props.height}
        fill={color}
      />
    </g>
  );
};


export default function StockDetails({ stock }) {
  const [chartType, setChartType] = useState('area'); // 'area' | 'candle'

  if (!stock) return (
    <div className="mt-8 p-8 bg-[#0d1117] border border-green-900/30 rounded-lg text-center text-gray-500 animate-pulse">
      Select a stock tile above to view detailed analysis
    </div>
  );

  const data = stock.history?.map((h, i) => ({
    name: `T-${20 - i}`,
    ...h,
    // Prepare range for Bar chart [min, max] usage in Recharts
    body: [Math.min(h.o, h.c), Math.max(h.o, h.c)],
    wick: [h.l, h.h],
    color: h.c >= h.o ? '#22c55e' : '#ef4444'
  })) || [];

  const isPositive = stock.change >= 0;
  const color = isPositive ? '#4ade80' : '#f87171';

  return (
    <div className="mt-8 p-6 bg-[#0d1117] border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.1)] rounded-none">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-wider">{stock.ticker} Analysis</h2>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setChartType('area')}
              className={`text-sm px-3 py-1 rounded border ${chartType === 'area' ? 'bg-green-500 text-black border-green-500' : 'text-green-500 border-green-500/30 hover:border-green-500'}`}
            >
              Line Graph
            </button>
            <button
              onClick={() => setChartType('candle')}
              className={`text-sm px-3 py-1 rounded border ${chartType === 'candle' ? 'bg-green-500 text-black border-green-500' : 'text-green-500 border-green-500/30 hover:border-green-500'}`}
            >
              Candlestick
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-light text-white">${stock.price}</p>
          <p className={`text-lg font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '▲' : '▼'} {stock.change}%
          </p>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280' }} tickLine={false} />
              <YAxis domain={['auto', 'auto']} stroke="#6b7280" tick={{ fill: '#6b7280' }} tickLine={false} tickFormatter={(val) => `$${val.toFixed(0)}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }}
                itemStyle={{ color: color }}
              />
              <Area
                type="monotone"
                dataKey="c"
                stroke={color}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280' }} tickLine={false} />
              <YAxis domain={['auto', 'auto']} stroke="#6b7280" tick={{ fill: '#6b7280' }} tickLine={false} tickFormatter={(val) => `$${val.toFixed(0)}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />

              {/* Wicks: Rendered as a separate "Bar" representing the High-Low range 
                    We set barSize small to look like a line.
                    Recharts <Bar> can take [min,max] arrays. 
                */}
              <Bar dataKey="wick" fill="#9ca3af" barSize={1} xAxisId={0} />

              {/* Bodies: Rendered as main Bar [Open, Close] 
                    We color individual cells based on price action
                */}
              <Bar dataKey="body" barSize={10} xAxisId={0}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-4 bg-[#161b22] border-l-2 border-green-500">
          <p className="text-xs text-gray-500 uppercase">Volume</p>
          <p className="text-xl text-white font-mono">2.4M</p>
        </div>
        <div className="p-4 bg-[#161b22] border-l-2 border-green-500">
          <p className="text-xs text-gray-500 uppercase">High</p>
          <p className="text-xl text-white font-mono">${(Math.max(...(stock.history?.map(h => h.h) || [0]))).toFixed(2)}</p>
        </div>
        <div className="p-4 bg-[#161b22] border-l-2 border-green-500">
          <p className="text-xs text-gray-500 uppercase">Low</p>
          <p className="text-xl text-white font-mono">${(Math.min(...(stock.history?.map(h => h.l) || [0]))).toFixed(2)}</p>
        </div>
        <div className="p-4 bg-[#161b22] border-l-2 border-green-500">
          <p className="text-xs text-gray-500 uppercase">Mkt Cap</p>
          <p className="text-xl text-white font-mono">1.8T</p>
        </div>
      </div>
    </div>
  );
}
