import React, { useState, useRef, useEffect } from 'react';
import { CameraView } from "expo-camera";
import { Stack } from "expo-router";
import {
  AppState,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from "react-native";
import ConfirmationDialog from "../../components/ConfirmationDialog"; // Import the ConfirmationModal
import  psaService from "../api/services/psaService"; // Import PSAResponse type
import { PSAResponse } from '~/types/psaResponse';

export default function Home() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [modalVisible, setModalVisible] = useState(false);
  const [scannedItem, setScannedItem] = useState<PSAResponse | null>(null); // Use the imported PSAResponse type
  const [hasScanned, setHasScanned] = useState(false); // New state to track if a scan has occurred

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

  const onBarcodeScanned = async ({ data }: { data: string }) => {
    console.log("data", data);
    if (data && !qrLock.current && !hasScanned) { // Check if a scan has already occurred
      qrLock.current = true;
      setHasScanned(true); // Set the flag to true to prevent further scans
      const result = await psaService.fetchCertification(data); // Get the result without type assertion
      if (result) {
        // Wrap the result in a PSAResponse object
        const psaResponse: PSAResponse = {
          PSACert: result, // Assuming result is the PSACert object
        };
        setScannedItem(psaResponse); // Set the scanned item
        setModalVisible(true); // Show the confirmation modal
      }
    }
  };

  const handleConfirm = () => {
    // Logic to add the item to the inventory
    console.log("Item added to inventory:", scannedItem);
    setModalVisible(false); // Close the modal
    setHasScanned(false); // Reset the scan flag to allow new scans
  };

  const handleCancel = () => {
    setModalVisible(false); // Close the modal
    setHasScanned(false); // Reset the scan flag to allow new scans
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
      <ConfirmationDialog
        visible={modalVisible}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        item={scannedItem} // Pass the scanned item to the modal
      />
    </SafeAreaView>
  );
}