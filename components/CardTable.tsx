import { FlashList } from '@shopify/flash-list';
import { View, ActivityIndicator, ScrollView, useWindowDimensions } from 'react-native';
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
import { DatabasePSACard } from '@/types/DatabasePSACard';
import { psaCardService } from '@/services/database';

const MIN_COLUMN_WIDTHS = [200, 120, 100, 100];

export default function CardTable() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const columnWidths = React.useMemo(() => {
    return MIN_COLUMN_WIDTHS.map((minWidth) => {
      const evenWidth = width / MIN_COLUMN_WIDTHS.length;
      return Math.max(evenWidth, minWidth);
    });
  }, [width]);

  const [cards, setCards] = useState<DatabasePSACard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await psaCardService.getAll();
      if (!response) throw new Error('Failed to fetch cards');
      setCards(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
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

  // Calculate the available height for the FlashList
  const headerHeight = 48; // Approximate height of the header row
  const availableHeight = height - headerHeight - insets.top - insets.bottom;

  return (
    <View style={{ height: height - insets.top - insets.bottom }}>
      <ScrollView 
        horizontal 
        bounces={false} 
        showsHorizontalScrollIndicator={false}
      >
        <Table aria-labelledby='card-table'>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: columnWidths[0] }}>
                <Text className="font-medium">Card Name</Text>
              </TableHead>
              <TableHead style={{ width: columnWidths[1] }}>
                <Text className="font-medium">Grade</Text>
              </TableHead>
              <TableHead style={{ width: columnWidths[2] }}>
                <Text className="font-medium">Value</Text>
              </TableHead>
              <TableHead style={{ width: columnWidths[3] }}>
                <Text className="font-medium text-right pr-4">Cost</Text>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <View style={{ height: availableHeight }}>
              <FlashList
                data={cards}
                estimatedItemSize={50}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: insets.bottom,
                }}
                renderItem={({ item }: { item: DatabasePSACard }) => (
                  <TableRow key={item.id}>
                    <TableCell style={{ width: columnWidths[0] }}>
                      <Text>{item.year} {item.brand} {item.subject}</Text>
                    </TableCell>
                    <TableCell style={{ width: columnWidths[1] }}>
                      <Text>{item.card_grade}</Text>
                    </TableCell>
                    <TableCell style={{ width: columnWidths[2] }}>
                      <Text></Text>
                    </TableCell>
                    <TableCell style={{ width: columnWidths[3] }}>
                      <Text className="text-right pr-4"></Text>
                    </TableCell>
                  </TableRow>
                )}
                ListFooterComponent={() => (
                  <TableFooter>
                    <TableRow>
                      <TableCell>
                        <Text className="text-right pr-4">
                          Total Cards: {cards.length}
                        </Text>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              />
            </View>
          </TableBody>
        </Table>
      </ScrollView>
    </View>
  );
}