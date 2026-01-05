import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
import {
  insertSentimentAnalysis,
  getAllSentimentData,
  getSentimentStats,
  getChartData,
  getRecentEntries,
  getDatabaseInfo,
  initializeDatabase,
  clearAllData
} from './postgresDB.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://brin-six.vercel.app','https://brin-project-kp.vercel.app'] // Your actual Vercel URL
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize PostgreSQL database
(async () => {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
})();

app.get('/api/health', async (req, res) => {
  try {
    const dbInfo = await getDatabaseInfo();
    res.json({
      status: 'OK',
      message: 'Database API is running',
      database: {
        total_entries: dbInfo?.total_entries || 0,
        database_type: dbInfo?.database_type || 'PostgreSQL',
        connection_status: dbInfo?.connection_status || 'unknown',
        last_updated: dbInfo?.last_updated
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
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
    
    const result = await insertSentimentAnalysis({
      text,
      predicted_class,
      confidence,
      all_probabilities,
      source: 'web_analyzer'
    });
    
    if (result.success) {
      const [stats, chartData] = await Promise.all([
        getSentimentStats(),
        getChartData()
      ]);
      
      
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

app.get('/api/sentiment-data', async (req, res) => {
  try {
    const { limit } = req.query;
    const allData = await getAllSentimentData();
    
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

app.get('/api/sentiment-stats', async (req, res) => {
  try {
    const [stats, chartData, recentEntries, dbInfo] = await Promise.all([
      getSentimentStats(),
      getChartData(),
      getRecentEntries(5),
      getDatabaseInfo()
    ]);
    
    res.json({
      success: true,
      statistics: stats,
      chart_data: chartData,
      recent_entries: recentEntries,
      database_info: {
        total_entries: dbInfo?.total_entries || 0,
        last_updated: dbInfo?.last_updated,
        database_type: dbInfo?.database_type || 'PostgreSQL'
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

app.get('/api/chart-data', async (req, res) => {
  try {
    const chartData = await getChartData();
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

app.delete('/api/clear-data', async (req, res) => {
  try {
    const result = await clearAllData();
    
    if (result.success) {
      
      res.json({
        success: true,
        message: 'All sentiment data cleared successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to clear data'
      });
    }
    
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear data'
    });
  }
});

// Proxy endpoints for ML API to avoid CORS issues
app.post('/api/predict', async (req, res) => {
  try {
    const response = await fetch('https://sentiment-4c5g.onrender.com/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      let errorData;
      const responseClone = response.clone();
      try {
        errorData = await response.json();
      } catch (parseError) {
        // Handle non-JSON responses (like "Too Many Requests" plain text)
        const textData = await responseClone.text();
        errorData = { error: textData || 'Unknown error occurred' };
      }
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('ML API predict error:', error);
    res.status(500).json({
      error: 'Failed to connect to ML API'
    });
  }
});

app.post('/api/batch_predict', async (req, res) => {
  try {
    const response = await fetch('https://sentiment-4c5g.onrender.com/batch_predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      let errorData;
      const responseClone = response.clone();
      try {
        errorData = await response.json();
      } catch (parseError) {
        // Handle non-JSON responses (like "Too Many Requests" plain text)
        const textData = await responseClone.text();
        errorData = { error: textData || 'Unknown error occurred' };
      }
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('ML API batch_predict error:', error);
    res.status(500).json({
      error: 'Failed to connect to ML API'
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
  console.log(`   POST http://localhost:${PORT}/api/predict`);
  console.log(`   POST http://localhost:${PORT}/api/batch_predict`);
  console.log('\n💡 Ready to receive sentiment analysis data!');
});

export default app;