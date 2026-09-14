import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Menu, User } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../../theme';

interface HeaderProps {
  title?: string;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  showProfile?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'NavGuard',
  onMenuPress,
  onProfilePress,
  showProfile = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {onMenuPress && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onMenuPress}
            activeOpacity={0.7}
          >
            <Menu size={24} color={Colors.onSurface} />
          </TouchableOpacity>
        )}
        <Text style={[Typography.headlineLgMobile, styles.title]}>{title}</Text>
      </View>

      {showProfile && (
        <TouchableOpacity
          style={styles.profileButton}
          onPress={onProfilePress}
          activeOpacity={0.7}
        >
          <View style={styles.avatarContainer}>
            <User size={20} color={Colors.onSurfaceVariant} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Spacing.touchTargetMin + 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.gutter,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHighest,
    zIndex: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },
  title: {
    color: Colors.primaryBrand,
    fontWeight: '700',
  },
  profileButton: {
    padding: 2,
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
  },
});
