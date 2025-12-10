import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import BackgroundEffect from './components/BackgroundEffect';

function App() {
  // We can lift the stock data up to App if needed for global context,
  // or let Dashboard fetch it and pass a sampling to Chat via a different method.
  // For simplicity, we'll let Dashboard fetch, and if we want the chat to know about it,
  // we might need to restructure or have Dashboard pass data up. 
  // For this prototype, we will create a shared state or just mock the context in ChatInterface until connected.

  // Real implementation: Dashboard notifies App of loaded data.
  const [marketContext, setMarketContext] = useState(null);

  // Callback to capture data from Dashboard for RAG
  // We'll modify Dashboard slightly to call this when data loads.
  const handleDataLoaded = (data) => {
    setMarketContext(data);
  };

  return (
    <div className="min-h-screen text-gray-300 font-sans selection:bg-green-500/30 relative">
      {/* Dynamic Background */}
      <BackgroundEffect />

      <div className="relative z-10">
        <Dashboard onDataLoaded={handleDataLoaded} onSelectStock={(stock) => console.log('Selected', stock)} />
        <ChatInterface contextData={marketContext} />
      </div>
    </div>
  );
}

export default App;
