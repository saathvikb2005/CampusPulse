// src/utils/preferences.js - User Preferences Utilities

/**
 * Get user notification preferences from localStorage
 */
export const getNotificationPreferences = () => {
  try {
    const prefs = localStorage.getItem('notificationPreferences');
    return prefs ? JSON.parse(prefs) : {
      academic: true,
      events: true,
      emergency: true,
      clubs: true
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return {
      academic: true,
      events: true,
      emergency: true,
      clubs: true
    };
  }
};

/**
 * Get user privacy preferences from localStorage
 */
export const getPrivacyPreferences = () => {
  try {
    const prefs = localStorage.getItem('userPreferences');
    const userPrefs = prefs ? JSON.parse(prefs) : {};
    return userPrefs.privacy || {
      showEmail: false,
      showPhone: false,
      showDepartment: true
    };
  } catch (error) {
    console.error('Error getting privacy preferences:', error);
    return {
      showEmail: false,
      showPhone: false,
      showDepartment: true
    };
  }
};

/**
 * Get user theme preference from localStorage
 */
export const getThemePreference = () => {
  try {
    const prefs = localStorage.getItem('userPreferences');
    const userPrefs = prefs ? JSON.parse(prefs) : {};
    return userPrefs.theme || 'light';
  } catch (error) {
    console.error('Error getting theme preference:', error);
    return 'light';
  }
};

/**
 * Apply theme to document body
 */
export const applyTheme = (theme) => {
  const body = document.body;
  
  // Remove existing theme classes
  body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
  
  if (theme === 'auto') {
    // Use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
  } else {
    body.classList.add(`theme-${theme}`);
  }
};

/**
 * Filter notifications based on user preferences
 */
export const filterNotificationsByPreferences = (notifications) => {
  const preferences = getNotificationPreferences();
  
  return notifications.filter(notification => {
    const notificationType = notification.type || notification.category;
    
    switch (notificationType) {
      case 'event_created':
      case 'event_updated':
      case 'event_cancelled':
      case 'event_reminder':
      case 'registration_confirmed':
      case 'registration_cancelled':
        return preferences.events;
        
      case 'academic_announcement':
      case 'academic_update':
      case 'course_announcement':
        return preferences.academic;
        
      case 'emergency':
      case 'system_announcement':
      case 'urgent':
        return preferences.emergency;
        
      case 'club_update':
      case 'club_event':
      case 'society_announcement':
        return preferences.clubs;
        
      default:
        return true; // Show unknown types by default
    }
  });
};

/**
 * Check if user should see specific profile information based on privacy settings
 */
export const shouldShowProfileInfo = (infoType, isOwnProfile = false) => {
  if (isOwnProfile) return true; // Always show own info
  
  const privacyPrefs = getPrivacyPreferences();
  
  switch (infoType) {
    case 'email':
      return privacyPrefs.showEmail;
    case 'phone':
      return privacyPrefs.showPhone;
    case 'department':
      return privacyPrefs.showDepartment;
    default:
      return true;
  }
};

/**
 * Initialize theme on app load
 */
export const initializeTheme = () => {
  const theme = getThemePreference();
  applyTheme(theme);
  
  // Listen for system theme changes when auto is selected
  if (theme === 'auto') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      applyTheme('auto');
    });
  }
};