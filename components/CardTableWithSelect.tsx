import { View, ActivityIndicator, ScrollView, useWindowDimensions, Alert, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Text } from '~/components/ui/text';
import { DatabasePSACard } from '@/types/databasePSACard';
import { databaseService } from '@/services/database';
import { Checkbox } from '~/components/ui/checkbox'
import { FlatList } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Search } from 'lucide-react-native'; 

const MIN_COLUMN_WIDTHS = [50, 250, 120, 50, 50, 100];

export default function CardTableWithSelect() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const columnWidths = MIN_COLUMN_WIDTHS.map((minWidth) => {
    const evenWidth = width / MIN_COLUMN_WIDTHS.length;
    return Math.max(evenWidth, minWidth);
  });

  const [cards, setCards] = useState<DatabasePSACard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<Map<string, DatabasePSACard>>(new Map());
  const { selectedBuyerName } = useLocalSearchParams<{selectedBuyerName:string}>();
  const { selectedBuyerId } = useLocalSearchParams<{selectedBuyerId:string}>();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCards();
  }, []);
 
  const fetchCards = async () => {
    try {
      const response = await databaseService.getInStockCards();
      if (!response) throw new Error('Failed to fetch cards');
      setCards(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes", 
          onPress: async () => {
            try {
              router.back();
              } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
              } 
          }
        }
      ]
    );
  }

  const viewCurrentOrder = async () => {
    setSelectedCards(current => {
      const selectedCardsArray = Array.from(current.values());
      
      router.push({
        pathname: './view',
        params: {
          selectedBuyerName: selectedBuyerName,
          selectedBuyerId: selectedBuyerId,
          selectedCards: JSON.stringify(selectedCardsArray)
        },
      });
      
      return current;
    });
  }

  const toggleCardSelection = (card: DatabasePSACard) => {
    console.log("checkbox pressed");
    console.log(card);
    const cardId = card.id.toString();

    setSelectedCards((prevSelected) => {
      const newSelected = new Map(prevSelected);
      if (newSelected.has(cardId)) {
        newSelected.delete(cardId);
      } else {
        newSelected.set(cardId, card);
      }

      console.log(newSelected);
      return newSelected;
    });
  };

  // Filter cards based on search query
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return cards;
    
    const query = searchQuery.toLowerCase().trim();
    return cards.filter(card => {
      // Search across multiple fields
      return (
        card.year?.toString().includes(query) ||
        card.brand?.toLowerCase().includes(query) ||
        card.subject?.toLowerCase().includes(query) ||
        card.card_grade?.toString().includes(query) ||
        `${card.year} ${card.brand} ${card.subject}`.toLowerCase().includes(query)
      );
    });
  }, [cards, searchQuery]);

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
    <View style={{ height: height - insets.top - insets.bottom, flexDirection: 'column' }}>
      <Stack.Screen
        options={{
          title: "Card Scanner",
          headerShown: true,
          headerRight: () => (
            <Text onPress={viewCurrentOrder}>
                View Order
            </Text>
          ),
          headerLeft: () => (
            <Text onPress={cancelOrder}>
                Cancel
            </Text>
          ),
        }}
      />
      
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
            placeholder="Search Cards"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>
      
      <View style={{ height: height - insets.top - insets.bottom - footerHeight - searchBarHeight }}>
        <ScrollView 
          horizontal 
          bounces={false} 
          showsHorizontalScrollIndicator={false}
        >
          <Table aria-labelledby='card-table'>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: columnWidths[0] }}>
                  <Text className="font-medium">Select</Text>
                </TableHead>
                <TableHead style={{ width: columnWidths[1] }}>
                  <Text className="font-medium">Card Name</Text>
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
            <TableBody>
              <View style={{ height: availableHeight }}>
                <FlatList
                  data={filteredCards}
                  extraData={selectedCards}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{
                    paddingBottom: insets.bottom,
                  }}
                  renderItem={({ item }: { item: DatabasePSACard }) => (
                    <TableRow key={item.id}>
                      <TableCell style={{ width: columnWidths[0], alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                        <Checkbox
                          checked={selectedCards.has(item.id.toString())} 
                          onCheckedChange={() => toggleCardSelection(item)}
                        />
                      </TableCell>
                      <TableCell style={{ width: columnWidths[1] }}>
                        <Text>{item.year} {item.brand} {item.subject}</Text>
                      </TableCell>
                      <TableCell style={{ width: columnWidths[2] }}>
                        <Text>{item.card_grade}</Text>
                      </TableCell>
                      <TableCell style={{ width: columnWidths[3] }}>
                        <Text>{item.cost}</Text>
                      </TableCell>
                      <TableCell style={{ width: columnWidths[4] }}>
                        <Text>{item.value}</Text>
                      </TableCell>
                      <TableCell style={{ width: columnWidths[5] }}>
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
        <Text>Cards: {filteredCards.length}</Text>
        <Text>Selected Cards: {selectedCards.size}</Text>
      </View>
    </View>
  );
}