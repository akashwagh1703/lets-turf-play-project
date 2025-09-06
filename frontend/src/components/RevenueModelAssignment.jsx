import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Gift, DollarSign, Calendar, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

const RevenueModelAssignment = () => {
  const [turfOwners, setTurfOwners] = useState([]);
  const [revenueModels, setRevenueModels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    revenue_model_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_free_assignment: false,
    notes: ''
  });

  useEffect(() => {
    fetchTurfOwners();
    fetchRevenueModels();
  }, []);

  const fetchTurfOwners = async () => {
    try {
      const response = await apiService.getTurfOwners();
      const data = response.data?.data || response.data || [];
      setTurfOwners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch turf owners:', error);
      toast.error('Failed to load turf owners');
      setTurfOwners([]);
    }
  };

  const fetchRevenueModels = async () => {
    try {
      const response = await apiService.getRevenueModels();
      const data = response.data?.data || response.data || [];
      setRevenueModels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch revenue models:', error);
      toast.error('Failed to load revenue models');
      setRevenueModels([]);
    }
  };

  const handleAssignModel = () => {
    setShowAssignModal(true);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    
    try {
      const selectedModel = revenueModels.find(m => m.id === parseInt(assignmentData.revenue_model_id));
      if (!selectedModel) {
        toast.error('Please select a revenue model');
        return;
      }

      // Calculate end date based on model duration
      let endDate = new Date(assignmentData.start_date);
      if (selectedModel.duration_type === 'daily') {
        endDate.setDate(endDate.getDate() + selectedModel.duration_value);
      } else if (selectedModel.duration_type === 'weekly') {
        endDate.setDate(endDate.getDate() + (selectedModel.duration_value * 7));
      } else if (selectedModel.duration_type === 'monthly') {
        endDate.setMonth(endDate.getMonth() + selectedModel.duration_value);
      } else if (selectedModel.duration_type === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + selectedModel.duration_value);
      }

      const assignmentPayload = {
        owner_id: selectedOwner.id,
        revenue_model_id: assignmentData.revenue_model_id,
        start_date: assignmentData.start_date,
        end_date: selectedModel.duration_type === 'lifetime' ? null : endDate.toISOString().split('T')[0],
        is_free_assignment: assignmentData.is_free_assignment,
        notes: assignmentData.notes
      };

      await apiService.assignRevenueModel(assignmentPayload);
      toast.success(`${selectedModel.name} assigned to ${selectedOwner.name} successfully`);
      
      setShowAssignModal(false);
      setSelectedOwner(null);
      setAssignmentData({
        revenue_model_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        is_free_assignment: false,
        notes: ''
      });
      
      fetchTurfOwners(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign revenue model');
    }
  };

  const filteredOwners = turfOwners.filter(owner =>
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDurationText = (type, value) => {
    if (type === 'lifetime') return 'Lifetime';
    return `${value} ${type}${value > 1 ? 's' : ''}`;
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Model Assignment</h2>
          <p className="text-gray-600">Assign and manage revenue models for turf owners</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search turf owners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2">
          <Filter size={16} />
          <span>Filter</span>
        </button>
      </div>

      {/* Turf Owners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOwners.map((owner) => (
          <motion.div
            key={owner.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{owner.name}</h4>
                <p className="text-sm text-gray-600">{owner.email}</p>
                <p className="text-sm text-gray-600">{owner.phone}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">{owner.turfs_count} Turfs</div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  owner.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {owner.status}
                </div>
              </div>
            </div>

            {/* Current Plan */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Current Plan</div>
              {owner.current_plan ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{owner.current_plan}</span>
                    {owner.current_plan === 'Free Starter' && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center">
                        <Gift size={10} className="mr-1" />
                        Free
                      </span>
                    )}
                  </div>
                  {owner.plan_expires && (
                    <div className={`text-xs flex items-center ${
                      isExpired(owner.plan_expires) 
                        ? 'text-red-600' 
                        : isExpiringSoon(owner.plan_expires) 
                        ? 'text-yellow-600' 
                        : 'text-gray-600'
                    }`}>
                      <Calendar size={12} className="mr-1" />
                      Expires: {new Date(owner.plan_expires).toLocaleDateString()}
                      {isExpired(owner.plan_expires) && ' (Expired)'}
                      {isExpiringSoon(owner.plan_expires) && ' (Expiring Soon)'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">No plan assigned</div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                setSelectedOwner(owner);
                handleAssignModel();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              {owner.current_plan ? 'Change Plan' : 'Assign Plan'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedOwner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Assign Revenue Model</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600">Assigning to:</div>
              <div className="font-medium">{selectedOwner.name}</div>
              <div className="text-sm text-gray-600">{selectedOwner.email}</div>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Revenue Model</label>
                <select
                  required
                  value={assignmentData.revenue_model_id}
                  onChange={(e) => setAssignmentData({ ...assignmentData, revenue_model_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a model...</option>
                  {revenueModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - ₹{model.price} ({getDurationText(model.duration_type, model.duration_value)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  required
                  value={assignmentData.start_date}
                  onChange={(e) => setAssignmentData({ ...assignmentData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={assignmentData.notes}
                  onChange={(e) => setAssignmentData({ ...assignmentData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Add any notes about this assignment..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="free_assignment"
                  checked={assignmentData.is_free_assignment}
                  onChange={(e) => setAssignmentData({ ...assignmentData, is_free_assignment: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="free_assignment" className="text-sm text-gray-700">
                  Assign as free (no payment required)
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                >
                  <Check size={16} />
                  <span>Assign Model</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RevenueModelAssignment;