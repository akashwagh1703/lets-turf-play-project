import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';

const DebugTurfOwner = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        console.log('Fetching owner with ID:', id);
        const response = await apiService.getTurfOwner(id);
        console.log('API Response:', response);
        console.log('Response Data:', response.data);
        setData(response.data);
      } catch (err) {
        console.error('API Error:', err);
        console.error('Error Response:', err.response);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOwner();
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-6">
      <h1>Debug Turf Owner Data</h1>
      <div className="mt-4">
        <h2>Raw API Response:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
      
      <div className="mt-4">
        <h2>Parsed Fields:</h2>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <strong>Name:</strong> {data?.name || 'N/A'}
          </div>
          <div>
            <strong>Email:</strong> {data?.email || 'N/A'}
          </div>
          <div>
            <strong>Phone:</strong> {data?.phone || 'N/A'}
          </div>
          <div>
            <strong>Business Name:</strong> {data?.business_name || 'N/A'}
          </div>
          <div>
            <strong>Business Description:</strong> {data?.business_description || 'N/A'}
          </div>
          <div>
            <strong>Business Logo:</strong> {data?.business_logo || 'N/A'}
          </div>
          <div>
            <strong>Business Address:</strong> {data?.business_address || 'N/A'}
          </div>
          <div>
            <strong>Business Type:</strong> {data?.business_type || 'N/A'}
          </div>
          <div>
            <strong>GST Number:</strong> {data?.gst_number || 'N/A'}
          </div>
          <div>
            <strong>PAN Number:</strong> {data?.pan_number || 'N/A'}
          </div>
          <div>
            <strong>Bank Account:</strong> {data?.bank_account || 'N/A'}
          </div>
          <div>
            <strong>Bank IFSC:</strong> {data?.bank_ifsc || 'N/A'}
          </div>
          <div>
            <strong>Status:</strong> {data?.status ? 'Active' : 'Inactive'}
          </div>
          <div>
            <strong>Turfs:</strong> {data?.turfs?.length || 0}
          </div>
          <div>
            <strong>Subscriptions:</strong> {data?.subscriptions?.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugTurfOwner;