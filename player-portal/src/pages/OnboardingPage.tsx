import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { User, Camera, MapPin, Heart } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { completeProfile } from '../services/authService'
import { getAllAmenities } from '../services/turfService'
import { useAuth } from '../hooks/useAuth'

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileImage: '',
    favoriteLocation: '',
    preferredAmenities: [] as string[]
  })

  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  
  const phoneNumber = (location.state as any)?.phoneNumber || ''
  const amenities = getAllAmenities()

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

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = async () => {
    if (!formData.name.trim()) {
      return
    }

    setIsLoading(true)

    try {
      const user = await completeProfile({
        ...formData,
        phone: phoneNumber
      })
      
      login(user)
      navigate('/search')
    } catch (error) {
      console.error('Profile completion failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 relative">
          {formData.profileImage ? (
            <img
              src={formData.profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-gray-400" />
          )}
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500">Add a profile photo (optional)</p>
      </div>

      <Input
        label="Full Name"
        placeholder="Enter your full name"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        required
      />

      <Input
        label="Email (Optional)"
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
      />
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MapPin className="w-12 h-12 text-brand-primary mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Set Your Location</h3>
        <p className="text-gray-600">Help us find turfs near you</p>
      </div>

      <Input
        label="Favorite Location"
        placeholder="e.g., Nashik Road, Panchavati"
        value={formData.favoriteLocation}
        onChange={(e) => handleInputChange('favoriteLocation', e.target.value)}
      />

      <div className="text-center text-sm text-gray-500">
        <p>We'll use this to show relevant turfs in your area</p>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Heart className="w-12 h-12 text-brand-primary mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Preferred Amenities</h3>
        <p className="text-gray-600">What features do you value most?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {amenities.map((amenity) => (
          <button
            key={amenity}
            onClick={() => handleAmenityToggle(amenity)}
            className={`p-3 rounded-lg border-2 transition-colors text-sm ${
              formData.preferredAmenities.includes(amenity)
                ? 'border-brand-primary bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {amenity}
          </button>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>Select amenities you prefer (optional)</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">Step {step} of 3</p>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          
          <div className="ml-auto">
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={step === 1 && !formData.name.trim()}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                isLoading={isLoading}
                disabled={!formData.name.trim()}
              >
                Complete Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
