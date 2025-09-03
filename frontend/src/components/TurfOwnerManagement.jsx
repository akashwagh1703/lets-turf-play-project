import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Eye, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import CountUp from 'react-countup';
import { useTurfOwners, useOptimizedMutation, useOptimizedQuery } from '../hooks/useOptimizedQuery';
import { apiService } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

Modal.setAppElement('#root');

const TurfOwnerManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    revenue_model_id: ''
  });

  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const queryParams = useMemo(() => ({
    page: currentPage,
    search: debouncedSearch,
    status: statusFilter
  }), [currentPage, debouncedSearch, statusFilter]);

  const { data: ownersData, isLoading, error } = useTurfOwners(queryParams);
  const { data: revenueModelsData } = useOptimizedQuery(['revenue-models'], () => apiService.getRevenueModels());
  
  const owners = ownersData?.data?.data || [];
  const revenueModels = revenueModelsData?.data || [];
  const totalPages = ownersData?.data?.meta?.last_page || 1;
  const stats = useMemo(() => ({
    total: ownersData?.data?.meta?.total || 0,
    active: owners.filter(o => o.status === true).length,
    inactive: owners.filter(o => o.status === false).length
  }), [owners, ownersData]);

  const createMutation = useOptimizedMutation(
    (data) => apiService.createTurfOwner(data),
    {
      invalidateQueries: ['turf-owners'],
      successMessage: 'Owner created successfully!'
    }
  );

  const updateMutation = useOptimizedMutation(
    ({ id, data }) => apiService.updateTurfOwner(id, data),
    {
      invalidateQueries: ['turf-owners'],
      successMessage: 'Owner updated successfully!'
    }
  );

  const deleteMutation = useOptimizedMutation(
    (id) => apiService.deleteTurfOwner(id),
    {
      invalidateQueries: ['turf-owners'],
      successMessage: 'Owner deleted successfully!'
    }
  );

  const statusMutation = useOptimizedMutation(
    ({ id, status }) => apiService.updateTurfOwner(id, { status }),
    {
      invalidateQueries: ['turf-owners'],
      successMessage: 'Status updated successfully!'
    }
  );



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedOwner) {
      updateMutation.mutate({ id: selectedOwner.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
    
    setShowForm(false);
    setSelectedOwner(null);
    setFormData({ name: '', email: '', password: '', phone: '', revenue_model_id: '' });
  };

  const handleView = (owner) => {
    setSelectedOwner(owner);
    setShowViewModal(true);
  };

  const handleEdit = (owner) => {
    setFormData({
      name: owner.name,
      email: owner.email,
      password: '',
      phone: owner.phone || '',
      revenue_model_id: owner.subscriptions?.[0]?.revenue_model_id || ''
    });
    setSelectedOwner(owner);
    setShowForm(true);
  };

  const handleDelete = async (id, ownerName) => {
    const result = await Swal.fire({
      title: 'Delete Turf Owner',
      html: `Are you sure you want to delete <strong>${ownerName}</strong>?<br><small class="text-gray-500">This action cannot be undone.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-lg px-6 py-2',
        cancelButton: 'rounded-lg px-6 py-2'
      }
    });

    if (result.isConfirmed) {
      deleteMutation.mutate(id);
    }
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = !currentStatus;
    statusMutation.mutate({ id, status: newStatus });
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            <CountUp end={value} duration={1} />
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

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
            <h1 className="text-3xl font-bold text-gray-900">Turf Owners</h1>
            <p className="text-gray-600 mt-1">Manage turf owners and their subscriptions</p>
          </div>
          <button
            onClick={() => {
              setSelectedOwner(null);
              setFormData({ name: '', email: '', password: '', phone: '', revenue_model_id: '' });
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Owner</span>
          </button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Owners" value={stats.total} icon={Users} color="bg-blue-500" />
          <StatCard title="Active Owners" value={stats.active} icon={Users} color="bg-green-500" />
          <StatCard title="Inactive Owners" value={stats.inactive} icon={Users} color="bg-red-500" />
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search owners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {owners.map((owner, index) => (
                      <motion.tr 
                        key={owner.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">{owner.name?.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{owner.name}</div>
                              <div className="text-sm text-gray-500">{owner.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{owner.turfs?.length || 0} Turfs</div>
                          <div className="text-sm text-gray-500">Member since {new Date(owner.created_at).getFullYear()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {owner.subscriptions?.[0]?.revenue_model?.name || 'No Plan'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {owner.subscriptions?.[0]?.revenue_model?.commission_percentage}% commission
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleStatus(owner.id, owner.status)}
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                              owner.status
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {owner.status ? 'active' : 'inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleView(owner)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(owner)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(owner.id, owner.name)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {ownersData?.data?.meta?.from || 0} to {ownersData?.data?.meta?.to || 0} of {stats.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-3 py-1 text-sm font-medium">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showForm}
          onRequestClose={() => {
            setShowForm(false);
            setSelectedOwner(null);
            setFormData({ name: '', email: '', password: '', phone: '', revenue_model_id: '' });
          }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden outline-none"
          overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedOwner ? 'Edit Owner' : 'Add New Owner'}
            </h2>
            <p className="text-gray-600 mt-1">
              {selectedOwner ? 'Update owner information' : 'Create a new turf owner account'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedOwner ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!selectedOwner}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Revenue Model</label>
                <select
                  value={formData.revenue_model_id}
                  onChange={(e) => setFormData({...formData, revenue_model_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Revenue Model</option>
                  {revenueModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.commission_percentage}% commission (₹{model.monthly_fee}/month)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedOwner(null);
                  setFormData({ name: '', email: '', password: '', phone: '', revenue_model_id: '' });
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {(createMutation.isLoading || updateMutation.isLoading) && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{selectedOwner ? 'Update Owner' : 'Create Owner'}</span>
              </button>
            </div>
          </form>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={showViewModal}
          onRequestClose={() => setShowViewModal(false)}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden outline-none"
          overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          {selectedOwner && (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">{selectedOwner.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedOwner.name}</h2>
                    <p className="text-gray-600">{selectedOwner.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Full Name</label>
                          <p className="text-gray-900">{selectedOwner.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-900">{selectedOwner.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <p className="text-gray-900">{selectedOwner.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Overview</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Total Turfs</label>
                          <p className="text-2xl font-bold text-green-600">{selectedOwner.turfs?.length || 0}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Member Since</label>
                          <p className="text-gray-900">
                            {new Date(selectedOwner.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(selectedOwner);
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Edit Owner
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default TurfOwnerManagement;