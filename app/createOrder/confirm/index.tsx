import { View, SafeAreaView, Alert } from 'react-native';
import { router, Stack } from "expo-router";
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import React from 'react';
import { Label } from '@/components/ui/label';
import { useLocalSearchParams } from 'expo-router';
import { OrderItem, OrderItemResponse } from '@/types/order';
import { databaseService } from '@/services/database';
import { DatabasePSACard } from '@/types/databasePSACard';

const ConfirmOrderScreen = () => {

    const [value, setValue] = React.useState('');
    const [selectedCards, setSelectedCards] = useState<DatabasePSACard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const { selectedBuyerName } = useLocalSearchParams<{selectedBuyerName: string}>();
    const { selectedBuyerId } = useLocalSearchParams<{selectedBuyerId:string}>();  
    const selectedCardsParam = useLocalSearchParams<{ selectedCards: string }>().selectedCards;

    const totalValue = selectedCards.reduce((sum, item) => sum + (item.value ?? 0), 0);
    const totalPrice = selectedCards.reduce((sum, item) => sum + (item.cost ?? 0), 0);

    useEffect(() => {
        // Parse the selectedCards from params
        try {
          if (selectedCardsParam) {
            const parsedCards = JSON.parse(selectedCardsParam);
            setSelectedCards(Array.isArray(parsedCards) ? parsedCards : []);
          }
          setLoading(false);
        } catch (err) {
          setError(`Error parsing selected cards: ${err instanceof Error ? err.message : String(err)}`);
          setLoading(false);
        }
      }, [selectedCardsParam]);

    const onChangeText = (text: string) => {
        setValue(text);
    };

    const handleConfirm = async () => {
        /*DONE: 
            1. GO HOME
            2. UPDATE ALL CARD STATUS TO SOLD
        */
       selectedCards.forEach(async item => {
            const result = await databaseService.updateCard(item.id, {status: "Sold"})
            console.log(result);
            if (result) {
                console.log("Card status updated");
            } 
            else {
                console.error("Error updating card status");
            }
       })

       try {
        setLoading(true)
        // Create the order first
        const newOrder = await databaseService.createOrder(selectedBuyerId, selectedBuyerName, parseInt(value), selectedCards.length);
        
        // Verify order was created successfully
        if (!newOrder || !newOrder.data || !newOrder.data.id) {
          throw new Error('Failed to create order - invalid response from server');
        }
        
        const orderId = newOrder.data.id;
        console.log(`Order created successfully with ID: ${orderId}`);
        
        // Create order items in the database
        const orderItems: OrderItemResponse[] = [];
        const failedItems: DatabasePSACard[] = [];
        
        // Process each card
        for (const card of selectedCards) {
          try {
            // Validate card data
            if (!card || !card.id) {
              console.warn('Skipping invalid card:', card);
              failedItems.push(card);
              continue;
            }
            
            // Create the order item - this returns a response wrapper
          const orderItemResponse = await databaseService.createOrderItem({
            order_id: orderId,
            card_id: card.id, // Ensure ID is a string
            card_name: card.year && card.brand && card.subject 
              ? `${card.year} ${card.brand} ${card.subject}`
              : 'Unknown Card',
            card_grade: card.card_grade || 'N/A',
            price: typeof card.cost === 'number' || typeof card.cost === 'string' 
              ? card.cost 
              : 0,
            value: typeof card.value === 'number' || typeof card.value === 'string' 
              ? card.value 
              : 0,
            quantity: 1
          });
          
          // Check if the response was successful and has data
          if (!orderItemResponse || !orderItemResponse.success || !orderItemResponse.data) {
            throw new Error(`Failed to create order item for card ${card.id}: ${orderItemResponse?.error || 'Unknown error'}`);
          }
          
          // Add the actual order item data to our array
          orderItems.push(orderItemResponse.data);
          console.log(`Added card ${card.id} to order ${orderId}`);
          } catch (itemError) {
            console.error('Error adding card to order:', itemError);
            failedItems.push(card);
          }
        }
        
        // Check if any items failed
        if (failedItems.length > 0) {
          console.warn(`${failedItems.length} cards failed to add to order`);
          
          // If all items failed, throw error
          if (failedItems.length === selectedCards.length) {
            throw new Error('Failed to add any cards to the order');
          }
          
          // Otherwise notify user of partial success
          Alert.alert(
            "Partial Success",
            `${orderItems.length} cards were added to the order, but ${failedItems.length} failed.`,
            [{ text: "OK" }]
          );
        }
        
      } catch (err) {
        setLoading(false);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(`Failed to create order: ${errorMessage}`);
        
        Alert.alert(
          "Order Creation Failed",
          `Could not create order: ${errorMessage}`,
          [{ text: "OK" }]
        );
        
        console.error('Order creation error:', err);
      } finally {
        setLoading(false);
      }
        //TODO: Send email(s) to confirm order

       router.push('/(tabs)/orders');
    }
  
  return (
    <SafeAreaView >
      <Stack.Screen options={{ title: "Confirm Order", headerShown: true }} />
      <View className="flex flex-col items-center gap-4 py-15 p-5">
      <Text className="text-center font-bold text-3xl py-2">
        Order for {selectedBuyerName}
        </Text>
        <Text className="text-center font-bold text-xl">
        Est Market Value: ${totalValue}
        </Text>
        <Text className="text-center font-bold text-xl">
        Total Paid: ${totalPrice}
        </Text>
        <Text className="text-lg text-center">
        Number of cards: {selectedCards.length}
        </Text>
            <View className="w-full space-y-2">
            <View className="grid w-full items-start gap-1.5">
                <Label htmlFor="cost">Order Cost</Label>
                <View className="relative w-full">
                <View className="flex flex-row items-center">
                    <Text className="pr-1">$</Text>
                    <Input
                    className="flex-1 pl-1"
                    keyboardType="decimal-pad"
                    value={value}
                    onChangeText={onChangeText}
                    editable={true}
                    />
                </View>
                </View>
            </View>
            </View>
            <View className='flex-row gap-5 p-5'>
            <Button className='flex-1' onPress={() => router.back()}><Text>Back</Text></Button>
            <Button className='flex-1' onPress={handleConfirm}>
                <Text>Submit Order</Text>
            </Button>
            </View>
        </View>
    </SafeAreaView>
  );
};

export default ConfirmOrderScreen;