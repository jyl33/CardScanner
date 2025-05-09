import { useState, useEffect, useMemo } from 'react';
import { databaseService } from '@/services/database';
import { Order } from '@/types/order';
import { formatDate } from '../components/OrderTable';

export interface OrderFilterState {
  dateRange: {min: Date | null, max: Date | null};
  buyer: string | null;
  quantityRange: {min: string, max: string};
  totalRange: {min: string, max: string};
}

export const useOrderFilters = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [buyerOptions, setBuyerOptions] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState(0);
  
  // Filter state
  const [filterState, setFilterState] = useState<OrderFilterState>({
    dateRange: { min: null, max: null },
    buyer: null,
    quantityRange: { min: '', max: '' },
    totalRange: { min: '', max: '' }
  });
  
  const fetchOrders = async () => {
    try {
      setError(null);
      const response = await databaseService.getAllOrders();
      if (!response) throw new Error('Failed to fetch orders');
      setOrders(response);
      
      // Extract unique buyers for filter dropdown
      const uniqueBuyers = Array.from(new Set(response.map(order => order.buyer_name))).filter(Boolean) as string[];
      setBuyerOptions(uniqueBuyers.sort());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  useEffect(() => {
    console.log("Getting Orders");
    fetchOrders();
  }, []);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filterState.dateRange.min || filterState.dateRange.max) count++;
    if (filterState.buyer) count++;
    if (filterState.quantityRange.min || filterState.quantityRange.max) count++;
    if (filterState.totalRange.min || filterState.totalRange.max) count++;
    setActiveFilters(count);
  }, [filterState]);

  // Apply filters
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(order => {
        return (
          order.order_number?.toString().toLowerCase().includes(query) ||
          order.buyer_name?.toLowerCase().includes(query) ||
          formatDate(order?.order_date)?.includes(query) ||
          order.total_cost?.toString().includes(query) ||
          order.quantity?.toString().includes(query)
        );
      });
    }
    
    // Apply date range filter
    if (filterState.dateRange.min || filterState.dateRange.max) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.order_date);
        
        if (filterState.dateRange.min && filterState.dateRange.max) {
          return orderDate >= filterState.dateRange.min && orderDate <= filterState.dateRange.max;
        } else if (filterState.dateRange.min) {
          return orderDate >= filterState.dateRange.min;
        } else if (filterState.dateRange.max) {
          return orderDate <= filterState.dateRange.max;
        }
        return true;
      });
    }
    
    // Apply buyer filter
    if (filterState.buyer) {
      filtered = filtered.filter(order => order.buyer_name === filterState.buyer);
    }
    
    // Apply quantity range filter
    if (filterState.quantityRange.min || filterState.quantityRange.max) {
      filtered = filtered.filter(order => {
        const quantity = order.quantity || 0;
        
        if (filterState.quantityRange.min && filterState.quantityRange.max) {
          return quantity >= parseInt(filterState.quantityRange.min) && quantity <= parseInt(filterState.quantityRange.max);
        } else if (filterState.quantityRange.min) {
          return quantity >= parseInt(filterState.quantityRange.min);
        } else if (filterState.quantityRange.max) {
          return quantity <= parseInt(filterState.quantityRange.max);
        }
        return true;
      });
    }
    
    // Apply total range filter
    if (filterState.totalRange.min || filterState.totalRange.max) {
      filtered = filtered.filter(order => {
        const total = order.total_cost || 0;
        
        if (filterState.totalRange.min && filterState.totalRange.max) {
          return total >= parseFloat(filterState.totalRange.min) && total <= parseFloat(filterState.totalRange.max);
        } else if (filterState.totalRange.min) {
          return total >= parseFloat(filterState.totalRange.min);
        } else if (filterState.totalRange.max) {
          return total <= parseFloat(filterState.totalRange.max);
        }
        return true;
      });
    }
    
    return filtered;
  }, [orders, searchQuery, filterState]);

  const updateFilter = (key: keyof OrderFilterState, value: any) => {
    setFilterState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilterState({
      dateRange: { min: null, max: null },
      buyer: null,
      quantityRange: { min: '', max: '' },
      totalRange: { min: '', max: '' }
    });
  };

  return {
    orders,
    filteredOrders,
    loading,
    error,
    refreshing,
    searchQuery,
    setSearchQuery,
    handleRefresh,
    activeFilters,
    filterState,
    buyerOptions,
    updateFilter,
    resetFilters
  };
};