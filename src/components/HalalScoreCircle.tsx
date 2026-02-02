import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography, spacing } from '../constants/theme';
import { HalalStatus } from '../types';
import { getScoreColor, getStatusLabel } from '../services/halalAnalyzer';

interface HalalScoreCircleProps {
  score: number;
  status: HalalStatus;
  size?: number;
  animated?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function HalalScoreCircle({
  score,
  status,
  size = 180,
  animated = true,
}: HalalScoreCircleProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: score,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(score);
    }
  }, [score, animated]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const displayScore = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
  });

  const scoreColor = getScoreColor(score);
  const statusLabel = getStatusLabel(status);

  const getStatusIcon = () => {
    switch (status) {
      case 'halal':
        return '✓';
      case 'doubtful':
        return '?';
      case 'haram':
        return '✗';
      default:
        return '?';
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={scoreColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={scoreColor} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.surfaceLighter}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={[styles.statusIcon, { color: scoreColor }]}>
          {getStatusIcon()}
        </Text>
        <AnimatedText
          value={displayScore}
          style={[styles.scoreText, { color: scoreColor }]}
        />
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>
    </View>
  );
}

interface AnimatedTextProps {
  value: Animated.AnimatedInterpolation<number>;
  style: any;
}

function AnimatedText({ value, style }: AnimatedTextProps) {
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    const listener = value.addListener(({ value: v }) => {
      setDisplayValue(Math.round(v));
    });

    return () => {
      value.removeListener(listener);
    };
  }, [value]);

  return <Text style={style}>{displayValue}</Text>;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  scoreText: {
    ...typography.h1,
    fontSize: 42,
    fontWeight: '700',
  },
  statusText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
