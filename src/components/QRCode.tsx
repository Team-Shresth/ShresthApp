import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCodeSvg from 'react-native-qrcode-svg';
import { theme } from '../constants/theme';

export function QRCode({ value, size = 150 }: { value: string; size?: number }) {
  return (
    <View style={styles.container}>
      <QRCodeSvg value={value} size={size} color={theme.colors.text} backgroundColor={theme.colors.surface} />
      <Text style={styles.label}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  label: {
    marginTop: 8,
    fontSize: 10,
    color: theme.colors.secondaryText,
    fontFamily: theme.fonts.mono,
  },
});