import React, { useState } from 'react';
import { Upload, X, File, Image } from 'lucide-react';
import toast from 'react-hot-toast';

const FileUpload = ({ onUpload, acceptedTypes = 'image', maxSize = 10 }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = async (files) => {
    const file = files[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', acceptedTypes);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        onUpload(data.data);
        toast.success('File uploaded successfully');
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept={acceptedTypes === 'image' ? 'image/*' : acceptedTypes === 'document' ? '.pdf,.doc,.docx' : 'video/*'}
        onChange={(e) => handleFiles(e.target.files)}
        disabled={uploading}
      />
      
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center space-y-2">
          {acceptedTypes === 'image' ? (
            <Image className="w-12 h-12 text-gray-400" />
          ) : (
            <File className="w-12 h-12 text-gray-400" />
          )}
          
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          ) : (
            <>
              <p className="text-gray-600">
                Drop files here or <span className="text-blue-600 underline">browse</span>
              </p>
              <p className="text-sm text-gray-400">
                Max size: {maxSize}MB • {acceptedTypes}
              </p>
            </>
          )}
        </div>
      </label>
    </div>
  );
};

export default FileUpload;