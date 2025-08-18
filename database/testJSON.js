// database/testJSON.js
import {
  insertSentimentAnalysis,
  getAllSentimentData,
  getSentimentStats,
  getChartData,
  getRecentEntries,
  getDatabaseInfo,
  initializeDatabase
} from './jsonDB.js';

async function testJSONDatabase() {
  console.log('🧪 Testing JSON Database Functions...\n');

  initializeDatabase();

  console.log('📊 Database Info:');
  const dbInfo = getDatabaseInfo();
  console.log(`   - Created: ${dbInfo?.created_at}`);
  console.log(`   - Total entries: ${dbInfo?.total_entries}`);
  console.log(`   - File size: ${dbInfo?.file_size} bytes`);

  console.log('\n📝 Testing data insertion...');
  
  const testData = [
    {
      text: "I absolutely love autonomous vehicles! They make driving so much safer and convenient.",
      predicted_class: "positive",
      confidence: 0.9856,
      all_probabilities: {
        positive: 0.9856,
        negative: 0.0122,
        neutral: 0.0022
      }
    },
    {
      text: "Self-driving cars are dangerous and I don't trust them at all.",
      predicted_class: "negative", 
      confidence: 0.9234,
      all_probabilities: {
        positive: 0.0234,
        negative: 0.9234,
        neutral: 0.0532
      }
    },
    {
      text: "Autonomous vehicles have both good and bad aspects, I'm not sure about them.",
      predicted_class: "neutral",
      confidence: 0.7845,
      all_probabilities: {
        positive: 0.1234,
        negative: 0.0921,
        neutral: 0.7845
      }
    },
    {
      text: "Tesla Autopilot is absolutely amazing! Best technology ever created!",
      predicted_class: "positive",
      confidence: 0.9678,
      all_probabilities: {
        positive: 0.9678,
        negative: 0.0234,
        neutral: 0.0088
      }
    },
    {
      text: "I hate these self-driving features, they're scary and unreliable.",
      predicted_class: "negative",
      confidence: 0.8765,
      all_probabilities: {
        positive: 0.0445,
        negative: 0.8765,
        neutral: 0.0790
      }
    },
    {
      text: "Lane assist is pretty good, but I'm still learning how to use it properly.",
      predicted_class: "neutral",
      confidence: 0.6543,
      all_probabilities: {
        positive: 0.2987,
        negative: 0.0470,
        neutral: 0.6543
      }
    }
  ];

  let successCount = 0;
  testData.forEach((data, index) => {
    const result = insertSentimentAnalysis(data);
    if (result.success) {
      successCount++;
      console.log(`   ${index + 1}. ✅ ${data.predicted_class} sentiment (ID: ${result.id})`);
    } else {
      console.log(`   ${index + 1}. ❌ Failed: ${result.error}`);
    }
  });

  console.log(`\n📊 Inserted ${successCount}/${testData.length} records successfully`);
  console.log('\n📄 Testing data retrieval...');
  const allData = getAllSentimentData();
  console.log(`   Total records in database: ${allData.length}`);

  console.log('\n📈 Sentiment Statistics:');
  const stats = getSentimentStats();
  stats.forEach(stat => {
    console.log(`   ${stat.predicted_class.toUpperCase()}: ${stat.count} records (${stat.percentage}%) - Avg Confidence: ${(stat.avg_confidence * 100).toFixed(1)}%`);
  });

  console.log('\n📊 Chart Data for Frontend:');
  const chartData = getChartData();
  chartData.forEach(data => {
    console.log(`   ${data.name}: ${data.value}% (${data.count} records)`);
  });

  console.log('\n📝 Recent Entries (Last 3):');
  const recentEntries = getRecentEntries(3);
  recentEntries.forEach((entry, index) => {
    const shortText = entry.text.length > 50 ? entry.text.substring(0, 50) + '...' : entry.text;
    console.log(`   ${index + 1}. "${shortText}" → ${entry.predicted_class.toUpperCase()} (${(entry.confidence * 100).toFixed(1)}%)`);
  });

  console.log('\n📁 Database File:');
  console.log(`   Location: ${getDatabaseInfo()?.file_path}`);
  console.log(`   Size: ${getDatabaseInfo()?.file_size} bytes`);

  console.log('\n🎉 JSON Database test completed successfully!');
  console.log('\n💡 Next step: Integrate with your React frontend');
  
  console.log('\n📄 Sample of database content:');
  const sampleData = getAllSentimentData().slice(0, 2);
  console.log(JSON.stringify(sampleData, null, 2));
}

testJSONDatabase();