import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Plus, Eye, Edit, Trash2, MapPin, Users, DollarSign, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiService } from '../services/api';

const MyTurfs = () => {
  const navigate = useNavigate();
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMyTurfs();
  }, []);

  const fetchMyTurfs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTurfs({ owner_only: true });
      setTurfs(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to load turfs');
      setTurfs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, turfName) => {
    const result = await Swal.fire({
      title: 'Delete Turf',
      html: `Are you sure you want to delete <strong>${turfName}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await apiService.deleteTurf(id);
        toast.success('Turf deleted successfully!');
        fetchMyTurfs();
      } catch (error) {
        toast.error('Failed to delete turf');
      }
    }
  };

  const filteredTurfs = turfs.filter(turf =>
    turf.turf_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turf.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your turfs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50/30 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Turfs</h1>
            <p className="text-gray-600 mt-1">Manage your turf listings</p>
          </div>
          <button
            onClick={() => navigate('/owner/turfs/add')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add New Turf</span>
          </button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search turfs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </motion.div>

        {/* Turfs Grid */}
        {filteredTurfs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
          >
            <Building size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Turfs Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'No turfs match your search.' : 'You haven\'t added any turfs yet.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/owner/turfs/add')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus size={16} />
                <span>Add Your First Turf</span>
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTurfs.map((turf, index) => (
              <motion.div
                key={turf.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
              >
                {/* Turf Image */}
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Building className="w-16 h-16 text-white" />
                </div>

                {/* Turf Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{turf.turf_name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      turf.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {turf.status ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={14} className="mr-2" />
                      {turf.location || 'Location not specified'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users size={14} className="mr-2" />
                      {turf.capacity || 'N/A'} players
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign size={14} className="mr-2" />
                      ₹{turf.price_per_hour || 0}/hour
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/owner/turfs/view/${turf.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Turf"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/owner/turfs/edit/${turf.id}`)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit Turf"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(turf.id, turf.turf_name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Turf"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="text-xs text-gray-400">
                      ID: {turf.id}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTurfs;