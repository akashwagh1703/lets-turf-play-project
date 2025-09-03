const axios = require('axios');

const API_BASE = 'http://127.0.0.1:8000/api';
let authToken = '';

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
};

const test = async (name, testFn) => {
  try {
    log(`Running test: ${name}`);
    await testFn();
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASSED' });
    log(`✅ ${name} - PASSED`, 'success');
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAILED', error: error.message });
    log(`❌ ${name} - FAILED: ${error.message}`, 'error');
  }
};

const apiCall = async (method, endpoint, data = null, headers = {}) => {
  const config = {
    method,
    url: `${API_BASE}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers
    }
  };
  
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

const runTests = async () => {
  log('Starting automated feature testing...');
  
  // Test 1: Authentication
  await test('User Login', async () => {
    const response = await apiCall('POST', '/login', {
      email: 'admin@example.com',
      password: 'password'
    });
    
    if (response.status !== 200) throw new Error('Login failed');
    if (!response.data.access_token) throw new Error('No access token received');
    
    authToken = response.data.access_token;
  });
  
  // Test 2: Dashboard Stats
  await test('Dashboard Stats API', async () => {
    const response = await apiCall('GET', '/dashboard/stats');
    if (response.status !== 200) throw new Error('Dashboard stats failed');
    if (!response.data) throw new Error('No dashboard data received');
  });
  
  // Test 3: Turfs API
  await test('Turfs CRUD Operations', async () => {
    // Get turfs
    const getResponse = await apiCall('GET', '/turfs');
    if (getResponse.status !== 200) throw new Error('Get turfs failed');
    
    // Create turf
    const createResponse = await apiCall('POST', '/turfs', {
      turf_name: 'Test Turf',
      location: 'Test Location',
      capacity: 22,
      price_per_hour: 2000,
      status: true
    });
    if (createResponse.status !== 201) throw new Error('Create turf failed');
    
    const turfId = createResponse.data.id;
    
    // Update turf
    const updateResponse = await apiCall('PUT', `/turfs/${turfId}`, {
      turf_name: 'Updated Test Turf',
      location: 'Updated Location',
      capacity: 24,
      price_per_hour: 2500,
      status: true
    });
    if (updateResponse.status !== 200) throw new Error('Update turf failed');
    
    // Delete turf
    const deleteResponse = await apiCall('DELETE', `/turfs/${turfId}`);
    if (deleteResponse.status !== 200) throw new Error('Delete turf failed');
  });
  
  // Test 4: Bookings API
  await test('Bookings API', async () => {
    const response = await apiCall('GET', '/bookings');
    if (response.status !== 200) throw new Error('Get bookings failed');
  });
  
  // Test 5: Staff API
  await test('Staff API', async () => {
    const response = await apiCall('GET', '/staff');
    if (response.status !== 200) throw new Error('Get staff failed');
  });
  
  // Test 6: Analytics API
  await test('Advanced Analytics API', async () => {
    const response = await apiCall('GET', '/analytics/advanced?days=30');
    if (response.status !== 200) throw new Error('Analytics API failed');
    
    const data = response.data;
    if (!data.revenue || !data.bookings || !data.userGrowth || !data.turfUtilization) {
      throw new Error('Analytics data incomplete');
    }
  });
  
  // Test 7: Notifications API
  await test('Notifications API', async () => {
    const response = await apiCall('GET', '/notifications/1');
    if (response.status !== 200) throw new Error('Notifications API failed');
  });
  
  // Test 8: Revenue Models API
  await test('Revenue Models API', async () => {
    const response = await apiCall('GET', '/revenue-models');
    if (response.status !== 200) throw new Error('Revenue models API failed');
  });
  
  // Test 9: Players API
  await test('Players API', async () => {
    const response = await apiCall('GET', '/players');
    if (response.status !== 200) throw new Error('Players API failed');
  });
  
  // Test 10: Subscriptions API
  await test('Subscriptions API', async () => {
    const response = await apiCall('GET', '/subscriptions');
    if (response.status !== 200) throw new Error('Subscriptions API failed');
  });
  
  // Print results
  log('\n=== TEST RESULTS ===');
  log(`Total Tests: ${testResults.passed + testResults.failed}`);
  log(`Passed: ${testResults.passed}`, 'success');
  log(`Failed: ${testResults.failed}`, 'error');
  log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`);
  
  if (testResults.failed > 0) {
    log('\n=== FAILED TESTS ===');
    testResults.tests.filter(t => t.status === 'FAILED').forEach(test => {
      log(`❌ ${test.name}: ${test.error}`, 'error');
    });
  }
  
  process.exit(testResults.failed > 0 ? 1 : 0);
};

runTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});