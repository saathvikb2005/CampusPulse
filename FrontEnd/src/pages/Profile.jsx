import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import { getCurrentUser, isAuthenticated, logout } from '../utils/auth';
import { userAPI, eventAPI, blogAPI } from '../services/api';
import './Profile.css';

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
      
      // Load profile data from backend API
      const profileResponse = await userAPI.getProfile();
      if (profileResponse.success && profileResponse.data?.user) {
        const userData = profileResponse.data.user;
        setProfile({
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          regNumber: userData.studentId || '',
          department: userData.department || '',
          year: userData.year || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          interests: userData.interests || [],
          avatar: userData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60'
        });

        // Load user preferences (from localStorage for now, can be moved to API later)
        const savedPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        setPreferences(prev => ({ ...prev, ...savedPreferences }));
      }

      // Load user's registered events
      const registeredEventsResponse = await eventAPI.getUserRegistered();
      if (registeredEventsResponse.success) {
        const events = registeredEventsResponse.data?.events || registeredEventsResponse.events || [];
        const eventRegistrations = events.map(event => ({
          id: event._id,
          title: event.title,
          date: event.startDate,
          status: 'confirmed',
          type: 'participant'
        }));
        setRegistrations(eventRegistrations);
      }

      // Load user's created events and blogs for activity
      const createdEventsResponse = await eventAPI.getUserCreated();
      const userBlogsResponse = await blogAPI.getUserBlogs(getCurrentUser()?.id);
      
      const activities = [];
      
      // Add event registrations to activity
      if (registeredEventsResponse.success) {
        const registeredEvents = registeredEventsResponse.data?.events || registeredEventsResponse.events || [];
        registeredEvents.forEach(event => {
          activities.push({
            type: 'registration',
            event: event.title,
            date: event.createdAt || event.startDate,
            status: 'registered'
          });
        });
      }

      // Add created events to activity
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

      // Add user blogs to activity
      if (userBlogsResponse.success) {
        const blogs = userBlogsResponse.data?.blogs || userBlogsResponse.blogs || [];
        blogs.forEach(blog => {
          activities.push({
            type: 'blog',
            title: blog.title,
            date: blog.createdAt,
            status: blog.published ? 'published' : 'draft'
          });
        });
      }

      // Sort activities by date (newest first)
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      setActivities(activities);

    } catch (error) {
      console.error('Error loading user data:', error);
      showErrorToast('Failed to load profile data');
      
      // Fallback to current user data from localStorage
      const currentUser = getCurrentUser();
      if (currentUser) {
        setProfile({
          name: currentUser.name || 'User',
          email: currentUser.email,
          regNumber: '',
          department: currentUser.department || '',
          year: '',
          phone: '',
          bio: '',
          interests: [],
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60'
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

      const profileData = {
        firstName: firstName || '',
        lastName: lastName || '',
        email: profile.email,
        studentId: profile.regNumber, // Map regNumber to studentId for backend
        department: profile.department,
        year: profile.year,
        phone: profile.phone,
        bio: profile.bio,
        interests: profile.interests
      };

      const response = await userAPI.updateProfile(profileData);
      
      if (response.success) {
        // Update localStorage with new name
        localStorage.setItem('userName', profile.name);
        localStorage.setItem('userDepartment', profile.department);
        
        setIsEditing(false);
        showSuccessToast('Profile updated successfully!');
      } else {
        showErrorToast(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showErrorToast('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = () => {
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences.notifications));
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
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await userAPI.uploadAvatar(formData);
        
        if (response.success) {
          setProfile(prev => ({ ...prev, avatar: response.avatarUrl }));
          showSuccessToast('Avatar updated successfully!');
        } else {
          showErrorToast(response.message || 'Failed to upload avatar');
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
        showErrorToast('Failed to upload avatar. Please try again.');
        
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

  const addInterest = () => {
    const interest = prompt('Enter a new interest:');
    if (interest && !profile.interests.includes(interest)) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

  const removeInterest = (index) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
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
            <img src={profile.avatar} alt="Profile" className="profile-avatar" />
            {isEditing && (
              <label className="avatar-upload">
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
                <i className="fas fa-camera"></i>
              </label>
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
                    <button type="button" className="add-interest-btn" onClick={addInterest}>
                      + Add Interest
                    </button>
                  )}
                </div>
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
              {activities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'registration' && <i className="fas fa-calendar-plus"></i>}
                    {activity.type === 'feedback' && <i className="fas fa-comment"></i>}
                    {activity.type === 'blog' && <i className="fas fa-pen"></i>}
                    {activity.type === 'volunteer' && <i className="fas fa-hands-helping"></i>}
                  </div>
                  <div className="activity-content">
                    <h4>
                      {activity.type === 'registration' && `Registered for ${activity.event}`}
                      {activity.type === 'feedback' && `Submitted feedback for ${activity.event}`}
                      {activity.type === 'blog' && `Published: ${activity.title}`}
                      {activity.type === 'volunteer' && `Volunteered for ${activity.event}`}
                    </h4>
                    <p>{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`activity-status ${activity.status}`}>
                    {activity.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="registrations-tab">
            <h3>Event Registrations</h3>
            <div className="registrations-list">
              {registrations.map((registration) => (
                <div key={registration.id} className="registration-item">
                  <div className="registration-content">
                    <h4>{registration.title}</h4>
                    <p>Date: {new Date(registration.date).toLocaleDateString()}</p>
                    <p>Type: {registration.type}</p>
                  </div>
                  <div className={`registration-status ${registration.status}`}>
                    {registration.status}
                  </div>
                  <button 
                    className="btn btn-outline btn-small"
                    onClick={() => navigate(`/events/details/${registration.id}`)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="preferences-tab">
            <h3>Account Preferences</h3>
            
            <div className="preferences-section">
              <h4>Notification Preferences</h4>
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
              <div className="preference-group">
                <div className="preference-item">
                  <label>Theme:</label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
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