import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Polyline, Circle, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';
import { theme } from '../constants/theme';

interface LineChartProps {
  data: number[];
  color: string;
  height?: number;
  /** Unit suffix for the legend (e.g. °C, ppm) */
  unit?: string;
}

/**
 * Responsive SVG line chart. Measures its container width on layout
 * instead of using a fixed pixel width, so it fills any card width.
 */
export function LineChart({ data, color, height = 140, unit = '°' }: LineChartProps) {
  const [width, setWidth] = useState(0);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      if (w > 0 && Math.abs(w - width) > 1) setWidth(w);
    },
    [width]
  );

  if (data.length < 2) {
    return (
      <View style={styles.chart} onLayout={onLayout}>
        <Text style={styles.placeholder}>Not enough data points to plot</Text>
      </View>
    );
  }

  const w = width || 320;
  const h = height;
  const pad = 10;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (w - 2 * pad),
    y: pad + ((max - v) / range) * (h - 2 * pad),
  }));

  const linePoints = pts.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = `${pad},${h - pad} ${linePoints} ${w - pad},${h - pad}`;
  const gradId = `grad-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <View style={styles.chart} onLayout={onLayout}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.16} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Polygon points={areaPoints} fill={`url(#${gradId})`} />
        <Polyline
          points={linePoints}
          stroke={color}
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />
        ))}
      </Svg>
      <View style={styles.legendRow}>
        <Text style={styles.legend}>
          <Text style={{ color }}>●</Text> {data[0].toFixed(1)}
          {unit} → {data[data.length - 1].toFixed(1)}
          {unit}
        </Text>
        <Text style={styles.legend}>
          min {min.toFixed(1)}
          {unit} · max {max.toFixed(1)}
          {unit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    padding: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  legend: {
    fontSize: 10,
    color: theme.colors.secondaryText,
    fontFamily: theme.fonts.mono,
  },
  placeholder: {
    textAlign: 'center',
    color: theme.colors.secondaryText,
    fontStyle: 'italic',
    padding: 20,
    fontSize: 12,
  },
});