import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building, Plus, Eye, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight, MapPin, Users } from 'lucide-react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import CountUp from 'react-countup';
import { useOptimizedQuery, useOptimizedMutation } from '../hooks/useOptimizedQuery';
import { apiService } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

Modal.setAppElement('#root');

const TurfManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    turf_name: '',
    location: '',
    capacity: '',
    sport_type: '',
    facilities: '',
    description: '',
    pricing: {
      weekday: {
        morning: '', // 6-12
        afternoon: '', // 12-18
        evening: '', // 18-22
        night: '' // 22-6
      },
      weekend: {
        morning: '',
        afternoon: '',
        evening: '',
        night: ''
      }
    }
  });

  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const queryParams = useMemo(() => ({
    page: currentPage,
    search: debouncedSearch,
    status: statusFilter
  }), [currentPage, debouncedSearch, statusFilter]);

  const [turfs, setTurfs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  useEffect(() => {
    fetchTurfs();
  }, [currentPage, debouncedSearch, statusFilter]);

  const fetchTurfs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTurfs({
        page: currentPage,
        search: debouncedSearch,
        status: statusFilter,
        per_page: 10
      });
      
      setTurfs(response.data?.data || []);
      setTotalPages(response.data?.meta?.last_page || 1);
      setStats({
        total: response.data?.meta?.total || 0,
        active: (response.data?.data || []).filter(t => t.status === true).length,
        inactive: (response.data?.data || []).filter(t => t.status === false).length
      });
    } catch (error) {
      console.error('Error fetching turfs:', error);
      setTurfs([]);
      setStats({ total: 0, active: 0, inactive: 0 });
    } finally {
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        turf_name: formData.turf_name,
        location: formData.location,
        capacity: parseInt(formData.capacity),
        sport_type: formData.sport_type,
        facilities: formData.facilities,
        description: formData.description,
        pricing_structure: formData.pricing
      };
      
      if (selectedTurf) {
        const response = await apiService.updateTurf(selectedTurf.id, submitData);
        toast.success(response.data?.message || 'Turf updated successfully!');
      } else {
        const response = await apiService.createTurf(submitData);
        toast.success(response.data?.message || 'Turf created successfully!');
      }
      
      setShowForm(false);
      setSelectedTurf(null);
      setFormData({ 
        turf_name: '', 
        location: '', 
        capacity: '', 
        sport_type: '', 
        facilities: '', 
        description: '',
        pricing: {
          weekday: { morning: '', afternoon: '', evening: '', night: '' },
          weekend: { morning: '', afternoon: '', evening: '', night: '' }
        }
      });
      fetchTurfs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save turf');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (turf) => {
    setSelectedTurf(turf);
    setShowViewModal(true);
  };

  const handleEdit = (turf) => {
    setFormData({
      turf_name: turf.turf_name,
      location: turf.location,
      capacity: turf.capacity,
      sport_type: turf.sport_type,
      facilities: turf.facilities || '',
      description: turf.description || '',
      pricing: turf.pricing_structure || {
        weekday: { morning: '', afternoon: '', evening: '', night: '' },
        weekend: { morning: '', afternoon: '', evening: '', night: '' }
      }
    });
    setSelectedTurf(turf);
    setShowForm(true);
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const response = await apiService.updateTurf(id, { status: !currentStatus });
      toast.success(`Turf ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchTurfs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
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
        const response = await apiService.deleteTurf(id);
        toast.success(response.data?.message || 'Turf deleted successfully!');
        fetchTurfs();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete turf');
      }
    }
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
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Turfs</h1>
            <p className="text-gray-600 mt-1">Manage your turf properties</p>
          </div>
          <button
            onClick={() => {
              setSelectedTurf(null);
              setFormData({ 
                turf_name: '', 
                location: '', 
                capacity: '', 
                sport_type: '', 
                facilities: '', 
                description: '',
                pricing: {
                  weekday: { morning: '', afternoon: '', evening: '', night: '' },
                  weekend: { morning: '', afternoon: '', evening: '', night: '' }
                }
              });
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Turf</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Turfs" value={stats.total} icon={Building} color="bg-blue-500" />
          <StatCard title="Active Turfs" value={stats.active} icon={Building} color="bg-green-500" />
          <StatCard title="Inactive Turfs" value={stats.inactive} icon={Building} color="bg-red-500" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search turfs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Turf</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {turfs.map((turf, index) => (
                  <motion.tr key={turf.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{turf.turf_name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {turf.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {turf.pricing_structure ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              <span className="text-xs">WD: ₹{turf.pricing_structure.weekday?.morning}-{turf.pricing_structure.weekday?.evening}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-xs">WE: ₹{turf.pricing_structure.weekend?.morning}-{turf.pricing_structure.weekend?.evening}</span>
                            </div>
                          </div>
                        ) : (
                          `₹${turf.price_per_hour}/hour`
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {turf.capacity} players
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{turf.bookings_count} bookings</div>
                      <div className="text-sm text-gray-500">{turf.sport_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(turf.id, turf.status)}
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors hover:opacity-80 ${
                          turf.status ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {turf.status ? 'active' : 'inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleView(turf)} className="text-blue-600 hover:text-blue-900 p-1 rounded">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleEdit(turf)} className="text-green-600 hover:text-green-900 p-1 rounded">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(turf.id, turf.turf_name)} className="text-red-600 hover:text-red-900 p-1 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showForm}
          onRequestClose={() => setShowForm(false)}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden outline-none"
          overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{selectedTurf ? 'Edit Turf' : 'Add New Turf'}</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Turf Name</label>
                <input
                  type="text"
                  value={formData.turf_name}
                  onChange={(e) => setFormData({...formData, turf_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-4">Pricing Structure (₹/hour)</label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weekday Pricing */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">Weekday Rates</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Morning (6AM - 12PM)</label>
                        <input
                          type="number"
                          value={formData.pricing.weekday.morning}
                          onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, weekday: {...formData.pricing.weekday, morning: e.target.value}}})}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Afternoon (12PM - 6PM)</label>
                        <input
                          type="number"
                          value={formData.pricing.weekday.afternoon}
                          onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, weekday: {...formData.pricing.weekday, afternoon: e.target.value}}})}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Evening (6PM - 10PM)</label>
                        <input
                          type="number"
                          value={formData.pricing.weekday.evening}
                          onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, weekday: {...formData.pricing.weekday, evening: e.target.value}}})}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="800"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Night (10PM - 6AM)</label>
                        <input
                          type="number"
                          value={formData.pricing.weekday.night}
                          onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, weekday: {...formData.pricing.weekday, night: e.target.value}}})}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="400"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Weekend Pricing */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-3">Weekend Rates</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Morning (6AM - 12PM)</label>
                        <input
                          type="number"
                          value={formData.pricing.weekend.morning}
                          onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, weekend: {...formData.pricing.weekend, morning: e.target.value}}})}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                          placeholder="700"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Afternoon (12PM - 6PM)</label>
                        <input
                          type="number"
                          value={formData.pricing.weekend.afternoon}
                          onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, weekend: {...formData.pricing.weekend, afternoon: e.target.value}}})}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                          placeholder="900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Evening (6PM - 10PM)</label>
                        <input
                          type="number"
                          value={formData.pricing.weekend.evening}
                          onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, weekend: {...formData.pricing.weekend, evening: e.target.value}}})}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                          placeholder="1200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Night (10PM - 6AM)</label>
                        <input
                          type="number"
                          value={formData.pricing.weekend.night}
                          onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, weekend: {...formData.pricing.weekend, night: e.target.value}}})}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                          placeholder="600"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sport Type</label>
                <select
                  value={formData.sport_type}
                  onChange={(e) => setFormData({...formData, sport_type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Sport</option>
                  <option value="Football">Football</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Tennis">Tennis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
                <input
                  type="text"
                  value={formData.facilities}
                  onChange={(e) => setFormData({...formData, facilities: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Parking, Changing Room"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                {selectedTurf ? 'Update Turf' : 'Create Turf'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default TurfManagement;