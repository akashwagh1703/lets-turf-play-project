import React, { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Filter, MapPin, Star, Tag, X, Compass, Award, Sparkles, LocateFixed } from 'lucide-react'
import { getTurfs, getAllAmenities } from '../services/turfService'
import { SearchFilters, Turf } from '../types'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { formatCurrency } from '../lib/utils'
import { Link } from 'react-router-dom'
import { AmenityIcon } from '../components/ui/AmenityIcon'
import { useAuth } from '../hooks/useAuth'
import { useGeolocation } from '../hooks/useGeolocation'

const TurfCard: React.FC<{ turf: Turf }> = ({ turf }) => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className="h-full"
    >
      <Link to={`/turf/${turf.id}`} className="block h-full">
        <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 h-full flex flex-col border-gray-200 bg-white">
          <div className="aspect-video relative overflow-hidden">
            <img
              src={turf.images[0]}
              alt={turf.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 to-transparent" />
            
            <div className="absolute top-3 right-3 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold shadow-md">
              {formatCurrency(turf.price)}/hr
            </div>

            {turf.tags && (
              <div className="absolute bottom-3 left-3 flex gap-2">
                {turf.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-xs bg-accent text-accent-foreground font-semibold px-2 py-1 rounded-full shadow">
                    <Sparkles className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <CardContent className="p-4 flex-grow flex flex-col">
            <h3 className="font-bold text-lg text-dark mb-1 truncate">{turf.name}</h3>
            
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-secondary" />
              <span className="truncate">{turf.location}</span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-accent fill-accent mr-1" />
                <span className="text-sm font-bold">{turf.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500 ml-1">({turf.reviewCount} reviews)</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-gray-500 mt-auto pt-2 border-t border-gray-100">
              {turf.amenities.slice(0, 4).map((amenity) => (
                <AmenityIcon key={amenity} amenity={amenity} className="w-5 h-5" title={amenity} />
              ))}
              {turf.amenities.length > 4 && (
                <span className="text-xs font-medium">+ {turf.amenities.length - 4} more</span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

export const SearchPage: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()
  const { coordinates, isLoading: isGeoLoading, error: geoError, getLocation } = useGeolocation()

  const { data: allTurfs = [], isLoading: allTurfsLoading, error } = useQuery({
    queryKey: ['turfs', filters],
    queryFn: () => getTurfs(filters),
    staleTime: 1000 * 60 * 5
  })

  const { data: popularTurfs = [], isLoading: popularTurfsLoading } = useQuery({
    queryKey: ['turfs', { sortBy: 'rating' }],
    queryFn: () => getTurfs({ sortBy: 'rating' }),
    staleTime: 1000 * 60 * 15
  })

  useEffect(() => {
    if (coordinates) {
      setFilters(prev => ({
        ...prev,
        sortBy: 'nearest',
        latitude: coordinates.lat,
        longitude: coordinates.lon,
        location: undefined // Clear location text search when using geo
      }))
      setSearchQuery('')
    }
  }, [coordinates])

  const amenities = getAllAmenities()

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleQuickFilter = (sortBy: 'nearest' | 'rating' | 'cheapest') => {
    if (sortBy === 'nearest') {
      getLocation()
    } else {
      setFilters({ sortBy })
    }
    setSearchQuery('')
  }

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = filters.amenities || []
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity]
    handleFilterChange('amenities', newAmenities)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
  }

  const applySearch = () => {
    handleFilterChange('location', searchQuery.trim() || undefined)
    setIsFilterModalOpen(false)
  }

  const isSearching = useMemo(() => {
    return Object.values(filters).some(v => v !== undefined && (Array.isArray(v) ? v.length > 0 : true))
  }, [filters])

  const isLoading = allTurfsLoading || isGeoLoading

  if (error) return <div>Error loading turfs.</div>

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6 pb-6 md:pb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {user ? `Welcome, ${user.name.split(' ')[0]}!` : 'Welcome!'}
            </h1>
            <p className="text-gray-200 mt-1 text-sm md:text-base">Find & Book Your Perfect Turf</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 md:mt-6"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5 pointer-events-none" />
                <Input
                  placeholder="Search by location or turf name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-24 sm:pr-28 !py-3 w-full !bg-white/20 !text-white rounded-full !border-transparent focus:!ring-white placeholder:text-gray-200"
                  onKeyPress={(e) => e.key === 'Enter' && applySearch()}
                />
                <Button 
                  onClick={applySearch} 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 !rounded-full !px-4 !py-1.5 text-sm bg-white text-primary font-bold hover:bg-white/90"
                >
                  <span className="hidden sm:inline">Search</span>
                  <Search className="w-4 h-4 sm:hidden" />
                </Button>
              </div>
              <Button onClick={getLocation} className="!rounded-full !p-3 bg-white text-secondary hover:bg-white/90" aria-label="Use my location">
                <LocateFixed className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isSearching ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-dark">
                {isLoading ? 'Searching...' : `${allTurfs.length} turf${allTurfs.length !== 1 ? 's' : ''} found`}
              </h2>
              <button
                onClick={clearFilters}
                className="text-sm text-destructive hover:text-destructive/80 font-medium flex items-center gap-1"
              >
                <X size={14} /> Clear
              </button>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <Card key={i} className="animate-pulse h-80 bg-white" />)}
              </div>
            ) : allTurfs.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                initial="hidden"
                animate="show"
              >
                {allTurfs.map((turf) => <TurfCard key={turf.id} turf={turf} />)}
              </motion.div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-dark mb-2">No turfs found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="space-y-12">
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => handleQuickFilter('nearest')} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-xs font-medium text-gray-700 hover:text-dark">
                  <Compass className="w-4 h-4 text-secondary" />
                  <span>Nearest</span>
                </button>
                <button onClick={() => handleQuickFilter('rating')} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-xs font-medium text-gray-700 hover:text-dark">
                  <Award className="w-4 h-4 text-accent" />
                  <span>Top Rated</span>
                </button>
                <button onClick={() => handleQuickFilter('cheapest')} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-xs font-medium text-gray-700 hover:text-dark">
                  <Tag className="w-4 h-4 text-primary" />
                  <span>Best Value</span>
                </button>
                <button onClick={() => setIsFilterModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-dark text-white rounded-full shadow-sm hover:shadow-md transition-shadow border-dark text-xs font-medium">
                  <Filter className="w-4 h-4 text-gray-300" />
                  <span>All Filters</span>
                </button>
              </div>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-2xl font-bold text-dark mb-4">Popular Turfs</h2>
              {popularTurfsLoading ? (
                <div className="flex space-x-4 -mx-4 px-4 pb-4 overflow-x-auto">
                  {[...Array(2)].map((_, i) => <div key={i} className="w-72 h-80 bg-white rounded-lg animate-pulse flex-shrink-0" />)}
                </div>
              ) : (
                <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4">
                  {popularTurfs.slice(0, 5).map(turf => (
                    <div key={turf.id} className="w-72 flex-shrink-0">
                      <TurfCard turf={turf} />
                    </div>
                  ))}
                </div>
              )}
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-2xl font-bold text-dark mb-4">All Turfs</h2>
              {allTurfsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => <Card key={i} className="animate-pulse h-80 bg-white" />)}
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                  initial="hidden"
                  animate="show"
                >
                  {allTurfs.map((turf) => <TurfCard key={turf.id} turf={turf} />)}
                </motion.div>
              )}
            </motion.section>
          </div>
        )}
      </main>

      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filter Turfs" className="max-w-lg">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={filters.sortBy || ''}
              onChange={(e) => handleFilterChange('sortBy', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="">Default</option>
              <option value="nearest">Nearest</option>
              <option value="cheapest">Cheapest</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Min price" type="number" value={filters.minPrice || ''} onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)} />
              <Input placeholder="Max price" type="number" value={filters.maxPrice || ''} onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
            <select
              value={filters.rating || ''}
              onChange={(e) => handleFilterChange('rating', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="">Any rating</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="grid grid-cols-2 gap-2">
              {amenities.map((amenity) => (
                <button
                  key={amenity}
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`p-2 rounded-md border text-sm transition-colors flex items-center gap-2 ${
                    filters.amenities?.includes(amenity)
                      ? 'border-primary bg-primary/10 text-dark'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <AmenityIcon amenity={amenity} className="w-4 h-4" />
                  {amenity}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={clearFilters} variant="outline" className="flex-1">Clear</Button>
            <Button onClick={applySearch} variant="primary" className="flex-1">Apply Filters</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
