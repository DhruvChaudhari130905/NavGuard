import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Mail, Lock, UserRound, Eye, EyeOff } from 'lucide-react-native';
import { Colors, Typography } from '../theme';

interface AuthScreenProps {
  onAuthenticated: (name: string, email: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (!trimmedEmail || !password || (isSignUp && (!trimmedName || !confirmPassword))) {
      setError(isSignUp ? 'Enter your name, Gmail address, and both passwords.' : 'Enter your Gmail address and password.');
      return;
    }
    if (!/^[^\s@]+@gmail\.com$/i.test(trimmedEmail)) {
      setError('Use a Gmail address ending with @gmail.com.');
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const displayName = trimmedName || trimmedEmail.split('@')[0];
    await AsyncStorage.multiSet([
      ['authSignedIn', 'true'],
      ['profileName', displayName],
      ['profileEmail', trimmedEmail],
    ]);
    onAuthenticated(displayName, trimmedEmail);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logo}><Text style={styles.logoText}>N</Text></View>
        <Text style={[Typography.displayLg, styles.title]}>{isSignUp ? 'Create your account' : 'Welcome back'}</Text>
        <Text style={[Typography.bodyMd, styles.subtitle]}>
          {isSignUp ? 'Start resilient navigation with NavGuard.' : 'Sign in to continue navigating safely.'}
        </Text>

        {isSignUp && (
          <View style={styles.inputRow}>
            <UserRound size={19} color={Colors.onSurfaceVariant} />
            <TextInput value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={Colors.onSurfaceVariant} style={styles.input} />
          </View>
        )}
        <View style={styles.inputRow}>
          <Mail size={19} color={Colors.onSurfaceVariant} />
          <TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={Colors.onSurfaceVariant} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
        </View>
        <View style={styles.inputRow}>
          <Lock size={19} color={Colors.onSurfaceVariant} />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={Colors.onSurfaceVariant} secureTextEntry={!showPassword} style={styles.input} />
          <TouchableOpacity onPress={() => setShowPassword((value) => !value)} accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? <EyeOff size={19} color={Colors.onSurfaceVariant} /> : <Eye size={19} color={Colors.onSurfaceVariant} />}
          </TouchableOpacity>
        </View>
        {isSignUp && (
          <View style={styles.inputRow}>
            <Lock size={19} color={Colors.onSurfaceVariant} />
            <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter password" placeholderTextColor={Colors.onSurfaceVariant} secureTextEntry={!showConfirmPassword} style={styles.input} />
            <TouchableOpacity onPress={() => setShowConfirmPassword((value) => !value)} accessibilityLabel={showConfirmPassword ? 'Hide re-entered password' : 'Show re-entered password'}>
              {showConfirmPassword ? <EyeOff size={19} color={Colors.onSurfaceVariant} /> : <Eye size={19} color={Colors.onSurfaceVariant} />}
            </TouchableOpacity>
          </View>
        )}
        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.primaryButton} onPress={() => { void submit(); }} activeOpacity={0.85}>
          <Text style={styles.primaryText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setIsSignUp((value) => !value); setError(''); }} activeOpacity={0.7}>
          <Text style={styles.switchText}>
            {isSignUp ? 'Already have an account? Sign In' : 'New to NavGuard? Sign Up'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', padding: 20 },
  card: { padding: 24, borderRadius: 24, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceContainerHighest },
  logo: { width: 54, height: 54, borderRadius: 18, backgroundColor: Colors.primaryBrand, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  logoText: { color: Colors.onPrimary, fontSize: 28, fontWeight: '800' },
  title: { color: Colors.onSurface, fontWeight: '800' },
  subtitle: { color: Colors.onSurfaceVariant, marginTop: 8, marginBottom: 24 },
  inputRow: { height: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.outlineVariant, backgroundColor: Colors.surfaceContainerLow, marginBottom: 12 },
  input: { flex: 1, color: Colors.onSurface, fontSize: 15 },
  error: { color: Colors.error, marginBottom: 12 },
  primaryButton: { height: 52, borderRadius: 14, backgroundColor: Colors.primaryBrand, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 18 },
  primaryText: { color: Colors.onPrimary, fontWeight: '700', fontSize: 15 },
  switchText: { color: Colors.primaryBrand, textAlign: 'center', fontWeight: '700' },
});
