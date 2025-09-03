import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building, Search, Eye, Edit, Trash2, MapPin, Users, Calendar, DollarSign } from 'lucide-react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import CountUp from 'react-countup';
import { apiService } from '../services/api';

Modal.setAppElement('#root');

const SuperAdminTurfManagement = () => {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');

  useEffect(() => {
    fetchTurfs();
  }, []);

  const fetchTurfs = async () => {
    setLoading(true);
    try {
      const response = await apiService.getTurfs({ per_page: 1000, include: 'owner,bookings' });
      const turfsData = response.data?.data || [];
      
      setTurfs(turfsData);
    } catch (error) {
      console.error('Error fetching turfs:', error);
      toast.error('Failed to load turfs data');
      setTurfs([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const activeTurfs = turfs.filter(t => t.status === 'active').length;
    const totalRevenue = turfs.reduce((sum, turf) => 
      sum + (turf.bookings || []).reduce((bookingSum, booking) => bookingSum + (booking.amount || 0), 0), 0
    );
    const totalBookings = turfs.reduce((sum, turf) => sum + (turf.bookings?.length || 0), 0);
    const uniqueOwners = [...new Set(turfs.map(t => t.owner_id))].length;

    return {
      total: turfs.length,
      active: activeTurfs,
      inactive: turfs.length - activeTurfs,
      totalRevenue,
      totalBookings,
      uniqueOwners
    };
  }, [turfs]);

  const filteredTurfs = useMemo(() => {
    return turfs.filter(turf => {
      const matchesSearch = (turf.turf_name || turf.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (turf.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (turf.owner?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || turf.status === statusFilter;
      const matchesOwner = ownerFilter === 'all' || turf.owner_id?.toString() === ownerFilter;
      return matchesSearch && matchesStatus && matchesOwner;
    });
  }, [turfs, searchTerm, statusFilter, ownerFilter]);

  const uniqueOwners = useMemo(() => {
    const owners = turfs.map(t => ({ id: t.owner_id, name: t.owner?.name }))
                       .filter(o => o.id && o.name);
    return [...new Map(owners.map(o => [o.id, o])).values()];
  }, [turfs]);

  const handleView = (turf) => {
    setSelectedTurf(turf);
    setShowViewModal(true);
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
        fetchTurfs();
      } catch (error) {
        toast.error('Failed to delete turf');
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, prefix = '', suffix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {prefix}<CountUp end={value} duration={1} />{suffix}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="h-full bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading turfs data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50/30 overflow-auto">
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Turf Management</h1>
            <p className="text-gray-600 mt-1">All turfs across all owners</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <StatCard title="Total Turfs" value={stats.total} icon={Building} color="bg-blue-500" />
          <StatCard title="Active Turfs" value={stats.active} icon={Building} color="bg-green-500" />
          <StatCard title="Inactive Turfs" value={stats.inactive} icon={Building} color="bg-red-500" />
          <StatCard title="Total Bookings" value={stats.totalBookings} icon={Calendar} color="bg-purple-500" />
          <StatCard title="Total Revenue" value={stats.totalRevenue} icon={DollarSign} color="bg-emerald-500" prefix="₹" />
          <StatCard title="Unique Owners" value={stats.uniqueOwners} icon={Users} color="bg-indigo-500" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search turfs, location, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
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
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Owners</option>
              {uniqueOwners.map(owner => (
                <option key={owner.id} value={owner.id}>{owner.name}</option>
              ))}
            </select>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Turf Details</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Price/Hour</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTurfs.map((turf, index) => (
                  <motion.tr key={turf.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{turf.turf_name || turf.name}</div>
                          <div className="text-sm text-gray-500">{turf.sport_type || 'Multi-Sport'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{turf.owner?.name || 'Unknown Owner'}</div>
                      <div className="text-sm text-gray-500">ID: {turf.owner_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {turf.location || 'Not specified'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="w-4 h-4 mr-1 text-gray-400" />
                        {turf.capacity || 'N/A'} players
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{(turf.price_per_hour || 0).toLocaleString()}</div>
                      <div className="text-sm text-gray-500">per hour</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{turf.bookings?.length || 0}</div>
                      <div className="text-sm text-gray-500">total bookings</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        (turf.status || 'active') === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {turf.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleView(turf)} className="text-blue-600 hover:text-blue-900 p-1 rounded">
                          <Eye size={16} />
                        </button>
                        <button className="text-green-600 hover:text-green-900 p-1 rounded">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(turf.id, turf.turf_name || turf.name)} className="text-red-600 hover:text-red-900 p-1 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredTurfs.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No turfs found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* View Modal */}
        <Modal
          isOpen={showViewModal}
          onRequestClose={() => setShowViewModal(false)}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden outline-none"
          overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          {selectedTurf && (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTurf.turf_name || selectedTurf.name}</h2>
                    <p className="text-gray-600">{selectedTurf.sport_type || 'Multi-Sport'} • {selectedTurf.location}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Owner</label>
                    <p className="text-gray-900">{selectedTurf.owner?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Capacity</label>
                    <p className="text-gray-900">{selectedTurf.capacity || 'N/A'} players</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Price per Hour</label>
                    <p className="text-gray-900 font-medium">₹{(selectedTurf.price_per_hour || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Bookings</label>
                    <p className="text-gray-900">{selectedTurf.bookings?.length || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedTurf.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedTurf.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Revenue</label>
                    <p className="text-gray-900 font-medium">₹{((selectedTurf.bookings || []).reduce((sum, b) => sum + (b.amount || 0), 0)).toLocaleString()}</p>
                  </div>
                </div>
                
                {selectedTurf.facilities && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Facilities</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTurf.facilities.map((facility, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
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

export default SuperAdminTurfManagement;