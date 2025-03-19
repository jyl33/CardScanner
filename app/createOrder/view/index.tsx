import { View, SafeAreaView } from 'react-native';
import { Stack } from "expo-router";
import { Text } from '@/components/ui/text';
import { ThemeToggle } from '@/components/ThemeToggle';
import AddOrder from '@/components/AddOrder';
import CurrentOrder
 from '@/components/CurrentOrder';
const CurrentOrderScreen = () => {

  return (
    <SafeAreaView >
      <CurrentOrder/>
    </SafeAreaView>
    
  );
};

export default CurrentOrderScreen;