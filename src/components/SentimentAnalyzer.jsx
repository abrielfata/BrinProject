import { useState } from 'react'
import { Button } from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { Textarea } from './ui/Textarea'
import { Badge } from './ui/Badge'
import { Progress } from './ui/Progress'
import { Loader2, Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useToast } from '../hooks/useToast'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export default function SentimentAnalyzer() {
  const [text, setText] = useState('')
  const [batchTexts, setBatchTexts] = useState('')
  const [result, setResult] = useState(null)
  const [batchResults, setBatchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('single')
  const { toast } = useToast()

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
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
      
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

    setLoading(true)
    try {
      const response = await fetch('/api/batch_predict', {
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
      toast({
        title: 'Batch Analysis Complete',
        description: `Analyzed ${data.total_processed} texts successfully`,
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
        return 'bg-green-100 text-green-800 border-green-200'
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const preparePieChartData = (probabilities) => {
    if (!probabilities) return []
    
    const colors = {
      positive: '#22c55e',
      negative: '#ef4444',
      neutral: '#eab308'
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
        <h4 className="text-sm font-medium mb-2">Probability Distribution</h4>
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
      neutral: '#eab308'
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
        <h4 className="text-sm font-medium mb-2">Batch Sentiment Distribution</h4>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Sentiment Analyzer</h1>
          </div>
          <p className="text-gray-600">Analyze the emotional tone of your text using AI</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
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
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Analyze Single Text</CardTitle>
              <CardDescription>Enter your text below to analyze its sentiment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your text here... (e.g., 'I love this product!' or 'This is disappointing')"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[120px] resize-none"
                maxLength={1000}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{text.length}/1000 characters</span>
                <Button onClick={analyzeSentiment} disabled={loading}>
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
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getSentimentIcon(result.predicted_class)}
                      Analysis Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={getSentimentColor(result.predicted_class)}>
                        {result.predicted_class.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600">{(result.confidence * 100).toFixed(1)}% confidence</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Probability Breakdown:</h4>
                      {Object.entries(result.all_probabilities).map(([sentiment, prob]) => (
                        <div key={sentiment} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{sentiment}</span>
                            <span>{(prob * 100).toFixed(1)}%</span>
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
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Batch Analysis</CardTitle>
              <CardDescription>Enter multiple texts (one per line) to analyze them all at once</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`Enter multiple texts, one per line:
I love this product!
This is terrible quality
It's okay, nothing special
Amazing customer service`}
                value={batchTexts}
                onChange={(e) => setBatchTexts(e.target.value)}
                className="min-h-[150px] resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {batchTexts.split('\n').filter((t) => t.trim()).length} texts to analyze
                </span>
                <Button onClick={analyzeBatch} disabled={loading}>
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
                  <h3 className="font-semibold">Batch Results ({batchResults.length} texts)</h3>
                  
                  {/* Batch Pie Chart */}
                  {renderBatchPieChart(batchResults)}
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {batchResults.map((result, index) => (
                      <Card key={index} className="p-3">
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
          <p>Powered by AI sentiment analysis • Real-time processing</p>
        </div>
      </div>
    </div>
  )
}