import pg from 'pg';
const { Pool } = pg;

// Database connection configuration
let pool = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
  });
} else {
  console.error('DATABASE_URL not found. PostgreSQL features disabled.');
}

// Test database connection
async function testConnection() {
  if (!pool) {
    return false;
  }
  
  try {
    const client = await pool.connect();
    // PostgreSQL connected successfully
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    return false;
  }
}

export async function initializeDatabase() {
  // Initializing PostgreSQL Database
  
  if (!pool) {
    // PostgreSQL not configured - using fallback mode
    return {
      total_entries: 0,
      last_updated: null,
      status: 'fallback_mode'
    };
  }
  
  const isConnected = await testConnection();
  if (!isConnected) {
    // PostgreSQL connection failed - using fallback mode
    return {
      total_entries: 0,
      last_updated: null,
      status: 'connection_failed'
    };
  }

  try {
    // Get database stats
    const stats = await getDatabaseStats();
    // Database initialized successfully
    
    return stats;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    // Using fallback mode
    return {
      total_entries: 0,
      last_updated: null,
      status: 'error'
    };
  }
}

export async function insertSentimentAnalysis(analysisData) {
  if (!pool) {
    return { success: false, error: 'PostgreSQL not configured' };
  }
  
  try {
    const query = `
      INSERT INTO sentiment_analysis (
        text, predicted_class, confidence, 
        positive_prob, negative_prob, neutral_prob, source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      analysisData.text,
      analysisData.predicted_class,
      analysisData.confidence,
      analysisData.all_probabilities.positive,
      analysisData.all_probabilities.negative,
      analysisData.all_probabilities.neutral,
      analysisData.source || 'web_analyzer'
    ];

    const result = await pool.query(query, values);
    const newEntry = result.rows[0];
    
    // Data inserted successfully
    return { 
      success: true, 
      id: newEntry.id, 
      data: {
        ...newEntry,
        // Convert back to original format for consistency
        all_probabilities: {
          positive: newEntry.positive_prob,
          negative: newEntry.negative_prob,
          neutral: newEntry.neutral_prob
        }
      }
    };
    
  } catch (error) {
    console.error('❌ Error inserting data:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllSentimentData() {
  if (!pool) {
    return [];
  }
  
  try {
    const query = `
      SELECT id, text, predicted_class, confidence,
             positive_prob, negative_prob, neutral_prob,
             source, created_at, updated_at
      FROM sentiment_analysis 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    // Transform data to match original JSON format
    return result.rows.map(row => ({
      ...row,
      all_probabilities: {
        positive: row.positive_prob,
        negative: row.negative_prob,
        neutral: row.neutral_prob
      }
    }));
    
  } catch (error) {
    console.error('❌ Error getting all data:', error);
    return [];
  }
}

export async function getSentimentStats() {
  if (!pool) {
    return [];
  }
  
  try {
    const query = `
      SELECT 
        predicted_class,
        COUNT(*) as count,
        AVG(confidence) as avg_confidence,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM sentiment_analysis)), 2) as percentage
      FROM sentiment_analysis
      GROUP BY predicted_class
      ORDER BY count DESC
    `;
    
    const result = await pool.query(query);
    
    return result.rows.map(row => ({
      predicted_class: row.predicted_class,
      count: parseInt(row.count),
      avg_confidence: parseFloat(parseFloat(row.avg_confidence).toFixed(4)),
      percentage: parseFloat(row.percentage)
    }));
    
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    return [];
  }
}

export function getChartData() {
  return getSentimentStats().then(stats => {
    return stats.map(stat => ({
      name: stat.predicted_class.charAt(0).toUpperCase() + stat.predicted_class.slice(1),
      value: stat.percentage,
      count: stat.count,
      avgConfidence: stat.avg_confidence,
      color: getSentimentColor(stat.predicted_class)
    }));
  }).catch(error => {
    console.error('❌ Error getting chart data:', error);
    return [];
  });
}

export function getSentimentColor(sentiment) {
  const colors = {
    positive: '#22c55e',
    negative: '#ef4444',
    neutral: '#6b7280'
  };
  return colors[sentiment] || '#6b7280';
}

export async function getRecentEntries(limit = 10) {
  if (!pool) {
    return [];
  }
  
  try {
    const query = `
      SELECT id, text, predicted_class, confidence,
             positive_prob, negative_prob, neutral_prob,
             source, created_at
      FROM sentiment_analysis 
      ORDER BY created_at DESC 
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    return result.rows.map(row => ({
      ...row,
      all_probabilities: {
        positive: row.positive_prob,
        negative: row.negative_prob,
        neutral: row.neutral_prob
      }
    }));
    
  } catch (error) {
    console.error('❌ Error getting recent entries:', error);
    return [];
  }
}

export async function getDatabaseInfo() {
  if (!pool) {
    return {
      total_entries: 0,
      last_updated: null,
      database_type: 'PostgreSQL (Not Configured)',
      connection_status: 'disconnected'
    };
  }
  
  try {
    const stats = await getDatabaseStats();
    return {
      total_entries: stats.total_entries,
      last_updated: stats.last_updated,
      database_type: 'PostgreSQL',
      connection_status: 'connected'
    };
  } catch (error) {
    console.error('❌ Error getting database info:', error);
    return {
      total_entries: 0,
      last_updated: null,
      database_type: 'PostgreSQL',
      connection_status: 'error'
    };
  }
}

export async function clearAllData() {
  if (!pool) {
    return { success: false, error: 'PostgreSQL not configured' };
  }
  
  try {
    const query = 'DELETE FROM sentiment_analysis';
    await pool.query(query);
    
    // All sentiment data cleared successfully
    return { success: true, message: 'All data cleared successfully' };
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    return { success: false, error: error.message };
  }
}

async function getDatabaseStats() {
  if (!pool) {
    return {
      total_entries: 0,
      last_updated: null
    };
  }
  
  try {
    const countQuery = 'SELECT COUNT(*) as total FROM sentiment_analysis';
    const lastUpdateQuery = `
      SELECT MAX(created_at) as last_updated 
      FROM sentiment_analysis
    `;
    
    const [countResult, updateResult] = await Promise.all([
      pool.query(countQuery),
      pool.query(lastUpdateQuery)
    ]);
    
    return {
      total_entries: parseInt(countResult.rows[0].total),
      last_updated: updateResult.rows[0].last_updated
    };
    
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    return {
      total_entries: 0,
      last_updated: null
    };
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  // Closing PostgreSQL connections
  await pool.end();
  // PostgreSQL connections closed
  process.exit(0);
});

export default pool;