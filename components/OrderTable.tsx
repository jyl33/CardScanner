import { FlashList } from '@shopify/flash-list';
import { View, ActivityIndicator, ScrollView, useWindowDimensions, TextInput, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Text } from '~/components/ui/text';
import { Search, Filter, RefreshCw } from 'lucide-react-native';
import OrderFilterModal from './OrderFilterModal';
import { useOrderFilters } from '@/services/useOrderFilters';
import { Order } from '@/types/order';
import { exportToExcel } from '@/services/exportToExcel';


const MIN_COLUMN_WIDTHS = [100, 100, 50, 50, 50];

export default function OrderTable() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const columnWidths = React.useMemo(() => {
    return MIN_COLUMN_WIDTHS.map((minWidth) => {
      const evenWidth = width / MIN_COLUMN_WIDTHS.length;
      return Math.max(evenWidth, minWidth);
    });
  }, [width]);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  
  // Use the custom hook for order filtering and data loading
  const {
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
  } = useOrderFilters();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

    // Handle Excel export
    const handleExport = () => {
      //TODO: create function to handle export of filtered orders in exportToExcel.ts
      exportToExcel(filteredOrders);
      setMenuVisible(false);
    };
  
    // Handle Import
    const handleImport = () => {
      setMenuVisible(false);
      setImportModalVisible(true);
    };
  
    // Handle import completion
    const handleImportComplete = () => {
      // Refresh the order list after import
      handleRefresh();
    };
  

  // Identify if we're on desktop (web platform with large screen)
  const isDesktop = Platform.OS === 'web' && width > 768;
  
  // Use different measurements for mobile vs desktop
  const headerHeight = 48; // Approximate height of the header row
  const footerHeight = 48; // Approximate height of the footer row
  const tabBarHeight = isDesktop ? 0 : 86; // Only use tab bar height on mobile
  const searchBarHeight = 56; // Height for search bar
  
  // Add extra padding for desktop to ensure footer is visible
  const desktopFooterPadding = isDesktop ? 115 : 0;
  
  const availableHeight = height - headerHeight - footerHeight - searchBarHeight - tabBarHeight - insets.top - insets.bottom - desktopFooterPadding;
  

  console.log("Buyer options", buyerOptions);

  return (
    <View style={{height: isDesktop ? '100%' : height - insets.top - insets.bottom - tabBarHeight}}>
      {/* Search Bar */}
      <View style={{ 
        height: searchBarHeight, 
        paddingHorizontal: 16, 
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6
      }}>

        {isDesktop && (<TouchableOpacity
          onPress={handleRefresh}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: '#f3f4f6',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <RefreshCw size={20} color="#6b7280" />
        </TouchableOpacity>)}

        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#f3f4f6',
          borderRadius: 8,
          paddingHorizontal: 12,
          height: 40
        }}>
          <Search size={20} color="#6b7280" style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, fontSize: 16 }}
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
        
        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: '#f3f4f6',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View>
            <Filter size={20} color={activeFilters > 0 ? "#0ea5e9" : "#6b7280"} />
            {activeFilters > 0 && (
              <View style={{
                position: 'absolute',
                top: -5,
                right: -5,
                backgroundColor: '#0ea5e9',
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>{activeFilters}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        bounces={false} 
        showsHorizontalScrollIndicator={false}
      >
        <Table aria-labelledby='order-table'>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: columnWidths[0] }}>
                <Text className="font-medium">Order #</Text>
              </TableHead>
              <TableHead style={{ width: columnWidths[1] }}>
                <Text className="font-medium">Date</Text>
              </TableHead>
              <TableHead style={{ width: columnWidths[2] }}>
                <Text className="font-medium">Buyer</Text>
              </TableHead>
              <TableHead style={{ width: columnWidths[3] }}>
                <Text className="font-medium">Quantity</Text>
              </TableHead>
              <TableHead style={{ width: columnWidths[4] }}>
                <Text className="font-medium text-right pr-4">Total</Text>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <View style={{ height: availableHeight }}>
              <FlashList
                data={filteredOrders}
                estimatedItemSize={50}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{
                  paddingBottom: insets.bottom,
                }}
                renderItem={({ item }: { item: Order }) => (
                  <TableRow key={item.id}>
                    <TableCell style={{ width: columnWidths[0] }}>
                      <Text>{item.order_number}</Text>
                    </TableCell>
                    <TableCell style={{ width: columnWidths[1] }}>
                      <Text>{formatDate(item.order_date)}</Text>
                    </TableCell>
                    <TableCell style={{ width: columnWidths[2] }}>
                      <Text>{item.buyer_name}</Text>
                    </TableCell>
                    <TableCell style={{ width: columnWidths[3] }}>
                      <Text>{item.quantity}</Text>
                    </TableCell>
                    <TableCell style={{ width: columnWidths[4] }}>
                      <Text className="text-right pr-4">${item.total_cost}</Text>
                    </TableCell>
                  </TableRow>
                )}
                keyExtractor={(item) => item.id.toString()}
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
            </View>
          </TableBody>
        </Table>
      </ScrollView>
      
      <View style={{ 
         height: footerHeight, 
         backgroundColor: 'white', 
         borderTopWidth: 1, 
         borderTopColor: '#e5e7eb',
         flexDirection: 'row',
         justifyContent: 'space-between',
         alignItems: 'center',
         paddingHorizontal: 15
      }}>
        <Text>Orders: {orders.length}{(searchQuery.trim() || activeFilters > 0) ? ` of ${filteredOrders.length}` : ''}</Text>
      </View>
      
      {/* Order Filter Modal Component */}
      <OrderFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filterState={filterState}
        buyerOptions={buyerOptions}
        onUpdateFilter={updateFilter}
        onResetFilters={resetFilters}
      />
    </View>
  );
}

// Helper function for formatting dates
export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};