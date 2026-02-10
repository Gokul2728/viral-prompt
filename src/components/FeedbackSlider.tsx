/**
 * FeedbackSlider - Emoji-based feedback component
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  DimensionValue,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAppStore } from '@/store';
import { Colors, BorderRadius, Spacing, Typography } from '@/theme';

interface FeedbackOption {
  value: number;
  emoji: string;
  label: string;
  color: string;
}

interface FeedbackSliderProps {
  question: string;
  options: FeedbackOption[];
  value: number;
  onChange: (value: number) => void;
  variant?: 'horizontal' | 'vertical' | 'arc';
}

export const FeedbackSlider: React.FC<FeedbackSliderProps> = ({
  question,
  options,
  value,
  onChange,
  variant = 'horizontal',
}) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  const selectedIndex = options.findIndex((o) => o.value === value);
  
  if (variant === 'vertical') {
    return (
      <View style={styles.verticalContainer}>
        <Text style={[styles.question, { color: colors.textPrimary }]}>
          {question}
        </Text>
        <View style={styles.verticalOptions}>
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                style={[
                  styles.verticalOption,
                  {
                    backgroundColor: isSelected
                      ? `${option.color}20`
                      : colors.glass,
                    borderColor: isSelected ? option.color : colors.glassBorder,
                  },
                ]}
                onPress={() => onChange(option.value)}
              >
                <View style={styles.verticalLeft}>
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <View>
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: isSelected ? option.color : colors.textPrimary },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                </View>
                {isSelected && (
                  <View
                    style={[styles.selectedIndicator, { backgroundColor: option.color }]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }
  
  if (variant === 'arc') {
    return (
      <View style={styles.arcContainer}>
        <Text style={[styles.question, { color: colors.textPrimary }]}>
          {question}
        </Text>
        <ArcSlider
          options={options}
          value={value}
          onChange={onChange}
        />
      </View>
    );
  }
  
  // Horizontal variant (default)
  return (
    <View style={styles.container}>
      <Text style={[styles.question, { color: colors.textPrimary }]}>
        {question}
      </Text>
      <View style={styles.horizontalOptions}>
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const scale = useSharedValue(1);
          
          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
          }));
          
          const handlePress = () => {
            scale.value = withSpring(1.2, { damping: 10 });
            setTimeout(() => {
              scale.value = withSpring(1, { damping: 10 });
            }, 100);
            onChange(option.value);
          };
          
          return (
            <Animated.View key={option.value} style={animatedStyle}>
              <Pressable
                style={[
                  styles.horizontalOption,
                  {
                    backgroundColor: isSelected
                      ? `${option.color}20`
                      : 'transparent',
                    borderColor: isSelected ? option.color : 'transparent',
                  },
                ]}
                onPress={handlePress}
              >
                <Text
                  style={[
                    styles.horizontalEmoji,
                    { opacity: isSelected ? 1 : 0.5 },
                  ]}
                >
                  {option.emoji}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
      {selectedIndex >= 0 && (
        <Text
          style={[
            styles.selectedLabel,
            { color: options[selectedIndex].color },
          ]}
        >
          {options[selectedIndex].label}
        </Text>
      )}
    </View>
  );
};

/**
 * ArcSlider - Semi-circular mood slider
 */
interface ArcSliderProps {
  options: FeedbackOption[];
  value: number;
  onChange: (value: number) => void;
}

const ArcSlider: React.FC<ArcSliderProps> = ({ options, value, onChange }) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  const selectedIndex = options.findIndex((o) => o.value === value);
  const rotation = useSharedValue(selectedIndex >= 0 ? selectedIndex : 2);
  
  const indicatorStyle = useAnimatedStyle(() => {
    const angle = interpolate(
      rotation.value,
      [0, options.length - 1],
      [-75, 75]
    );
    return {
      transform: [{ rotate: `${angle}deg` }],
    };
  });
  
  const handleSelect = (index: number) => {
    rotation.value = withSpring(index, { damping: 15, stiffness: 150 });
    onChange(options[index].value);
  };
  
  return (
    <View style={styles.arcWrapper}>
      {/* Arc background */}
      <View style={[styles.arc, { borderColor: colors.glassBorder }]}>
        {/* Colored segments */}
        {options.map((option, index) => {
          const startAngle = -90 + (index * 180) / (options.length - 1) - 20;
          const isSelected = index === selectedIndex;
          
          return (
            <Pressable
              key={option.value}
              style={[
                styles.arcSegment,
                {
                  transform: [{ rotate: `${startAngle}deg` }],
                },
              ]}
              onPress={() => handleSelect(index)}
            >
              <Text
                style={[
                  styles.arcEmoji,
                  {
                    opacity: isSelected ? 1 : 0.4,
                    transform: [{ rotate: `${-startAngle}deg` }],
                  },
                ]}
              >
                {option.emoji}
              </Text>
            </Pressable>
          );
        })}
        
        {/* Indicator */}
        <Animated.View style={[styles.arcIndicator, indicatorStyle]}>
          <View
            style={[
              styles.indicatorDot,
              {
                backgroundColor:
                  selectedIndex >= 0
                    ? options[selectedIndex].color
                    : colors.primary,
              },
            ]}
          />
        </Animated.View>
      </View>
      
      {/* Selected label */}
      {selectedIndex >= 0 && (
        <Text
          style={[
            styles.arcLabel,
            { color: options[selectedIndex].color },
          ]}
        >
          {options[selectedIndex].label}
        </Text>
      )}
    </View>
  );
};

