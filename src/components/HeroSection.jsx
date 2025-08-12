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
    <section id="home" className="relative min-h-screen flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 opacity-95"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent"></div>
      
      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 border border-yellow-500 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 border border-yellow-500 rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 border border-white rounded-lg transform rotate-45"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white">
            {/* Research Badge */}
            <div className="inline-flex items-center space-x-2 bg-yellow-500 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Award className="w-4 h-4" />
              <span>Penelitian Terdepan 2024</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              <span className="text-yellow-400">Deep Learning</span><br />
              <span>Model untuk Klasifikasi</span><br />
              <span className="text-yellow-400">Sentimen Publik</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-blue-100 mb-6">
              Teknologi Kendaraan Otonom Level 2
            </p>

            {/* Description */}
            <p className="text-lg text-blue-200 mb-8 max-w-2xl leading-relaxed">
              Penelitian inovatif BRIN untuk memahami persepsi masyarakat Indonesia terhadap 
              implementasi teknologi kendaraan otonom menggunakan artificial intelligence 
              dan deep learning terdepan.
            </p>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center space-x-3 bg-blue-800/50 backdrop-blur-sm rounded-lg p-4">
                <Brain className="w-6 h-6 text-yellow-400" />
                <div>
                  <h3 className="font-semibold">AI Model</h3>
                  <p className="text-sm text-blue-200">94.2% Akurasi</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-blue-800/50 backdrop-blur-sm rounded-lg p-4">
                <Car className="w-6 h-6 text-yellow-400" />
                <div>
                  <h3 className="font-semibold">Level 2 AV</h3>
                  <p className="text-sm text-blue-200">Fokus Penelitian</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-blue-800/50 backdrop-blur-sm rounded-lg p-4">
                <Zap className="w-6 h-6 text-yellow-400" />
                <div>
                  <h3 className="font-semibold">Real-time</h3>
                  <p className="text-sm text-blue-200">Analisis Cepat</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={onNavigateToAnalyzer}
                className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Target className="w-5 h-5 inline mr-2" />
                Coba Sentiment Analyzer
              </button>
              <button 
                onClick={() => document.getElementById('research').scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
              >
                Pelajari Penelitian
              </button>
            </div>
          </div>

          {/* Visual Element */}
          <div className="lg:flex justify-center items-center hidden">
            <div className="relative">
              {/* Main Circle */}
              <div className="w-80 h-80 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-2xl">
                <div className="w-64 h-64 rounded-full bg-blue-900 flex items-center justify-center">
                  <Brain className="w-32 h-32 text-yellow-400" />
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Car className="w-8 h-8 text-blue-900" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse delay-1000">
                <Target className="w-8 h-8 text-blue-900" />
              </div>
              <div className="absolute top-1/2 -right-8 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Award className="w-6 h-6 text-blue-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button 
            onClick={scrollToNext}
            className="flex flex-col items-center text-white hover:text-yellow-400 transition-colors duration-300 animate-bounce"
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