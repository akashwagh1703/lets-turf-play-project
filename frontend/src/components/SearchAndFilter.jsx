import React, { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import debounce from 'lodash.debounce';

const SearchAndFilter = ({ data, onFilteredData, searchFields, filterOptions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useMemo(
    () => debounce((term) => {
      filterData(term, activeFilters);
    }, 300),
    [data, activeFilters]
  );

  const filterData = (search, filters) => {
    let filtered = data;

    // Apply search
    if (search) {
      filtered = filtered.filter(item =>
        searchFields.some(field =>
          item[field]?.toString().toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(item => {
          if (Array.isArray(value)) {
            return value.includes(item[key]);
          }
          return item[key] === value;
        });
      }
    });

    onFilteredData(filtered);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    filterData(searchTerm, newFilters);
  };

  const clearFilter = (key) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    filterData(searchTerm, newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    onFilteredData(data);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter size={16} />
          Filters
          {Object.keys(activeFilters).length > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {Object.keys(activeFilters).length}
            </span>
          )}
        </button>

        {Object.keys(activeFilters).length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Active Filters */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {key}: {Array.isArray(value) ? value.join(', ') : value}
              <button
                onClick={() => clearFilter(key)}
                className="hover:bg-blue-200 rounded-full p-1"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          {filterOptions.map((option) => (
            <div key={option.key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {option.label}
              </label>
              {option.type === 'select' && (
                <select
                  value={activeFilters[option.key] || 'all'}
                  onChange={(e) => handleFilterChange(option.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  {option.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              {option.type === 'multiselect' && (
                <div className="space-y-2">
                  {option.options.map((opt) => (
                    <label key={opt.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(activeFilters[option.key] || []).includes(opt.value)}
                        onChange={(e) => {
                          const current = activeFilters[option.key] || [];
                          const newValue = e.target.checked
                            ? [...current, opt.value]
                            : current.filter(v => v !== opt.value);
                          handleFilterChange(option.key, newValue.length > 0 ? newValue : undefined);
                        }}
                        className="mr-2"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;