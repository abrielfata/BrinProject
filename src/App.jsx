import React, { useState } from 'react';
import BrinHeader from './components/BrinHeader';
import HeroSection from './components/HeroSection';
import SentimentAnalyzer from './components/SentimentAnalyzer';

function App() {
  const [activeSection, setActiveSection] = useState('home');

  const handleNavigation = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateToAnalyzer = () => {
    setActiveSection('analyzer');
    const element = document.getElementById('analyzer');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <BrinHeader 
        onNavigate={handleNavigation} 
        activeSection={activeSection} 
      />
      
      <main>
        <HeroSection onNavigateToAnalyzer={handleNavigateToAnalyzer} />
        
        {/* Placeholder for Research Section */}
        <section id="research" className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Research Overview</h2>
            <p className="text-gray-600">Section penelitian akan dibuat di step selanjutnya</p>
          </div>
        </section>

        {/* Sentiment Analyzer Section */}
        <section id="analyzer" className="min-h-screen">
          <SentimentAnalyzer />
        </section>

        {/* Placeholder for About Section */}
        <section id="about" className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Tentang Tim</h2>
            <p className="text-gray-600">Section tentang akan dibuat di step selanjutnya</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;