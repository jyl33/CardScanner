import { FlashList } from '@shopify/flash-list';
import { View, ActivityIndicator, ScrollView, useWindowDimensions, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
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
import { databaseService } from '@/services/database';
import { Order } from '@/types/order';
import { CircleMinus } from 'lucide-react-native';
import { Search } from 'lucide-react-native';

const MIN_COLUMN_WIDTHS = [100, 100, 50, 50, 50];

//TODO: NEEDS TO BE ABLE TO CLICK INTO AN ORDER 
// AND VIEW DETAILS OF ORDER

export default function OrderTable() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const columnWidths = React.useMemo(() => {
    return MIN_COLUMN_WIDTHS.map((minWidth) => {
      const evenWidth = width / MIN_COLUMN_WIDTHS.length;
      return Math.max(evenWidth, minWidth);
    });
  }, [width]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log("Getting Orders")
    fetchOrders();
  }, []);

  // Filter orders based on search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    
    const query = searchQuery.toLowerCase().trim();
    return orders.filter(order => {
      // Search across multiple fields
      return (
        order.order_number?.toString().toLowerCase().includes(query) ||
        order.buyer_name?.toLowerCase().includes(query) ||
        formatDate(order.order_date).includes(query) ||
        order.total_cost?.toString().includes(query) ||
        order.quantity?.toString().includes(query)
      );
    });
  }, [orders, searchQuery]);

  const fetchOrders = async () => {
    try {
      const response = await databaseService.getAllOrders();
      if (!response) throw new Error('Failed to fetch orders');
      setOrders(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

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
  
  return (
    <View style={{height: isDesktop ? '100%' : height - insets.top - insets.bottom - tabBarHeight,}}>
      {/* Search Bar */}
      <View style={{ 
        height: searchBarHeight, 
        paddingHorizontal: 16, 
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center'
      }}>
        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#f3f4f6',
          borderRadius: 8,
          paddingHorizontal: 12,
          height: 40
        }}>
          {/* If you have lucide icons installed, you can use this */}
          <Search size={20} color="#6b7280" style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, fontSize: 16 }}
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
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
        <Text>Orders: {orders.length}{searchQuery.trim() ? ` | Filtered: ${filteredOrders.length}` : ''}</Text>
      </View>
    </View>
  );
}