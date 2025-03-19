import { View, SafeAreaView } from 'react-native';
import { Stack } from "expo-router";
import { Text } from '@/components/ui/text';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useCameraPermissions } from "expo-camera";

const SettingsScreen = () => {
  
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);

  return (
    <SafeAreaView >
      <Stack.Screen options={{ title: "Settings", headerShown: true, headerRight: () => <ThemeToggle/> }} />
      <View className='p-2 pt-3'>
        <Button onPress={requestPermission}>
            <Text>Request Camera Permissions</Text>
        </Button>
      </View>
    </SafeAreaView>
    
  );
};

export default SettingsScreen;