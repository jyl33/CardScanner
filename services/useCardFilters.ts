import { useState, useEffect, useMemo, useCallback } from 'react';
import { DatabasePSACard } from '@/types/databasePSACard';
import { FilterOptions } from '@/types/filters';
export const useCardFilters = (cards: DatabasePSACard[]) => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("1000");
  const [minYear, setMinYear] = useState(""); 
  const [maxYear, setMaxYear] = useState(""); 
  const [activeFilters, setActiveFilters] = useState(0);

  // Extract unique filter options
  const filterOptions: FilterOptions = useMemo(() => {
    if (!cards.length) return { 
      grades: [], 
      statuses: [], 
      years: [], 
      maxPrice: 1000,
      minYear: '',
      maxYear: ''
    };
    
    const grades = new Set<string>();
    const statuses = new Set<string>();
    const years = new Set<string>();
    let maxCardPrice = 0;
    let minCardYear = Infinity;
    let maxCardYear = -Infinity;
    
    cards.forEach(card => {
      if (card.card_grade) grades.add(card.card_grade.toString());
      if (card.status) statuses.add(card.status);
      
      // Process years
      const cardYear = parseInt(card.year?.toString() || '0');
      if (!isNaN(cardYear)) {
        years.add(card.year.toString());
        minCardYear = Math.min(minCardYear, cardYear);
        maxCardYear = Math.max(maxCardYear, cardYear);
      }
      
      const cardValue = parseFloat(card.value?.toString() || '0');
      if (!isNaN(cardValue) && cardValue > maxCardPrice) {
        maxCardPrice = cardValue;
      }
    });
    
    return {
      grades: Array.from(grades).sort(),
      statuses: Array.from(statuses).sort(),
      years: Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)),
      maxPrice: Math.max(maxCardPrice, 1000),
      minYear: minCardYear !== Infinity ? minCardYear.toString() : '',
      maxYear: maxCardYear !== -Infinity ? maxCardYear.toString() : ''
    };
  }, [cards]);

  // Update max price and year ranges when filter options load
  useEffect(() => {
    setMaxPrice(filterOptions.maxPrice.toString());
    
    // Only set min/max years if they are not already set
    if (!minYear && filterOptions.minYear) {
      setMinYear(filterOptions.minYear);
    }
    if (!maxYear && filterOptions.maxYear) {
      setMaxYear(filterOptions.maxYear);
    }
  }, [filterOptions]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (selectedGrades.size > 0) count++;
    if (selectedStatuses.size > 0) count++;
    
    const minPriceValue = parseFloat(minPrice);
    const maxPriceValue = parseFloat(maxPrice);
    if (!isNaN(minPriceValue) && minPriceValue > 0) count++;
    if (!isNaN(maxPriceValue) && maxPriceValue < filterOptions.maxPrice) count++;
    
    const minYearValue = parseInt(minYear);
    const maxYearValue = parseInt(maxYear);
    if (!isNaN(minYearValue) && minYearValue > parseInt(filterOptions.minYear || '0')) count++;
    if (!isNaN(maxYearValue) && maxYearValue < parseInt(filterOptions.maxYear || '9999')) count++;
    
    setActiveFilters(count);
  }, [
    selectedGrades, 
    selectedStatuses, 
    minPrice, 
    maxPrice, 
    minYear, 
    maxYear, 
    filterOptions
  ]);

  // Filter cards based on all criteria
  const filteredCards = useMemo(() => {
    let filtered = cards;
    
    // Apply text search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(card => {
        return (
          card.year?.toString().includes(query) ||
          card.brand?.toLowerCase().includes(query) ||
          card.subject?.toLowerCase().includes(query) ||
          card.card_grade?.toString().toLowerCase().includes(query) ||
          `${card.year} ${card.brand} ${card.subject}`.toLowerCase().includes(query)
        );
      });
    }
    
    // Apply grade filter
    if (selectedGrades.size > 0) {
      filtered = filtered.filter(card => 
        card.card_grade && selectedGrades.has(card.card_grade.toString())
      );
    }
    
    // Apply status filter
    if (selectedStatuses.size > 0) {
      filtered = filtered.filter(card => 
        card.status && selectedStatuses.has(card.status)
      );
    }
    
    // Apply year filter with range
    const minYearValue = parseInt(minYear);
    const maxYearValue = parseInt(maxYear);
    
    if (!isNaN(minYearValue) || !isNaN(maxYearValue)) {
      filtered = filtered.filter(card => {
        const cardYear = parseInt(card.year?.toString() || '0');
        
        if (isNaN(cardYear)) return false;
        
        let passesMin = true;
        let passesMax = true;
        
        if (!isNaN(minYearValue)) {
          passesMin = cardYear >= minYearValue;
        }
        
        if (!isNaN(maxYearValue)) {
          passesMax = cardYear <= maxYearValue;
        }
        
        return passesMin && passesMax;
      });
    }
    
    // Apply price filter
    const minPriceValue = parseFloat(minPrice);
    const maxPriceValue = parseFloat(maxPrice);
    
    if (!isNaN(minPriceValue) || !isNaN(maxPriceValue)) {
      filtered = filtered.filter(card => {
        const cardValue = parseFloat(card.value?.toString() || '0');
        
        if (isNaN(cardValue)) return false;
        
        let passesMin = true;
        let passesMax = true;
        
        if (!isNaN(minPriceValue)) {
          passesMin = cardValue >= minPriceValue;
        }
        
        if (!isNaN(maxPriceValue)) {
          passesMax = cardValue <= maxPriceValue;
        }
        
        return passesMin && passesMax;
      });
    }
    
    return filtered;
  }, [
    cards, 
    searchQuery, 
    selectedGrades, 
    selectedStatuses, 
    minPrice, 
    maxPrice, 
    minYear, 
    maxYear
  ]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedGrades(new Set());
    setSelectedStatuses(new Set());
    setMinPrice("0");
    setMaxPrice(filterOptions.maxPrice ? filterOptions.maxPrice.toString() : ""); // Handle potential undefined
    setMinYear(filterOptions.minYear || ""); // Handle potential undefined
    setMaxYear(filterOptions.maxYear || ""); // Handle potential undefined
    setSearchQuery('');
  }, [filterOptions]);

  // Toggle functions for filters
  const toggleGrade = useCallback((grade: string) => {
    setSelectedGrades(prev => {
      const updated = new Set(prev);
      if (updated.has(grade)) {
        updated.delete(grade);
      } else {
        updated.add(grade);
      }
      return updated;
    });
  }, []);

  const toggleStatus = useCallback((status: string) => {
    setSelectedStatuses(prev => {
      const updated = new Set(prev);
      if (updated.has(status)) {
        updated.delete(status);
      } else {
        updated.add(status);
      }
      return updated;
    });
  }, []);

  // Handle numeric input for price and year fields
  const handleNumericInput = useCallback((
    text: string, 
    setter: React.Dispatch<React.SetStateAction<string>>,
    allowDecimal: boolean = false
  ) => {
    // Allow only numbers and optionally decimal point
    const numericText = allowDecimal 
      ? text.replace(/[^0-9.]/g, '')
      : text.replace(/[^0-9]/g, '');
    
    // Prevent multiple decimal points if decimal is allowed
    if (allowDecimal) {
      const parts = numericText.split('.');
      if (parts.length > 2) {
        return; // Don't update if there are multiple decimal points
      }
    }
    
    setter(numericText);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    showFilterModal,
    setShowFilterModal,
    selectedGrades,
    selectedStatuses,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    activeFilters,
    filterOptions,
    filteredCards,
    resetFilters,
    toggleGrade,
    toggleStatus,
    handleNumericInput,
    setMinPrice,
    setMaxPrice,
    setMinYear,
    setMaxYear
  };
};