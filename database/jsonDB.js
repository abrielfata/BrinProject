
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'sentiment_data.json');

const initialData = {
  sentiment_analysis: [],
  metadata: {
    created_at: new Date().toISOString(),
    total_entries: 0,
    last_updated: new Date().toISOString()
  }
};

export function readDatabase() {
  try {
    if (!fs.existsSync(dbPath)) {
      writeDatabase(initialData);
      console.log('✅ New database file created');
      return initialData;
    }
    
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error reading database:', error);
    return initialData;
  }
}
export function writeDatabase(data) {
  try {
    data.metadata.last_updated = new Date().toISOString();
    data.metadata.total_entries = data.sentiment_analysis.length;
    
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error writing database:', error);
    return false;
  }
}

export function insertSentimentAnalysis(analysisData) {
  try {
    const db = readDatabase();
    
    const newId = db.sentiment_analysis.length > 0 
      ? Math.max(...db.sentiment_analysis.map(item => item.id)) + 1 
      : 1;
    
    const newEntry = {
      id: newId,
      text: analysisData.text,
      predicted_class: analysisData.predicted_class,
      confidence: analysisData.confidence,
      positive_prob: analysisData.all_probabilities.positive,
      negative_prob: analysisData.all_probabilities.negative,
      neutral_prob: analysisData.all_probabilities.neutral,
      created_at: new Date().toISOString(),
      source: analysisData.source || 'web_analyzer'
    };
    
    db.sentiment_analysis.push(newEntry);
    
    const saved = writeDatabase(db);
    
    if (saved) {
      console.log('✅ Data inserted with ID:', newId);
      return { success: true, id: newId, data: newEntry };
    } else {
      return { success: false, error: 'Failed to save to file' };
    }
    
  } catch (error) {
    console.error('❌ Error inserting data:', error);
    return { success: false, error: error.message };
  }
}

export function getAllSentimentData() {
  try {
    const db = readDatabase();
    return db.sentiment_analysis.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error('❌ Error getting all data:', error);
    return [];
  }
}

export function getSentimentStats() {
  try {
    const db = readDatabase();
    const data = db.sentiment_analysis;
    
    if (data.length === 0) {
      return [];
    }
    
    const stats = {};
    
    data.forEach(entry => {
      const sentiment = entry.predicted_class;
      if (!stats[sentiment]) {
        stats[sentiment] = {
          count: 0,
          confidenceSum: 0
        };
      }
      stats[sentiment].count++;
      stats[sentiment].confidenceSum += entry.confidence;
    });
    
    const total = data.length;
    return Object.entries(stats).map(([sentiment, stat]) => ({
      predicted_class: sentiment,
      count: stat.count,
      avg_confidence: parseFloat((stat.confidenceSum / stat.count).toFixed(4)),
      percentage: parseFloat(((stat.count / total) * 100).toFixed(2))
    })).sort((a, b) => b.count - a.count);
    
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    return [];
  }
}

export function getChartData() {
  try {
    const stats = getSentimentStats();
    return stats.map(stat => ({
      name: stat.predicted_class.charAt(0).toUpperCase() + stat.predicted_class.slice(1),
      value: stat.percentage,
      count: stat.count,
      avgConfidence: stat.avg_confidence,
      color: getSentimentColor(stat.predicted_class)
    }));
  } catch (error) {
    console.error('❌ Error getting chart data:', error);
    return [];
  }
}

export function getSentimentColor(sentiment) {
  const colors = {
    positive: '#22c55e',
    negative: '#ef4444',
    neutral: '#6b7280'
  };
  return colors[sentiment] || '#6b7280';
}

export function getRecentEntries(limit = 10) {
  try {
    const data = getAllSentimentData();
    return data.slice(0, limit);
  } catch (error) {
    console.error('❌ Error getting recent entries:', error);
    return [];
  }
}

export function getDatabaseInfo() {
  try {
    const db = readDatabase();
    return {
      ...db.metadata,
      file_size: fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0,
      file_path: dbPath
    };
  } catch (error) {
    console.error('❌ Error getting database info:', error);
    return null;
  }
}

export function initializeDatabase() {
  console.log('🗄️  Initializing JSON Database...');
  const db = readDatabase();
  console.log('📊 Current database status:');
  console.log(`   - Total entries: ${db.sentiment_analysis.length}`);
  console.log(`   - Database file: ${dbPath}`);
  console.log('✅ JSON Database ready!');
  return db;
}