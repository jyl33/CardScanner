import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, SafeAreaView } from 'react-native';
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";
import { Text } from "~/components/ui/text";
import { ChevronDown } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { DatabasePSACard } from '@/types/databasePSACard';

// Access the global callbacks
declare global {
  var __scannerCallbacks: {
    updateSelectedCards?: (cards: Map<string, DatabasePSACard>) => void;
  };
}

const OrderScanConfirm = () => {
    const router = useRouter();
    
    // Get all params at the beginning of the component
    const params = useLocalSearchParams<{ 
      selectedCards: string;
      scannedItem: string;
      callerRoute: string;
    }>();
    
    const [selectedCards, setSelectedCards] = useState<Map<string, DatabasePSACard>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scannedItemData, setScannedItemData] = useState<DatabasePSACard | null>(null);
    const inputRef = useRef<TextInput>(null);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    // Get the scanner callback if it exists
    const getParentCallback = () => {
      if (params.callerRoute === 'scanner' && global.__scannerCallbacks) {
        return global.__scannerCallbacks.updateSelectedCards;
      }
      return null;
    };

    // Parse scanned item with error handling
    useEffect(() => {
      try {
        if (params.scannedItem && params.scannedItem !== "undefined") {
          const parsed = JSON.parse(params.scannedItem);
          setScannedItemData(parsed);
          console.log("SCANNED ITEM PARSED", parsed);
        }
      } catch (err) {
        console.error("Error parsing scanned item:", err);
        setError(`Error parsing scanned item: ${err instanceof Error ? err.message : String(err)}`);
      }
    }, [params.scannedItem]);

    useEffect(() => {
        // Parse the selectedCards from params
        try {
            if (params.selectedCards && params.selectedCards !== "undefined") {
                const parsedCards = JSON.parse(params.selectedCards);
                if (Array.isArray(parsedCards)) {
                    const cardMap = new Map<string, DatabasePSACard>();
                    parsedCards.forEach((card: DatabasePSACard) => {
                        cardMap.set(card.id.toString(), card);
                    });
                    setSelectedCards(cardMap);
                } else {
                    setSelectedCards(new Map());
                }
            }

            console.log("Confirmation screen - current selected cards array size:", selectedCards.size);
            setLoading(false);
        } catch (err) {
            setError(`Error parsing selected cards: ${err instanceof Error ? err.message : String(err)}`);
            setLoading(false);
        }
    }, [params.selectedCards]);

    useEffect(() => {
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const handleConfirm = (card: DatabasePSACard) => {
      if (!card) {
        console.error("Cannot add undefined card");
        setNotification({
          message: "Error: Card information is missing",
          type: 'error'
        });
        return;
      }

      // Check if the card is in stock
      if (card.status !== "In Stock") {
        setNotification({
          message: `Cannot add card with status: ${card.status}`,
          type: 'error'
        });
        return;
      }

      console.log("Adding card to order");
      console.log(card);
      const cardId = card.id.toString();
  
      setSelectedCards((prevSelected) => {
        const newSelected = new Map(prevSelected);
        
        // Add card to selection if not already present
        if (!newSelected.has(cardId)) {
          newSelected.set(cardId, card);
        }
        
        console.log("New selection size:", newSelected.size);
        
        // Call the parent callback with our updated map
        const parentCallback = getParentCallback();
        if (parentCallback) {
          console.log("Calling parent callback with updated cards");
          // Use setTimeout to ensure this runs after state update is processed
          setTimeout(() => {
            parentCallback(newSelected);
          }, 0);
        } else {
          console.log("No parent callback found");
        }
        
        setNotification({
          message: "Card added to order!",
          type: 'success'
        });
        
        // Navigate back after a short delay
        setTimeout(() => {
          setNotification(null);
          router.back();
        }, 500);
        
        return newSelected;
      });
    };

    // Check if card is in stock
    const isCardInStock = scannedItemData && scannedItemData.status === "In Stock";

    if (loading) {
      return (
        <SafeAreaView>
          <Stack.Screen options={{ 
            title: "Add Card to Order", 
            headerShown: true,
            headerBackTitle: 'Back',
          }} />
          <View className="flex-1 justify-center items-center p-5">
            <Text>Loading...</Text>
          </View>
        </SafeAreaView>
      );
    }

    if (error) {
      return (
        <SafeAreaView>
          <Stack.Screen options={{ 
            title: "Add Card to Order", 
            headerShown: true,
            headerBackTitle: 'Back',
          }} />
          <View className="flex-1 justify-center items-center p-5">
            <Text className="text-red-500">{error}</Text>
            <Button className="mt-4" onPress={() => router.back()}>
              <Text>Go Back</Text>
            </Button>
          </View>
        </SafeAreaView>
      );
    }

    if (!scannedItemData) {
      return (
        <SafeAreaView>
          <Stack.Screen options={{ 
            title: "Add Card to Order", 
            headerShown: true,
            headerBackTitle: 'Back',
          }} />
          <View className="flex-1 justify-center items-center p-5">
            <Text>No card information available</Text>
            <Button className="mt-4" onPress={() => router.back()}>
              <Text>Go Back</Text>
            </Button>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView>
        <Stack.Screen options={{ 
            title: "Add Card to Order", 
            headerShown: true,
            headerBackTitle: 'Back',
            }} />
            <View className="flex flex-col items-center gap-4 py-4 p-5">
                <Text className="text-center font-bold text-xl">
                {scannedItemData.year} {scannedItemData.brand} {scannedItemData.subject}
                </Text>
                <Text className="text-lg text-center">
                {scannedItemData.card_grade}
                </Text>
                <Text className="text-lg text-center">
                PSA Cert Number: {scannedItemData.cert_number}
                </Text>
                <Text className="text-lg text-center">
                Cost: {scannedItemData.cost}
                </Text>
                <View className="w-full space-y-2">
                  <Text 
                    className={`text-center text-lg font-semibold ${isCardInStock ? "text-green-600" : "text-red-600"}`}
                  >
                    Status: {scannedItemData.status}
                  </Text>
                  
                  {!isCardInStock && (
                    <Text className="text-center text-red-500 mt-2">
                      This card is not in stock and cannot be added to the order.
                    </Text>
                  )}
                </View>
                <View className='flex-row gap-5 p-5'>
                  <Button 
                    className='flex-1' 
                    onPress={() => router.back()}
                  >
                    <Text>Cancel</Text>
                  </Button>
                  <Button 
                    className={`flex-1 ${!isCardInStock ? "opacity-50" : ""}`} 
                    onPress={() => handleConfirm(scannedItemData)}
                    disabled={!isCardInStock}
                  >
                    <Text>Add to Order</Text>
                  </Button>
                </View>
            </View>
            {notification && (
                <Alert className="p-2" icon={ChevronDown} variant={notification.type === 'success' ? 'default' : 'destructive'}>
                    <AlertTitle>
                        {notification.type === 'success' ? 'Success' : 'Error'}
                    </AlertTitle>
                    <AlertDescription>
                        {notification.message}
                    </AlertDescription>
                </Alert>
            )}
      </SafeAreaView>
    );
  };
  
  export default OrderScanConfirm;