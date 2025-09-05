import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Eye, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import CountUp from 'react-countup';
import { useTurfOwners, useOptimizedMutation } from '../hooks/useOptimizedQuery';
import { apiService } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';



const TurfOwnerManagement = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const queryParams = useMemo(() => ({
    page: currentPage,
    search: debouncedSearch,
    status: statusFilter
  }), [currentPage, debouncedSearch, statusFilter]);

  const { data: ownersData, isLoading, error } = useTurfOwners(queryParams);
  
  const owners = ownersData?.data?.data || [];
  const totalPages = ownersData?.data?.meta?.last_page || 1;
  const stats = useMemo(() => ({
    total: ownersData?.data?.meta?.total || 0,
    active: owners.filter(o => o.status === true).length,
    inactive: owners.filter(o => o.status === false).length
  }), [owners, ownersData]);



  const deleteMutation = useOptimizedMutation(
    (id) => apiService.deleteTurfOwner(id),
    {
      onSuccess: () => {
        toast.success('Owner deleted successfully!');
        // Refresh the data
        window.location.reload();
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to delete owner';
        toast.error(message);
      }
    }
  );

  const statusMutation = useOptimizedMutation(
    ({ id, status }) => apiService.updateTurfOwner(id, { status }),
    {
      onSuccess: () => {
        toast.success('Status updated successfully!');
        // Refresh the data
        window.location.reload();
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to update status';
        toast.error(message);
      }
    }
  );



  const handleView = (owner) => {
    navigate(`/admin/owners/view/${owner.id}`);
  };

  const handleEdit = (owner) => {
    navigate(`/admin/owners/edit/${owner.id}`);
  };

  const handleAdd = () => {
    navigate('/admin/owners/add');
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
            onClick={handleAdd}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // Search is already handled by debounced value
                    }
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
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
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-red-500 mb-2">
                <AlertCircle size={48} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Owners</h3>
              <p className="text-gray-600 mb-4">Failed to load turf owners. Please try again.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : owners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Owners Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No owners match your current filters.' 
                  : 'No turf owners have been added yet.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={handleAdd}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Add First Owner
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {owners.map((owner, index) => (
                  <motion.div
                    key={owner.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{owner.name?.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{owner.name}</h3>
                          <p className="text-sm text-gray-500">{owner.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleStatus(owner.id, owner.status)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                          owner.status
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {owner.status ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    {/* Business Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Turfs</span>
                        <span className="font-medium text-gray-900">{owner.turfs?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Member Since</span>
                        <span className="font-medium text-gray-900">{new Date(owner.created_at).getFullYear()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Plan</span>
                        <span className="font-medium text-gray-900">
                          {owner.subscriptions?.[0]?.revenue_model?.name || 'No Plan'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Commission</span>
                        <span className="font-medium text-green-600">
                          {owner.subscriptions?.[0]?.revenue_model?.commission_rate || 0}%
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(owner)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Owner"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(owner)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Owner"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(owner.id, owner.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Owner"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {owner.id}
                      </div>
                    </div>
                  </motion.div>
                ))}
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


      </div>
    </div>
  );
};

export default TurfOwnerManagement;