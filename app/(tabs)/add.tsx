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
import psaService from "../api/services/psaService";
import { PSAResponse } from '~/types/psaResponse';

export default function Scanner() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [scannedItem, setScannedItem] = useState<PSAResponse | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
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

  // Enable camera when component is focused, disable when unfocused
  useFocusEffect(
    React.useCallback(() => {
      console.log("Scanner in focus - activating camera");
      setIsCameraActive(true);
      setScannedItem(null); // Reset card state
      qrLock.current = false; // Reset QR lock
      
      // This return function runs when the screen loses focus
      return () => {
        console.log("Scanner losing focus - deactivating camera");
        setIsCameraActive(false);
      };
    }, [])
  );

  const onBarcodeScanned = async ({ data }: { data: string }) => {
    console.log("data", data);
    if (data && !qrLock.current) { // Check if a scan has already occurred
      qrLock.current = true;
      const result = await psaService.fetchCertification(data);
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

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "Card Scanner",
          headerShown: true,
        }}
      />
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      {isCameraActive && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={onBarcodeScanned}
        />
      )}
    </SafeAreaView>
  );
}