import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Eye, Edit, Trash2, Search, Phone, Mail, UserCheck } from 'lucide-react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import CountUp from 'react-countup';

Modal.setAppElement('#root');

const StaffManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    staff_name: '',
    email: '',
    phone: '',
    position: '',
    salary: '',
    shift_timing: ''
  });

  // Mock data
  const staffData = {
    data: [
      { id: 1, staff_name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '9876543210', position: 'Ground Keeper', salary: 25000, shift_timing: '6:00 AM - 2:00 PM', status: 'active', hire_date: '2023-06-15' },
      { id: 2, staff_name: 'Priya Sharma', email: 'priya@example.com', phone: '9876543211', position: 'Receptionist', salary: 22000, shift_timing: '9:00 AM - 6:00 PM', status: 'active', hire_date: '2023-08-20' },
      { id: 3, staff_name: 'Amit Singh', email: 'amit@example.com', phone: '9876543212', position: 'Security Guard', salary: 20000, shift_timing: '6:00 PM - 6:00 AM', status: 'inactive', hire_date: '2023-05-10' },
      { id: 4, staff_name: 'Neha Gupta', email: 'neha@example.com', phone: '9876543213', position: 'Cleaner', salary: 18000, shift_timing: '7:00 AM - 3:00 PM', status: 'active', hire_date: '2023-09-05' }
    ]
  };

  const staff = staffData?.data || [];
  const stats = useMemo(() => ({
    total: staff.length,
    active: staff.filter(s => s.status === 'active').length,
    inactive: staff.filter(s => s.status === 'inactive').length,
    totalSalary: staff.filter(s => s.status === 'active').reduce((sum, s) => sum + s.salary, 0)
  }), [staff]);

  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      const matchesSearch = member.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [staff, searchTerm, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedStaff) {
      toast.success('Staff updated successfully!');
    } else {
      toast.success('Staff added successfully!');
    }
    setShowForm(false);
    setSelectedStaff(null);
    setFormData({ staff_name: '', email: '', phone: '', position: '', salary: '', shift_timing: '' });
  };

  const handleView = (member) => {
    setSelectedStaff(member);
    setShowViewModal(true);
  };

  const handleEdit = (member) => {
    setFormData({
      staff_name: member.staff_name,
      email: member.email,
      phone: member.phone,
      position: member.position,
      salary: member.salary,
      shift_timing: member.shift_timing
    });
    setSelectedStaff(member);
    setShowForm(true);
  };

  const handleDelete = async (id, staffName) => {
    const result = await Swal.fire({
      title: 'Remove Staff Member',
      html: `Are you sure you want to remove <strong>${staffName}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      toast.success('Staff member removed successfully!');
    }
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toast.success(`Staff ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
  };

  const StatCard = ({ title, value, icon: Icon, color, prefix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {prefix}<CountUp end={value} duration={1} />
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
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600 mt-1">Manage your turf staff members</p>
          </div>
          <button
            onClick={() => {
              setSelectedStaff(null);
              setFormData({ staff_name: '', email: '', phone: '', position: '', salary: '', shift_timing: '' });
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Staff</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Staff" value={stats.total} icon={Users} color="bg-blue-500" />
          <StatCard title="Active Staff" value={stats.active} icon={UserCheck} color="bg-green-500" />
          <StatCard title="Inactive Staff" value={stats.inactive} icon={Users} color="bg-red-500" />
          <StatCard title="Monthly Payroll" value={stats.totalSalary} icon={Users} color="bg-purple-500" prefix="₹" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search staff..."
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Staff Member</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((member, index) => (
                  <motion.tr key={member.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">{member.staff_name?.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.staff_name}</div>
                          <div className="text-sm text-gray-500">Since {new Date(member.hire_date).getFullYear()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {member.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {member.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{member.position}</div>
                      <div className="text-sm text-gray-500">{member.shift_timing}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{member.salary}</div>
                      <div className="text-sm text-gray-500">per month</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(member.id, member.status)}
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                          member.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {member.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleView(member)} className="text-blue-600 hover:text-blue-900 p-1 rounded">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleEdit(member)} className="text-green-600 hover:text-green-900 p-1 rounded">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(member.id, member.staff_name)} className="text-red-600 hover:text-red-900 p-1 rounded">
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden outline-none"
          overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.staff_name}
                  onChange={(e) => setFormData({...formData, staff_name: e.target.value})}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Position</option>
                  <option value="Ground Keeper">Ground Keeper</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Security Guard">Security Guard</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Salary (₹)</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift Timing</label>
                <input
                  type="text"
                  value={formData.shift_timing}
                  onChange={(e) => setFormData({...formData, shift_timing: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 9:00 AM - 6:00 PM"
                  required
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
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                {selectedStaff ? 'Update Staff' : 'Add Staff'}
              </button>
            </div>
          </form>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={showViewModal}
          onRequestClose={() => setShowViewModal(false)}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden outline-none"
          overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          {selectedStaff && (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">{selectedStaff.staff_name?.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedStaff.staff_name}</h2>
                    <p className="text-gray-600">{selectedStaff.position}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedStaff.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{selectedStaff.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Monthly Salary</label>
                    <p className="text-gray-900 font-medium">₹{selectedStaff.salary}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Shift Timing</label>
                    <p className="text-gray-900">{selectedStaff.shift_timing}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hire Date</label>
                    <p className="text-gray-900">{new Date(selectedStaff.hire_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedStaff.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedStaff.status ? 'active' : 'inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(selectedStaff);
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Edit Staff
                </button>
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

export default StaffManagement;