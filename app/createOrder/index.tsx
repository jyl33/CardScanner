import { View, SafeAreaView } from 'react-native';
import { Stack, useRouter } from "expo-router";
import { Text } from '@/components/ui/text';
import { useState, useEffect } from 'react';
import * as React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from '~/components/ui/select';
import { databaseService } from '@/services/database';
import { Buyer } from '@/types/buyer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';


const addOrderScreen = () => {

  //TODO: HANDLE ON INTERRUPTION
  // CACHE? DELETE ORDER? 
  
    const [buyers, setBuyers] = useState<Buyer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addMethod, setAddMethod] = React.useState('Scan Cards');
    const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
    const [selectedBuyerName, setSelectedBuyerName] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    const insets = useSafeAreaInsets();
    const contentInsets = {
        top: insets.top,
        bottom: insets.bottom,
        left: 12,
        right: 12,
    };

    useEffect(() => {
      async function fetchBuyers() {
        try {
          const response = await databaseService.getAllBuyers();
          if (error) throw error;
          setBuyers(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      }
  
      fetchBuyers();
    }, []);

    function onLabelPress(label: string) {
        return () => {
          setAddMethod(label);
        };
      }
    
    async function startNewOrder() {
        console.log(selectedBuyerId);
        console.log(selectedBuyerName);
        console.log(addMethod);
        
        if (!selectedBuyerId || !selectedBuyerName) {
            setErrorMessage('Please select a buyer'); 
            return;
        } else {
            // Ensure that selectedBuyerId and selectedBuyerName are strings
            const buyerId = selectedBuyerId || ''; // Default to empty string if null
            const buyerName = selectedBuyerName || ''; // Default to empty string if null

            /* // Create new order with buyer ID & name
            const result = await databaseService.createOrder(buyerId, buyerName);
            
            console.log(result); */

            // Handle the result of the order creation
            if (addMethod === 'Scan Cards') {
                // Navigate to the order scan page or handle success
                router.push({
                    pathname: '/createOrder/scan',
                    params: {
                        selectedBuyerName: buyerName,
                        selectedBuyerId: buyerId
                    },
                });
            } else if (addMethod === 'Add From Inventory'){
              router.push({
                pathname: '/createOrder/select',
                params: {
                    selectedBuyerName: buyerName,
                    selectedBuyerId: buyerId
                },
            });
            } else {
                setErrorMessage('An error occurred while creating the order');
            }
        }
        setErrorMessage(null); // Clear error message if a buyer is selected
    }
    
    return (
        <SafeAreaView style={{ paddingHorizontal: contentInsets.left }}>
        <Stack.Screen options={{ 
            title: "Add Order", 
            headerBackTitle: 'Back',
        }} />
        <View className='pt-10 flex items-center gap-3'>
            <View className='w-[350px]'>
              { !errorMessage ? <Label className='pl-1 text-start font-bold'>Buyer</Label>
               : <Label className='pl-1 text-start font-bold text-red-500'>Buyer</Label>}
            </View>
            <Select
                onValueChange={(buyer) => {
                    const selectedBuyer = buyers.find(b => b.id === buyer?.value);
                    setSelectedBuyerId(selectedBuyer?.id || null);
                    setSelectedBuyerName(selectedBuyer?.name || null);
                    console.log(selectedBuyer); // This will log the actual buyer object
                }}
            >
                <SelectTrigger className='w-[350px]'>
                    <SelectValue 
                    className='text-foreground text-sm native:text-lg'
                    placeholder={loading ? "Loading buyers..." : error ? `Error: ${error}` : "Select a buyer"} 
                    />
                </SelectTrigger>
                <SelectContent insets={contentInsets} className='w-[350px]'>
                    {!loading && !error && buyers.map((buyer) => (
                    <SelectItem 
                        key={buyer.id}
                        label={buyer.name} 
                        value={buyer.id}
                    >
                        {buyer.name}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <View className='w-[350px]'>{errorMessage && <Text className='text-red-500 text-sm'>{errorMessage}</Text>}</View>
            <View className='w-[350px] flex justify-center items-start p-4'>
                <RadioGroup value={addMethod} onValueChange={setAddMethod} className='gap-3'>
                    <RadioGroupItemWithLabel value='Scan Cards' onLabelPress={onLabelPress('Scan Cards')} />
                    <RadioGroupItemWithLabel value='Add From Inventory' onLabelPress={onLabelPress('Add From Inventory')} />
                </RadioGroup>
            </View>
            <View className='w-[350px] flex-row gap-3 pt-4'>
                <Button className='flex-1' variant={'outline'} onPress={() => router.back()}>
                    <Text>Cancel</Text>
                </Button>
                <Button className='flex-1' onPress={startNewOrder}>
                    <Text>Start New Order</Text>
                </Button>
            </View>
        </View>
      </SafeAreaView>
      );
};

function RadioGroupItemWithLabel({
    value,
    onLabelPress,
  }: {
    value: string;
    onLabelPress: () => void;
  }) {
    return (
      <View className={'flex-row gap-2 items-start'}>
        <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} />
        <Label nativeID={`label-for-${value}`} onPress={onLabelPress}>
          {value}
        </Label>
      </View>
    );
  }

export default addOrderScreen;