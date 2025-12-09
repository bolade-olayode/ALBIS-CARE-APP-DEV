// src/components/ScreenWrapper.tsx
import React from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
  ViewStyle,
} from 'react-native';

interface ScreenWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  style?: ViewStyle;
}

export default function ScreenWrapper({ 
  children, 
  backgroundColor = '#f8fafc',
  style 
}: ScreenWrapperProps) {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor }, style]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {children}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
});