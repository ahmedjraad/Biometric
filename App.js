import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Audio } from 'expo-av';

export default function App() {
  const [isTouchIDSupported, setIsTouchIDSupported] = useState(false);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [sound, setSound] = useState();

  // Check if the device supports biometrics and Touch ID
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      setIsTouchIDSupported(compatible && supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT));
    })();
  }, []);

  // Play success sound
  const playSuccessSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/success.mp3') // Add a sound file named "success.mp3" to the `assets` folder
    );
    setSound(sound);
    await sound.playAsync();
  };

  // Cleanup the sound
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handlePasswordAuth = async () => {
    const biometricAuth = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate with your phone password',
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use Phone Password',
    });

    if (biometricAuth.success) {
      await playSuccessSound(); // Play sound
      setAuthenticated(true); // Simulate navigating to another screen
    } else if (biometricAuth.error === 'user_cancel') {
      Alert.alert('Cancelled', 'Authentication was cancelled.');
    } else if (biometricAuth.error === 'fallback') {
      Alert.alert('Fallback', 'You will need to enter your phone password.');
    } else {
      Alert.alert('Failed', 'Authentication failed. Please try again.');
    }
  };

  // Simulated "Success" screen
  if (authenticated) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <Text style={styles.successText}>Authentication Successful!</Text>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
          }}
          style={styles.successImage}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        {/* Profile Icon */}
        <View style={styles.profileIconContainer}>
          <Image
            source={{
              uri: 'https://via.placeholder.com/100',
            }}
            style={styles.profileIcon}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {isTouchIDSupported
            ? 'Login with Touch ID or Password'
            : 'Touch ID is not available'}
        </Text>

        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#A1A1A1"
          autoCapitalize="none"
        />

        {/* Password Input */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#A1A1A1"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Forgot Password */}
        <Text style={styles.forgotPassword}>Forgot password?</Text>

        {/* Authentication Button */}
        {isTouchIDSupported ? (
          <TouchableOpacity style={styles.button} onPress={handlePasswordAuth}>
            <Text style={styles.buttonText}>Login with Touch ID</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handlePasswordAuth}>
            <Text style={styles.buttonText}>Login with Password</Text>
          </TouchableOpacity>
        )}

        {/* Create Account */}
        <Text style={styles.createAccount}>
          Don’t have an account?{' '}
          <Text style={styles.createAccountLink}>Create</Text>
        </Text>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Light gray background for professionalism
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '85%',
    padding: 30,
    borderRadius: 20,
    backgroundColor: '#FFFFFF', // White background for form
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  profileIconContainer: {
    marginBottom: 20,
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E6EAF0', // Subtle gray for placeholder
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50', // Dark blue for text
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F3F6FB', // Light gray for inputs
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D6DCE6', // Subtle border for clarity
  },
  forgotPassword: {
    color: '#2C3E50',
    fontSize: 14,
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007BFF', // Primary blue for button
    marginBottom: 20,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF', // White text on blue button
    fontSize: 18,
    fontWeight: '600',
  },
  createAccount: {
    fontSize: 14,
    color: '#2C3E50',
  },
  createAccountLink: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 20,
  },
  successImage: {
    width: 100,
    height: 100,
  },
});
