import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, SafeAreaView, InputAccessoryView, Platform, Keyboard } from 'react-native';
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { PSAResponse } from '@/types/psaResponse';
import { databaseService } from '~/services/database';
import { ChevronDown } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Stack, useLocalSearchParams, useRouter } from "expo-router";


const AddCardScan = () => {

    const router = useRouter();

    const { scannedItem } = useLocalSearchParams<{scannedItem:string}>();  
    const item = JSON.parse(scannedItem);
    const inputAccessoryViewID = 'uniqueID'; // Unique ID for accessory view

    const [cost, setCost] = useState('');
    const inputRef = useRef<TextInput>(null); // Specify the type for the ref
    const [costError, setCostError] = useState<string>('');

    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
      } | null>(null);


    useEffect(() => {
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);

        return () => clearTimeout(timer);
    }, []);


      const validateAndFormatCost = (value: string): number | null => {
        const cleanValue = value.replace(/[^\d.]/g, '');
        const number = parseFloat(cleanValue);
        
        if (isNaN(number) || number < 0) {
          return null;
        }
        
        return Number(number.toFixed(2));
    };

    const handleConfirm = async () => {
    if (item) {
        const validatedCost = validateAndFormatCost(cost);
        
        if (validatedCost === null) {
            setCostError('Please enter a valid cost');
            return;
        } else item.PSACert.Cost = cost;
        

        console.log("Adding item to inventory:", item);
        const result = await databaseService.create(item);

        if (result.success) {
        console.log("Item added to inventory:", result.data);
        setNotification({
            message: "Item successfully added to inventory!",
            type: 'success'
        });
            setCost('');
            setCostError('');
        } else {
            console.error("Error adding item to inventory:", result.error);
            setNotification({
                message: result.error || "An unknown error occurred",
                type: 'error'
            });
        }

        setTimeout(() => {
            setNotification(null);
            router.back();
        }, 500);
    }
    };

    return (
      <SafeAreaView >
        <Stack.Screen options={{ 
            title: "Add Card to Inventory", 
            headerShown: true,
            headerLeft: () => (
                <Text onPress={() => router.back()} className="text-primary px-4">
                    Back
                </Text>
            ),
            }} />
            <View className="flex flex-col items-center gap-4 py-4 p-5">
                <Text className="text-center font-bold text-xl">
                {item.PSACert.Year} {item.PSACert.Brand} {item.PSACert.Subject}
                </Text>
                <Text className="text-lg text-center">
                {item.PSACert.CardGrade}
                </Text>
                <Text className="text-lg text-center">
                PSA Cert Number: {item.PSACert.CertNumber}
                </Text>
                  <View className="w-full space-y-2">
                    <View className="grid w-full items-start gap-1.5">
                      <Label htmlFor="cost">Cost</Label>
                      <View className="relative w-full">
                        <View className="flex flex-row items-center">
                          <Text className="pr-1">$</Text>
                          <Input
                            ref={inputRef}
                            className="flex-1 pl-1"
                            keyboardType="decimal-pad"
                            value={cost}
                            onChangeText={setCost}
                            editable={true}
                            inputAccessoryViewID={inputAccessoryViewID}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                  <View className='flex-row gap-5 p-5'>
                    <Button className='flex-1' onPress={() => router.back()}><Text>Cancel</Text></Button>
                    <Button className='flex-1' onPress={handleConfirm}>
                        <Text>Add to Inventory</Text>
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
  
  export default AddCardScan;