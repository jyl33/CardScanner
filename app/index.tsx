import { View, StyleSheet, SafeAreaView, Pressable } from "react-native";
import { Link, Stack } from "expo-router";
import React from "react";
import { verifyInstallation } from 'nativewind';
import { useCameraPermissions } from "expo-camera";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text"

export default function Home() {
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);

  verifyInstallation();



  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Home", headerShown: true }} />
      <Text style={{fontSize: 40, lineHeight:40}}>PSA Card Scanner</Text>
      <View style={{ gap: 20 }}>
        <Button onPress={requestPermission}>
          <Text>Request Permissions</Text>
        </Button>
        <Link href={"/inventory"} asChild>
          <Button>
            <Text>View Inventory</Text>
          </Button>
        </Link>
        <Link href={"/scanner"} asChild>
          <Button  disabled={!isPermissionGranted}>
              <Text>Add Card</Text>
          </Button>
        </Link>
      </View>
    </SafeAreaView>
  );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 80,
  },});
 