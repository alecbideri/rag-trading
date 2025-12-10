import React from 'react';

export default function StockTile({ ticker, price, change, history, onClick }) {
  const isPositive = change >= 0;

  return (
    <div
      onClick={onClick}
      className="
        relative
        p-6 
        h-40
        flex flex-col justify-between
        bg-[#0d1117] 
        border-2 border-green-500/30 
        rounded-none 
        cursor-pointer
        transition-all duration-300 ease-out
        hover:border-green-400 
        hover:shadow-[0_0_20px_2px_rgba(74,222,128,0.5)]
        hover:-translate-y-1
        group
      "
    >
      <div className="flex justify-between items-start">
        <h3 className="text-2xl font-bold text-white tracking-wider">{ticker}</h3>
        <span className={`text-sm font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{change}%
        </span>
      </div>

      <div className="mt-auto">
        <p className="text-3xl font-light text-green-50 group-hover:text-green-400 transition-colors">
          ${price}
        </p>
      </div>

      {/* Sparkline Chart */}
      <div className="absolute bottom-4 right-4 w-24 h-12 opacity-80 group-hover:opacity-100 transition-opacity">
        <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
          <path
            d={
              history
                ? `M ${history.map((val, i) => {
                  const min = Math.min(...history);
                  const max = Math.max(...history);
                  const range = max - min || 1;
                  const x = (i / (history.length - 1)) * 100;
                  const y = 50 - ((val - min) / range) * 50;
                  return `${x} ${y}`;
                }).join(' L ')}`
                : "M 0 25 L 100 25"
            }
            fill="none"
            stroke={isPositive ? "#4ade80" : "#f87171"}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* Radiating effect element (optional internal glow) */}
      <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