/**
 * MoodMeter - Colorful mood gauge component
 */
interface MoodMeterProps {
  question: string;
  value: number; // 1-5
  onChange: (value: number) => void;
}

export const MoodMeter: React.FC<MoodMeterProps> = ({
  question,
  value,
  onChange,
}) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  const moodOptions: FeedbackOption[] = [
    { value: 1, emoji: '😢', label: 'Very Bad', color: '#EF4444' },
    { value: 2, emoji: '😕', label: 'Bad', color: '#F97316' },
    { value: 3, emoji: '😐', label: 'Neutral', color: '#EAB308' },
    { value: 4, emoji: '🙂', label: 'Good', color: '#84CC16' },
    { value: 5, emoji: '😄', label: 'Great', color: '#22C55E' },
  ];
  
  return (
    <View style={styles.moodContainer}>
      <Text style={[styles.question, { color: colors.textPrimary }]}>
        {question}
      </Text>
      
      {/* Color bar */}
      <View style={styles.moodBar}>
        {moodOptions.map((option, index) => {
          const isSelected = option.value === value;
          const width = `${100 / moodOptions.length}%` as DimensionValue;
          
          return (
            <Pressable
              key={option.value}
              style={[
                styles.moodSegment,
                {
                  backgroundColor: option.color,
                  width,
                  opacity: isSelected ? 1 : 0.4,
                },
              ]}
              onPress={() => onChange(option.value)}
            >
              <Text
                style={[
                  styles.moodEmoji,
                  {
                    opacity: isSelected ? 1 : 0.6,
                    transform: [{ scale: isSelected ? 1.3 : 1 }],
                  },
                ]}
              >
                {option.emoji}
              </Text>
            </Pressable>
          );
        })}
      </View>
      
      {/* Selected indicator */}
      <View style={styles.moodIndicator}>
        <View
          style={[
            styles.moodIndicatorArrow,
            {
              left: `${((value - 1) / (moodOptions.length - 1)) * 100}%`,
              borderTopColor: moodOptions[value - 1].color,
            },
          ]}
        />
      </View>
      
      {/* Label */}
      <Text
        style={[
          styles.moodLabel,
          { color: moodOptions[value - 1].color },
        ]}
      >
        {moodOptions[value - 1].label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.lg,
  },
  question: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  horizontalOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  horizontalOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  horizontalEmoji: {
    fontSize: 28,
  },
  selectedLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  // Vertical styles
  verticalContainer: {
    paddingVertical: Spacing.lg,
  },
  verticalOptions: {
    gap: Spacing.sm,
  },
  verticalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  verticalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Arc styles
  arcContainer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  arcWrapper: {
    alignItems: 'center',
    height: 180,
  },
  arc: {
    width: 240,
    height: 120,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    borderWidth: 3,
    borderBottomWidth: 0,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  arcSegment: {
    position: 'absolute',
    bottom: 0,
    left: 117,
    height: 100,
    alignItems: 'center',
  },
  arcEmoji: {
    fontSize: 24,
    position: 'absolute',
    top: -5,
  },
  arcIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 90,
    transformOrigin: 'bottom',
  },
  indicatorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: 0,
    left: -8,
  },
  arcLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginTop: Spacing.xl,
  },
  // Mood meter styles
  moodContainer: {
    paddingVertical: Spacing.lg,
  },
  moodBar: {
    flexDirection: 'row',
    height: 60,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  moodSegment: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodIndicator: {
    height: 12,
    position: 'relative',
  },
  moodIndicatorArrow: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginLeft: -8,
  },
  moodLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});

export default FeedbackSlider;
