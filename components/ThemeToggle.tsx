
import React from 'react';
import { Icon } from './Icon';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300/70 dark:hover:bg-gray-600/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 transition-all duration-300"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Icon name="moon" className="w-6 h-6" />
      ) : (
        <Icon name="sun" className="w-6 h-6" />
      )}
    </button>
  );
};
