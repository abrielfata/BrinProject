import { useState } from 'react'
import { Button } from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { Textarea } from './ui/Textarea'
import { Badge } from './ui/Badge'
import { Progress } from './ui/Progress'
import { Loader2, Brain, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'
import { useToast } from '../hooks/useToast'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

// API Configuration
const API_BASE_URL = 'https://sentiment-api1.onrender.com';

export default function SentimentAnalyzer() {
  const [text, setText] = useState('')
  const [batchTexts, setBatchTexts] = useState('')
  const [result, setResult] = useState(null)
  const [batchResults, setBatchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('single')
  const [apiStatus, setApiStatus] = useState('unknown')
  const { toast } = useToast()

  // Check API health status
  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiStatus(data.model_loaded && data.tokenizer_loaded ? 'ready' : 'loading');
        return true;
      } else {
        setApiStatus('error');
        return false;
      }
    } catch (error) {
      console.error('API health check failed:', error);
      setApiStatus('error');
      return false;
    }
  };

  // Save to local backend for data persistence
  const saveToLocalBackend = async (analysisData) => {
    try {
      const response = await fetch('/api/save-sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      });
      
      if (response.ok) {
        console.log('✅ Data saved to local database');
      } else {
        console.warn('⚠️ Failed to save to local database');
      }
    } catch (error) {
      console.warn('⚠️ Local backend not available:', error.message);
    }
  };

  const analyzeSentiment = async () => {
    if (!text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text to analyze',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    
    try {
      // Check API health first
      const isHealthy = await checkApiHealth();
      if (!isHealthy) {
        throw new Error('API is currently unavailable. Please try again later.');
      }

      // Call external sentiment API
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json()
      
      // Validate response format
      if (!data.predicted_class || !data.confidence || !data.all_probabilities) {
        throw new Error('Invalid response format from API');
      }
      
      setResult(data)
      
      // Save to local backend for persistence
      await saveToLocalBackend({
        text: data.text,
        predicted_class: data.predicted_class,
        confidence: data.confidence,
        all_probabilities: data.all_probabilities
      });
      
      toast({
        title: 'Analysis Complete',
        description: `Sentiment: ${data.predicted_class} (${(data.confidence * 100).toFixed(1)}% confidence)`,
      })
    } catch (error) {
      console.error('Error:', error)
      let errorMessage = 'Failed to analyze sentiment. Please try again.'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const analyzeBatch = async () => {
    const texts = batchTexts.split('\n').filter((t) => t.trim())
    if (texts.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter texts to analyze (one per line)',
        variant: 'destructive',
      })
      return
    }

    if (texts.length > 50) {
      toast({
        title: 'Error',
        description: 'Maximum 50 texts allowed per batch',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    
    try {
      // Check API health first
      const isHealthy = await checkApiHealth();
      if (!isHealthy) {
        throw new Error('API is currently unavailable. Please try again later.');
      }

      // Call external batch prediction API
      const response = await fetch(`${API_BASE_URL}/batch_predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          texts: texts,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json()
      
      // Validate response format
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid batch response format from API');
      }
      
      setBatchResults(data.results)
      
      // Save successful results to local backend
      const successfulResults = data.results.filter(r => r.status === 'success');
      for (const result of successfulResults) {
        await saveToLocalBackend({
          text: result.text,
          predicted_class: result.predicted_class,
          confidence: result.confidence,
          all_probabilities: result.all_probabilities || {
            [result.predicted_class]: result.confidence,
            positive: result.predicted_class === 'positive' ? result.confidence : (1 - result.confidence) / 2,
            negative: result.predicted_class === 'negative' ? result.confidence : (1 - result.confidence) / 2,
            neutral: result.predicted_class === 'neutral' ? result.confidence : (1 - result.confidence) / 2
          }
        });
      }
      
      toast({
        title: 'Batch Analysis Complete',
        description: `Analyzed ${data.total_processed || successfulResults.length} texts successfully`,
      })
    } catch (error) {
      console.error('Error:', error)
      let errorMessage = 'Failed to analyze batch. Please try again.'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'negative':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const preparePieChartData = (probabilities) => {
    if (!probabilities) return []
    
    const colors = {
      positive: '#22c55e',
      negative: '#ef4444',
      neutral: '#6b7280'
    }
    
    return Object.entries(probabilities).map(([sentiment, probability]) => ({
      name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
      value: (probability * 100).toFixed(1),
      probability: probability,
      color: colors[sentiment]
    }))
  }

  const renderPieChart = (probabilities) => {
    const data = preparePieChartData(probabilities)
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2 text-gray-900">Probability Distribution</h4>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="probability"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [`${(value * 100).toFixed(1)}%`, name]}
            />
            <Legend 
              formatter={(value, entry) => `${value}: ${entry.payload.value}%`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const prepareBatchPieChartData = (results) => {
    if (!results || results.length === 0) return []
    
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 }
    
    results.filter(r => r.status === 'success').forEach(result => {
      sentimentCounts[result.predicted_class] = (sentimentCounts[result.predicted_class] || 0) + 1
    })
    
    const total = results.filter(r => r.status === 'success').length
    if (total === 0) return []
    
    const colors = {
      positive: '#22c55e',
      negative: '#ef4444',
      neutral: '#6b7280'
    }
    
    return Object.entries(sentimentCounts)
      .filter(([, count]) => count > 0)
      .map(([sentiment, count]) => ({
        name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
        value: ((count / total) * 100).toFixed(1),
        count: count,
        color: colors[sentiment]
      }))
  }

  const renderBatchPieChart = (results) => {
    const data = prepareBatchPieChartData(results)
    
    if (data.length === 0) return null;
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2 text-gray-900">Batch Sentiment Distribution</h4>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [`${value} texts (${data.find(d => d.name === name)?.value}%)`, name]}
            />
            <Legend 
              formatter={(value, entry) => `${value}: ${entry.payload.count} texts (${entry.payload.value}%)`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Initialize API health check on component mount
  useState(() => {
    checkApiHealth();
  }, []);

  return (
    <div className="bg-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with API Status */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Sentiment Analyzer</h1>
          </div>
          <p className="text-gray-600">Analyze sentiment using BRIN's trained Bi-LSTM model</p>
          
          {/* API Status Indicator */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${
              apiStatus === 'ready' ? 'bg-green-500' : 
              apiStatus === 'loading' ? 'bg-yellow-500' : 
              apiStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-xs text-gray-500">
              {apiStatus === 'ready' ? 'API Ready' : 
               apiStatus === 'loading' ? 'API Loading...' : 
               apiStatus === 'error' ? 'API Unavailable' : 'Checking API...'}
            </span>
          </div>
        </div>

        {/* API Warning for cold start */}
        {apiStatus === 'loading' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  API is warming up (cold start). This may take 30-60 seconds. Please wait...
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="bg-gray-50 rounded-lg p-1 shadow-sm border border-gray-200">
            <Button
              variant={activeTab === 'single' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('single')}
              className="px-6"
            >
              Single Text
            </Button>
            <Button
              variant={activeTab === 'batch' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('batch')}
              className="px-6"
            >
              Batch Analysis
            </Button>
          </div>
        </div>

        {/* Single Text Analysis */}
        {activeTab === 'single' && (
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Analyze Single Text</CardTitle>
              <CardDescription>
                Enter your text about autonomous vehicles to analyze its sentiment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your text here... (e.g., 'I love autonomous vehicles!' or 'Self-driving cars are scary')"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[120px] resize-none border-gray-200 focus:border-red-500 focus:ring-red-500"
                maxLength={1000}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{text.length}/1000 characters</span>
                <Button 
                  onClick={analyzeSentiment} 
                  disabled={loading || apiStatus === 'error'} 
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Analyze Sentiment
                    </>
                  )}
                </Button>
              </div>

              {/* Single Result */}
              {result && (
                <Card className="mt-6 border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      {getSentimentIcon(result.predicted_class)}
                      Analysis Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm text-gray-700 italic">"{result.text}"</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getSentimentColor(result.predicted_class)}>
                        {result.predicted_class.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600">{(result.confidence * 100).toFixed(2)}% confidence</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Probability Breakdown:</h4>
                      {Object.entries(result.all_probabilities).map(([sentiment, prob]) => (
                        <div key={sentiment} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize text-gray-700">{sentiment}</span>
                            <span className="text-gray-600">{(prob * 100).toFixed(2)}%</span>
                          </div>
                          <Progress value={prob * 100} className="h-2" />
                        </div>
                      ))}
                    </div>

                    {renderPieChart(result.all_probabilities)}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}

        {/* Batch Analysis */}
        {activeTab === 'batch' && (
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Batch Analysis</CardTitle>
              <CardDescription>
                Enter multiple texts about autonomous vehicles (one per line) to analyze them all at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`Enter multiple texts, one per line:
I love Tesla Autopilot!
Self-driving cars are dangerous
Lane assist is helpful
FSD is the future
Waymo technology seems promising`}
                value={batchTexts}
                onChange={(e) => setBatchTexts(e.target.value)}
                className="min-h-[150px] resize-none border-gray-200 focus:border-red-500 focus:ring-red-500"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {batchTexts.split('\n').filter((t) => t.trim()).length} texts to analyze (max 50)
                </span>
                <Button 
                  onClick={analyzeBatch} 
                  disabled={loading || apiStatus === 'error'} 
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Analyze Batch
                    </>
                  )}
                </Button>
              </div>

              {/* Batch Results */}
              {batchResults.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      Batch Results ({batchResults.filter(r => r.status === 'success').length} successful)
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setBatchResults([])}
                    >
                      Clear Results
                    </Button>
                  </div>
                  
                  {/* Batch Pie Chart */}
                  {renderBatchPieChart(batchResults)}
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {batchResults.map((result, index) => (
                      <Card key={index} className={`p-3 ${
                        result.status === 'success' ? 'border-gray-200' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 truncate" title={result.text}>
                              "{result.text}"
                            </p>
                            {result.error && (
                              <p className="text-xs text-red-600 mt-1">{result.error}</p>
                            )}
                          </div>
                          {result.status === 'success' && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {getSentimentIcon(result.predicted_class)}
                              <Badge className={`${getSentimentColor(result.predicted_class)} text-xs`}>
                                {result.predicted_class}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {(result.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                          {result.status !== 'success' && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
                                Error
                              </Badge>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>Powered by BRIN Bi-LSTM Model • Real-time processing</p>
        </div>
      </div>
    </div>
  )
}