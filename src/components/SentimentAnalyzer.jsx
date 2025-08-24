import { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { Textarea } from './ui/Textarea'
import { Badge } from './ui/Badge'
import { Progress } from './ui/Progress'
import { Loader2, Brain, TrendingUp, TrendingDown, Minus, Database, BarChart3, Trash2 } from 'lucide-react'
import { useToast } from '../hooks/useToast'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export default function SentimentAnalyzer() {
  const [text, setText] = useState('')
  const [batchTexts, setBatchTexts] = useState('')
  const [result, setResult] = useState(null)
  const [batchResults, setBatchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('single')
  const [databaseStats, setDatabaseStats] = useState(null)
  const [recentEntries, setRecentEntries] = useState([])
  const [lastRequestTime, setLastRequestTime] = useState(0)
  const { toast } = useToast()

  // Simple refresh approach - no Socket.IO complexity needed

  // Load database statistics when component mounts
  useEffect(() => {
    loadDatabaseStats()
  }, [])

  const loadDatabaseStats = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${apiUrl}/api/sentiment-stats`)
      if (response.ok) {
        const data = await response.json()
        setDatabaseStats(data)
        setRecentEntries(data.recent_entries || [])
      }
    } catch (error) {
      console.error('Error loading database stats:', error)
    }
  }

  const saveToDatabase = async (sentimentData) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${apiUrl}/api/save-sentiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sentimentData),
      })

      if (response.ok) {
        const saveResult = await response.json()
        console.log('✅ Data saved to database:', saveResult.data.id)
        // Real-time update will be handled by Socket.IO
        return true
      }
    } catch (error) {
      console.error('Error saving to database:', error)
    }
    return false
  }

  const analyzeSentiment = async () => {
    if (!text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text to analyze',
        variant: 'destructive',
      })
      return
    }

    // Rate limiting: prevent requests within 2 seconds of each other
    const now = Date.now()
    if (now - lastRequestTime < 2000) {
      toast({
        title: 'Please wait',
        description: 'Please wait a moment before making another request',
        variant: 'destructive',
      })
      return
    }
    setLastRequestTime(now)

    setLoading(true)
    try {
      // Call sentiment API via backend proxy
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${apiUrl}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim().replace(/\\/g, ''), // Remove any backslashes that might cause escape issues
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
      
      // Save to local database
      const saved = await saveToDatabase(data)
      
      // Refresh database stats after successful analysis
      await loadDatabaseStats()
      
      // Kosongkan input setelah analisis berhasil
      setText('')

      toast({
        title: 'Analysis Complete',
        description: `Sentiment: ${data.predicted_class} (${(data.confidence * 100).toFixed(1)}% confidence)${saved ? ' - Saved to database' : ''}`,
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
    const texts = batchTexts.split('\n')
      .filter((t) => t.trim())
      .map(t => t.trim().replace(/\\/g, '')) // Remove backslashes from each text
    if (texts.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter texts to analyze (one per line)',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      // Call batch API via backend proxy
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${apiUrl}/api/batch_predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setBatchResults(data.results)
      
      // Save each result to database
      let savedCount = 0
      for (const result of data.results) {
        if (result.status === 'success') {
          const saved = await saveToDatabase(result)
          if (saved) savedCount++
        }
      }

      // Refresh database stats after successful batch analysis
      await loadDatabaseStats()

      // Kosongkan input batch setelah analisis berhasil
      setBatchTexts('')

      toast({
        title: 'Batch Analysis Complete',
        description: `Analyzed ${data.total_processed} texts, saved ${savedCount} to database`,
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
    
    results.forEach(result => {
      sentimentCounts[result.predicted_class] = (sentimentCounts[result.predicted_class] || 0) + 1
    })
    
    const total = results.length
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

  return (
    <div className="bg-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Sentiment Analyzer</h1>
          </div>
          <p className="text-gray-600">Analyze the emotional tone of your text using AI</p>
          <p className="text-xs text-red-500 mt-1">
            <strong>Note:</strong> Please input your comment in <span className="underline">English</span>.
          </p>
        </div>

        {/* Database Statistics Card */}
        {databaseStats && (
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Database className="h-5 w-5 text-red-600" />
                Database Statistics
              </CardTitle>
              <CardDescription>
                Total entries: {databaseStats.database_info?.total_entries || 0} | 
                Last updated: {databaseStats.database_info?.last_updated ? 
                  new Date(databaseStats.database_info.last_updated).toLocaleString() : 'Never'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Statistics Table */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Sentiment Distribution
                  </h4>
                  <div className="space-y-2">
                    {databaseStats.statistics?.map((stat) => (
                      <div key={stat.predicted_class} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(stat.predicted_class)}
                          <span className="capitalize font-medium text-gray-900">{stat.predicted_class}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{stat.count} entries</div>
                          <div className="text-xs text-gray-600">{stat.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Database Chart */}
                <div>
                  {databaseStats.chart_data && databaseStats.chart_data.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Database Overview</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={databaseStats.chart_data}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                          >
                            {databaseStats.chart_data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value} entries`, name]}
                          />
                          <Legend 
                            formatter={(value, entry) => `${value}: ${entry.payload.count}`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Entries */}
              {recentEntries.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Recent Analyses</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {recentEntries.map((entry) => (
                      <div key={entry.id} className="flex items-start justify-between p-2 bg-gray-50 rounded text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-700 truncate" title={entry.text}>
                            "{entry.text}"
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(entry.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {getSentimentIcon(entry.predicted_class)}
                          <Badge className={`${getSentimentColor(entry.predicted_class)} text-xs`}>
                            {entry.predicted_class}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              <CardDescription>Enter your text below to analyze its sentiment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your text here... (e.g., 'I love autonomous vehicles!' or 'Self-driving cars are dangerous')"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[120px] resize-none border-gray-200 focus:border-red-500 focus:ring-red-500"
                maxLength={1000}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{text.length}/1000 characters</span>
                <Button onClick={analyzeSentiment} disabled={loading} className="bg-red-600 hover:bg-red-700">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Sentiment'
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
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 font-medium">Analyzed Text:</p>
                      <p className="text-gray-900 mt-1">"{result.text}"</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getSentimentColor(result.predicted_class)}>
                        {result.predicted_class.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600">{(result.confidence * 100).toFixed(1)}% confidence</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Probability Breakdown:</h4>
                      {Object.entries(result.all_probabilities).map(([sentiment, prob]) => (
                        <div key={sentiment} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize text-gray-700">{sentiment}</span>
                            <span className="text-gray-600">{(prob * 100).toFixed(1)}%</span>
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
              <CardDescription>Enter multiple texts (one per line) to analyze them all at once</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`Enter multiple texts, one per line:
I love autonomous vehicles!
Self-driving cars are dangerous
Autopilot is okay but needs improvement
Tesla FSD is amazing technology
Lane assist feature is helpful`}
                value={batchTexts}
                onChange={(e) => setBatchTexts(e.target.value)}
                className="min-h-[150px] resize-none border-gray-200 focus:border-red-500 focus:ring-red-500"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {batchTexts.split('\n').filter((t) => t.trim()).length} texts to analyze
                </span>
                <Button onClick={analyzeBatch} disabled={loading} className="bg-red-600 hover:bg-red-700">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Batch'
                  )}
                </Button>
              </div>

              {/* Batch Results */}
              {batchResults.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-semibold text-gray-900">Batch Results ({batchResults.length} texts)</h3>
                  
                  {/* Batch Pie Chart */}
                  {renderBatchPieChart(batchResults)}
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {batchResults.map((result, index) => (
                      <Card key={index} className="p-3 border border-gray-200">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 truncate" title={result.text}>
                              {result.text}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {getSentimentIcon(result.predicted_class)}
                            <Badge className={`${getSentimentColor(result.predicted_class)} text-xs`}>
                              {result.predicted_class}
                            </Badge>
                            <span className="text-xs text-gray-500">{(result.confidence * 100).toFixed(0)}%</span>
                          </div>
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
        <div className="text-center text-sm text-gray-500">
          <p>Powered by BRIN Deep Learning Model</p>
        </div>
      </div>
    </div>
  )
}