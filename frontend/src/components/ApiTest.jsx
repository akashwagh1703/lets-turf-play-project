import React, { useState } from 'react';
import { apiService } from '../services/api';

const ApiTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing API connection...');
      
      // Test 1: Check if we can get turf owners list
      console.log('📋 Testing getTurfOwners...');
      const ownersResponse = await apiService.getTurfOwners({ per_page: 5 });
      console.log('✅ getTurfOwners response:', ownersResponse);
      
      if (ownersResponse.data?.data?.length > 0) {
        const firstOwnerId = ownersResponse.data.data[0].id;
        console.log(`🎯 Testing getTurfOwner with ID: ${firstOwnerId}`);
        
        // Test 2: Get specific owner
        const ownerResponse = await apiService.getTurfOwner(firstOwnerId);
        console.log('✅ getTurfOwner response:', ownerResponse);
        
        setResult({
          ownersCount: ownersResponse.data.data.length,
          firstOwner: ownersResponse.data.data[0],
          ownerDetails: ownerResponse.data
        });
      } else {
        setResult({ message: 'No turf owners found' });
      }
      
    } catch (err) {
      console.error('❌ API Test failed:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>
      
      <button
        onClick={testApi}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg mb-4"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold mb-2">API Test Results:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-bold mb-2">Current Token:</h3>
        <p className="text-sm bg-gray-100 p-2 rounded break-all">
          {localStorage.getItem('token') || 'No token found'}
        </p>
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">Current User:</h3>
        <p className="text-sm bg-gray-100 p-2 rounded">
          {localStorage.getItem('user') || 'No user found'}
        </p>
      </div>
    </div>
  );
};

export default ApiTest;