import React from 'react';
import { ChevronDown, Car, Brain, Target, Award, Zap } from 'lucide-react';

function HeroSection({ onNavigateToAnalyzer }) {
  const scrollToNext = () => {
    const nextSection = document.getElementById('research');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center bg-white">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 border border-gray-100 rounded-full opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 border border-red-100 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 border border-gray-100 rounded-lg transform rotate-45 opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-gray-900">
            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              <span className="text-red-600">Deep Learning</span><br />
              <span className="text-gray-900">Model untuk Klasifikasi</span><br />
              <span className="text-red-600">Sentimen Publik</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-6">
              Teknologi Kendaraan Otonom Level 2
            </p>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl leading-relaxed">
              Penelitian inovatif BRIN untuk memahami persepsi terhadap implementasi teknologi kendaraan otonom menggunakan artificial intelligence 
              dan deep learning terdepan.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <Brain className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">AI Model</h3>
                  <p className="text-sm text-gray-600">94.2% Akurasi</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <Car className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Level 2 AV</h3>
                  <p className="text-sm text-gray-600">Fokus Penelitian</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <Zap className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Real-time</h3>
                  <p className="text-sm text-gray-600">Analisis Cepat</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={onNavigateToAnalyzer}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Target className="w-5 h-5 inline mr-2" />
                Coba Sentiment Analyzer
              </button>
              <button 
                onClick={() => document.getElementById('research').scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
              >
                Pelajari Penelitian
              </button>
            </div>
          </div>

          <div className="lg:flex justify-center items-center hidden">
            <div className="relative">
              <div className="w-80 h-80 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-xl border border-gray-200">
                <div className="w-64 h-64 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-100">
                  <img 
                    src="/brin-logo.png" 
                    alt="Logo" 
                    className="w-32 h-32 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextElementSibling) {
                        e.target.nextElementSibling.style.display = 'block';
                      }
                    }}
                  />
                  <Brain className="w-32 h-32 text-red-600 hidden" />
                </div>
              </div>
              
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 animate-pulse">
                <Car className="w-8 h-8 text-gray-700" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 animate-pulse delay-1000">
                <Target className="w-8 h-8 text-gray-700" />
              </div>
              <div className="absolute top-1/2 -right-8 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center shadow-lg border border-red-200 animate-bounce">
                <Award className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button 
            onClick={scrollToNext}
            className="flex flex-col items-center text-gray-600 hover:text-red-600 transition-colors duration-300 animate-bounce"
          >
            <span className="text-sm mb-2">Jelajahi Lebih Lanjut</span>
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;