import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  ActivityIndicator, 
  ScrollView, 
  useWindowDimensions, 
  TextInput, 
  Platform, 
  TouchableOpacity,
  RefreshControl,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Search, Filter, Menu, Upload, Download } from 'lucide-react-native';

// Local imports
import { DatabasePSACard } from '~/types/databasePSACard';
import { useCardFilters } from '~/services/useCardFilters';
import { cardTableStyles } from '~/styles/cardTableStyles';
import { databaseService } from '~/services/database';
import { exportToExcel } from '~/services/exportToExcel';
import CardFilterModal from '~/components/CardFilterModal';

const MIN_COLUMN_WIDTHS = [250, 120, 120, 50, 50, 100];

export default function CardTable() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Column width calculation
  const columnWidths = React.useMemo(() => {
    return MIN_COLUMN_WIDTHS.map((minWidth) => {
      const evenWidth = width / MIN_COLUMN_WIDTHS.length;
      return Math.max(evenWidth, minWidth);
    });
  }, [width]);

  // Card state management
  const [cards, setCards] = useState<DatabasePSACard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Menu state
  const [menuVisible, setMenuVisible] = useState(false);

  // Use custom filter hook
  const {
    searchQuery,
    setSearchQuery,
    showFilterModal,
    setShowFilterModal,
    activeFilters,
    filterOptions,
    filteredCards,
    resetFilters,
    ...filterProps
  } = useCardFilters(cards);

  // Fetch cards
  const fetchCards = async () => {
    try {
      const response = await databaseService.getAllCards();
      if (!response) throw new Error('Failed to fetch cards');
      setCards(response);
      console.log("Fetched Cards", response.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch and refresh handler
  useEffect(() => {
    fetchCards();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setError(null);
    
    setTimeout(() => {
      fetchCards()
        .finally(() => {
          setRefreshing(false);
        });
    }, 500);
  }, []);

  // Handle Excel export
  const handleExport = () => {
    exportToExcel(filteredCards);
    setMenuVisible(false);
  };

  // Handle Import
  const handleImport = () => {
    // TODO: Implementation for import functionality
    console.log("Import functionality to be implemented");
    setMenuVisible(false);
  };

  // Identify if we're on desktop (web platform with large screen)
  const isDesktop = Platform.OS === 'web' && width > 768;
  
  // Measurements for layout
  const headerHeight = 48;
  const footerHeight = 48;
  const tabBarHeight = isDesktop ? 0 : 86;
  const searchBarHeight = 56;
  
  // Add extra padding for desktop to ensure footer is visible
  const desktopFooterPadding = isDesktop ? 115 : 0;
  
  const availableHeight = height - headerHeight - footerHeight - searchBarHeight - tabBarHeight - insets.top - insets.bottom - desktopFooterPadding;

  // Render loading state
  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  }  

  // Render error state
  if (error && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
        <Button className="mt-4" onPress={onRefresh}>
          <Text>Try Again</Text>
        </Button>
      </View>
    );
  }

  return (
    <View style={{ 
      height: isDesktop ? '100%' : height - insets.top - insets.bottom - tabBarHeight,
      display: 'flex',
      flexDirection: 'column'
    }}>
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
        gap: 8,
        zIndex: 20 // Ensure this is higher than the table
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
          <Search size={20} color="#6b7280" style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, fontSize: 16 }}
            placeholder="Search Cards"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
        
        {/* Filter Button */}
        <TouchableOpacity 
          onPress={() => setShowFilterModal(true)}
          style={{
            height: 40,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: activeFilters > 0 ? '#e0f2fe' : '#f3f4f6',
            borderRadius: 8,
            paddingHorizontal: 12,
            borderWidth: activeFilters > 0 ? 1 : 0,
            borderColor: '#0ea5e9'
          }}
        >
          <Filter size={20} color={activeFilters > 0 ? '#0ea5e9' : '#6b7280'} />
          {activeFilters > 0 && (
            <View style={{ 
              backgroundColor: '#0ea5e9',
              borderRadius: 10,
              minWidth: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 6 
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>{activeFilters}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* Hamburger Menu Button */}
        <View style={{ zIndex: 30 }}>
          <TouchableOpacity 
            onPress={() => setMenuVisible(!menuVisible)}
            style={{
              height: 40,
              width: 40,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: 8,
            }}
          >
            <Menu size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Table Content - Lower z-index */}
      <View style={{ flex: 1, overflow: 'hidden', zIndex: 1 }}>
        <ScrollView 
          horizontal 
          bounces={false} 
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <Table aria-labelledby='card-table' style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: columnWidths[0] }}>
                  <Text className="font-medium">Card Name</Text>
                </TableHead>
                <TableHead style={{ width: columnWidths[1] }}>
                  <Text className="font-medium">Grade</Text>
                </TableHead>
                <TableHead style={{ width: columnWidths[2] }}>
                  <Text className="font-medium">Variety</Text>
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
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      colors={['transparent']} // Hide default indicator on Android
                      tintColor="transparent" // Hide default indicator on iOS
                      progressBackgroundColor="transparent"
                    />
                  }
                  renderItem={({ item }: { item: DatabasePSACard }) => (
                    <TableRow key={item.id}>
                      <TableCell style={{ width: columnWidths[0] }}>
                        <Text>{item.year} {item.brand} {item.subject}</Text>
                      </TableCell>
                      <TableCell style={{ width: columnWidths[1] }}>
                        <Text>{item.card_grade}</Text>
                      </TableCell>
                      <TableCell style={{ width: columnWidths[2] }}>
                        <Text>{item.variety}</Text>
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

      {/* Footer */}
      <View style={{ 
         height: footerHeight, 
         backgroundColor: 'white', 
         borderTopWidth: 1, 
         borderTopColor: '#e5e7eb',
         flexDirection: 'row',
         justifyContent: 'space-between',
         alignItems: 'center',
         paddingHorizontal: 15,
         zIndex: 1
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text>Cards: {filteredCards.length} of {cards.length}</Text>
        </View>
        {activeFilters > 0 && (
          <TouchableOpacity onPress={resetFilters}>
            <Text style={{ color: '#0ea5e9' }}>Reset Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Modal */}
      <CardFilterModal 
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filterOptions={filterOptions}
        resetFilters={resetFilters}
        {...filterProps}
      />

      {/* Dropdown Menu - Use Modal for better handling */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
          }}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={{
            position: 'absolute',
            top: 115, // Position below the header
            right: 16,
            backgroundColor: '#ffffff',
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            width: 150,
          }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#f3f4f6',
              }}
              onPress={handleImport}
            >
              <Upload size={18} color="#6b7280" style={{ marginRight: 10 }} />
              <Text>Import</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
              }}
              onPress={handleExport}
            >
              <Download size={18} color="#6b7280" style={{ marginRight: 10 }} />
              <Text>Export</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Refresh Indicator */}
      {refreshing && (
        <View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: searchBarHeight,
          height: availableHeight,
          justifyContent: 'flex-start',
          alignItems: 'center',
          backgroundColor: 'transparent',
          zIndex: 5,
          paddingTop: 65
        }}>
          <ActivityIndicator size="small" />
        </View>
      )}
    </View>
  );
}