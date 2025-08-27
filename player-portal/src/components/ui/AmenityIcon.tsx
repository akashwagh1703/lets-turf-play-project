import React from 'react'
import {
  Zap,
  Car,
  ShowerHead,
  GlassWater,
  PlusSquare,
  Utensils,
  Shirt,
  Sprout,
  Wind,
  Wifi,
  Users,
  Dumbbell
} from 'lucide-react'

interface AmenityIconProps {
  amenity: string
  className?: string
}

export const AmenityIcon: React.FC<AmenityIconProps> = ({ amenity, className }) => {
  const iconProps = { className: className || 'w-4 h-4' }

  switch (amenity.toLowerCase()) {
    case 'floodlights':
      return <Zap {...iconProps} />
    case 'parking':
      return <Car {...iconProps} />
    case 'washroom':
      return <ShowerHead {...iconProps} />
    case 'drinking water':
      return <GlassWater {...iconProps} />
    case 'first aid':
      return <PlusSquare {...iconProps} />
    case 'cafeteria':
      return <Utensils {...iconProps} />
    case 'changing room':
      return <Shirt {...iconProps} />
    case 'seating area':
      return <Users {...iconProps} />
    case 'equipment rental':
      return <Dumbbell {...iconProps} />
    case 'natural grass':
      return <Sprout {...iconProps} />
    case 'air conditioning':
      return <Wind {...iconProps} />
    case 'wi-fi':
      return <Wifi {...iconProps} />
    default:
      return null
  }
}
