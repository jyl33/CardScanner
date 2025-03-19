import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CameraView } from "expo-camera";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  AppState,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import psaService, { getCertificationNumber } from "../../api/services/psaService";
import { PSAResponse } from '~/types/psaResponse';
import { databaseService } from '@/services/database';
import { DatabasePSACard } from '@/types/databasePSACard';
import { Text } from '@/components/ui/text';
import { Alert } from 'react-native';

// Define a global type for our callback storage
declare global {
  var __scannerCallbacks: {
    updateSelectedCards?: (cards: Map<string, DatabasePSACard>) => void;
  };
}

// Create a global object to store callbacks
if (typeof global !== 'undefined') {
  global.__scannerCallbacks = global.__scannerCallbacks || {};
}

export default function Scanner() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [card, setCard] = useState<DatabasePSACard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<Map<string, DatabasePSACard>>(new Map());
  const [hasScanOccurred, setHasScanOccurred] = useState(false);
  const router = useRouter();

  // GET ORDER ID FROM ROUTER PUSH PARAMS
  const { selectedBuyerId } = useLocalSearchParams<{selectedBuyerId:string}>();
  const { selectedBuyerName } = useLocalSearchParams<{selectedBuyerName:string}>();
  const selectedCardsParam = useLocalSearchParams<{ selectedCards: string }>().selectedCards;

  // Create the callback function to update selected cards
  const updateSelectedCards = useCallback((updatedCards: Map<string, DatabasePSACard>) => {
    console.log("Callback received updated cards:", updatedCards.size);
    setSelectedCards(updatedCards);
  }, []);

  // Register the callback globally when component mounts
  useEffect(() => {
    // Register the callback in the global object
    global.__scannerCallbacks = {
      updateSelectedCards
    };

    // Cleanup on unmount
    return () => {
      global.__scannerCallbacks = {};
    };
  }, [updateSelectedCards]);

  useEffect(() => {
    // Parse the selectedCards from params on initial load only
    try {
      if (selectedCardsParam) {
        const parsedCards = JSON.parse(selectedCardsParam);
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
      console.log("Current Cards Array Size:", selectedCards.size);
      setLoading(false);
    } catch (err) {
      setError(`Error parsing selected cards: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  }, [selectedCardsParam]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const fetchCard = async (certificationNumber: string) => {
    setHasScanOccurred(true);
    try {
      const response = await databaseService.getByCardNumber(certificationNumber);
      console.log("Fetch card response", response);
      
      if (!response) {
        // Card not found in database - show alert but keep camera visible
        console.log("Card not found in inventory");
        Alert.alert(
          "Card Not Found",
          "This card was not found in your inventory",
          [
            {
              text: "OK",
              onPress: () => {
                qrLock.current = false;
                setHasScanOccurred(false);
              }
            },
          ]
        );
        
        // Important: Keep camera visible by not setting card
        // and unlocking for next scan after a short delay
        setTimeout(() => {
          qrLock.current = false;
        }, 1500);
        
        return;
      }
      
      // Only set card when found, which will trigger navigation
      console.log("FETCH CARD RESPONSE", response);
      setCard(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Show error alert but keep camera visible
      Alert.alert(
        "Error",
        `Failed to fetch card: ${err instanceof Error ? err.message : 'An error occurred'}`,
        [
          {
            text: "OK",
            onPress: () => {
              qrLock.current = false;
              setHasScanOccurred(false);
            }
          },
        ]
      );
      
      // Reset lock after a short delay to allow for next scan
      setTimeout(() => {
        qrLock.current = false;
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only proceed if card is not null AND a scan has occurred
    if (card && hasScanOccurred) {
      console.log("Card found, navigating to confirmation screen");

      const handleNavigation = async () => {
        try {
          await router.push({
            pathname: '/createOrder/scan/scanConfirm',
            params: {
              scannedItem: JSON.stringify(card),
              selectedCards: JSON.stringify(Array.from(selectedCards.values())),
              callerRoute: 'scanner' // Add this to identify where the callback should be sent
            },
          });
        } catch (error) {
          console.error("Failed to navigate:", error);
          // If navigation fails, unlock scanner
          qrLock.current = false;
        }
      };

      handleNavigation();
      // Reset the scan flag after navigation
      setHasScanOccurred(false);
    }
  }, [card, hasScanOccurred]);

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
  };

  const viewCurrentOrder = () => {
    console.log("Viewing current order, total cards:", selectedCards.size);

    const handleNavigation = async () => {
      const selectedCardsArray = Array.from(selectedCards.values());

      try {
        await router.push({
          pathname: '/createOrder/view',
          params: {
            selectedBuyerName: selectedBuyerName,
            selectedBuyerId: selectedBuyerId,
            selectedCards: JSON.stringify(selectedCardsArray),
            callerRoute: 'scanner'
          },
        });
      } catch (error) {
        console.error("Failed to navigate:", error);
      }
    };

    handleNavigation();
  };

  const onBarcodeScanned = async ({ data }: { data: string }) => {
    console.log("data", data);
    if (data && !qrLock.current) {
      qrLock.current = true;
      console.log("attempting to find card in inventory");

      let certificationNumber: string | null = null;
      if (data.includes("https://www.psacard.com/cert/")) {
        certificationNumber = getCertificationNumber(data);
        console.log("certificationNumber", certificationNumber);
      } else {
        certificationNumber = data;
        console.log("certificationNumber", certificationNumber);
      }

      if (certificationNumber) {
        await fetchCard(certificationNumber);
      } else {
        console.log('Certification number not found or invalid');
        Alert.alert(
          "Invalid QR Code",
          "This doesn't appear to be a valid certification number.",
          [{ text: "OK" }]
        );
        qrLock.current = false;
      }
    }
  };

  // Reset state when the component mounts or comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("Scanner screen in focus, resetting card state and QR Lock");
      setCard(null);
      qrLock.current = false;
      setHasScanOccurred(false);

      return () => {
        // No need to do anything special here
      };
    }, [])
  );
  
  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "Card Scanner",
          headerShown: true,
          headerRight: () => (
            <Text onPress={viewCurrentOrder}>
              View Order ({selectedCards.size})
            </Text>
          ),
          headerLeft: () => (
            <Text onPress={cancelOrder}>
              Cancel
            </Text>
          ),
        }}
      />
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={onBarcodeScanned}
      />
    </SafeAreaView>
  );
}