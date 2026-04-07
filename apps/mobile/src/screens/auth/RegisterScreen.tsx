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

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'employer'>('student');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email.trim(), password, role);
    } catch (err) {
      const apiErr = err as ApiError;
      const msg = Array.isArray(apiErr.message) ? apiErr.message[0] : apiErr.message;
      Alert.alert('Registration Failed', msg || 'Something went wrong');
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Intemso and start your journey
            </Text>
          </View>

          <Text style={styles.sectionLabel}>I want to...</Text>
          <View style={styles.roleToggle}>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'student' && styles.roleBtnActive]}
              onPress={() => setRole('student')}
            >
              <Ionicons
                name="school-outline"
                size={24}
                color={role === 'student' ? Colors.primary : Colors.textTertiary}
              />
              <Text style={[styles.roleText, role === 'student' && styles.roleTextActive]}>
                Find Work
              </Text>
              <Text style={styles.roleDesc}>I'm a student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'employer' && styles.roleBtnActive]}
              onPress={() => setRole('employer')}
            >
              <Ionicons
                name="business-outline"
                size={24}
                color={role === 'employer' ? Colors.primary : Colors.textTertiary}
              />
              <Text style={[styles.roleText, role === 'employer' && styles.roleTextActive]}>
                Hire Talent
              </Text>
              <Text style={styles.roleDesc}>I'm an employer</Text>
            </TouchableOpacity>
          </View>

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

          <Input
            label="Password"
            icon="lock-closed-outline"
            placeholder="At least 8 characters"
            value={password}
            onChangeText={setPassword}
            isPassword
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            icon="lock-closed-outline"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
            error={errors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={styles.registerBtn}
          />

          <Text style={styles.terms}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.footerLink}>Sign In</Text>
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
    paddingTop: 32,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  roleToggle: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  roleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  roleBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  roleText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleTextActive: {
    color: Colors.primary,
  },
  roleDesc: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  registerBtn: {
    marginTop: Spacing.sm,
  },
  terms: {
    marginTop: Spacing.lg,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
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
