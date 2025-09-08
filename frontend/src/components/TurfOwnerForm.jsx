import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Save, User, Building, CreditCard, Calendar, Upload, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOptimizedMutation } from '../hooks/useOptimizedQuery';
import { apiService } from '../services/api';
import { validateField, validateStep, isStepValid } from '../utils/validation';

const TurfOwnerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    business_name: '',
    business_description: '',
    business_logo: '',
    business_address: '',
    business_type: '',
    gst_number: '',
    pan_number: '',
    bank_account: '',
    bank_ifsc: '',
    revenue_model_id: '',
    status: true
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [revenueModels, setRevenueModels] = useState([]);

  useEffect(() => {
    const fetchRevenueModels = async () => {
      try {
        const response = await apiService.getRevenueModels();
        const models = response?.data?.data || response?.data || [];
        setRevenueModels(models);
      } catch (err) {
        console.error('Error fetching revenue models:', err);
        setRevenueModels([]);
      }
    };
    fetchRevenueModels();
  }, []);
  const [ownerData, setOwnerData] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerError, setOwnerError] = useState(null);

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!isEdit || !id) return;
      
      try {
        setOwnerLoading(true);
        setOwnerError(null);
        console.log('🔍 Fetching owner data for edit, ID:', id);
        
        const response = await apiService.getTurfOwner(id);
        console.log('📡 Owner data response:', response);
        
        setOwnerData(response);
      } catch (err) {
        console.error('❌ Error fetching owner data:', err);
        setOwnerError(err);
      } finally {
        setOwnerLoading(false);
      }
    };

    fetchOwnerData();
  }, [isEdit, id]);



  useEffect(() => {
    if (isEdit && ownerData?.data) {
      const owner = ownerData.data.data || ownerData.data;
      
      if (owner && owner.id) {
        setFormData({
          name: owner.name || '',
          email: owner.email || '',
          password: '',
          phone: owner.phone || '',
          business_name: owner.business_name || '',
          business_description: owner.business_description || '',
          business_logo: owner.business_logo || '',
          business_address: owner.business_address || '',
          business_type: owner.business_type || '',
          gst_number: owner.gst_number || '',
          pan_number: owner.pan_number || '',
          bank_account: owner.bank_account || '',
          bank_ifsc: owner.bank_ifsc || '',
          revenue_model_id: owner.subscriptions?.[0]?.revenue_model_id?.toString() || '',
          status: owner.status ?? true
        });
      }
    }
  }, [isEdit, ownerData]);

  const createMutation = useOptimizedMutation(
    (data) => apiService.createTurfOwner(data),
    {
      onSuccess: () => {
        toast.success('Owner created successfully!');
        navigate('/admin/owners');
      },
      onError: (error) => {
        const validationErrors = error.response?.data?.errors || {};
        setErrors(validationErrors);
        // Mark all error fields as touched
        const newTouched = {};
        Object.keys(validationErrors).forEach(field => {
          newTouched[field] = true;
        });
        setTouched(prev => ({ ...prev, ...newTouched }));
      }
    }
  );

  const updateMutation = useOptimizedMutation(
    ({ id, data }) => apiService.updateTurfOwner(id, data),
    {
      onSuccess: () => {
        toast.success('Owner updated successfully!');
        navigate('/admin/owners');
      },
      onError: (error) => {
        const validationErrors = error.response?.data?.errors || {};
        setErrors(validationErrors);
        // Mark all error fields as touched
        const newTouched = {};
        Object.keys(validationErrors).forEach(field => {
          newTouched[field] = true;
        });
        setTouched(prev => ({ ...prev, ...newTouched }));
      }
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all steps before submission
    let hasErrors = false;
    const allErrors = {};
    
    for (let step = 1; step <= totalSteps; step++) {
      const stepErrors = validateStep(step, formData, isEdit);
      if (Object.keys(stepErrors).length > 0) {
        hasErrors = true;
        Object.assign(allErrors, stepErrors);
      }
    }
    
    if (hasErrors) {
      setErrors(allErrors);
      setTouched(prev => {
        const newTouched = { ...prev };
        Object.keys(allErrors).forEach(field => {
          newTouched[field] = true;
        });
        return newTouched;
      });
      toast.error('Please fix all validation errors before submitting');
      return;
    }
    
    const submitData = { ...formData };
    // Remove empty strings
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '') {
        submitData[key] = null;
      }
    });
    
    if (isEdit) {
      updateMutation.mutate({ id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    if (touched[field]) {
      const step = getFieldStep(field);
      const error = validateField(field, value, step, isEdit);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  }, [touched, isEdit]);

  const handleFieldBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const step = getFieldStep(field);
    const error = validateField(field, formData[field], step, isEdit);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, [formData, isEdit]);

  const getFieldStep = (field) => {
    const stepFields = {
      1: ['name', 'email', 'password', 'phone'],
      2: ['business_name', 'business_type', 'business_description', 'business_address', 'gst_number', 'pan_number'],
      3: ['bank_account', 'bank_ifsc'],
      4: ['revenue_model_id']
    };
    
    for (const [step, fields] of Object.entries(stepFields)) {
      if (fields.includes(field)) return parseInt(step);
    }
    return 1;
  };

  const handleKeyDown = useCallback((e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const step = getFieldStep(field);
      
      // Validate current field
      handleFieldBlur(field);
      
      // Move to next step if current step is valid
      if (isStepValid(step, formData, isEdit)) {
        if (currentStep < totalSteps) {
          setCurrentStep(currentStep + 1);
        } else {
          // Submit form if on last step
          handleSubmit(e);
        }
      }
    }
  }, [formData, isEdit, totalSteps, currentStep, handleFieldBlur]);

  const nextStep = () => {
    // Validate current step before proceeding
    const stepErrors = validateStep(currentStep, formData, isEdit);
    setErrors(prev => ({ ...prev, ...stepErrors }));
    
    if (Object.keys(stepErrors).length === 0 && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark all fields in current step as touched to show errors
      const stepFields = getStepFields(currentStep);
      const newTouched = {};
      stepFields.forEach(field => {
        newTouched[field] = true;
      });
      setTouched(prev => ({ ...prev, ...newTouched }));
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepFields = (step) => {
    const stepFields = {
      1: ['name', 'email', 'password', 'phone'],
      2: ['business_name', 'business_type', 'business_description', 'business_address', 'gst_number', 'pan_number'],
      3: ['bank_account', 'bank_ifsc'],
      4: ['revenue_model_id']
    };
    return stepFields[step] || [];
  };

  const isCurrentStepValid = () => {
    return isStepValid(currentStep, formData, isEdit);
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Business Details', icon: Building },
    { number: 3, title: 'Banking Info', icon: CreditCard },
    { number: 4, title: 'Subscription', icon: Calendar }
  ];

  if (isEdit && ownerLoading) {
    return (
      <div className="h-full bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading owner data...</p>
        </div>
      </div>
    );
  }

  if (isEdit && ownerError) {
    return (
      <div className="h-full bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Owner</h2>
          <p className="text-gray-600 mb-4">Could not load owner data for editing.</p>
          <button
            onClick={() => navigate('/admin/owners')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Owners
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50/30 overflow-auto">
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4"
        >
          <button
            onClick={() => navigate('/admin/owners')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Turf Owner' : 'Add New Turf Owner'}
            </h1>
            <p className="text-gray-600 mt-1">
              Step {currentStep} of {totalSteps}: {steps[currentStep - 1].title}
            </p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isActive 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                    </div>
                    <span className={`text-sm font-medium mt-2 ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-6 rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <User className="text-blue-600" size={22} />
                    <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onBlur={() => handleFieldBlur('name')}
                        onKeyDown={(e) => handleKeyDown(e, 'name')}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                          errors.name && touched.name
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="Enter full name"
                        required
                      />
                      {errors.name && touched.name && (
                        <div className="flex items-center mt-1 text-red-600 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.name}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={() => handleFieldBlur('email')}
                        onKeyDown={(e) => handleKeyDown(e, 'email')}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                          errors.email && touched.email
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="Enter email address"
                        required
                      />
                      {errors.email && touched.email && (
                        <div className="flex items-center mt-1 text-red-600 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.email}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isEdit ? 'New Password (leave blank to keep current)' : 'Password *'}
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        onBlur={() => handleFieldBlur('password')}
                        onKeyDown={(e) => handleKeyDown(e, 'password')}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                          errors.password && touched.password
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="Enter password"
                        required={!isEdit}
                      />
                      {errors.password && touched.password && (
                        <div className="flex items-center mt-1 text-red-600 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.password}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        onBlur={() => handleFieldBlur('phone')}
                        onKeyDown={(e) => handleKeyDown(e, 'phone')}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                          errors.phone && touched.phone
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="Enter phone number"
                      />
                      {errors.phone && touched.phone && (
                        <div className="flex items-center mt-1 text-red-600 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Business Information */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <Building className="text-green-600" size={22} />
                    <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                      <input
                        type="text"
                        value={formData.business_name}
                        onChange={(e) => handleInputChange('business_name', e.target.value)}
                        onBlur={() => handleFieldBlur('business_name')}
                        onKeyDown={(e) => handleKeyDown(e, 'business_name')}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                          errors.business_name && touched.business_name
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="Enter business name"
                        required
                      />
                      {errors.business_name && touched.business_name && (
                        <div className="flex items-center mt-1 text-red-600 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.business_name}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                      <select
                        value={formData.business_type}
                        onChange={(e) => handleInputChange('business_type', e.target.value)}
                        onBlur={() => handleFieldBlur('business_type')}
                        onKeyDown={(e) => handleKeyDown(e, 'business_type')}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                          errors.business_type && touched.business_type
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      >
                        <option value="">Select Business Type</option>
                        <option value="individual">Individual</option>
                        <option value="partnership">Partnership</option>
                        <option value="private_limited">Private Limited</option>
                        <option value="llp">LLP</option>
                      </select>
                      {errors.business_type && touched.business_type && (
                        <div className="flex items-center mt-1 text-red-600 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.business_type}
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        {formData.business_logo ? (
                          <div className="space-y-3">
                            <img src={formData.business_logo} alt="Business Logo" className="mx-auto h-20 w-20 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => handleInputChange('business_logo', '')}
                              className="text-red-600 text-sm hover:text-red-700"
                            >
                              Remove Logo
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-10 w-10 text-gray-400" />
                            <div className="mt-3">
                              <label className="cursor-pointer">
                                <span className="block text-sm font-medium text-gray-900">
                                  Upload business logo
                                </span>
                                <input 
                                  type="file" 
                                  className="sr-only" 
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      if (file.size > 2 * 1024 * 1024) {
                                        toast.error('File size must be less than 2MB');
                                        return;
                                      }
                                      const reader = new FileReader();
                                      reader.onload = (e) => {
                                        handleInputChange('business_logo', e.target.result);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                              <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 2MB</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
                      <textarea
                        value={formData.business_description}
                        onChange={(e) => handleInputChange('business_description', e.target.value)}
                        onBlur={() => handleFieldBlur('business_description')}
                        rows={3}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                          errors.business_description && touched.business_description
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="Describe your business..."
                      />
                      {errors.business_description && touched.business_description && (
                        <div className="flex items-center mt-1 text-red-600 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.business_description}
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                      <textarea
                        value={formData.business_address}
                        onChange={(e) => handleInputChange('business_address', e.target.value)}
                        onBlur={() => handleFieldBlur('business_address')}
                        rows={3}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                          errors.business_address && touched.business_address
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="Enter complete business address"
                      />
                      {errors.business_address && touched.business_address && (
                        <div className="flex items-center mt-1 text-red-600 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.business_address}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                      <input
                        type="text"
                        value={formData.gst_number}
                        onChange={(e) => handleInputChange('gst_number', e.target.value.toUpperCase())}
                        onBlur={() => handleFieldBlur('gst_number')}
                        onKeyDown={(e) => handleKeyDown(e, 'gst_number')}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                          errors.gst_number && touched.gst_number
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="22AAAAA0000A1Z5"
                        maxLength={15}
                      />
                      {errors.gst_number && touched.gst_number && (
                        <div className="flex items-center mt-1 text-red-600 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.gst_number}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                      <input
                        type="text"
                        value={formData.pan_number}
                        onChange={(e) => handleInputChange('pan_number', e.target.value.toUpperCase())}
                        onBlur={() => handleFieldBlur('pan_number')}
                        onKeyDown={(e) => handleKeyDown(e, 'pan_number')}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                          errors.pan_number && touched.pan_number
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                      />
                      {errors.pan_number && touched.pan_number && (
                        <div className="flex items-center mt-1 text-red-600 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.pan_number}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Banking Information */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <CreditCard className="text-purple-600" size={22} />
                    <h2 className="text-xl font-semibold text-gray-900">Banking Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
                      <input
                        type="text"
                        value={formData.bank_account}
                        onChange={(e) => handleInputChange('bank_account', e.target.value.replace(/\D/g, ''))}
                        onBlur={() => handleFieldBlur('bank_account')}
                        onKeyDown={(e) => handleKeyDown(e, 'bank_account')}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                          errors.bank_account && touched.bank_account
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="Enter bank account number"
                        maxLength={18}
                      />
                      {errors.bank_account && touched.bank_account && (
                        <div className="flex items-center mt-1 text-red-600 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.bank_account}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                      <input
                        type="text"
                        value={formData.bank_ifsc}
                        onChange={(e) => handleInputChange('bank_ifsc', e.target.value.toUpperCase())}
                        onBlur={() => handleFieldBlur('bank_ifsc')}
                        onKeyDown={(e) => handleKeyDown(e, 'bank_ifsc')}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                          errors.bank_ifsc && touched.bank_ifsc
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="SBIN0001234"
                        maxLength={11}
                      />
                      {errors.bank_ifsc && touched.bank_ifsc && (
                        <div className="flex items-center mt-1 text-red-600 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.bank_ifsc}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Subscription */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <Calendar className="text-orange-600" size={22} />
                    <h2 className="text-xl font-semibold text-gray-900">Subscription Plan</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">Select Revenue Model *</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {revenueModels.map(model => (
                          <div
                            key={model.id}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              formData.revenue_model_id === model.id.toString()
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              handleInputChange('revenue_model_id', model.id.toString());
                              handleFieldBlur('revenue_model_id');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleInputChange('revenue_model_id', model.id.toString());
                                handleFieldBlur('revenue_model_id');
                              }
                            }}
                            tabIndex={0}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-900">{model.name}</h3>
                              <span className="text-lg font-bold text-blue-600">
                                ₹{model.price}/{model.billing_cycle}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                            <div className="text-sm text-green-600 font-medium">
                              {model.commission_rate}% commission rate
                            </div>
                          </div>
                        ))}
                      </div>
                      {errors.revenue_model_id && touched.revenue_model_id && (
                        <div className="flex items-center mt-2 text-red-600 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.revenue_model_id}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="status"
                        checked={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="status" className="ml-2 block text-sm text-gray-900">
                        Active Status
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={currentStep === 1 ? () => navigate('/admin/owners') : prevStep}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center space-x-2"
              >
                <ArrowLeft size={16} />
                <span>{currentStep === 1 ? 'Cancel' : 'Previous'}</span>
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isCurrentStepValid()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={createMutation.isLoading || updateMutation.isLoading || !isCurrentStepValid()}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {(createMutation.isLoading || updateMutation.isLoading) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <Save size={16} />
                  <span>{isEdit ? 'Update Owner' : 'Create Owner'}</span>
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default TurfOwnerForm;