import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { User, Edit2, MapPin, Heart, Save, X } from 'lucide-react'
import { updateProfile } from '../services/authService'
import { getAllAmenities } from '../services/turfService'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader } from '../components/ui/Card'

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    favoriteLocation: user?.favoriteLocation || '',
    preferredAmenities: user?.preferredAmenities || []
  })

  const amenities = getAllAmenities()

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      updateUser(updatedUser)
      setIsEditing(false)
    }
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      preferredAmenities: prev.preferredAmenities.includes(amenity)
        ? prev.preferredAmenities.filter(a => a !== amenity)
        : [...prev.preferredAmenities, amenity]
    }))
  }

  const handleSave = async () => {
    if (!user) return
    
    await updateProfileMutation.mutateAsync({
      ...user,
      ...formData
    })
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      favoriteLocation: user?.favoriteLocation || '',
      preferredAmenities: user?.preferredAmenities || []
    })
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">User not found</h2>
          <Button onClick={() => window.location.href = '/login'}>Login</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                isLoading={updateProfileMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900">{user.name}</h2>
                  <p className="text-slate-600">{user.phone}</p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                />

                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your email"
                />

                <Input
                  label="Phone Number"
                  value={user.phone}
                  disabled
                  className="bg-slate-100"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location Preference
              </h3>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <Input
                label="Favorite Location"
                value={formData.favoriteLocation}
                onChange={(e) => handleInputChange('favoriteLocation', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Nashik Road, Panchavati"
              />
              {!isEditing && formData.favoriteLocation && (
                <p className="text-sm text-slate-600 mt-2">
                  We'll prioritize turfs near this location in search results
                </p>
              )}
            </CardContent>
          </Card>

          {/* Preferred Amenities */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Preferred Amenities
              </h3>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenities.map((amenity) => (
                  <button
                    key={amenity}
                    onClick={() => isEditing && handleAmenityToggle(amenity)}
                    disabled={!isEditing}
                    className={`p-3 rounded-lg border-2 transition-colors text-sm ${
                      formData.preferredAmenities.includes(amenity)
                        ? 'border-accent-600 bg-accent-50 text-accent-700'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${!isEditing ? 'cursor-default' : 'cursor-pointer'} ${
                      !isEditing && !formData.preferredAmenities.includes(amenity) ? 'opacity-50' : ''
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
              {!isEditing && (
                <p className="text-sm text-slate-600 mt-4">
                  {formData.preferredAmenities.length > 0
                    ? `You have selected ${formData.preferredAmenities.length} preferred amenities`
                    : 'No preferred amenities selected'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Account</h3>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Privacy Settings
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
