import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme';
import type { ApiError } from '../../lib/api';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

export function LoginScreen({ onNavigateToRegister }: LoginScreenProps) {
  const { login, loginWithGhanaCard } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'email' | 'ghana-card'>('email');
  const [email, setEmail] = useState('');
  const [ghanaCardNumber, setGhanaCardNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (loginMethod === 'email') {
      if (!email.trim()) errs.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email address';
    } else {
      if (!ghanaCardNumber.trim()) errs.ghanaCard = 'Ghana Card number is required';
    }
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (loginMethod === 'email') {
        await login(email.trim(), password);
      } else {
        await loginWithGhanaCard(ghanaCardNumber.trim(), password);
      }
    } catch (err) {
      const apiErr = err as ApiError;
      const msg = Array.isArray(apiErr.message) ? apiErr.message[0] : apiErr.message;
      Alert.alert('Login Failed', msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logo}>
              <Ionicons name="briefcase" size={32} color={Colors.textInverse} />
            </View>
            <Text style={styles.brandName}>Intemso</Text>
            <Text style={styles.subtitle}>
              Find flexible gigs. Build your career.
            </Text>
          </View>

          <View style={styles.methodToggle}>
            <TouchableOpacity
              style={[styles.methodBtn, loginMethod === 'email' && styles.methodBtnActive]}
              onPress={() => setLoginMethod('email')}
            >
              <Text style={[styles.methodText, loginMethod === 'email' && styles.methodTextActive]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.methodBtn, loginMethod === 'ghana-card' && styles.methodBtnActive]}
              onPress={() => setLoginMethod('ghana-card')}
            >
              <Text style={[styles.methodText, loginMethod === 'ghana-card' && styles.methodTextActive]}>
                Ghana Card
              </Text>
            </TouchableOpacity>
          </View>

          {loginMethod === 'email' ? (
            <Input
              label="Email"
              icon="mail-outline"
              placeholder="you@university.edu.gh"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
          ) : (
            <Input
              label="Ghana Card Number"
              icon="card-outline"
              placeholder="GHA-XXXXXXXXX-X"
              value={ghanaCardNumber}
              onChangeText={setGhanaCardNumber}
              autoCapitalize="characters"
              error={errors.ghanaCard}
            />
          )}

          <Input
            label="Password"
            icon="lock-closed-outline"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            isPassword
            error={errors.password}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={styles.loginBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onNavigateToRegister}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: 40,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  brandName: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.xxl,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  methodBtnActive: {
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  methodText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textTertiary,
  },
  methodTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  loginBtn: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  footerText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
});
