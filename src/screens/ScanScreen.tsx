import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import BarcodeScanner from '../components/BarcodeScanner';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';
import { fetchProductByBarcode } from '../services/openFoodFactsApi';
import { analyzeHalalStatus } from '../services/halalAnalyzer';
import { saveScanToHistory } from '../services/storage';

export default function ScanScreen() {
  const navigation = useNavigation<any>();
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      setIsScanning(true);
      setIsLoading(false);
    }, [])
  );

  const handleBarcodeScan = async (barcode: string) => {
    if (isLoading) return;

    setIsScanning(false);
    setIsLoading(true);
    setLoadingMessage('Fetching product information...');

    try {
      const product = await fetchProductByBarcode(barcode);

      if (!product) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'Product Not Found',
          'This product is not in our database. Try scanning a different barcode.',
          [{ text: 'OK', onPress: () => setIsScanning(true) }]
        );
        setIsLoading(false);
        return;
      }

      setLoadingMessage('Analyzing ingredients...');
      const analysis = analyzeHalalStatus(product);

      setLoadingMessage('Saving to history...');
      await saveScanToHistory(product, analysis);

      await Haptics.notificationAsync(
        analysis.status === 'halal'
          ? Haptics.NotificationFeedbackType.Success
          : analysis.status === 'haram'
          ? Haptics.NotificationFeedbackType.Error
          : Haptics.NotificationFeedbackType.Warning
      );

      setIsLoading(false);
      navigation.navigate('Result', { product, analysis });
    } catch (error) {
      console.error('Error scanning barcode:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Error',
        'Failed to fetch product information. Please check your internet connection and try again.',
        [{ text: 'OK', onPress: () => setIsScanning(true) }]
      );
      setIsLoading(false);
    }
  };

  const handleManualEntry = () => {
    Alert.prompt(
      'Enter Barcode',
      'Type the barcode number manually:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Search',
          onPress: (barcode) => {
            if (barcode && barcode.trim()) {
              handleBarcodeScan(barcode.trim());
            }
          },
        },
      ],
      'plain-text',
      '',
      'number-pad'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Halal Scanner</Text>
        <Text style={styles.subtitle}>Scan a barcode to check halal status</Text>
      </View>

      {/* Scanner or Loading */}
      <View style={styles.scannerContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner message={loadingMessage} />
          </View>
        ) : (
          <BarcodeScanner onScan={handleBarcodeScan} isScanning={isScanning} />
        )}
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleManualEntry}
          disabled={isLoading}
        >
          <Ionicons name="keypad-outline" size={24} color={colors.textPrimary} />
          <Text style={styles.actionButtonText}>Enter Manually</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => navigation.navigate('History')}
          disabled={isLoading}
        >
          <Ionicons name="time-outline" size={24} color={colors.textPrimary} />
          <Text style={styles.actionButtonText}>View History</Text>
        </TouchableOpacity>
      </View>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <View style={styles.tip}>
          <Ionicons name="bulb-outline" size={16} color={colors.doubtfulYellow} />
          <Text style={styles.tipText}>
            Hold your device steady and ensure good lighting
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scannerContainer: {
    flex: 1,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...shadows.sm,
  },
  primaryButton: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.primary,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  tipsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tipText: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
});
