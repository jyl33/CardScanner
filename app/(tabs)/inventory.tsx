import React, { useState, useEffect } from 'react';
import { View, SafeAreaView } from 'react-native';
import  CardTable  from '~/components/CardTable'
import { Link, Stack } from "expo-router";



const InventoryScreen = () => {
  
  return (
    <SafeAreaView >
      <Stack.Screen options={{ title: "Inventory", headerShown: true }} />
      <View>
          <CardTable/>
      </View>
    </SafeAreaView>
    
  );
};

export default InventoryScreen;