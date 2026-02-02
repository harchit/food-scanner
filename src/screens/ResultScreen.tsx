import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Share,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';
import { Product, HalalAnalysis } from '../types';
import HalalScoreCircle from '../components/HalalScoreCircle';
import IngredientsList from '../components/IngredientsList';
import { getScoreColor } from '../services/halalAnalyzer';

type ResultScreenParams = {
  Result: {
    product: Product;
    analysis: HalalAnalysis;
  };
};

export default function ResultScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ResultScreenParams, 'Result'>>();
  const { product, analysis } = route.params;

  const scoreColor = getScoreColor(analysis.score);

  const handleShare = async () => {
    try {
      const statusText =
        analysis.status === 'halal'
          ? 'Halal ✓'
          : analysis.status === 'haram'
          ? 'Not Halal ✗'
          : 'Doubtful ?';

      await Share.share({
        message: `I scanned "${product.name}" by ${product.brand} with Halal Scanner.\n\nStatus: ${statusText}\nHalal Score: ${analysis.score}/100\n\n${analysis.summary}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleScanAnother = () => {
    navigation.navigate('Scan');
  };

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
        <Text style={styles.headerTitle}>Scan Result</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Card */}
        <View style={styles.productCard}>
          <View style={styles.productHeader}>
            {product.imageUrl ? (
              <Image
                source={{ uri: product.imageUrl }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="cube-outline" size={40} color={colors.textMuted} />
              </View>
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.brandName}>{product.brand}</Text>
              <Text style={styles.barcodeText}>Barcode: {product.barcode}</Text>
            </View>
          </View>
        </View>

        {/* Halal Score */}
        <View style={styles.scoreSection}>
          <HalalScoreCircle
            score={analysis.score}
            status={analysis.status}
            size={180}
          />
        </View>

        {/* Summary Card */}
        <View style={[styles.summaryCard, { borderLeftColor: scoreColor }]}>
          <Text style={styles.summaryTitle}>Analysis Summary</Text>
          <Text style={styles.summaryText}>{analysis.summary}</Text>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Details</Text>
          <Text style={styles.detailsText}>{analysis.details}</Text>
        </View>

        {/* Labels */}
        {product.labels.length > 0 && (
          <View style={styles.labelsSection}>
            <Text style={styles.sectionTitle}>Product Labels</Text>
            <View style={styles.labelsContainer}>
              {product.labels.slice(0, 6).map((label, index) => (
                <View
                  key={index}
                  style={[
                    styles.labelBadge,
                    label.toLowerCase().includes('halal') && styles.halalLabelBadge,
                    label.toLowerCase().includes('vegan') && styles.veganLabelBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.labelText,
                      (label.toLowerCase().includes('halal') ||
                        label.toLowerCase().includes('vegan')) &&
                        styles.highlightedLabelText,
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Ingredients Analysis */}
        <View style={styles.ingredientsSection}>
          <Text style={styles.sectionTitle}>Ingredients Analysis</Text>
          <IngredientsList
            haramIngredients={analysis.haramIngredients}
            doubtfulIngredients={analysis.doubtfulIngredients}
            halalIngredients={analysis.halalIngredients}
            allIngredients={product.ingredients}
          />
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
          <Text style={styles.disclaimerText}>
            This analysis is based on ingredient data from Open Food Facts and our
            halal ingredient database. For complete certainty, please verify with
            the manufacturer or a certified halal authority.
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.scanAnotherButton}
          onPress={handleScanAnother}
          activeOpacity={0.8}
        >
          <Ionicons name="scan-outline" size={24} color={colors.textPrimary} />
          <Text style={styles.scanAnotherText}>Scan Another Product</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  },
  shareButton: {
    padding: spacing.sm,
    marginRight: -spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  productHeader: {
    flexDirection: 'row',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  productName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  brandName: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  barcodeText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  scoreSection: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderLeftWidth: 4,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  summaryTitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  summaryText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  detailsTitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  detailsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  labelsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  labelBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  halalLabelBadge: {
    backgroundColor: colors.halalGreen + '20',
    borderColor: colors.halalGreen,
  },
  veganLabelBadge: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  labelText: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  highlightedLabelText: {
    color: colors.halalGreen,
    fontWeight: '600',
  },
  ingredientsSection: {
    marginBottom: spacing.lg,
  },
  disclaimerCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 18,
  },
  scanAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  scanAnotherText: {
    ...typography.button,
    color: colors.textPrimary,
  },
});
