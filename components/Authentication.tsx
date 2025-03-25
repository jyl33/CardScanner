import React, { useState } from 'react'
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ViewStyle
} from 'react-native'
import { supabase } from '@/utils/supabase'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
    
    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        // If sign up is successful, update user profile
        if (data.user) {
          const { error: profileError } = await supabase
            .from('users')
            .update({
              first_name: firstName,
              last_name: lastName,
              account_tier: 'free'
            })
            .eq('id', data.user.id)

          if (profileError) throw profileError

          Alert.alert(
            'Success', 
            'Account created. Please check your email to verify.'
          )
        }
      } else {
        // Sign In Flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        // Optional: Additional login logic
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('account_tier, is_active')
          .eq('id', data.user.id)
          .single()

        if (userError) throw userError

        // Check if user account is active
        if (!userData.is_active) {
          throw new Error('Account is not active')
        }
      }
    } catch (error) {
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'An error occurred'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      //behavior="position"
      style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <ScrollView 
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          width: '100%',
          maxWidth: 500,
        }}
        scrollEnabled={Platform.OS === 'web'}
        automaticallyAdjustKeyboardInsets={true}
        automaticallyAdjustContentInsets={true}
      >
        <Text style={{ 
          fontSize: 24, 
          marginBottom: 20, 
          textAlign: 'center',
          fontWeight: 'bold',
          paddingTop: 50
        }}>
          {isSignUp ? 'Create Account' : 'Sign In'}
        </Text>

        {isSignUp && (
          <>
            <TextInput
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                padding: 10,
                marginBottom: 10,
                borderRadius: 5,
                width: Platform.OS === 'web' ? 400 : 250,
                maxWidth: 500,
                alignSelf: 'center'
              }}
            />

            <TextInput
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                padding: 10,
                marginBottom: 10,
                borderRadius: 5,
                width: Platform.OS === 'web' ? 400 : 250,
                maxWidth: 500,
                alignSelf: 'center'
              }}
            />
          </>
        )}

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{borderWidth: 1,
            borderColor: '#ddd',
            padding: 10,
            marginBottom: 10,
            borderRadius: 5,
            width: Platform.OS === 'web' ? 400 : 250,
            maxWidth: 500,
            alignSelf: 'center'
        }}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{borderWidth: 1,
            borderColor: '#ddd',
            padding: 10,
            marginBottom: 10,
            borderRadius: 5,
            width: Platform.OS === 'web' ? 400 : 250,
            maxWidth: 500,
            alignSelf: 'center'
        }}
        />

        <Button 
          onPress={handleAuth}
          disabled={loading}
          style={{
            width: Platform.OS === 'web' ? 400 : 250,
            maxWidth: 500,
            alignSelf: 'center'
          }}
        >
          <Text>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
        </Button>

        <TouchableOpacity 
          onPress={() => setIsSignUp(!isSignUp)}
          style={{ 
            marginTop: 15, 
            alignItems: 'center' 
          }}
        >
          <Text style={{ color: '#007bff' }}>
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : 'Need an account? Sign Up'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}