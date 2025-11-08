import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import { getCurrentUser, isAuthenticated, logout } from '../utils/auth';
import { userAPI, eventAPI, blogAPI } from '../services/api';
import { applyTheme } from '../utils/preferences';
import { INTEREST_CATEGORIES, getInterestSuggestions } from '../utils/interests';
import './Profile.css';
import '../styles/preferences.css';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // User profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    regNumber: '',
    department: '',
    year: '',
    phone: '',
    bio: '',
    interests: [],
    avatar: ''
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    notifications: {
      academic: true,
      events: true,
      emergency: true,
      clubs: true
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      showDepartment: true
    },
    theme: 'light',
    language: 'en'
  });

  // Activity data
  const [activities, setActivities] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  
  // Avatar upload method
  const [avatarUploadMethod, setAvatarUploadMethod] = useState('upload');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Interest management
  const [showInterestSuggestions, setShowInterestSuggestions] = useState(false);
  const [interestQuery, setInterestQuery] = useState('');
  const [interestSuggestions, setInterestSuggestions] = useState([]);

  // Load user data on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadUserData();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      console.log('Loading user profile data...');
      
      // Load profile data from backend API
      const profileResponse = await userAPI.getProfile();
      console.log('Profile API response:', profileResponse);
      console.log('Profile response data:', profileResponse.data);
      console.log('Profile response data.user:', profileResponse.data?.user);
      
      if (profileResponse.success && profileResponse.data?.user) {
        const userData = profileResponse.data.user;
        console.log('User data from API:', userData);
        
        setProfile({
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User',
          email: userData.email || '',
          regNumber: userData.studentId || '',
          department: userData.department || '',
          year: userData.year || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          interests: userData.interests || [],
          avatar: userData.avatar || ''
        });

        // Load user preferences (from localStorage for now, can be moved to API later)
        const savedPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        setPreferences(prev => ({ ...prev, ...savedPreferences }));
      } else {
        console.error('Profile API failed:', profileResponse);
        console.error('Missing data.user - checking for direct user in data...');
        
        // Check if user data is directly in data instead of data.user
        if (profileResponse.success && profileResponse.data && !profileResponse.data.user) {
          console.log('Trying direct user data:', profileResponse.data);
          const userData = profileResponse.data;
          
          setProfile({
            name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User',
            email: userData.email || '',
            regNumber: userData.studentId || '',
            department: userData.department || '',
            year: userData.year || '',
            phone: userData.phone || '',
            bio: userData.bio || '',
            interests: userData.interests || [],
            avatar: userData.avatar || ''
          });

          // Load user preferences
          const savedPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
          setPreferences(prev => ({ ...prev, ...savedPreferences }));
        } else {
          throw new Error('Failed to load profile data');
        }
      }

      // Load user's registered events
      console.log('Loading user registered events...');
      try {
        const registeredEventsResponse = await eventAPI.getUserRegistered();
        console.log('Registered events response:', registeredEventsResponse);
        
        if (registeredEventsResponse.success) {
          const events = registeredEventsResponse.data?.events || registeredEventsResponse.events || [];
          console.log('Registered events:', events);
          
          const eventRegistrations = events.map(event => ({
            id: event._id,
            title: event.title,
            date: event.startDate || event.date,
            status: 'confirmed',
            type: 'participant'
          }));
          setRegistrations(eventRegistrations);
        } else {
          console.error('Failed to load registered events:', registeredEventsResponse);
          setRegistrations([]);
        }
      } catch (eventError) {
        console.error('Error loading registered events:', eventError);
        setRegistrations([]);
      }

      // Load user's created events and blogs for activity
      const activities = [];
      
      try {
        console.log('Loading user created events...');
        const createdEventsResponse = await eventAPI.getUserCreated();
        console.log('Created events response:', createdEventsResponse);
        
        if (createdEventsResponse.success) {
          const createdEvents = createdEventsResponse.data?.events || createdEventsResponse.events || [];
          createdEvents.forEach(event => {
            activities.push({
              type: 'event_created',
              event: event.title,
              date: event.createdAt,
              status: 'created'
            });
          });
        }
      } catch (eventError) {
        console.error('Error loading created events:', eventError);
      }

      try {
        console.log('Loading user blogs...');
        const currentUser = getCurrentUser();
        if (currentUser?.id) {
          const userBlogsResponse = await blogAPI.getUserBlogs(currentUser.id);
          console.log('User blogs response:', userBlogsResponse);
          
          if (userBlogsResponse.success) {
            const blogs = userBlogsResponse.data?.blogs || userBlogsResponse.blogs || [];
            blogs.forEach(blog => {
              activities.push({
                type: 'blog',
                title: blog.title,
                date: blog.createdAt,
                status: blog.status === 'published' ? 'published' : 'draft'
              });
            });
          }
        }
      } catch (blogError) {
        console.error('Error loading user blogs:', blogError);
      }

      // Sort activities by date (newest first)
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      setActivities(activities);
      console.log('Final activities:', activities);

    } catch (error) {
      console.error('Error loading user data:', error);
      showErrorToast('Failed to load profile data');
      
      // Fallback to current user data from localStorage
      const currentUser = getCurrentUser();
      console.log('Fallback to localStorage user:', currentUser);
      
      if (currentUser) {
        setProfile({
          name: currentUser.name || 'User',
          email: currentUser.email || '',
          regNumber: '',
          department: currentUser.department || '',
          year: '',
          phone: '',
          bio: '',
          interests: [],
          avatar: ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare profile data for backend API
      const [firstName, ...lastNameParts] = profile.name.split(' ');
      const lastName = lastNameParts.join(' ');

      // Validate required fields
      if (!firstName || firstName.trim().length === 0) {
        showErrorToast('First name is required');
        setLoading(false);
        return;
      }

      if (!lastName || lastName.trim().length === 0) {
        showErrorToast('Last name is required');
        setLoading(false);
        return;
      }

      if (firstName.length > 50) {
        showErrorToast('First name cannot exceed 50 characters');
        setLoading(false);
        return;
      }

      if (lastName.length > 50) {
        showErrorToast('Last name cannot exceed 50 characters');
        setLoading(false);
        return;
      }

      if (profile.department && profile.department.length > 100) {
        showErrorToast('Department name cannot exceed 100 characters');
        setLoading(false);
        return;
      }

      if (profile.bio && profile.bio.length > 1000) {
        showErrorToast('Bio cannot exceed 1000 characters');
        setLoading(false);
        return;
      }

      // Validate phone number format if provided
      if (profile.phone && profile.phone.trim() !== '') {
        const phoneRegex = /^\+?[\d\s-()]+$/;
        if (!phoneRegex.test(profile.phone)) {
          showErrorToast('Please provide a valid phone number (numbers, spaces, dashes, and parentheses only)');
          setLoading(false);
          return;
        }
      }

      // Validate interests
      const validInterests = Array.isArray(profile.interests) 
        ? profile.interests.filter(interest => 
            typeof interest === 'string' && 
            interest.trim().length > 0 && 
            interest.trim().length <= 50
          )
        : [];

      const profileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        department: profile.department ? profile.department.trim() : '',
        phone: profile.phone ? profile.phone.trim() : '',
        bio: profile.bio ? profile.bio.trim() : '',
        interests: validInterests
      };

      // Remove empty fields except for required ones (firstName, lastName)
      Object.keys(profileData).forEach(key => {
        if ((profileData[key] === '' || profileData[key] === undefined || profileData[key] === null) && 
            key !== 'firstName' && key !== 'lastName') {
          delete profileData[key];
        }
        // Keep empty arrays for interests as they are valid
        if (key === 'interests' && Array.isArray(profileData[key]) && profileData[key].length === 0) {
          // Keep empty interests array - it's valid
        }
      });

      const response = await userAPI.updateProfile(profileData);
      
      if (response.success) {
        // Update localStorage with new name
        localStorage.setItem('userName', profile.name);
        localStorage.setItem('userDepartment', profile.department);
        
        setIsEditing(false);
        showSuccessToast('Profile updated successfully!');
      } else {
        // Show specific validation errors if available
        if (response.errors && Array.isArray(response.errors)) {
          response.errors.forEach(error => showErrorToast(error.msg || error.message || error));
        } else {
          showErrorToast(response.message || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Show more specific error messages
      if (error.message && error.message.includes('Validation failed')) {
        showErrorToast('Please check your input fields and try again. Some fields may have invalid data.');
      } else if (error.message && error.message.includes('400')) {
        showErrorToast('Invalid data provided. Please check your input and try again.');
      } else {
        showErrorToast('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = () => {
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences.notifications));
      
      // Apply theme immediately when changed
      applyTheme(preferences.theme);
      
      setLoading(false);
      showSuccessToast('Preferences updated successfully!');
    }, 500);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout(); // Use the auth utility's logout function which handles backend logout and localStorage cleanup
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        console.log('Uploading avatar file:', file);
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          showErrorToast('File size must be less than 5MB');
          return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          showErrorToast('Please select an image file');
          return;
        }
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('avatar', file);
        console.log('FormData created with file:', file.name);

        const response = await userAPI.uploadAvatar(formData);
        console.log('Avatar upload response:', response);
        
        if (response.success) {
          const avatarUrl = response.data?.avatarUrl || response.avatarUrl;
          console.log('Avatar URL:', avatarUrl);
          setProfile(prev => ({ ...prev, avatar: avatarUrl }));
          showSuccessToast('Avatar updated successfully!');
        } else {
          console.error('Avatar upload failed:', response);
          showErrorToast(response.message || 'Failed to upload avatar');
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
        console.error('Error details:', error.message);
        showErrorToast(`Failed to upload avatar: ${error.message}`);
        
        // Fallback to local preview
        const reader = new FileReader();
        reader.onload = (event) => {
          setProfile(prev => ({ ...prev, avatar: event.target.result }));
        };
        reader.readAsDataURL(file);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAvatarUrl = async () => {
    if (!avatarUrl.trim()) {
      showErrorToast('Please enter a valid image URL');
      return;
    }

    try {
      setLoading(true);
      
      // Validate URL format
      try {
        new URL(avatarUrl);
      } catch {
        showErrorToast('Please enter a valid URL');
        return;
      }

      // Save avatar URL to backend
      const response = await userAPI.updateProfile({ avatar: avatarUrl });
      
      if (response.success) {
        // Update local profile state
        setProfile(prev => ({ ...prev, avatar: avatarUrl }));
        showSuccessToast('Avatar updated successfully!');
        setAvatarUrl('');
      } else {
        showErrorToast(response.message || 'Failed to update avatar');
      }
      
    } catch (error) {
      console.error('Error setting avatar URL:', error);
      showErrorToast('Failed to set avatar URL');
    } finally {
      setLoading(false);
    }
  };

  const addInterest = (interest) => {
    if (interest && !profile.interests.includes(interest)) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
      setShowInterestSuggestions(false);
      setInterestQuery('');
    }
  };

  const removeInterest = (index) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const handleInterestSearch = (query) => {
    setInterestQuery(query);
    const suggestions = getInterestSuggestions(query);
    setInterestSuggestions(suggestions);
  };

  const toggleInterestSuggestions = () => {
    setShowInterestSuggestions(!showInterestSuggestions);
    if (!showInterestSuggestions) {
      setInterestSuggestions(getInterestSuggestions(''));
    }
  };

  return (
    <div className="profile-page">
      <Navigation />
      
      {/* Profile Header */}
      <div className="profile-page-header">
        <h1>My Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="avatar-container">
            <img 
              src={profile.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60'} 
              alt="Profile" 
              className="profile-avatar" 
            />
            {isEditing && (
              <div className="avatar-upload-options">
                <div className="upload-method-selector">
                  <button
                    type="button"
                    className={`method-btn ${avatarUploadMethod === 'upload' ? 'active' : ''}`}
                    onClick={() => setAvatarUploadMethod('upload')}
                  >
                    <i className="fas fa-upload"></i> Upload
                  </button>
                  <button
                    type="button"
                    className={`method-btn ${avatarUploadMethod === 'url' ? 'active' : ''}`}
                    onClick={() => setAvatarUploadMethod('url')}
                  >
                    <i className="fas fa-link"></i> URL
                  </button>
                </div>
                
                {avatarUploadMethod === 'upload' ? (
                  <label className="avatar-upload">
                    <input type="file" accept="image/*" onChange={handleAvatarChange} />
                    <i className="fas fa-camera"></i>
                  </label>
                ) : (
                  <div className="avatar-url-input">
                    <input
                      type="url"
                      placeholder="Enter image URL..."
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={handleAvatarUrl}
                      disabled={loading || !avatarUrl.trim()}
                      className="url-submit-btn"
                    >
                      <i className="fas fa-check"></i>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="profile-summary">
            <h2>{profile.name}</h2>
            <p className="profile-role">{profile.department} • {profile.year}</p>
            <p className="profile-reg">{profile.regNumber}</p>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">{registrations.length}</span>
                <span className="stat-label">Events</span>
              </div>
              <div className="stat">
                <span className="stat-number">{activities.filter(a => a.type === 'blog').length}</span>
                <span className="stat-label">Blogs</span>
              </div>
              <div className="stat">
                <span className="stat-number">{activities.filter(a => a.type === 'volunteer').length}</span>
                <span className="stat-label">Volunteer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Information
        </button>
        <button 
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
        <button 
          className={`tab ${activeTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('registrations')}
        >
          Event Registrations
        </button>
        <button 
          className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-tab">
            <div className="tab-header">
              <h3>Personal Information</h3>
              <button 
                className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Registration Number</label>
                  <input
                    type="text"
                    value={profile.regNumber}
                    onChange={(e) => setProfile(prev => ({ ...prev, regNumber: e.target.value }))}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={profile.department}
                    onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                    disabled={!isEditing}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Chemical">Chemical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Year</label>
                  <select
                    value={profile.year}
                    onChange={(e) => setProfile(prev => ({ ...prev, year: e.target.value }))}
                    disabled={!isEditing}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="form-group full-width">
                <label>Interests</label>
                <div className="interests-container">
                  <div className="interests-list">
                    {profile.interests.map((interest, index) => (
                      <span key={index} className="interest-tag">
                        {interest}
                        {isEditing && (
                          <button type="button" onClick={() => removeInterest(index)}>
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="interest-input-section">
                      <button 
                        type="button" 
                        className="add-interest-btn" 
                        onClick={toggleInterestSuggestions}
                      >
                        + Add Interest
                      </button>
                      
                      {showInterestSuggestions && (
                        <div className="interest-suggestions-container">
                          <input
                            type="text"
                            placeholder="Search interests..."
                            value={interestQuery}
                            onChange={(e) => handleInterestSearch(e.target.value)}
                            className="interest-search-input"
                          />
                          <div className="interest-suggestions">
                            {interestSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                className={`interest-suggestion ${
                                  profile.interests.includes(suggestion) ? 'already-selected' : ''
                                }`}
                                onClick={() => addInterest(suggestion)}
                                disabled={profile.interests.includes(suggestion)}
                              >
                                {suggestion}
                                {profile.interests.includes(suggestion) && ' ✓'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {profile.interests.length > 0 && (
                  <p className="interests-help-text">
                    🤖 These interests help our AI recommend personalized events for you!
                  </p>
                )}
              </div>

              {isEditing && (
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </form>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-tab">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {loading ? (
                <div className="loading-message">Loading activity...</div>
              ) : activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'registration' && <i className="fas fa-calendar-plus"></i>}
                      {activity.type === 'event_created' && <i className="fas fa-calendar-plus"></i>}
                      {activity.type === 'feedback' && <i className="fas fa-comment"></i>}
                      {activity.type === 'blog' && <i className="fas fa-pen"></i>}
                      {activity.type === 'volunteer' && <i className="fas fa-hands-helping"></i>}
                    </div>
                    <div className="activity-content">
                      <h4>
                        {activity.type === 'registration' && `Registered for ${activity.event || 'Event'}`}
                        {activity.type === 'event_created' && `Created event: ${activity.event || 'Event'}`}
                        {activity.type === 'feedback' && `Submitted feedback for ${activity.event || 'Event'}`}
                        {activity.type === 'blog' && `Published: ${activity.title || 'Blog Post'}`}
                        {activity.type === 'volunteer' && `Volunteered for ${activity.event || 'Event'}`}
                      </h4>
                      <p>{activity.date ? new Date(activity.date).toLocaleDateString() : 'No date'}</p>
                    </div>
                    <div className={`activity-status ${activity.status || 'unknown'}`}>
                      {activity.status || 'unknown'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="fas fa-history"></i>
                  <h4>No Recent Activity</h4>
                  <p>Start engaging with events and blogs to see your activity here!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="registrations-tab">
            <h3>Event Registrations</h3>
            <div className="registrations-list">
              {loading ? (
                <div className="loading-message">Loading registrations...</div>
              ) : registrations.length > 0 ? (
                registrations.map((registration) => (
                  <div key={registration.id} className="registration-item">
                    <div className="registration-content">
                      <h4>{registration.title || 'Event'}</h4>
                      <p>Date: {registration.date ? new Date(registration.date).toLocaleDateString() : 'No date'}</p>
                      <p>Type: {registration.type || 'participant'}</p>
                    </div>
                    <div className={`registration-status ${registration.status || 'confirmed'}`}>
                      {registration.status || 'confirmed'}
                    </div>
                    <div className="registration-actions">
                      <button 
                        className="btn btn-outline btn-small"
                        onClick={() => navigate(`/events/details/${registration.id}`)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn btn-primary btn-small"
                        onClick={() => navigate(`/events/register/${registration.id}/confirmation`)}
                      >
                        View Confirmation
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="fas fa-calendar-alt"></i>
                  <h4>No Event Registrations</h4>
                  <p>You haven't registered for any events yet. Explore upcoming events!</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/events')}
                  >
                    Browse Events
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="preferences-tab">
            <h3>Account Preferences</h3>
            
            <div className="preferences-info">
              <div className="info-banner">
                <i className="fas fa-info-circle"></i>
                <span>Your preferences are now active! Changes to notifications will filter what you see, and theme changes apply immediately.</span>
              </div>
            </div>
            
            <div className="preferences-section">
              <h4>Notification Preferences</h4>
              <p className="preference-description">Choose which types of notifications you want to receive:</p>
              <div className="preference-group">
                {Object.entries(preferences.notifications).map(([key, value]) => (
                  <label key={key} className="preference-item">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, [key]: e.target.checked }
                      }))}
                    />
                    <span>{key.charAt(0).toUpperCase() + key.slice(1)} Notifications</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="preferences-section">
              <h4>Privacy Settings</h4>
              <p className="preference-description">Control what information is visible to other users:</p>
              <div className="preference-group">
                {Object.entries(preferences.privacy).map(([key, value]) => (
                  <label key={key} className="preference-item">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, [key]: e.target.checked }
                      }))}
                    />
                    <span>Show {key.replace('show', '').toLowerCase()} publicly</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="preferences-section">
              <h4>App Settings</h4>
              <p className="preference-description">Customize your app experience:</p>
              <div className="preference-group">
                <div className="preference-item">
                  <label>Theme:</label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => {
                      const newTheme = e.target.value;
                      setPreferences(prev => ({ ...prev, theme: newTheme }));
                      // Apply theme immediately for preview
                      applyTheme(newTheme);
                    }}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>
                <div className="preference-item">
                  <label>Language:</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              className="btn btn-primary"
              onClick={handlePreferencesUpdate}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;