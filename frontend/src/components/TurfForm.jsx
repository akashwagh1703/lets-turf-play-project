import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Save, Upload, X, MapPin, Clock, Users, Camera, Video, FileText, Hash, Star, Check, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

const TurfForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    turf_name: '',
    location: '',
    capacity: '',
    price_per_hour: '',
    description: '',
    facilities: '',
    rules: '',
    contact_number: '',
    email: '',
    opening_time: '',
    closing_time: '',
    turf_type: '',
    surface_type: '',
    size: '',
    parking_available: false,
    changing_rooms: false,
    washrooms: false,
    lighting: false,
    water_facility: false,
    first_aid: false,
    security: false,
    hashtags: '',
    images: [],
    videos: [],
    documents: [],
    status: true
  });

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  const steps = [
    { number: 1, title: 'Basic Info', icon: Building },
    { number: 2, title: 'Facilities', icon: Star },
    { number: 3, title: 'Media & Content', icon: Camera },
    { number: 4, title: 'Review', icon: Check }
  ];

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.turf_name && formData.location && formData.capacity && formData.price_per_hour && formData.turf_type;
      case 2:
        return true; // Facilities are optional
      case 3:
        return true; // Media is optional
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setValidating(true);
      setTimeout(() => {
        if (validateStep(currentStep)) {
          setCurrentStep(currentStep + 1);
        } else {
          toast.error('Please fill all required fields before proceeding');
        }
        setValidating(false);
      }, 100);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (type, files) => {
    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      if (type === 'images' && file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      if (type === 'videos' && file.size > 50 * 1024 * 1024) {
        toast.error('Video size must be less than 50MB');
        return;
      }
      if (type === 'documents' && file.size > 10 * 1024 * 1024) {
        toast.error('Document size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target.result
        };
        
        setFormData(prev => ({
          ...prev,
          [type]: [...prev[type], fileData]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        hashtags: formData.hashtags ? formData.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        facilities: formData.facilities ? formData.facilities.split(',').map(f => f.trim()).filter(f => f) : []
      };

      if (isEdit) {
        await apiService.updateTurf(id, submitData);
        toast.success('Turf updated successfully!');
        navigate('/owner/turfs');
      } else {
        await apiService.createTurf(submitData);
        toast.success('Turf created successfully!');
        navigate('/owner/turfs');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to save turf');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50/30 flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6 p-6 pb-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4"
        >
          <button
            onClick={() => navigate('/owner/turfs')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Edit Turf' : 'Add New Turf'}
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

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <Building className="text-blue-600" size={22} />
                    <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Turf Name *</label>
                <input
                  type="text"
                  value={formData.turf_name}
                  onChange={(e) => handleInputChange('turf_name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter turf name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Turf Type *</label>
                <select
                  value={formData.turf_type}
                  onChange={(e) => handleInputChange('turf_type', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="football">Football</option>
                  <option value="cricket">Cricket</option>
                  <option value="badminton">Badminton</option>
                  <option value="tennis">Tennis</option>
                  <option value="basketball">Basketball</option>
                  <option value="multi_sport">Multi Sport</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <textarea
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter complete address with landmarks"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Max players"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per Hour *</label>
                <input
                  type="number"
                  value={formData.price_per_hour}
                  onChange={(e) => handleInputChange('price_per_hour', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="₹ 0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Surface Type</label>
                <select
                  value={formData.surface_type}
                  onChange={(e) => handleInputChange('surface_type', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Surface</option>
                  <option value="natural_grass">Natural Grass</option>
                  <option value="artificial_turf">Artificial Turf</option>
                  <option value="concrete">Concrete</option>
                  <option value="wooden">Wooden</option>
                  <option value="synthetic">Synthetic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100x60 feet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                <input
                  type="time"
                  value={formData.opening_time}
                  onChange={(e) => handleInputChange('opening_time', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                <input
                  type="time"
                  value={formData.closing_time}
                  onChange={(e) => handleInputChange('closing_time', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <input
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => handleInputChange('contact_number', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter contact number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Facilities */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <Star className="text-green-600" size={22} />
                    <h2 className="text-xl font-semibold text-gray-900">Facilities & Amenities</h2>
                  </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { key: 'parking_available', label: 'Parking' },
                { key: 'changing_rooms', label: 'Changing Rooms' },
                { key: 'washrooms', label: 'Washrooms' },
                { key: 'lighting', label: 'Lighting' },
                { key: 'water_facility', label: 'Water Facility' },
                { key: 'first_aid', label: 'First Aid' },
                { key: 'security', label: 'Security' }
              ].map(facility => (
                <label key={facility.key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[facility.key]}
                    onChange={(e) => handleInputChange(facility.key, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{facility.label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Facilities</label>
              <input
                type="text"
                value={formData.facilities}
                onChange={(e) => handleInputChange('facilities', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter facilities separated by commas (e.g., Cafeteria, Equipment Rental, Scoreboard)"
              />
            </div>
                </motion.div>
              )}

              {/* Step 3: Media & Content */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <Camera className="text-purple-600" size={22} />
                    <h2 className="text-xl font-semibold text-gray-900">Media & Content</h2>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description & Rules</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe your turf, its unique features, and what makes it special..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rules & Regulations</label>
                <textarea
                  value={formData.rules}
                  onChange={(e) => handleInputChange('rules', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="List important rules and regulations for players..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Hash className="mr-1" size={16} />
                  Hashtags
                </label>
                <input
                  type="text"
                  value={formData.hashtags}
                  onChange={(e) => handleInputChange('hashtags', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hashtags separated by commas (e.g., #football, #premium, #floodlit)"
                />
              </div>
            </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Media & Documents</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Camera className="mr-1" size={16} />
                  Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-sm font-medium text-gray-900">Upload Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleFileUpload('images', e.target.files)}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB each</p>
                </div>
                
                {formData.images.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.images.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('images', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Video className="mr-1" size={16} />
                  Videos
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <Video className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-sm font-medium text-gray-900">Upload Videos</span>
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      className="sr-only"
                      onChange={(e) => handleFileUpload('videos', e.target.files)}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">MP4, MOV up to 50MB each</p>
                </div>
                
                {formData.videos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.videos.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('videos', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Documents */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <FileText className="mr-1" size={16} />
                  Documents
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-sm font-medium text-gray-900">Upload Documents</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      className="sr-only"
                      onChange={(e) => handleFileUpload('documents', e.target.files)}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC up to 10MB each</p>
                </div>
                
                {formData.documents.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('documents', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <Check className="text-orange-600" size={22} />
                    <h2 className="text-xl font-semibold text-gray-900">Review & Submit</h2>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Turf Summary</h3>
                    <p><strong>Name:</strong> {formData.turf_name}</p>
                    <p><strong>Location:</strong> {formData.location}</p>
                    <p><strong>Capacity:</strong> {formData.capacity} players</p>
                    <p><strong>Price:</strong> ₹{formData.price_per_hour}/hour</p>
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
                      Active Status (Turf is available for booking)
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={currentStep === 1 ? () => navigate('/owner/turfs') : prevStep}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center space-x-2"
              >
                <ArrowLeft size={16} />
                <span>{currentStep === 1 ? 'Cancel' : 'Previous'}</span>
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
                  disabled={!validateStep(currentStep) || validating}
                >
                  {validating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>Next</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <Save size={16} />
                  <span>{isEdit ? 'Update Turf' : 'Create Turf'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default TurfForm;