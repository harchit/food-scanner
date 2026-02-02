import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { ScanHistoryItem } from '../types';
import { getScanHistory, clearScanHistory, removeScanFromHistory } from '../services/storage';
import HistoryCard from '../components/HistoryCard';

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      const data = await getScanHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const handleItemPress = (item: ScanHistoryItem) => {
    navigation.navigate('Result', {
      product: item.product,
      analysis: item.analysis,
    });
  };

  const handleDeleteItem = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.alert(
      'Delete Scan',
      'Are you sure you want to remove this item from history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeScanFromHistory(id);
              setHistory(prev => prev.filter(item => item.id !== id));
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting item:', error);
            }
          },
        },
      ]
    );
  };

  const handleClearHistory = () => {
    if (history.length === 0) return;

    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all scan history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearScanHistory();
              setHistory([]);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error clearing history:', error);
            }
          },
        },
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="time-outline" size={64} color={colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No Scan History</Text>
      <Text style={styles.emptyText}>
        Products you scan will appear here for quick reference.
      </Text>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('Scan')}
      >
        <Ionicons name="scan-outline" size={20} color={colors.textPrimary} />
        <Text style={styles.scanButtonText}>Start Scanning</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderText}>
        {history.length} {history.length === 1 ? 'product' : 'products'} scanned
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan History</Text>
        {history.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearHistory}
          >
            <Ionicons name="trash-outline" size={22} color={colors.haramRed} />
          </TouchableOpacity>
        )}
      </View>

      {/* History List */}
      <FlatList
        data={history}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <HistoryCard
            item={item}
            onPress={() => handleItemPress(item)}
            onDelete={() => handleDeleteItem(item.id)}
          />
        )}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={history.length > 0 ? renderHeader : null}
        contentContainerStyle={[
          styles.listContent,
          history.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Quick Stats */}
      {history.length > 0 && (
        <View style={styles.statsContainer}>
          <StatItem
            icon="checkmark-circle"
            color={colors.halalGreen}
            value={history.filter(h => h.analysis.status === 'halal').length}
            label="Halal"
          />
          <StatItem
            icon="help-circle"
            color={colors.doubtfulYellow}
            value={history.filter(h => h.analysis.status === 'doubtful').length}
            label="Doubtful"
          />
          <StatItem
            icon="close-circle"
            color={colors.haramRed}
            value={history.filter(h => h.analysis.status === 'haram').length}
            label="Not Halal"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

interface StatItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  value: number;
  label: string;
}

function StatItem({ icon, color, value, label }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    padding: spacing.sm,
    marginRight: -spacing.sm,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  listHeader: {
    marginBottom: spacing.md,
  },
  listHeaderText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  scanButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
