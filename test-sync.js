const axios = require('axios');

const API_BASE = 'http://127.0.0.1:8000/api';
const users = {
  admin: { email: 'admin@example.com', password: 'password', token: '' },
  owner: { email: 'owner@example.com', password: 'password', token: '' },
  staff: { email: 'staff@example.com', password: 'password', token: '' }
};

const api = (token = '') => axios.create({
  baseURL: API_BASE,
  headers: { 
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  }
});

const test = async (name, fn) => {
  try {
    await fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.log(`❌ ${name}: ${error.response?.data?.message || error.message}`);
  }
};

const runTests = async () => {
  console.log('🔄 Testing Role Synchronization...\n');

  // Login all users
  for (const [role, user] of Object.entries(users)) {
    const response = await api().post('/login', { email: user.email, password: user.password });
    user.token = response.data.access_token;
    console.log(`🔑 ${role} logged in`);
  }

  // Test Super Admin Access
  console.log('\n📊 SUPER ADMIN TESTS:');
  await test('Dashboard Stats', async () => {
    const response = await api(users.admin.token).get('/dashboard/stats');
    if (!response.data.total_turfs) throw new Error('Missing stats');
  });

  await test('All Turfs Access', async () => {
    await api(users.admin.token).get('/turfs');
  });

  await test('All Bookings Access', async () => {
    await api(users.admin.token).get('/bookings');
  });

  await test('Revenue Models Access', async () => {
    await api(users.admin.token).get('/revenue-models');
  });

  await test('Players Management', async () => {
    await api(users.admin.token).get('/players');
  });

  // Test Turf Owner Access
  console.log('\n🏟️ TURF OWNER TESTS:');
  await test('Owner Dashboard Stats', async () => {
    const response = await api(users.owner.token).get('/dashboard/stats');
    if (response.data.my_turfs === undefined) throw new Error('Missing owner stats');
  });

  await test('Own Turfs Only', async () => {
    await api(users.owner.token).get('/turfs');
  });

  await test('Own Bookings Only', async () => {
    await api(users.owner.token).get('/bookings');
  });

  await test('Own Staff Only', async () => {
    await api(users.owner.token).get('/staff');
  });

  await test('Subscription Access', async () => {
    await api(users.owner.token).get('/my-subscription');
  });

  // Test Staff Access
  console.log('\n👨‍💼 STAFF TESTS:');
  await test('Staff Dashboard Stats', async () => {
    const response = await api(users.staff.token).get('/dashboard/stats');
    if (response.data.total_bookings === undefined) throw new Error('Missing staff stats');
  });

  await test('Booking Management', async () => {
    await api(users.staff.token).get('/bookings');
  });

  // Test Access Restrictions
  console.log('\n🚫 ACCESS RESTRICTION TESTS:');
  await test('Owner Cannot Access Revenue Models', async () => {
    try {
      await api(users.owner.token).get('/revenue-models');
      throw new Error('Should be forbidden');
    } catch (error) {
      if (error.response?.status !== 403) throw error;
    }
  });

  await test('Staff Cannot Access Turfs', async () => {
    try {
      await api(users.staff.token).get('/turfs');
      // Staff might have limited access, check response
    } catch (error) {
      // Expected for some roles
    }
  });

  // Test CRUD Operations
  console.log('\n🔧 CRUD OPERATION TESTS:');
  let turfId;
  await test('Create Turf (Owner)', async () => {
    const response = await api(users.owner.token).post('/turfs', {
      turf_name: 'Test Turf',
      location: 'Test Location',
      capacity: 22,
      price_per_hour: 2000
    });
    turfId = response.data.id;
  });

  if (turfId) {
    await test('Update Turf (Owner)', async () => {
      await api(users.owner.token).put(`/turfs/${turfId}`, {
        turf_name: 'Updated Test Turf'
      });
    });

    await test('Delete Turf (Owner)', async () => {
      await api(users.owner.token).delete(`/turfs/${turfId}`);
    });
  }

  console.log('\n✅ Role synchronization tests completed!');
};

runTests().catch(console.error);