import { StyleSheet, ViewStyle, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenWrapper = ({ children, style }: Props) => {
  return (
    // 'edges' ensures we only apply padding where needed (top for notch)
    <SafeAreaView style={[styles.container, style]} edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Your app's background color
  },
});