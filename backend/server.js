import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  insertSentimentAnalysis,
  getAllSentimentData,
  getSentimentStats,
  getChartData,
  getRecentEntries,
  getDatabaseInfo,
  initializeDatabase
} from '../database/jsonDB.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initializeDatabase();

app.get('/api/health', (req, res) => {
  const dbInfo = getDatabaseInfo();
  res.json({
    status: 'OK',
    message: 'Database API is running',
    database: {
      total_entries: dbInfo?.total_entries || 0,
      file_size: dbInfo?.file_size || 0,
      last_updated: dbInfo?.last_updated
    },
    timestamp: new Date().toISOString()
  });
});

app.post('/api/save-sentiment', async (req, res) => {
  try {
    const { text, predicted_class, confidence, all_probabilities } = req.body;
    
    if (!text || !predicted_class || !confidence || !all_probabilities) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: text, predicted_class, confidence, all_probabilities'
      });
    }
    
    const result = insertSentimentAnalysis({
      text,
      predicted_class,
      confidence,
      all_probabilities,
      source: 'web_analyzer'
    });
    
    if (result.success) {
      const stats = getSentimentStats();
      const chartData = getChartData();
      
      res.json({
        success: true,
        message: 'Sentiment analysis saved successfully',
        data: result.data,
        current_stats: stats,
        chart_data: chartData
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('Error saving sentiment:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/api/sentiment-data', (req, res) => {
  try {
    const { limit } = req.query;
    const allData = getAllSentimentData();
    
    const data = limit ? allData.slice(0, parseInt(limit)) : allData;
    
    res.json({
      success: true,
      data: data,
      total: allData.length
    });
  } catch (error) {
    console.error('Error getting sentiment data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve sentiment data'
    });
  }
});

app.get('/api/sentiment-stats', (req, res) => {
  try {
    const stats = getSentimentStats();
    const chartData = getChartData();
    const recentEntries = getRecentEntries(5);
    const dbInfo = getDatabaseInfo();
    
    res.json({
      success: true,
      statistics: stats,
      chart_data: chartData,
      recent_entries: recentEntries,
      database_info: {
        total_entries: dbInfo?.total_entries || 0,
        last_updated: dbInfo?.last_updated
      }
    });
  } catch (error) {
    console.error('Error getting sentiment stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve sentiment statistics'
    });
  }
});

app.get('/api/chart-data', (req, res) => {
  try {
    const chartData = getChartData();
    res.json({
      success: true,
      chart_data: chartData
    });
  } catch (error) {
    console.error('Error getting chart data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve chart data'
    });
  }
});

app.delete('/api/clear-data', (req, res) => {
  try {
    const emptyData = {
      sentiment_analysis: [],
      metadata: {
        created_at: new Date().toISOString(),
        total_entries: 0,
        last_updated: new Date().toISOString()
      }
    };
    
    import('../database/jsonDB.js').then(({ writeDatabase }) => {
      const saved = writeDatabase(emptyData);
      if (saved) {
        res.json({
          success: true,
          message: 'All sentiment data cleared successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to clear data'
        });
      }
    });
    
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear data'
    });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Database API server running on http://localhost:${PORT}`);
  console.log('📍 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/save-sentiment`);
  console.log(`   GET  http://localhost:${PORT}/api/sentiment-data`);
  console.log(`   GET  http://localhost:${PORT}/api/sentiment-stats`);
  console.log(`   GET  http://localhost:${PORT}/api/chart-data`);
  console.log(`   DEL  http://localhost:${PORT}/api/clear-data`);
  console.log('\n💡 Ready to receive sentiment analysis data!');
});

export default app;