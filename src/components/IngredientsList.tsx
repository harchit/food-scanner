import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { IngredientAnalysis, HalalStatus } from '../types';

interface IngredientsListProps {
  haramIngredients: IngredientAnalysis[];
  doubtfulIngredients: IngredientAnalysis[];
  halalIngredients: IngredientAnalysis[];
  allIngredients: string[];
}

export default function IngredientsList({
  haramIngredients,
  doubtfulIngredients,
  halalIngredients,
  allIngredients,
}: IngredientsListProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    haramIngredients.length > 0 ? 'haram' : doubtfulIngredients.length > 0 ? 'doubtful' : null
  );

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <View style={styles.container}>
      {/* Haram Ingredients */}
      {haramIngredients.length > 0 && (
        <IngredientSection
          title="Not Halal"
          count={haramIngredients.length}
          status="haram"
          ingredients={haramIngredients}
          expanded={expandedSection === 'haram'}
          onToggle={() => toggleSection('haram')}
        />
      )}

      {/* Doubtful Ingredients */}
      {doubtfulIngredients.length > 0 && (
        <IngredientSection
          title="Doubtful"
          count={doubtfulIngredients.length}
          status="doubtful"
          ingredients={doubtfulIngredients}
          expanded={expandedSection === 'doubtful'}
          onToggle={() => toggleSection('doubtful')}
        />
      )}

      {/* All Ingredients (collapsed by default) */}
      {allIngredients.length > 0 && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('all')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.statusDot, { backgroundColor: colors.textMuted }]} />
              <Text style={styles.sectionTitle}>All Ingredients</Text>
              <View style={[styles.countBadge, { backgroundColor: colors.surfaceLighter }]}>
                <Text style={styles.countText}>{allIngredients.length}</Text>
              </View>
            </View>
            <Ionicons
              name={expandedSection === 'all' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {expandedSection === 'all' && (
            <View style={styles.ingredientsList}>
              <Text style={styles.allIngredientsText}>
                {allIngredients.join(', ')}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

interface IngredientSectionProps {
  title: string;
  count: number;
  status: HalalStatus;
  ingredients: IngredientAnalysis[];
  expanded: boolean;
  onToggle: () => void;
}

function IngredientSection({
  title,
  count,
  status,
  ingredients,
  expanded,
  onToggle,
}: IngredientSectionProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'haram':
        return colors.haramRed;
      case 'doubtful':
        return colors.doubtfulYellow;
      case 'halal':
        return colors.halalGreen;
      default:
        return colors.textMuted;
    }
  };

  const statusColor = getStatusColor();

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.sectionTitleContainer}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={[styles.countBadge, { backgroundColor: statusColor + '30' }]}>
            <Text style={[styles.countText, { color: statusColor }]}>{count}</Text>
          </View>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.ingredientsList}>
          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <View style={styles.ingredientHeader}>
                <Text style={[styles.ingredientName, { color: statusColor }]}>
                  {ingredient.name}
                </Text>
                {ingredient.confidence < 100 && (
                  <Text style={styles.confidenceText}>
                    {ingredient.confidence}% confidence
                  </Text>
                )}
              </View>
              <Text style={styles.ingredientReason}>{ingredient.reason}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  countBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  countText: {
    ...typography.caption,
    fontWeight: '600',
  },
  ingredientsList: {
    padding: spacing.md,
    paddingTop: 0,
  },
  ingredientItem: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ingredientName: {
    ...typography.body,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  confidenceText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  ingredientReason: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  allIngredientsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
    textTransform: 'capitalize',
  },
});
