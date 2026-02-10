/**
 * FeedbackScreen - Prompt rating and feedback
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppStore } from '@/store';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { Header, GlassCard, Button, FeedbackSlider } from '@/components';
import { apiService } from '@/services/api';

export const FeedbackScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  const [usefulness, setUsefulness] = useState(3);
  const [viralPotential, setViralPotential] = useState(3);
  const [quality, setQuality] = useState(3);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const usefulnessOptions = [
    { value: 1, emoji: '😕', label: 'Not useful', color: '#EF4444' },
    { value: 2, emoji: '😐', label: 'Slightly useful', color: '#F97316' },
    { value: 3, emoji: '🙂', label: 'Useful', color: '#EAB308' },
    { value: 4, emoji: '😊', label: 'Very useful', color: '#84CC16' },
    { value: 5, emoji: '🤩', label: 'Extremely useful', color: '#22C55E' },
  ];
  
  const viralOptions = [
    { value: 1, emoji: '📉', label: 'Not viral', color: '#EF4444' },
    { value: 2, emoji: '📊', label: 'Low potential', color: '#F97316' },
    { value: 3, emoji: '📈', label: 'Could go viral', color: '#EAB308' },
    { value: 4, emoji: '🚀', label: 'High potential', color: '#84CC16' },
    { value: 5, emoji: '💥', label: 'Definitely viral', color: '#22C55E' },
  ];
  
  const qualityOptions = [
    { value: 1, emoji: '👎', label: 'Poor', color: '#EF4444' },
    { value: 2, emoji: '🤏', label: 'Below average', color: '#F97316' },
    { value: 3, emoji: '👍', label: 'Good', color: '#EAB308' },
    { value: 4, emoji: '👏', label: 'Great', color: '#84CC16' },
    { value: 5, emoji: '🏆', label: 'Excellent', color: '#22C55E' },
  ];
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const result = await apiService.submitFeedback(route.params.promptId, {
        usefulness,
        viralPotential,
        quality,
        comment,
      });
      
      if (result.success) {
        Alert.alert('Thank you!', 'Your feedback has been submitted.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', 'Could not submit feedback. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Rate Prompt"
        subtitle="Help us improve"
        showBack
        onBack={() => navigation.goBack()}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Usefulness */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <GlassCard padding="lg" style={styles.questionCard}>
              <FeedbackSlider
                question="How useful was this prompt?"
                options={usefulnessOptions}
                value={usefulness}
                onChange={setUsefulness}
                variant="horizontal"
              />
            </GlassCard>
          </Animated.View>
          
          {/* Viral Potential */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <GlassCard padding="lg" style={styles.questionCard}>
              <FeedbackSlider
                question="How viral do you think this is?"
                options={viralOptions}
                value={viralPotential}
                onChange={setViralPotential}
                variant="horizontal"
              />
            </GlassCard>
          </Animated.View>
          
          {/* Quality Rating */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <GlassCard padding="lg" style={styles.questionCard}>
              <FeedbackSlider
                question="Rate the overall quality"
                options={qualityOptions}
                value={quality}
                onChange={setQuality}
                variant="horizontal"
              />
            </GlassCard>
          </Animated.View>
          
          {/* Comment */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <GlassCard padding="lg" style={styles.questionCard}>
              <Text style={[styles.commentLabel, { color: colors.textPrimary }]}>
                Any additional thoughts?
              </Text>
              <Text style={[styles.commentHint, { color: colors.textTertiary }]}>
                Optional - help us understand your rating better
              </Text>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    backgroundColor: colors.glass,
                    borderColor: colors.glassBorder,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Share your thoughts..."
                placeholderTextColor={colors.textTertiary}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: colors.textTertiary }]}>
                {comment.length}/250
              </Text>
            </GlassCard>
          </Animated.View>
          
          {/* Submit button */}
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <Button
              title={isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              onPress={handleSubmit}
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              disabled={isSubmitting}
              icon="checkmark-circle"
            />
          </Animated.View>
          
          {/* Skip link */}
          <Button
            title="Skip for now"
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="md"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  questionCard: {
    marginBottom: 0,
  },
  commentLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  commentHint: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: Typography.fontSize.md,
    minHeight: 100,
  },
  charCount: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
});

export default FeedbackScreen;
