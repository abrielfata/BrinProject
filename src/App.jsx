import React, { useState } from 'react';
import BrinHeader from './components/BrinHeader';
import HeroSection from './components/HeroSection';
import SentimentAnalyzer from './components/SentimentAnalyzer';
import { Brain } from 'lucide-react';

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

        {/* Sentiment Analyzer Section dengan styling BRIN */}
        <section id="analyzer" className="bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-blue-900 text-white px-6 py-3 rounded-full text-sm font-semibold mb-6">
                  <Brain className="w-5 h-5" />
                  <span>AI Sentiment Analyzer BRIN</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
                  Analisis Sentimen Real-time
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Gunakan model deep learning kami untuk menganalisis sentimen teks tentang teknologi kendaraan otonom
                </p>
              </div>
            </div>
            <div className="max-w-4xl mx-auto px-4">
              <SentimentAnalyzer />
            </div>
          </div>
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