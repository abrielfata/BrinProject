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

// FIXED: Dynamic CORS configuration yang lebih permissive
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://brin-six.vercel.app',
      'https://brin-project-kp.vercel.app',
      // IMPORTANT: Tambahkan pattern untuk semua preview deployments Vercel
      /https:\/\/brin-.*\.vercel\.app$/,
      /https:\/\/.*-fates-projects.*\.vercel\.app$/,
      process.env.FRONTEND_URL
    ].filter(Boolean)
  : [
      'http://localhost:5173', 
      'http://localhost:3000',
      'http://localhost:5174'
    ];

// FIXED: CORS configuration yang lebih robust
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed origins array
    const isAllowedString = allowedOrigins.includes(origin);
    
    // Check if origin matches any RegExp patterns
    const isAllowedPattern = allowedOrigins.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(origin);
      }
      return false;
    });
    
    // Allow if matches string or pattern, or in development mode
    if (isAllowedString || isAllowedPattern || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('⚠️ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // IMPORTANT: Explicitly handle preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// ADDED: Explicit OPTIONS handling for all routes
app.options('*', cors());

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
      environment: process.env.NODE_ENV || 'development',
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
  console.log(`🚀 Database API server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('📍 Available endpoints:');
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/save-sentiment`);
  console.log(`   GET  /api/sentiment-data`);
  console.log(`   GET  /api/sentiment-stats`);
  console.log(`   GET  /api/chart-data`);
  console.log(`   DEL  /api/clear-data`);
  console.log(`   POST /api/predict`);
  console.log(`   POST /api/batch_predict`);
  console.log('\n💡 Ready to receive sentiment analysis data!');
  
  // Log allowed origins
  console.log('\n🔒 CORS Configuration:');
  console.log('   Allowed Origins:', allowedOrigins);
});

export default app;