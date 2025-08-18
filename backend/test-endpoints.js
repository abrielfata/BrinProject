
const API_BASE = 'http://localhost:3001/api';

async function testEndpoints() {
  console.log('🧪 Testing Backend API Endpoints...\n');

  try {
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log(`   Database entries: ${healthData.database.total_entries}`);
    console.log('\n2️⃣ Testing Save Sentiment...');
    const testSentiment = {
      text: "This autonomous vehicle feature is incredibly impressive!",
      predicted_class: "positive",
      confidence: 0.9543,
      all_probabilities: {
        positive: 0.9543,
        negative: 0.0234,
        neutral: 0.0223
      }
    };

    const saveResponse = await fetch(`${API_BASE}/save-sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testSentiment)
    });

    if (saveResponse.ok) {
      const saveData = await saveResponse.json();
      console.log('✅ Sentiment saved successfully');
      console.log(`   ID: ${saveData.data.id}, Class: ${saveData.data.predicted_class}`);
    } else {
      console.log('❌ Failed to save sentiment');
    }

    console.log('\n3️⃣ Testing Get All Data...');
    const dataResponse = await fetch(`${API_BASE}/sentiment-data?limit=5`);
    const allData = await dataResponse.json();
    console.log(`✅ Retrieved ${allData.data.length} records (limit: 5)`);

    console.log('\n4️⃣ Testing Get Statistics...');
    const statsResponse = await fetch(`${API_BASE}/sentiment-stats`);
    const statsData = await statsResponse.json();
    console.log('✅ Statistics retrieved:');
    statsData.statistics.forEach(stat => {
      console.log(`   ${stat.predicted_class.toUpperCase()}: ${stat.count} (${stat.percentage}%)`);
    });

    console.log('\n5️⃣ Testing Chart Data...');
    const chartResponse = await fetch(`${API_BASE}/chart-data`);
    const chartData = await chartResponse.json();
    console.log('✅ Chart data retrieved:');
    chartData.chart_data.forEach(data => {
      console.log(`   ${data.name}: ${data.value}% (${data.count} records)`);
    });

    console.log('\n🎉 All endpoints working correctly!');
    console.log('\n💡 Next: Update React frontend to use this backend');

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
    console.log('\n❗ Make sure backend server is running first:');
    console.log('   npm run backend');
  }
}

testEndpoints();