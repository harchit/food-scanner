import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';
import { ScanHistoryItem } from '../types';
import { getScoreColor, getStatusLabel } from '../services/halalAnalyzer';

interface HistoryCardProps {
  item: ScanHistoryItem;
  onPress: () => void;
  onDelete?: () => void;
}

export default function HistoryCard({ item, onPress, onDelete }: HistoryCardProps) {
  const { product, analysis, scannedAt } = item;
  const scoreColor = getScoreColor(analysis.score);
  const statusLabel = getStatusLabel(analysis.status);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  const getStatusIcon = () => {
    switch (analysis.status) {
      case 'halal':
        return 'checkmark-circle';
      case 'doubtful':
        return 'help-circle';
      case 'haram':
        return 'close-circle';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="cube-outline" size={24} color={colors.textMuted} />
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.brandName} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={styles.dateText}>{formatDate(scannedAt)}</Text>
      </View>

      {/* Score Badge */}
      <View style={styles.scoreContainer}>
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '20' }]}>
          <Ionicons
            name={getStatusIcon()}
            size={16}
            color={scoreColor}
            style={styles.statusIcon}
          />
          <Text style={[styles.scoreText, { color: scoreColor }]}>
            {analysis.score}
          </Text>
        </View>
        <Text style={[styles.statusLabel, { color: scoreColor }]}>
          {statusLabel}
        </Text>
      </View>

      {/* Delete Button */}
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  productName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  brandName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dateText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  scoreContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusIcon: {
    marginRight: 4,
  },
  scoreText: {
    ...typography.body,
    fontWeight: '700',
  },
  statusLabel: {
    ...typography.caption,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deleteButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
});
