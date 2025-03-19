import { View, SafeAreaView } from 'react-native';
import { Stack } from "expo-router";
import { Text } from '@/components/ui/text';
import { ThemeToggle } from '@/components/ThemeToggle';
import AddOrder from '@/components/AddOrder';
import OrderTable from '@/components/OrderTable';

const OrdersScreen = () => {
  
  return (
    <SafeAreaView >
      <Stack.Screen options={{ title: "Orders", headerShown: true, headerRight: () => <AddOrder/> }} />
      <View>
          <OrderTable/>
      </View>
    </SafeAreaView>
    
  );
};

export default OrdersScreen;