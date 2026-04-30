import React, { useState } from 'react';
import ContentWriter from './components/ContentWriter';
import VoiceStudio from './pages/VoiceStudio';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'voice', label: 'Voice Studio', icon: '🎙️' },
    { id: 'enhance', label: 'AI Voice Enhance', icon: '✨' },
    { id: 'facesync', label: 'Face Sync tool', icon: '👄' },
    { id: 'editor', label: 'Video Editor', icon: '💬' },
    { id: 'history', label: 'History', icon: '📂' },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col">

      {/* 🔝 TOP NAVBAR */}
      <header className="bg-[#121212] text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold leading-none">
              ASTRO SAGAR
            </span>
            <span className="text-xl font-black tracking-tighter">
              Studio
            </span>
          </div>

          {/* Menu */}
          <nav className="flex items-center gap-1">
            {menuItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold
                  ${activeTab === item.id 
                    ? 'bg-[#2a2a2a] text-white shadow-inner' 
                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}
              >
                <span>{item.icon}</span>
                <span className="hidden lg:block">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Status */}
          <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-1.5 rounded-full border border-gray-800">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-green-500 uppercase">
              Online
            </span>
          </div>
        </div>
      </header>

      {/* 🧠 MAIN AREA */}
      <main className={`flex-1 ${activeTab === 'content' ? '' : 'p-6 lg:p-10'}`}>

        {/* 👇 CONDITIONAL WRAPPER */}
        <div
          className={`${
            activeTab === 'content'
              ? 'w-full h-full bg-transparent rounded-none shadow-none border-none'
              : 'max-w-[1500px] mx-auto bg-white rounded-[2rem] shadow-2xl border border-gray-100 min-h-[80vh] overflow-hidden'
          }`}
        >

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col items-center justify-center h-[70vh] opacity-10">
              <h3 className="text-6xl font-black text-black">
                ASTRO SAGAR
              </h3>
              <p className="text-xl font-medium">
                Select a tool from the top menu
              </p>
            </div>
          )}

          {/* ✅ CONTENT (NO CARD MODE) */}
          {activeTab === 'content' && <ContentWriter />}

          {/* Voice */}
          {activeTab === 'voice' && <VoiceStudio />}

          {/* Other Tabs */}
          {['enhance', 'facesync', 'editor', 'history'].includes(activeTab) && (
            <div className="p-20 text-center text-gray-400 font-bold">
              Coming Soon: {activeTab} logic add karna baki hai.
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;