import { FlashList } from '@shopify/flash-list';
import { View, ActivityIndicator, ScrollView, useWindowDimensions, Alert, Platform, TextInput } from 'react-native';
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
import { OrderItem, OrderItemResponse } from '@/types/order';
import { router, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CircleMinus } from 'lucide-react-native';
import { Button } from './ui/button';
import { DatabasePSACard } from '@/types/databasePSACard';
// Import Search icon if available
// import { Search } from 'lucide-react-native';

const MIN_COLUMN_WIDTHS = [50, 200, 120, 50, 50, 100];

export default function CurrentOrder() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const columnWidths = React.useMemo(() => {
    return MIN_COLUMN_WIDTHS.map((minWidth) => {
      const evenWidth = width / MIN_COLUMN_WIDTHS.length;
      return Math.max(evenWidth, minWidth);
    });
  }, [width]);

  // State for locally managed selected cards
  const [selectedCards, setSelectedCards] = useState<DatabasePSACard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Parse params
  const { selectedBuyerId } = useLocalSearchParams<{ selectedBuyerId: string }>();
  const { selectedBuyerName } = useLocalSearchParams<{ selectedBuyerName: string }>();
  const selectedCardsParam = useLocalSearchParams<{ selectedCards: string }>().selectedCards;

  useEffect(() => {
    // Parse the selectedCards from params
    try {
      if (selectedCardsParam) {
        const parsedCards = JSON.parse(selectedCardsParam);
        setSelectedCards(Array.isArray(parsedCards) ? parsedCards : []);
      }
      setLoading(false);
    } catch (err) {
      setError(`Error parsing selected cards: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  }, [selectedCardsParam]);

  // Filter cards based on search query
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return selectedCards;
    
    const query = searchQuery.toLowerCase().trim();
    return selectedCards.filter(card => {
      // Search across multiple fields
      return (
        card.year?.toString().includes(query) ||
        card.brand?.toLowerCase().includes(query) ||
        card.subject?.toLowerCase().includes(query) ||
        card.card_grade?.toString().toLowerCase().includes(query) ||
        card.status?.toLowerCase().includes(query) ||
        `${card.year} ${card.brand} ${card.subject}`.toLowerCase().includes(query)
      );
    });
  }, [selectedCards, searchQuery]);

  const handleSubmit = async () => {
    if (selectedCards.length === 0) {
      Alert.alert("Error", "No items in current order");
      return;
    }

    router.push({
      pathname: '/createOrder/confirm',
      params: {
        selectedBuyerId: selectedBuyerId,
        selectedBuyerName: selectedBuyerName,
        selectedCards: JSON.stringify(selectedCards)
      },
    });
  };

  const removeItem = (cardId: string) => {
    Alert.alert(
      "Remove item from order?",
      "Are you sure you want to remove this item?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes", 
          onPress: () => {
            // Remove card from local array
            setSelectedCards(prevCards => 
              prevCards.filter(card => card.id.toString() !== cardId)
            );
          }
        }
      ]
    );
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
  const footerHeight = 70; // Approximate height of the footer row
  const tabBarHeight = isDesktop ? 0 : 86; // Only use tab bar height on mobile
  const searchBarHeight = 56; // Height for search bar
  
  // Add extra padding for desktop to ensure footer is visible
  const desktopFooterPadding = isDesktop ? 115 : 0;
  
  const availableHeight = height - headerHeight - footerHeight - searchBarHeight - tabBarHeight - insets.top - insets.bottom - desktopFooterPadding;

  return (
    <View style={{ height: height - insets.top - insets.bottom, display: 'flex', flexDirection: 'column' }}>
      <Stack.Screen options={{ 
        title: `${selectedBuyerName || 'Customer'}'s Order`, 
        headerShown: true, 
        headerRight: () => (
          selectedCards.length > 0 ? (
            <Text onPress={handleSubmit}>Submit</Text>
          ) : (
            <View>
              <Text style={{ opacity: 0.5 }}>Submit</Text>
            </View>
          )
        ),
        headerBackTitle: 'Back',
      }} />
      
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
          {/* <Search size={20} color="#6b7280" style={{ marginRight: 8 }} /> */}
          <TextInput
            style={{ flex: 1, fontSize: 16 }}
            placeholder="Search cards in order..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView 
          horizontal 
          bounces={false} 
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <Table aria-labelledby='order-items-table' style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: columnWidths[0] }}>
                  <Text className="font-medium">Remove</Text>
                </TableHead>
                <TableHead style={{ width: columnWidths[1] }}>
                  <Text className="font-medium">Card</Text>
                </TableHead>
                <TableHead style={{ width: columnWidths[2] }}>
                  <Text className="font-medium">Grade</Text>
                </TableHead>
                <TableHead style={{ width: columnWidths[3] }}>
                  <Text className="font-medium">Cost</Text>
                </TableHead>
                <TableHead style={{ width: columnWidths[4] }}>
                  <Text className="font-medium">Value</Text>
                </TableHead>
                <TableHead style={{ width: columnWidths[5] }}>
                  <Text className="font-medium text-right pr-4">Status</Text>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody style={{ flex: 1 }}>
              <View style={{ height: availableHeight }}>
                <FlashList
                  data={filteredCards}
                  estimatedItemSize={50}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{
                    paddingBottom: insets.bottom,
                  }}
                  renderItem={({ item }: { item: DatabasePSACard }) => (
                    <TableRow key={item.id}>
                      <TableCell style={{ width: columnWidths[0], justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                        <Button 
                          variant='ghost' 
                          onPress={() => removeItem(item.id.toString())}
                        >
                          <CircleMinus color="red"/>
                        </Button>
                      </TableCell>
                      <TableCell style={{ width: columnWidths[1], justifyContent: 'center', alignItems: 'flex-start', display: 'flex' }}>
                        <Text>{item.year} {item.brand} {item.subject}</Text>
                      </TableCell>
                      <TableCell style={{ width: columnWidths[2], justifyContent: 'center', alignItems: 'flex-start', display: 'flex' }}>
                        <Text>{item.card_grade}</Text>
                      </TableCell>
                      <TableCell style={{ width: columnWidths[3], justifyContent: 'center', alignItems: 'flex-start', display: 'flex' }}>
                        <Text>{item.cost}</Text>
                      </TableCell>
                      <TableCell style={{ width: columnWidths[4], justifyContent: 'center', alignItems: 'flex-start', display: 'flex' }}>
                        <Text>{item.value}</Text>
                      </TableCell>
                      <TableCell style={{ width: columnWidths[5], justifyContent: 'center', alignItems: 'flex-end', display: 'flex' }}>
                        <Text className="text-right pr-4">{item.status}</Text>
                      </TableCell>
                    </TableRow>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                />
              </View>
            </TableBody>
          </Table>
        </ScrollView>
      </View>

      <View style={{ 
         height: footerHeight, 
         backgroundColor: 'white', 
         borderTopWidth: 1, 
         borderTopColor: '#e5e7eb',
         flexDirection: 'row',
         justifyContent: 'space-between',
         alignItems: 'center',
         paddingHorizontal: 30,
         paddingBottom: 15
      }}>
        <Text>
          {searchQuery.trim() ? `Showing ${filteredCards.length} of ${selectedCards.length} cards` : `Total Cards: ${selectedCards.length}`}
        </Text>
        <Text className="text-right pr-4">
          Total Value: ${selectedCards.reduce((sum, card) => {
            // Handle different value types safely
            const cardValue = card.value !== undefined && card.value !== null 
              ? (typeof card.value === 'string' 
                  ? parseFloat(card.value) 
                  : Number(card.value))
              : 0;
            return sum + (isNaN(cardValue) ? 0 : cardValue);
          }, 0).toFixed(2)}
        </Text>
      </View>
    </View>
  );
}