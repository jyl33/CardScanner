import { View, SafeAreaView, Alert } from 'react-native';
import { router, Stack } from "expo-router";
import { Text } from '@/components/ui/text';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useCameraPermissions } from "expo-camera";
import { useRouter } from 'expo-router'
import { supabase } from '@/utils/supabase';

const SettingsScreen = () => {
  
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      router.replace('/')
    } catch (error) {
      Alert.alert(
        'Sign Out Error', 
        error instanceof Error ? error.message : 'An error occurred during sign out'
      )
    }
  }

  return (
    <SafeAreaView >
      {/* <Stack.Screen options={{ title: "Settings", headerShown: true, headerRight: () => <ThemeToggle/> }} /> */}
      <Stack.Screen options={{ title: "Settings", headerShown: true }} />
      <View className='p-2 pt-3 gap-2'>
        <Button onPress={requestPermission}>
            <Text>Request Camera Permissions</Text>
        </Button>
        <Button onPress={handleSignOut}>
            <Text>Log Out</Text>
        </Button>
      </View>
    </SafeAreaView>
    
  );
};

export default SettingsScreen;