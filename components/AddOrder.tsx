import React from 'react';
import { Plus } from 'lucide-react-native'; // Import the Plus icon from lucide-react-native
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

const AddOrder: React.FC = () => {
  const router = useRouter();

  const handlePress = () => {
    router.push('/createOrder')
  };

  return (
    <Pressable
    onPress={handlePress}
    className='web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2'
    >
      <View
          className='flex-1 aspect-square pt-0.5 justify-center items-start web:px-5'
        ><Plus size={24} />
        </View>
      
    </Pressable>
  );
};

export default AddOrder;