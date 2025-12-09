// src/components/FormScrollView.tsx
import React from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
} from 'react-native';

interface FormScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  extraPadding?: number;
}

export default function FormScrollView({ 
  children, 
  extraPadding = 120,
  ...props 
}: FormScrollViewProps) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: extraPadding }
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      bounces={true}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});