// Validation utility functions
export const validators = {
  required: (value, fieldName = 'Field') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[+]?[\d\s\-()]{10,15}$/;
    return phoneRegex.test(value) ? null : 'Please enter a valid phone number';
  },

  password: (value, isEdit = false) => {
    if (isEdit && !value) return null; // Allow empty password in edit mode
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  },

  gst: (value) => {
    if (!value) return null;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(value) ? null : 'Please enter a valid GST number';
  },

  pan: (value) => {
    if (!value) return null;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(value) ? null : 'Please enter a valid PAN number';
  },

  ifsc: (value) => {
    if (!value) return null;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(value) ? null : 'Please enter a valid IFSC code';
  },

  bankAccount: (value) => {
    if (!value) return null;
    const accountRegex = /^[0-9]{9,18}$/;
    return accountRegex.test(value) ? null : 'Please enter a valid bank account number';
  },

  minLength: (value, min, fieldName = 'Field') => {
    if (!value) return null;
    return value.length >= min ? null : `${fieldName} must be at least ${min} characters`;
  },

  maxLength: (value, max, fieldName = 'Field') => {
    if (!value) return null;
    return value.length <= max ? null : `${fieldName} must not exceed ${max} characters`;
  }
};

// Form validation schema
export const turfOwnerValidationSchema = {
  step1: {
    name: [(value) => validators.required(value, 'Full name')],
    email: [
      (value) => validators.required(value, 'Email'),
      validators.email
    ],
    password: [(value, isEdit) => validators.password(value, isEdit)],
    phone: [validators.phone]
  },
  step2: {
    business_name: [(value) => validators.required(value, 'Business name')],
    business_type: [],
    business_description: [(value) => validators.maxLength(value, 1000, 'Business description')],
    business_address: [(value) => validators.maxLength(value, 500, 'Business address')],
    gst_number: [validators.gst],
    pan_number: [validators.pan]
  },
  step3: {
    bank_account: [validators.bankAccount],
    bank_ifsc: [validators.ifsc]
  },
  step4: {
    revenue_model_id: [(value) => validators.required(value, 'Revenue model')]
  }
};

// Validate a single field
export const validateField = (fieldName, value, step, isEdit = false) => {
  const stepSchema = turfOwnerValidationSchema[`step${step}`];
  if (!stepSchema || !stepSchema[fieldName]) return null;

  for (const validator of stepSchema[fieldName]) {
    const error = validator(value, isEdit);
    if (error) return error;
  }
  return null;
};

// Validate entire step
export const validateStep = (stepNumber, formData, isEdit = false) => {
  const stepSchema = turfOwnerValidationSchema[`step${stepNumber}`];
  if (!stepSchema) return {};

  const errors = {};
  for (const fieldName of Object.keys(stepSchema)) {
    const error = validateField(fieldName, formData[fieldName], stepNumber, isEdit);
    if (error) errors[fieldName] = error;
  }
  return errors;
};

// Check if step is valid
export const isStepValid = (stepNumber, formData, isEdit = false) => {
  const errors = validateStep(stepNumber, formData, isEdit);
  return Object.keys(errors).length === 0;
};

import { useState } from 'react';

// Real-time validation hook
export const useFormValidation = (initialData = {}, isEdit = false) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateAndSetField = (fieldName, value, step) => {
    const error = validateField(fieldName, value, step, isEdit);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const touchField = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const validateCurrentStep = (step) => {
    const stepErrors = validateStep(step, formData, isEdit);
    setErrors(prev => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  return {
    formData,
    errors,
    touched,
    setFormData,
    validateAndSetField,
    touchField,
    validateCurrentStep,
    isStepValid: (step) => isStepValid(step, formData, isEdit)
  };
};