import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type HeaderProps = {
  title: string;
  subtitle: string;
};

type LoadingProps = {
  message: string;
};

type ErrorProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function StaffHeader({ title, subtitle }: HeaderProps) {
  return (
    <View style={styles.headerSection}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.headerSubtitle}>{subtitle}</Text>
    </View>
  );
}

export function StaffLoadingState({ message }: LoadingProps) {
  return (
    <View style={styles.centerState}>
      <Ionicons name="sync" size={22} color="#10B981" />
      <Text style={styles.stateText}>{message}</Text>
    </View>
  );
}

export function StaffErrorState({
  title = 'Terjadi masalah',
  message,
  onRetry,
}: ErrorProps) {
  return (
    <View style={styles.centerState}>
      <Ionicons name="alert-circle" size={26} color="#EF4444" />
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Coba lagi</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export const cardShadow = {
  boxShadow: '0px 2px 8px rgba(15, 23, 42, 0.06)' as const,
};

export const softShadow = {
  boxShadow: '0px 2px 8px rgba(15, 23, 42, 0.08)' as const,
};

export const strongShadow = {
  boxShadow: '0px 8px 16px rgba(16, 185, 129, 0.28)' as const,
};

const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 24,
  },
  stateText: {
    marginTop: 10,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
  },
  errorTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  errorMessage: {
    marginTop: 6,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
