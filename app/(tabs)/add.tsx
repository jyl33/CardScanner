import React, { useState, useRef, useEffect } from 'react';
import { CameraView } from "expo-camera";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import {
  AppState,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from "react-native";
import  psaService from "../api/services/psaService"; // Import PSAResponse type
import { PSAResponse } from '~/types/psaResponse';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Scanner() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [scannedItem, setScannedItem] = useState<PSAResponse | null>(null); 
  const router = useRouter();

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

  // Reset state when the component mounts or comes into focus
 useFocusEffect(
  React.useCallback(() => {
    console.log("Resetting card state and QR Lock");
    setScannedItem(null); // Reset card state
    qrLock.current = false; // Reset QR lock
  }, []) // This effect runs whenever the component is focused
);

  const onBarcodeScanned = async ({ data }: { data: string }) => {
    console.log("data", data);
    if (data && !qrLock.current) { // Check if a scan has already occurred
      qrLock.current = true;
      //setHasScanned(true); // Set the flag to true to prevent further scans
      const result = await psaService.fetchCertification(data); // Get the result without type assertion
      if (result) {
        // Wrap the result in a PSAResponse object
        const psaResponse: PSAResponse = {
          PSACert: result, // Assuming result is the PSACert object
        };
        setScannedItem(psaResponse); // Set the scanned item
        if (psaResponse) { // Check if psaResponse is not null
          router.push({
            pathname: '/addCardScan',
            params: {scannedItem: JSON.stringify(psaResponse)},
          });
        }
      }
    }
  };

  const handleConfirm = () => {
    // Logic to add the item to the inventory
    console.log("Item added to inventory:", scannedItem);
    //setHasScanned(false); // Reset the scan flag to allow new scans
  };



  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "Card Scanner",
          headerShown: true,
        }}
      />
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={onBarcodeScanned} // Use the updated function
      />
    </SafeAreaView>
  );
}