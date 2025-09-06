import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Settings, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

const FeatureManagement = () => {
  const [features, setFeatures] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'basic',
    is_premium: false,
    status: true
  });

  const categories = [
    { value: 'basic', label: 'Basic Features' },
    { value: 'booking', label: 'Booking Management' },
    { value: 'analytics', label: 'Analytics & Reports' },
    { value: 'staff', label: 'Staff Management' },
    { value: 'payment', label: 'Payment Features' },
    { value: 'marketing', label: 'Marketing Tools' },
    { value: 'advanced', label: 'Advanced Features' }
  ];

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await apiService.getFeatures();
      const data = response.data?.data || response.data || [];
      setFeatures(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch features:', error);
      toast.error('Failed to load features');
      setFeatures([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFeature) {
        await apiService.updateFeature(editingFeature.id, formData);
        toast.success('Feature updated successfully');
      } else {
        await apiService.createFeature(formData);
        toast.success('Feature added successfully');
      }
      resetForm();
      fetchFeatures();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', category: 'basic', is_premium: false, status: true });
    setShowAddForm(false);
    setEditingFeature(null);
  };

  const handleEdit = (feature) => {
    setFormData(feature);
    setEditingFeature(feature);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteFeature(id);
      toast.success('Feature deleted successfully');
      fetchFeatures();
    } catch (error) {
      toast.error('Failed to delete feature');
    }
  };

  const toggleStatus = async (id) => {
    try {
      const feature = features.find(f => f.id === id);
      await apiService.updateFeature(id, { status: !feature.status });
      toast.success('Feature status updated');
      fetchFeatures();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feature Management</h2>
          <p className="text-gray-600">Manage platform features for revenue models</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Feature</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingFeature ? 'Edit Feature' : 'Add New Feature'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feature Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter feature name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter feature description"
              />
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_premium}
                  onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Premium Feature</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Save size={16} />
                <span>{editingFeature ? 'Update' : 'Save'} Feature</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Features List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{feature.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={() => handleEdit(feature)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(feature.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  categories.find(c => c.value === feature.category)?.label === 'Basic Features' 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {categories.find(c => c.value === feature.category)?.label}
                </span>
                {feature.is_premium && (
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                    Premium
                  </span>
                )}
              </div>
              <button
                onClick={() => toggleStatus(feature.id)}
                className={`p-1 rounded-full ${
                  feature.status ? 'text-green-600 bg-green-100' : 'text-gray-400 bg-gray-100'
                }`}
              >
                <Check size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeatureManagement;