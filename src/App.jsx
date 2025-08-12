import React, { useState } from 'react';
import BrinHeader from './components/BrinHeader';
import HeroSection from './components/HeroSection';
import SentimentAnalyzer from './components/SentimentAnalyzer';
import { Brain, Car, Target, Database, TrendingUp, Zap, BookOpen, Users, Award, ChevronRight, BarChart3, Network, Cpu } from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      <BrinHeader 
        onNavigate={handleNavigation} 
        activeSection={activeSection} 
      />
      
      <main>
        <HeroSection onNavigateToAnalyzer={handleNavigateToAnalyzer} />
        
        <section id="research" className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-full text-sm font-semibold mb-6 border border-blue-200">
                <BookOpen className="w-5 h-5" />
                <span>Penelitian Inovatif BRIN</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Latar Belakang Penelitian
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Menganalisis persepsi publik terhadap teknologi kendaraan otonom Level 2 menggunakan 
                pendekatan deep learning untuk klasifikasi sentimen
              </p>
            </div>

            <div className="space-y-16">
              <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200">
                <div className="grid lg:grid-cols-5 gap-8 items-center">
                  <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Car className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Revolusi AI dalam Industri Otomotif</h3>
                        <p className="text-red-600 font-medium">Teknologi Disruptif Era Modern</p>
                      </div>
                    </div>
                    
                    <div className="prose prose-lg text-gray-700 space-y-4">
                      <p className="leading-relaxed">
                        Perkembangan <strong>kecerdasan buatan</strong> telah mendorong inovasi disruptif di berbagai sektor, 
                        tidak terkecuali industri otomotif. Salah satu manifestasi utamanya adalah <strong>Sistem Asistensi 
                        Pengemudi Canggih (ADAS)</strong> yang dikategorikan sebagai otonomi Level 2 oleh Society of Automotive Engineers (SAE).
                      </p>
                      
                      <p className="leading-relaxed">
                        Sistem ini mengkombinasikan fungsi seperti <em>Adaptive Cruise Control</em> dan <em>Lane Keeping Assist</em>, 
                        memungkinkan kendaraan untuk mengelola kecepatan dan kemudi secara simultan di bawah pengawasan pengemudi.
                      </p>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-50 rounded-xl p-6 text-center border border-red-200">
                        <div className="text-3xl font-bold text-red-600 mb-2">Level 2</div>
                        <div className="text-sm text-gray-600">SAE Autonomy</div>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-200">
                        <div className="text-3xl font-bold text-blue-600 mb-2">ADAS</div>
                        <div className="text-sm text-gray-600">Technology</div>
                      </div>
                      <div className="bg-green-50 rounded-xl p-6 text-center border border-green-200">
                        <div className="text-3xl font-bold text-green-600 mb-2">ACC</div>
                        <div className="text-sm text-gray-600">Cruise Control</div>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-6 text-center border border-purple-200">
                        <div className="text-3xl font-bold text-purple-600 mb-2">LKA</div>
                        <div className="text-sm text-gray-600">Lane Keeping</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Diskursus Publik Digital</h3>
                        <p className="text-blue-600 font-medium">Sumber Data Berharga</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 text-gray-700">
                      <p className="leading-relaxed">
                        Seiring dengan meningkatnya prevalensi teknologi ini, <strong>diskursus publik</strong> di platform digital 
                        seperti forum online dan media sosial menjadi semakin intens. Opini publik ini menjadi sumber data yang 
                        sangat berharga dalam memahami persepsi masyarakat terhadap teknologi kendaraan otonom.
                      </p>
                      
                      <p className="leading-relaxed">
                        <strong>Sentimen yang diekspresikan</strong> dapat merefleksikan tingkat kepercayaan, kekhawatiran terkait 
                        keamanan, ekspektasi fitur, dan kepuasan pengguna secara umum.
                      </p>
                      
                      <p className="leading-relaxed">
                        Analisis terhadap sentimen ini memberikan <em>wawasan krusial</em> bagi produsen untuk inovasi produk, 
                        bagi regulator untuk penyusunan kebijakan, dan bagi komunitas riset untuk memahami interaksi manusia-mesin.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4">Sumber Data Digital</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Forum Online</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div className="w-5/6 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Media Sosial</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div className="w-4/5 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Review Platform</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div className="w-3/4 h-2 bg-purple-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                        <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-sm font-medium text-gray-900">Kepercayaan</div>
                        <div className="text-xs text-gray-600">Trust Level</div>
                      </div>
                      <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
                        <Target className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <div className="text-sm font-medium text-gray-900">Kekhawatiran</div>
                        <div className="text-xs text-gray-600">Safety Concerns</div>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                        <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-sm font-medium text-gray-900">Ekspektasi</div>
                        <div className="text-xs text-gray-600">Feature Expectations</div>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
                        <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-sm font-medium text-gray-900">Kepuasan</div>
                        <div className="text-xs text-gray-600">User Satisfaction</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200">
                <div className="text-center mb-12">
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Natural Language Processing & Deep Learning</h3>
                      <p className="text-green-600 font-medium">Solusi Analisis Teks Berskala Besar</p>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="prose text-gray-700 space-y-4">
                      <p className="leading-relaxed">
                        Untuk menganalisis data tekstual berskala besar ini, teknik <strong>Natural Language Processing (NLP)</strong>, 
                        khususnya analisis sentimen, menawarkan solusi yang efektif.
                      </p>
                      
                      <p className="leading-relaxed">
                        Dalam beberapa tahun terakhir, pendekatan berbasis <strong>deep learning (DL)</strong> telah menunjukkan 
                        keunggulan signifikan dibandingkan metode machine learning (ML) konvensional untuk tugas-tugas NLP.
                      </p>
                      
                      <p className="leading-relaxed">
                        Arsitektur seperti <em>Recurrent Neural Network (RNN)</em> dan variannya, <em>Long Short-Term Memory (LSTM)</em>, 
                        dirancang khusus untuk memodelkan data sekuensial seperti bahasa, memungkinkan mereka untuk menangkap 
                        konteks dan dependensi yang kompleks antar kata.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Cpu className="w-5 h-5 mr-2" />
                        Keunggulan Deep Learning
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <ChevronRight className="w-4 h-4 mr-2" />
                          <span>Menangkap konteks kompleks antar kata</span>
                        </div>
                        <div className="flex items-center">
                          <ChevronRight className="w-4 h-4 mr-2" />
                          <span>Memodelkan dependensi sekuensial</span>
                        </div>
                        <div className="flex items-center">
                          <ChevronRight className="w-4 h-4 mr-2" />
                          <span>Kinerja superior untuk tugas NLP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Network className="w-5 h-5 mr-2" />
                        Arsitektur Model
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                          <div>
                            <div className="font-medium text-gray-900">RNN</div>
                            <div className="text-sm text-gray-600">Recurrent Neural Network</div>
                          </div>
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div className="w-3/4 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                          <div>
                            <div className="font-medium text-gray-900">LSTM</div>
                            <div className="text-sm text-gray-600">Long Short-Term Memory</div>
                          </div>
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div className="w-full h-2 bg-green-500 rounded-full"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                          <div>
                            <div className="font-medium text-gray-900">ML Konvensional</div>
                            <div className="text-sm text-gray-600">Baseline Comparison</div>
                          </div>
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div className="w-2/3 h-2 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Target Kinerja
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">94.2%</div>
                          <div className="text-sm text-gray-600">Akurasi Model</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">92.1%</div>
                          <div className="text-sm text-gray-600">F1-Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">0.89</div>
                          <div className="text-sm text-gray-600">Precision</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">0.95</div>
                          <div className="text-sm text-gray-600">Recall</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="analyzer" className="bg-white">
          <div className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-red-50 text-red-700 px-6 py-3 rounded-full text-sm font-semibold mb-6 border border-red-200">
                  <Brain className="w-5 h-5" />
                  <span>AI Sentiment Analyzer BRIN</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
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

        <section id="about" className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tentang Tim</h2>
            <p className="text-gray-600">Section tentang akan dibuat di step selanjutnya</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;