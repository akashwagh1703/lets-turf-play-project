// Simple Node.js script to test the backend API directly
const https = require('http');

// Test data
const testData = {
  baseUrl: 'http://localhost:8000/api',
  endpoints: [
    '/turf-owners',
    '/turf-owners/4'  // Test with known ID
  ]
};

console.log('🧪 Testing backend API directly...\n');

// Function to make HTTP request
function makeRequest(url, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Test function
async function testEndpoints() {
  for (const endpoint of testData.endpoints) {
    const url = testData.baseUrl + endpoint;
    console.log(`📡 Testing: ${url}`);
    
    try {
      const response = await makeRequest(url);
      console.log(`✅ Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
      } else {
        console.log('❌ Error response:', response.data);
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
    
    console.log('---\n');
  }
}

// Run tests
testEndpoints().catch(console.error);