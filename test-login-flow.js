const axios = require('axios');

const API_BASE = 'http://127.0.0.1:8000/api';
const users = [
  { email: 'admin@example.com', password: 'password', role: 'super_admin' },
  { email: 'owner@example.com', password: 'password', role: 'turf_owner' },
  { email: 'staff@example.com', password: 'password', role: 'staff' }
];

const testLoginFlow = async () => {
  console.log('🔄 Testing Login Flow...\n');

  for (const user of users) {
    try {
      console.log(`Testing ${user.role} login...`);
      
      // Test login
      const loginResponse = await axios.post(`${API_BASE}/login`, {
        email: user.email,
        password: user.password
      });

      if (loginResponse.data.access_token && loginResponse.data.user) {
        console.log(`✅ ${user.role} login successful`);
        console.log(`   Token: ${loginResponse.data.access_token.substring(0, 20)}...`);
        console.log(`   User: ${loginResponse.data.user.name} (${loginResponse.data.user.role})`);

        // Test authenticated request
        const dashboardResponse = await axios.get(`${API_BASE}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${loginResponse.data.access_token}` }
        });

        console.log(`✅ ${user.role} dashboard access successful`);
        console.log(`   Stats keys: ${Object.keys(dashboardResponse.data).join(', ')}`);
      } else {
        console.log(`❌ ${user.role} login failed - missing token or user data`);
      }
    } catch (error) {
      console.log(`❌ ${user.role} login failed: ${error.response?.data?.message || error.message}`);
    }
    console.log('');
  }

  console.log('✅ Login flow testing completed!');
};

testLoginFlow().catch(console.error);