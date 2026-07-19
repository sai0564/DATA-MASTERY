import { useTheme } from 'next-themes';
import { AnimatedThemeToggler } from '../registry/magicui/animated-theme-toggler';

export default function ThemeToggle(props) {
  const { theme, setTheme } = useTheme();

  return (
    <AnimatedThemeToggler
      theme={theme}
      onThemeChange={(t) => setTheme(t)}
      {...props}
    />
  );
}
