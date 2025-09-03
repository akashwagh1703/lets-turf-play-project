import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, DollarSign, Percent, Calendar, Check } from 'lucide-react';
import { apiService } from '../services/api';

const RevenueModelManagement = () => {
  const [revenueModels, setRevenueModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    features: [],
    type: 'subscription',
    monthly_price: '',
    yearly_price: '',
    commission_rate: '',
    turf_limit: '',
    staff_limit: '',
    booking_limit: '',
    is_popular: false,
    sort_order: 0,
    status: true
  });

  useEffect(() => {
    fetchRevenueModels();
  }, []);

  const fetchRevenueModels = async () => {
    try {
      setLoading(true);
      console.log('Fetching revenue models...');
      const response = await apiService.getRevenueModels();
      console.log('Revenue models response:', response);
      setRevenueModels(response.data || []);
    } catch (error) {
      console.error('Revenue models error:', error.response || error);
      toast.error(`Failed to fetch revenue models: ${error.response?.data?.message || error.message}`);
      setRevenueModels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      
      // Convert string values to numbers
      if (data.monthly_price) data.monthly_price = parseFloat(data.monthly_price);
      if (data.yearly_price) data.yearly_price = parseFloat(data.yearly_price);
      if (data.commission_rate) data.commission_rate = parseFloat(data.commission_rate);
      if (data.turf_limit) data.turf_limit = parseInt(data.turf_limit);
      if (data.staff_limit) data.staff_limit = parseInt(data.staff_limit);
      if (data.booking_limit) data.booking_limit = parseInt(data.booking_limit);
      if (data.sort_order) data.sort_order = parseInt(data.sort_order);
      
      // Convert features string to array
      if (typeof data.features === 'string') {
        data.features = data.features.split(',').map(f => f.trim()).filter(f => f);
      }

      if (editingModel) {
        await apiService.updateRevenueModel(editingModel.id, data);
        toast.success('Revenue model updated successfully');
      } else {
        await apiService.createRevenueModel(data);
        toast.success('Revenue model created successfully');
      }
      
      setModalOpen(false);
      resetForm();
      fetchRevenueModels();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (model) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      description: model.description,
      features: model.features_array || [],
      type: model.type,
      monthly_price: model.monthly_price || '',
      yearly_price: model.yearly_price || '',
      commission_rate: model.commission_rate || '',
      turf_limit: model.turf_limit || '',
      staff_limit: model.staff_limit || '',
      booking_limit: model.booking_limit || '',
      is_popular: model.is_popular || false,
      sort_order: model.sort_order || 0,
      status: model.status
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Revenue Model?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete'
    });

    if (result.isConfirmed) {
      try {
        await apiService.deleteRevenueModel(id);
        toast.success('Revenue model deleted successfully');
        fetchRevenueModels();
      } catch (error) {
        toast.error('Failed to delete revenue model');
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await apiService.updateRevenueModel(id, { status: !currentStatus });
      toast.success('Status updated successfully');
      fetchRevenueModels();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      features: [],
      type: 'subscription',
      monthly_price: '',
      yearly_price: '',
      commission_rate: '',
      turf_limit: '',
      staff_limit: '',
      booking_limit: '',
      is_popular: false,
      sort_order: 0,
      status: true
    });
    setEditingModel(null);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'subscription': return 'bg-blue-100 text-blue-800';
      case 'commission': return 'bg-purple-100 text-purple-800';
      case 'fixed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'subscription': return 'Subscription';
      case 'commission': return 'Commission';
      case 'fixed': return 'Fixed Price';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Revenue Models</h1>
            <p className="text-gray-600 mt-1">Manage platform pricing and subscription models</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Plus size={20} />
            <span>Add Revenue Model</span>
          </button>
        </motion.div>

        {/* Revenue Models Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {revenueModels.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
                model.is_popular 
                  ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-white' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{model.name}</h3>
                      {model.is_popular && (
                        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(model.type)}`}>
                      {getTypeLabel(model.type)}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleStatus(model.id, model.status)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      model.status 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {model.status ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    <span>{model.status ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed">{model.description}</p>
              </div>

              {/* Pricing */}
              <div className="px-6 py-4 bg-gray-50/50">
                <div className="space-y-3">
                  {model.type !== 'commission' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Platform Fee</span>
                      </div>
                      <div className="text-right">
                        {model.monthly_price > 0 && (
                          <div className="text-lg font-bold text-gray-900">
                            ₹{model.monthly_price}<span className="text-sm font-normal text-gray-500">/month</span>
                          </div>
                        )}
                        {model.yearly_price > 0 && (
                          <div className="text-sm text-gray-600">
                            ₹{model.yearly_price}<span className="text-xs">/year</span>
                            {model.monthly_price > 0 && model.yearly_discount > 0 && (
                              <span className="text-green-600 ml-1">
                                (Save {model.yearly_discount}%)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {model.commission_rate > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Percent size={16} className="text-orange-500" />
                        <span className="text-sm font-medium text-gray-700">Commission</span>
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        {model.commission_rate}%
                        <span className="text-sm font-normal text-gray-500 ml-1">per booking</span>
                      </div>
                    </div>
                  )}
                  
                  {model.type === 'commission' && (
                    <div className="text-center py-2">
                      <div className="text-2xl font-bold text-green-600">
                        {model.commission_rate}%
                      </div>
                      <div className="text-sm text-gray-600">Commission Only</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              {model.features_array && model.features_array.length > 0 && (
                <div className="px-6 py-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Features Included:</h4>
                  <div className="space-y-2">
                    {model.features_array.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <Check size={14} className="text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleEdit(model)}
                    className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(model.id)}
                    className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        className="max-w-3xl mx-auto mt-10 bg-white rounded-2xl shadow-2xl overflow-hidden"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <h3 className="text-2xl font-bold text-white">
            {editingModel ? 'Edit Revenue Model' : 'Create New Revenue Model'}
          </h3>
          <p className="text-blue-100 mt-1">
            {editingModel ? 'Update pricing model details' : 'Set up a new pricing structure for your platform'}
          </p>
        </div>
        
        <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Model Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Premium Plan"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Model Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="subscription">Subscription</option>
                <option value="commission">Commission</option>
                <option value="fixed">Fixed Price</option>
              </select>
            </div>
          </div>



          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              rows="3"
              placeholder="Describe the key benefits and target audience for this pricing model"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Features Included</label>
            <textarea
              value={Array.isArray(formData.features) ? formData.features.join(', ') : formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value.split(',').map(f => f.trim()).filter(f => f) })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              rows="3"
              placeholder="List key features separated by commas (e.g., 24/7 Support, Advanced Analytics, Priority Processing)"
              required
            />
          </div>

          {/* Pricing Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign size={20} className="mr-2 text-green-500" />
              Pricing Configuration
            </h4>
            
            {(formData.type === 'subscription' || formData.type === 'fixed') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monthly_price}
                      onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="999.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Yearly Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.yearly_price}
                      onChange={(e) => setFormData({ ...formData, yearly_price: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="9999.00"
                    />
                  </div>
                  {formData.monthly_price && formData.yearly_price && (
                    <p className="text-sm text-green-600 mt-1">
                      Yearly saves: ₹{(formData.monthly_price * 12 - formData.yearly_price).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {formData.type === 'commission' && (
              <div className="max-w-md">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Commission Rate (%)</label>
                <div className="relative">
                  <Percent size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="5.00"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Percentage charged on each successful booking</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Turf Limit</label>
                <input
                  type="number"
                  min="1"
                  value={formData.turf_limit}
                  onChange={(e) => setFormData({ ...formData, turf_limit: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Staff Limit</label>
                <input
                  type="number"
                  min="1"
                  value={formData.staff_limit}
                  onChange={(e) => setFormData({ ...formData, staff_limit: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Limit</label>
                <input
                  type="number"
                  min="1"
                  value={formData.booking_limit}
                  onChange={(e) => setFormData({ ...formData, booking_limit: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Unlimited"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div>
                <label htmlFor="status" className="text-sm font-semibold text-gray-900">
                  Model Status
                </label>
                <p className="text-sm text-gray-600">Enable this revenue model</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="status"
                  checked={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
              <div>
                <label htmlFor="popular" className="text-sm font-semibold text-gray-900">
                  Popular Plan
                </label>
                <p className="text-sm text-gray-600">Mark as recommended plan</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="popular"
                  checked={formData.is_popular}
                  onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {editingModel ? 'Update Model' : 'Create Model'}
            </button>
          </div>
        </form>
        </div>
      </Modal>
    </div>
  );
};

export default RevenueModelManagement;