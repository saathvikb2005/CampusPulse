import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ showLabel = false, compact = false, animated = true }) => {
  const { currentTheme, setTheme, isDark } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleThemeChange = async (newTheme) => {
    if (animated) {
      setIsAnimating(true);
      // Add a slight delay for smooth animation
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    setTheme(newTheme);
    if (animated) {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const toggleTheme = () => {
    handleThemeChange(isDark ? 'light' : 'dark');
  };

  // Keyboard accessibility
  const handleKeyPress = (event, theme) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleThemeChange(theme);
    }
  };

  if (compact) {
    return (
      <div className={`theme-toggle-compact ${isAnimating ? 'animating' : ''}`}>
        <button
          className={`theme-btn ${isDark ? 'dark-active' : 'light-active'}`}
          onClick={toggleTheme}
          onKeyPress={(e) => handleKeyPress(e, isDark ? 'light' : 'dark')}
          title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          disabled={isAnimating}
        >
          <span className="theme-icon">
            {isDark ? '☀️' : '🌙'}
          </span>
          {isAnimating && <span className="theme-ripple"></span>}
        </button>
      </div>
    );
  }

  return (
    <div className={`theme-toggle ${isAnimating ? 'animating' : ''}`}>
      {showLabel && (
        <label className="theme-label" htmlFor="theme-options">
          Theme:
        </label>
      )}
      <div 
        className="theme-options" 
        id="theme-options"
        role="radiogroup"
        aria-label="Select theme preference"
      >
        {[
          { id: 'light', icon: '☀️', label: 'Light' },
          { id: 'dark', icon: '🌙', label: 'Dark' },
          { id: 'auto', icon: '🔄', label: 'Auto' }
        ].map((theme) => (
          <button
            key={theme.id}
            className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
            onClick={() => handleThemeChange(theme.id)}
            onKeyPress={(e) => handleKeyPress(e, theme.id)}
            title={`${theme.label} theme`}
            aria-label={`${theme.label} theme`}
            aria-checked={currentTheme === theme.id}
            role="radio"
            disabled={isAnimating}
          >
            <span className="theme-icon">{theme.icon}</span>
            {showLabel && <span className="theme-text">{theme.label}</span>}
            {currentTheme === theme.id && <span className="theme-indicator"></span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeToggle;