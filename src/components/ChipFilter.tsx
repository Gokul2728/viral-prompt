/**
 * ChipFilter - Horizontal scrolling filter chips
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/store';
import { Colors, BorderRadius, Spacing, Typography } from '@/theme';

interface ChipOption {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}

interface ChipFilterProps {
  options: ChipOption[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  multiSelect?: boolean;
  showAll?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ChipFilter: React.FC<ChipFilterProps> = ({
  options,
  selectedIds,
  onSelect,
  multiSelect = false,
  showAll = true,
}) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  const allSelected = selectedIds.length === 0;
  
  const handleSelect = (id: string) => {
    if (id === 'all') {
      onSelect('all');
      return;
    }
    
    if (multiSelect) {
      onSelect(id);
    } else {
      onSelect(id);
    }
  };
  
  const renderChip = (option: ChipOption, isSelected: boolean) => {
    const scale = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));
    
    const handlePressIn = () => {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    };
    
    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };
    
    if (isSelected) {
      return (
        <AnimatedPressable
          key={option.id}
          style={animatedStyle}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => handleSelect(option.id)}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.chipGradient}
          >
            {option.icon && (
              <Ionicons name={option.icon} size={14} color="#FFFFFF" />
            )}
            <Text style={styles.chipTextSelected}>{option.label}</Text>
          </LinearGradient>
        </AnimatedPressable>
      );
    }
    
    return (
      <AnimatedPressable
        key={option.id}
        style={[
          animatedStyle,
          styles.chip,
          {
            backgroundColor: colors.glass,
            borderColor: colors.glassBorder,
          },
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => handleSelect(option.id)}
      >
        {option.icon && (
          <Ionicons
            name={option.icon}
            size={14}
            color={option.color || colors.textSecondary}
          />
        )}
        <Text style={[styles.chipText, { color: colors.textSecondary }]}>
          {option.label}
        </Text>
      </AnimatedPressable>
    );
  };
  
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {showAll && renderChip({ id: 'all', label: 'All' }, allSelected)}
      {options.map((option) =>
        renderChip(option, selectedIds.includes(option.id))
      )}
    </ScrollView>
  );
};

/**
 * ChipFilterVertical - Vertical layout for modals/sheets
 */
interface ChipFilterVerticalProps extends ChipFilterProps {
  title?: string;
}

export const ChipFilterVertical: React.FC<ChipFilterVerticalProps> = ({
  options,
  selectedIds,
  onSelect,
  multiSelect = true,
  title,
}) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  return (
    <View style={styles.verticalContainer}>
      {title && (
        <Text style={[styles.verticalTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
      )}
      <View style={styles.verticalChips}>
        {options.map((option) => {
          const isSelected = selectedIds.includes(option.id);
          
          return (
            <Pressable
              key={option.id}
              style={[
                styles.verticalChip,
                {
                  backgroundColor: isSelected
                    ? `${colors.primary}20`
                    : colors.glass,
                  borderColor: isSelected ? colors.primary : colors.glassBorder,
                },
              ]}
              onPress={() => onSelect(option.id)}
            >
              {option.icon && (
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={isSelected ? colors.primary : option.color || colors.textSecondary}
                />
              )}
              <Text
                style={[
                  styles.verticalChipText,
                  {
                    color: isSelected ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                {option.label}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color={colors.primary} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 6,
  },
  chipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  chipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  chipTextSelected: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Vertical styles
  verticalContainer: {
    paddingHorizontal: Spacing.lg,
  },
  verticalTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  verticalChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  verticalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    gap: 8,
  },
  verticalChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
});

export default ChipFilter;
