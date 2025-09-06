import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, DollarSign, Clock, Users, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

const DynamicRevenueModel = () => {
  const [revenueModels, setRevenueModels] = useState([]);
  const [features, setFeatures] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration_type: 'monthly',
    duration_value: 1,
    is_free: false,
    max_turfs: 1,
    max_staff: 1,
    max_bookings_per_month: 100,
    selected_features: [],
    status: true
  });

  const durationTypes = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'lifetime', label: 'Lifetime' }
  ];

  useEffect(() => {
    fetchRevenueModels();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingModel) {
        await apiService.updateRevenueModel(editingModel.id, formData);
        toast.success('Revenue model updated successfully');
      } else {
        await apiService.createRevenueModel(formData);
        toast.success('Revenue model created successfully');
      }
      resetForm();
      fetchRevenueModels();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration_type: 'monthly',
      duration_value: 1,
      is_free: false,
      max_turfs: 1,
      max_staff: 1,
      max_bookings_per_month: 100,
      selected_features: [],
      status: true
    });
    setShowAddForm(false);
    setEditingModel(null);
  };

  const handleEdit = (model) => {
    setFormData(model);
    setEditingModel(model);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteRevenueModel(id);
      toast.success('Revenue model deleted successfully');
      fetchRevenueModels();
    } catch (error) {
      toast.error('Failed to delete revenue model');
    }
  };

  const toggleFeature = (featureId) => {
    const selected = formData.selected_features.includes(featureId)
      ? formData.selected_features.filter(id => id !== featureId)
      : [...formData.selected_features, featureId];
    setFormData({ ...formData, selected_features: selected });
  };

  const getDurationText = (type, value) => {
    if (type === 'lifetime') return 'Lifetime';
    return `${value} ${type}${value > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Models</h2>
          <p className="text-gray-600">Create and manage dynamic pricing plans</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Create Model</span>
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
              {editingModel ? 'Edit Revenue Model' : 'Create New Revenue Model'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Professional Plan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  disabled={formData.is_free}
                />
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
                placeholder="Describe this revenue model"
              />
            </div>

            {/* Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration Type</label>
                <select
                  value={formData.duration_type}
                  onChange={(e) => setFormData({ ...formData, duration_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {durationTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {formData.duration_type !== 'lifetime' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration Value</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration_value}
                    onChange={(e) => setFormData({ ...formData, duration_value: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Limits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Turfs</label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_turfs}
                  onChange={(e) => setFormData({ ...formData, max_turfs: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Staff</label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_staff}
                  onChange={(e) => setFormData({ ...formData, max_staff: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Bookings/Month</label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_bookings_per_month}
                  onChange={(e) => setFormData({ ...formData, max_bookings_per_month: parseInt(e.target.value) || 100 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Features Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Included Features</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {features.map((feature) => (
                  <label
                    key={feature.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.selected_features.includes(feature.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selected_features.includes(feature.id)}
                      onChange={() => toggleFeature(feature.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{feature.name}</div>
                      {feature.is_premium && (
                        <span className="text-xs text-purple-600">Premium</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_free}
                  onChange={(e) => setFormData({ ...formData, is_free: e.target.checked, price: e.target.checked ? 0 : formData.price })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Free Plan</span>
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
                <span>{editingModel ? 'Update' : 'Create'} Model</span>
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

      {/* Revenue Models List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {revenueModels.map((model) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-bold text-lg text-gray-900">{model.name}</h4>
                  {model.is_free && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center">
                      <Gift size={12} className="mr-1" />
                      Free
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{model.description}</p>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={() => handleEdit(model)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(model.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900 flex items-center">
                  <DollarSign size={20} className="mr-1" />
                  ₹{model.price.toLocaleString()}
                </span>
                <span className="text-sm text-gray-600 flex items-center">
                  <Clock size={14} className="mr-1" />
                  {getDurationText(model.duration_type, model.duration_value)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-lg font-bold text-gray-900">{model.max_turfs}</div>
                  <div className="text-xs text-gray-600">Turfs</div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-lg font-bold text-gray-900">{model.max_staff}</div>
                  <div className="text-xs text-gray-600">Staff</div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-lg font-bold text-gray-900">{model.max_bookings_per_month}</div>
                  <div className="text-xs text-gray-600">Bookings</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Features ({model.selected_features.length})</div>
                <div className="flex flex-wrap gap-1">
                  {model.selected_features.slice(0, 3).map(featureId => {
                    const feature = features.find(f => f.id === featureId);
                    return feature ? (
                      <span key={featureId} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                        {feature.name}
                      </span>
                    ) : null;
                  })}
                  {model.selected_features.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{model.selected_features.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DynamicRevenueModel;