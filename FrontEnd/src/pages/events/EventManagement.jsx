import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import { getCurrentUser, canManageEvents } from '../../utils/auth';
import { eventAPI } from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import './EventManagement.css';

const EventManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  const [editingEvent, setEditingEvent] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showVolunteers, setShowVolunteers] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: 'academic',
    type: 'individual',
    date: '',
    time: '',
    endTime: '',
    location: '',
    maxParticipants: '',
    volunteerSpots: '',
    prerequisites: [''],
    agenda: [''],
    tags: [''],
    registrationDeadline: '',
    teamSize: { min: 2, max: 5 },
    image: '',
    youtubeStreamUrl: '',
    streamTitle: '',
    enableLiveStream: false,
    isFreeEvent: true,
    registrationFee: 0
  });
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploadMethod, setImageUploadMethod] = useState('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [participants, setParticipants] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !canManageEvents()) {
      navigate('/home');
      return;
    }
    setUser(currentUser);
    loadUserEvents();

    // Check for edit parameter in URL
    const searchParams = new URLSearchParams(location.search);
    const editEventId = searchParams.get('edit');
    if (editEventId) {
      loadEventForEdit(editEventId);
    }
  }, [navigate, location.search]);

  const loadUserEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getUserCreated();
      console.log('getUserCreated response:', response); // Debug log
      
      if (response.success && response.data) {
        // Backend returns data.events, not data as array
        const eventsData = response.data.events || [];
        
        if (eventsData.length === 0) {
          console.log('No events found for user');
          setEvents([]);
          return;
        }
        
        const userEvents = eventsData.map(event => {
          // Create a combined datetime for status calculation
          const eventDateTime = event.date && event.startTime ? 
            new Date(`${event.date}T${event.startTime}`) : null;
          const endDateTime = event.date && event.endTime ? 
            new Date(`${event.date}T${event.endTime}`) : null;
            
          return {
            id: event._id,
            title: event.title,
            date: eventDateTime, // Combined datetime for display/status
            status: getEventStatus(eventDateTime, endDateTime),
            registrations: event.registrations?.length || 0,
            volunteers: event.volunteers?.length || 0,
            type: event.isTeamEvent ? 'team' : 'individual',
            category: event.category || 'technical',
            description: event.description,
            location: event.venue, // Map venue to location for display
            maxParticipants: event.maxParticipants,
            organizer: event.organizer?.name || getCurrentUser()?.name,
            // Keep original backend fields for editing
            originalDate: event.date, // Keep the original date string
            venue: event.venue,
            isTeamEvent: event.isTeamEvent,
            startTime: event.startTime,
            endTime: event.endTime,
            images: event.images,
            prerequisites: event.prerequisites,
            agenda: event.agenda,
            tags: event.tags,
            registrationDeadline: event.registrationDeadline
          };
        });
        setEvents(userEvents);
      } else {
        console.log('API response not successful or no data:', response);
        showErrorToast('Failed to load your events');
        setEvents([]);
      }
    } catch (error) {
      console.error('Error loading user events:', error);
      showErrorToast('Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (startDate, endDate) => {
    try {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Check for invalid dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 'unknown';
      }

      if (now < start) return 'upcoming';
      if (now >= start && now <= end) return 'live';
      return 'ended';
    } catch (error) {
      console.error('Error calculating event status:', error);
      return 'unknown';
    }
  };

  const loadEventForEdit = async (eventId) => {
    try {
      setLoading(true);
      const response = await eventAPI.getById(eventId);
      
      if (response.success) {
        const event = response.data?.event || response.event;
        if (event) {
          console.log('Event data for editing:', event); // Debug log
          
          // Safely convert dates with validation
          const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
          };
          
          const formatTimeForInput = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? '' : date.toTimeString().slice(0, 5);
          };
          
          setEventForm({
            title: event.title || '',
            description: event.description || '',
            category: event.category || 'academic',
            type: event.isTeamEvent ? 'team' : 'individual', // Convert boolean back to type
            date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
            time: event.startTime || '',
            endTime: event.endTime || '',
            location: event.venue || '',
            maxParticipants: event.maxParticipants || '',
            volunteerSpots: event.volunteerSpots || '',
            prerequisites: event.prerequisites || [''],
            agenda: event.agenda || [''],
            tags: event.tags || [''],
            registrationDeadline: formatDateForInput(event.registrationDeadline),
            teamSize: event.teamSize || { min: 2, max: 5 },
            image: event.images && event.images[0] ? event.images[0].url : '',
            youtubeStreamUrl: event.youtubeStreamUrl || '',
            streamTitle: event.streamTitle || '',
            enableLiveStream: event.enableLiveStream || false,
            isFreeEvent: event.isFreeEvent !== undefined ? event.isFreeEvent : true,
            registrationFee: event.registrationFee || 0
          });
          
          setEditingEvent(event);
          setActiveTab('create'); // Switch to form tab
          showSuccessToast('Event loaded for editing');
        }
      } else {
        showErrorToast('Failed to load event for editing');
      }
    } catch (error) {
      console.error('Error loading event for edit:', error);
      showErrorToast('Failed to load event for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEventForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEventForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setEventForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setEventForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setEventForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showErrorToast('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        showErrorToast('Image file size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageUrl('');
    setEventForm(prev => ({ ...prev, image: '' }));
  };

  const handleImageUrl = () => {
    if (!imageUrl.trim()) {
      showErrorToast('Please enter a valid image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      showErrorToast('Please enter a valid URL');
      return;
    }

    // Set the URL as preview and form data
    setImagePreview(imageUrl);
    setSelectedImage(null); // Clear any selected file
    setEventForm(prev => ({ ...prev, image: imageUrl }));
    showSuccessToast('Image URL added successfully');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      // Validate form
      if (!eventForm.title || !eventForm.description || !eventForm.date || !eventForm.time || !eventForm.endTime || !eventForm.location) {
        showErrorToast('Please fill in all required fields (title, description, date, start time, end time, and location)');
        return;
      }

      // Validate time logic
      if (eventForm.time >= eventForm.endTime) {
        showErrorToast('End time must be after start time');
        return;
      }

      let imageUrl = eventForm.image;

      // Handle image upload if a file is selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
          const uploadResponse = await eventAPI.uploadImage(formData);
          if (uploadResponse.success) {
            imageUrl = uploadResponse.data.url; // Backend returns 'url' not 'imageUrl'
          } else {
            showErrorToast('Failed to upload image');
            return;
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          showErrorToast('Failed to upload image');
          return;
        }
      }

      // Create event object for API
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        category: eventForm.category,
        date: new Date(eventForm.date + 'T00:00:00'), // Ensure proper date format without timezone issues
        startTime: eventForm.time, // Time in HH:MM format
        endTime: eventForm.endTime, // Time in HH:MM format
        venue: eventForm.location, // venue field instead of location
        maxParticipants: parseInt(eventForm.maxParticipants) || null,
        registrationDeadline: eventForm.registrationDeadline ? new Date(`${eventForm.registrationDeadline}T23:59:59.000Z`) : null,
        isTeamEvent: eventForm.type === 'team', // Backend expects 'isTeamEvent' boolean
        images: imageUrl ? [{ url: imageUrl, caption: eventForm.title }] : [],
        isFreeEvent: eventForm.isFreeEvent,
        registrationFee: eventForm.isFreeEvent ? 0 : (parseFloat(eventForm.registrationFee) || 0)
      };

      // Add streaming fields if live stream is enabled
      if (eventForm.enableLiveStream && eventForm.youtubeStreamUrl) {
        eventData.streamingUrl = eventForm.youtubeStreamUrl;
        eventData.liveStreamUrl = eventForm.youtubeStreamUrl; // For PresentEvents compatibility
        eventData.liveStream = {
          isLive: true,
          streamUrl: eventForm.youtubeStreamUrl,
          streamTitle: eventForm.streamTitle || eventForm.title
        };
      }

      // Only include optional fields if they have values
      if (eventForm.prerequisites && eventForm.prerequisites.length > 0) {
        eventData.prerequisites = eventForm.prerequisites.filter(p => p.trim());
      }
      if (eventForm.agenda && eventForm.agenda.length > 0) {
        eventData.agenda = eventForm.agenda.filter(a => a.trim());
      }
      if (eventForm.tags && eventForm.tags.length > 0) {
        eventData.tags = eventForm.tags.filter(t => t.trim());
      }

      const response = await eventAPI.create(eventData);
      
      if (response.success) {
        showSuccessToast('Event created successfully!');
        
        // Reset form and image
        setEventForm({
          title: '',
          description: '',
          category: 'academic',
          type: 'individual',
          date: '',
          time: '',
          endTime: '',
          location: '',
          maxParticipants: '',
          volunteerSpots: '',
          prerequisites: [''],
          agenda: [''],
          tags: [''],
          registrationDeadline: '',
          teamSize: { min: 2, max: 5 },
          image: '',
          youtubeStreamUrl: '',
          streamTitle: '',
          enableLiveStream: false,
          isFreeEvent: true,
          registrationFee: 0
        });

        // Reset image upload
        setSelectedImage(null);
        setImagePreview(null);

        // Refresh events list
        loadUserEvents();
        setActiveTab('manage');
      } else {
        showErrorToast(response.message || 'Failed to create event');
      }

    } catch (error) {
      console.error('Error creating event:', error);
      
      // Handle validation errors specifically
      if (error.response && error.response.errors) {
        const validationErrors = Object.values(error.response.errors).flat().join(', ');
        showErrorToast(`Validation failed: ${validationErrors}`);
      } else if (error.message) {
        showErrorToast(error.message);
      } else {
        showErrorToast('Failed to create event. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const exportRegistrations = async (eventId) => {
    try {
      const response = await eventAPI.getRegistrations(eventId);
      
      if (response.success && response.data) {
        const registrations = response.data.registrations || response.data;
        const registrationData = [
          ['Name', 'Email', 'Phone', 'Department', 'Registration Date', 'Type']
        ];
        
        registrations.forEach(reg => {
          registrationData.push([
            reg.name || reg.user?.name || 'N/A',
            reg.email || reg.user?.email || 'N/A',
            reg.phone || reg.user?.phone || 'N/A',
            reg.department || reg.user?.department || 'N/A',
            new Date(reg.createdAt || reg.registrationDate).toLocaleDateString(),
            'Participant'
          ]);
        });

        const csvContent = registrationData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `event_${eventId}_registrations.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        showSuccessToast('Registration data exported successfully!');
      } else {
        showErrorToast('No registration data found');
      }
    } catch (error) {
      console.error('Export error:', error);
      showErrorToast('Failed to export registration data');
    }
  };

  const exportVolunteers = async (eventId) => {
    try {
      // If we already have volunteers data, use it; otherwise fetch it
      let volunteersToExport = volunteers;
      
      if (!volunteersToExport || volunteersToExport.length === 0 || selectedEvent !== eventId) {
        const response = await eventAPI.getVolunteerRegistrations(eventId);
        if (response.success && response.data) {
          volunteersToExport = response.data;
        } else {
          showErrorToast('Failed to fetch volunteer data for export');
          return;
        }
      }

      if (volunteersToExport.length === 0) {
        showErrorToast('No volunteer data to export');
        return;
      }

      // Create CSV headers
      const headers = ['Name', 'Email', 'Phone', 'University', 'Skills/Experience', 'Registration Date', 'Status'];
      
      // Convert volunteer data to CSV rows
      const csvRows = volunteersToExport.map(volunteer => [
        volunteer.fullName || `${volunteer.firstName || ''} ${volunteer.lastName || ''}`.trim(),
        volunteer.email || '',
        volunteer.phone || '',
        volunteer.university || '',
        volunteer.skills || volunteer.experience || '',
        volunteer.registeredAt ? new Date(volunteer.registeredAt).toLocaleDateString() : 
        volunteer.createdAt ? new Date(volunteer.createdAt).toLocaleDateString() : '',
        volunteer.status || 'Registered'
      ]);

      // Combine headers and data
      const csvContent = [headers, ...csvRows].map(row => 
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event_${eventId}_volunteers.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      showSuccessToast('Volunteer data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      showErrorToast('Failed to export volunteer data');
    }
  };

  const handleEditEvent = (event) => {
    console.log('Editing event:', event); // Debug log
    setEditingEvent(event);
    
    // Use the same date formatting functions as loadEventForEdit
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    };
    
    const formData = {
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'technical',
      type: event.isTeamEvent ? 'team' : 'individual', // Convert boolean back to type
      date: event.originalDate ? new Date(event.originalDate).toISOString().split('T')[0] : '',
      time: event.startTime || '',
      endTime: event.endTime || '',
      location: event.venue || '',
      maxParticipants: event.maxParticipants || '',
      volunteerSpots: event.volunteerSpots || '',
      prerequisites: event.prerequisites || [''],
      agenda: event.agenda || [''],
      tags: event.tags || [''],
      registrationDeadline: formatDateForInput(event.registrationDeadline),
      teamSize: event.teamSize || { min: 2, max: 5 },
      image: event.images && event.images[0] ? event.images[0].url : '',
      youtubeStreamUrl: event.liveStreamUrl || event.youtubeStreamUrl || '',
      streamTitle: event.streamTitle || '',
      enableLiveStream: !!event.liveStreamUrl || event.enableLiveStream || false,
      isFreeEvent: event.isFreeEvent !== undefined ? event.isFreeEvent : true,
      registrationFee: event.registrationFee || 0
    };
    
    console.log('Setting form data:', formData); // Debug log
    setEventForm(formData);
    setActiveTab('edit');
  };

  const handleUpdateEvent = async () => {
    // Validate form
    if (!eventForm.title || !eventForm.description || !eventForm.date || !eventForm.time || !eventForm.endTime || !eventForm.location) {
      showErrorToast('Please fill in all required fields (title, description, date, start time, end time, and location)');
      return;
    }

    // Validate time logic
    if (eventForm.time >= eventForm.endTime) {
      showErrorToast('End time must be after start time');
      return;
    }

    try {
      setLoading(true);
      
      let imageUrl = eventForm.image;

      // Handle image upload if a new file is selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
          const uploadResponse = await eventAPI.uploadImage(formData);
          if (uploadResponse.success) {
            imageUrl = uploadResponse.data.url; // Backend returns 'url'
          } else {
            showErrorToast('Failed to upload image');
            return;
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          showErrorToast('Failed to upload image');
          return;
        }
      }

      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        category: eventForm.category,
        date: new Date(eventForm.date + 'T00:00:00'), // Ensure proper date format without timezone issues
        startTime: eventForm.time, // Backend expects 'startTime' not combined datetime
        endTime: eventForm.endTime, // Backend expects 'endTime' 
        venue: eventForm.location, // Backend expects 'venue' not 'location'
        maxParticipants: parseInt(eventForm.maxParticipants) || null,
        registrationDeadline: eventForm.registrationDeadline ? new Date(`${eventForm.registrationDeadline}T23:59:59.000Z`) : null,
        isTeamEvent: eventForm.type === 'team', // Backend expects 'isTeamEvent' boolean
        images: imageUrl ? [{ url: imageUrl, caption: eventForm.title }] : undefined,
        isFreeEvent: eventForm.isFreeEvent,
        registrationFee: eventForm.isFreeEvent ? 0 : (parseFloat(eventForm.registrationFee) || 0)
      };

      // Add streaming fields if live stream is enabled
      if (eventForm.enableLiveStream && eventForm.youtubeStreamUrl) {
        eventData.streamingUrl = eventForm.youtubeStreamUrl;
        eventData.liveStreamUrl = eventForm.youtubeStreamUrl; // For PresentEvents compatibility
        eventData.liveStream = {
          isLive: true,
          streamUrl: eventForm.youtubeStreamUrl,
          streamTitle: eventForm.streamTitle || eventForm.title
        };
      }

      // Only include prerequisites, agenda, tags if the backend model supports them
      if (eventForm.prerequisites && eventForm.prerequisites.length > 0) {
        eventData.prerequisites = eventForm.prerequisites.filter(p => p.trim());
      }
      if (eventForm.agenda && eventForm.agenda.length > 0) {
        eventData.agenda = eventForm.agenda.filter(a => a.trim());
      }
      if (eventForm.tags && eventForm.tags.length > 0) {
        eventData.tags = eventForm.tags.filter(t => t.trim());
      }

      console.log('Sending event update data:', eventData); // Debug log
      console.log('Event ID:', editingEvent.id); // Debug log

      const response = await eventAPI.update(editingEvent.id, eventData);
      
      if (response.success) {
        showSuccessToast(`Event "${eventForm.title}" updated successfully!`);
        
        // Update the form with the new image URL if uploaded
        if (selectedImage && imageUrl) {
          setEventForm(prev => ({ ...prev, image: imageUrl }));
        }
        
        // Clear only the selected image, keep form data for further editing
        setSelectedImage(null);
        setImagePreview(null);
        
        // Refresh events list to show updated data
        loadUserEvents();
        
        // Don't switch tabs or clear form - keep user in edit mode
        showSuccessToast('Event updated! You can continue editing or switch to manage tab.');
      } else {
        showErrorToast(response.message || 'Failed to update event');
      }

    } catch (error) {
      console.error('Error updating event:', error);
      console.error('Error details:', error.response); // Additional debug info
      
      // Handle validation errors specifically
      if (error.response && error.response.errors) {
        console.error('Validation errors:', error.response.errors);
        
        // Log each error individually for better debugging
        error.response.errors.forEach((err, index) => {
          console.error(`Validation error ${index + 1}:`, err);
        });
        
        // Since errors is an array, let's properly extract the messages
        const validationErrors = error.response.errors.map(err => {
          if (typeof err === 'string') {
            return err;
          } else if (err.message || err.msg) {
            return `${err.path || 'Field'}: ${err.message || err.msg}`;
          } else {
            return JSON.stringify(err);
          }
        }).join(', ');
        
        showErrorToast(`Validation failed: ${validationErrors}`);
      } else if (error.message) {
        showErrorToast(error.message);
      } else {
        showErrorToast('Failed to update event. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        setLoading(true);
        const response = await eventAPI.delete(eventId);
        
        if (response.success) {
          showSuccessToast('Event deleted successfully!');
          // Refresh events list
          loadUserEvents();
        } else {
          showErrorToast(response.message || 'Failed to delete event');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        showErrorToast('Failed to delete event. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const viewParticipants = async (eventId) => {
    setSelectedEvent(eventId);
    setLoadingParticipants(true);
    try {
      const response = await eventAPI.getRegistrations(eventId);
      if (response.success && response.data) {
        const registrations = response.data.registrations || response.data;
        setParticipants(registrations);
      } else {
        setParticipants([]);
        showErrorToast('Failed to fetch participants');
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      setParticipants([]);
      showErrorToast('Failed to fetch participants');
    } finally {
      setLoadingParticipants(false);
      setShowParticipants(true);
      // Prevent body scroll when modal opens
      document.body.classList.add('modal-open');
    }
  };

  const viewVolunteers = async (eventId) => {
    setSelectedEvent(eventId);
    setLoadingVolunteers(true);
    try {
      const response = await eventAPI.getVolunteerRegistrations(eventId);
      if (response.success && response.data) {
        setVolunteers(response.data);
      } else {
        setVolunteers([]);
        showErrorToast('Failed to fetch volunteers');
      }
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      setVolunteers([]);
      showErrorToast('Failed to fetch volunteers');
    } finally {
      setLoadingVolunteers(false);
      setShowVolunteers(true);
      // Prevent body scroll when modal opens
      document.body.classList.add('modal-open');
    }
  };

  // Helper functions to manage modal state and body scroll
  const closeParticipantsModal = () => {
    setShowParticipants(false);
    document.body.classList.remove('modal-open');
  };

  const closeVolunteersModal = () => {
    setShowVolunteers(false);
    document.body.classList.remove('modal-open');
  };

  // Handle ESC key press to close modals
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.keyCode === 27) { // ESC key
        if (showParticipants) {
          closeParticipantsModal();
        } else if (showVolunteers) {
          closeVolunteersModal();
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    // Cleanup function to ensure body scroll is restored
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.classList.remove('modal-open');
    };
  }, [showParticipants, showVolunteers]);

  if (!user) {
    return (
      <div className="event-management-page">
        <Navigation />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-management-page">
      <Navigation />
      
      <div className="event-management-header">
        <div className="container">
          <h1>Event Management</h1>
          <p>Create and manage events for the campus community</p>
        </div>
      </div>

      <div className="event-management-content">
        <div className="container">
          <div className="management-tabs">
            <button 
              className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <i className="fas fa-plus"></i>
              Create Event
            </button>
            <button 
              className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              <i className="fas fa-list"></i>
              Manage Events
            </button>
            {editingEvent && (
              <button 
                className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
                onClick={() => setActiveTab('edit')}
              >
                <i className="fas fa-edit"></i>
                Edit: {editingEvent.title}
              </button>
            )}
          </div>

          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Processing...</p>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="create-event-section">
              <form onSubmit={handleSubmit} className="event-form">
                <div className="form-section">
                  <h3>Basic Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={eventForm.title}
                        onChange={handleInputChange}
                        placeholder="Enter event title"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        name="category"
                        value={eventForm.category}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      >
                        <option value="academic">Academic</option>
                        <option value="cultural">Cultural</option>
                        <option value="sports">Sports</option>
                        <option value="workshop">Workshop</option>
                        <option value="seminar">Seminar</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Type *</label>
                      <select
                        name="type"
                        value={eventForm.type}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      >
                        <option value="individual">Individual Event</option>
                        <option value="team">Team Event</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Location *</label>
                      <input
                        type="text"
                        name="location"
                        value={eventForm.location}
                        onChange={handleInputChange}
                        placeholder="Event venue"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {eventForm.type === 'team' && (
                    <div className="form-row">
                      <div className="form-group">
                        <label>Minimum Team Size</label>
                        <input
                          type="number"
                          name="teamSize.min"
                          value={eventForm.teamSize.min}
                          onChange={handleInputChange}
                          min="2"
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label>Maximum Team Size</label>
                        <input
                          type="number"
                          name="teamSize.max"
                          value={eventForm.teamSize.max}
                          onChange={handleInputChange}
                          min="2"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      name="description"
                      value={eventForm.description}
                      onChange={handleInputChange}
                      placeholder="Event description"
                      rows="4"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Schedule & Capacity</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={eventForm.date}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Registration Deadline *</label>
                      <input
                        type="date"
                        name="registrationDeadline"
                        value={eventForm.registrationDeadline}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Time *</label>
                      <input
                        type="time"
                        name="time"
                        value={eventForm.time}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Time *</label>
                      <input
                        type="time"
                        name="endTime"
                        value={eventForm.endTime}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Max Participants *</label>
                      <input
                        type="number"
                        name="maxParticipants"
                        value={eventForm.maxParticipants}
                        onChange={handleInputChange}
                        placeholder={eventForm.type === 'team' ? 'Number of teams' : 'Number of participants'}
                        min="1"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Volunteer Spots</label>
                      <input
                        type="number"
                        name="volunteerSpots"
                        value={eventForm.volunteerSpots}
                        onChange={handleInputChange}
                        placeholder="Number of volunteers needed"
                        min="0"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section registration-settings-section">
                  <h3>💰 Registration Settings</h3>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={eventForm.isFreeEvent}
                        onChange={(e) => setEventForm({
                          ...eventForm, 
                          isFreeEvent: e.target.checked,
                          registrationFee: e.target.checked ? 0 : eventForm.registrationFee
                        })}
                        disabled={loading}
                      />
                      Free Event (No Registration Fee)
                    </label>
                  </div>

                  {!eventForm.isFreeEvent && (
                    <div className="form-group">
                      <label>Registration Fee *</label>
                      <div className="fee-input-group">
                        <span className="currency-symbol">₹</span>
                        <input
                          type="number"
                          name="registrationFee"
                          value={eventForm.registrationFee}
                          onChange={handleInputChange}
                          placeholder="Enter registration fee"
                          min="0"
                          step="0.01"
                          required={!eventForm.isFreeEvent}
                          disabled={loading}
                        />
                      </div>
                      <small className="form-help">
                        Set the registration fee for this event. Leave as 0 for free events.
                      </small>
                    </div>
                  )}
                </div>

                <div className="form-section live-stream-section">
                  <h3>🔴 Live Stream Settings</h3>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={eventForm.enableLiveStream}
                        onChange={(e) => setEventForm({...eventForm, enableLiveStream: e.target.checked})}
                        disabled={loading}
                      />
                      Enable Live Stream for this event
                    </label>
                  </div>

                  {eventForm.enableLiveStream && (
                    <>
                      <div className="form-group">
                        <label>YouTube Stream URL *</label>
                        <input
                          type="url"
                          name="youtubeStreamUrl"
                          value={eventForm.youtubeStreamUrl}
                          onChange={handleInputChange}
                          placeholder="https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID"
                          required={eventForm.enableLiveStream}
                          disabled={loading}
                        />
                        <small className="form-help">
                          Enter the YouTube video URL for live streaming. You can update this anytime before or during the event.
                        </small>
                      </div>

                      <div className="form-group">
                        <label>Stream Title</label>
                        <input
                          type="text"
                          name="streamTitle"
                          value={eventForm.streamTitle}
                          onChange={handleInputChange}
                          placeholder="e.g., 🔴 LIVE: Annual Tech Conference 2025"
                          disabled={loading}
                        />
                        <small className="form-help">
                          Custom title for the live stream (optional). If not provided, will use event title.
                        </small>
                      </div>

                      <div className="stream-preview">
                        <h4>Stream Preview</h4>
                        <p>Participants will see:</p>
                        <div className="preview-box">
                          <strong>{eventForm.streamTitle || `🔴 LIVE: ${eventForm.title}`}</strong>
                          <br />
                          <small>Live stream will be available during the event</small>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="form-section">
                  <h3>Additional Details</h3>
                  
                  <div className="form-group">
                    <label>Prerequisites</label>
                    {eventForm.prerequisites.map((prereq, index) => (
                      <div key={index} className="array-input">
                        <input
                          type="text"
                          value={prereq}
                          onChange={(e) => handleArrayChange('prerequisites', index, e.target.value)}
                          placeholder="Enter prerequisite"
                          disabled={loading}
                        />
                        {eventForm.prerequisites.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('prerequisites', index)}
                            className="remove-btn"
                            disabled={loading}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('prerequisites')}
                      className="add-btn"
                      disabled={loading}
                    >
                      <i className="fas fa-plus"></i> Add Prerequisite
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Agenda</label>
                    {eventForm.agenda.map((item, index) => (
                      <div key={index} className="array-input">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleArrayChange('agenda', index, e.target.value)}
                          placeholder="Enter agenda item"
                          disabled={loading}
                        />
                        {eventForm.agenda.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('agenda', index)}
                            className="remove-btn"
                            disabled={loading}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('agenda')}
                      className="add-btn"
                      disabled={loading}
                    >
                      <i className="fas fa-plus"></i> Add Agenda Item
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Tags</label>
                    {eventForm.tags.map((tag, index) => (
                      <div key={index} className="array-input">
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                          placeholder="Enter tag"
                          disabled={loading}
                        />
                        {eventForm.tags.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('tags', index)}
                            className="remove-btn"
                            disabled={loading}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('tags')}
                      className="add-btn"
                      disabled={loading}
                    >
                      <i className="fas fa-plus"></i> Add Tag
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Event Image</label>
                    <div className="image-upload-section">
                      <div className="image-upload-options">
                        <div className="upload-method-selector">
                          <button
                            type="button"
                            className={`method-btn ${imageUploadMethod === 'upload' ? 'active' : ''}`}
                            onClick={() => setImageUploadMethod('upload')}
                          >
                            <i className="fas fa-upload"></i> Upload File
                          </button>
                          <button
                            type="button"
                            className={`method-btn ${imageUploadMethod === 'url' ? 'active' : ''}`}
                            onClick={() => setImageUploadMethod('url')}
                          >
                            <i className="fas fa-link"></i> Use URL
                          </button>
                        </div>

                        {imageUploadMethod === 'upload' ? (
                          imagePreview ? (
                            <div className="image-preview">
                              <img src={imagePreview} alt="Event preview" className="preview-img" />
                              <button type="button" onClick={removeImage} className="remove-image-btn">
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="image-upload-area">
                              <input
                                type="file"
                                id="eventImage"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={loading}
                                style={{ display: 'none' }}
                              />
                              <label htmlFor="eventImage" className="upload-label">
                                <i className="fas fa-cloud-upload-alt"></i>
                                <span>Click to upload event image</span>
                                <small>Supports: JPEG, PNG, GIF, WebP (Max 5MB)</small>
                              </label>
                            </div>
                          )
                        ) : (
                          <div className="url-input-section">
                            {imagePreview ? (
                              <div className="image-preview">
                                <img src={imagePreview} alt="Event preview" className="preview-img" />
                                <button type="button" onClick={removeImage} className="remove-image-btn">
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            ) : (
                              <>
                                <input
                                  type="url"
                                  placeholder="Enter image URL..."
                                  value={imageUrl}
                                  onChange={(e) => setImageUrl(e.target.value)}
                                  className="url-input"
                                  disabled={loading}
                                />
                                <button
                                  type="button"
                                  onClick={handleImageUrl}
                                  className="url-submit-btn"
                                  disabled={loading || !imageUrl.trim()}
                                >
                                  <i className="fas fa-check"></i> Add Image
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    <i className="fas fa-plus"></i>
                    {loading ? 'Creating Event...' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="manage-events-section">
              <h3>Your Events</h3>
              
              {events.length > 0 ? (
                <div className="events-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Event Name</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Registrations</th>
                        <th>Volunteers</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(event => (
                        <tr key={event.id}>
                          <td>{event.title}</td>
                          <td>{new Date(event.date).toLocaleDateString()}</td>
                          <td>
                            <span className={`event-type ${event.type}`}>
                              {event.type}
                            </span>
                          </td>
                          <td>{event.registrations}</td>
                          <td>{event.volunteers}</td>
                          <td>
                            <span className={`status ${event.status}`}>
                              {event.status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => exportRegistrations(event.id)}
                                title="Export Registrations"
                                disabled={loading}
                              >
                                <i className="fas fa-download"></i>
                                Export
                              </button>
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => viewParticipants(event.id)}
                                title="View Participants"
                                disabled={loading}
                              >
                                <i className="fas fa-users"></i>
                                Participants
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => viewVolunteers(event.id)}
                                title="View Volunteers"
                                disabled={loading}
                              >
                                <i className="fas fa-hands-helping"></i>
                                Volunteers
                              </button>
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => handleEditEvent(event)}
                                title="Edit Event"
                                disabled={loading}
                              >
                                <i className="fas fa-edit"></i>
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteEvent(event.id)}
                                title="Delete Event"
                                disabled={loading}
                              >
                                <i className="fas fa-trash"></i>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-events">
                  <i className="fas fa-calendar-plus"></i>
                  <h4>No events created yet</h4>
                  <p>Create your first event to get started</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab('create')}
                    disabled={loading}
                  >
                    Create Event
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'edit' && editingEvent && (
            <div className="edit-event-section">
              <div className="section-header">
                <h3>Edit Event: {editingEvent.title}</h3>
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setActiveTab('manage');
                    setEditingEvent(null);
                  }}
                  disabled={loading}
                >
                  Cancel Edit
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdateEvent(); }} className="event-form">
                <div className="form-section">
                  <h4>Basic Information</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        name="category"
                        value={eventForm.category}
                        onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                        disabled={loading}
                      >
                        <option value="academic">Academic</option>
                        <option value="cultural">Cultural</option>
                        <option value="sports">Sports</option>
                        <option value="workshop">Workshop</option>
                        <option value="seminar">Seminar</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      name="description"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      rows="4"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Type</label>
                      <select
                        name="type"
                        value={eventForm.type}
                        onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                        disabled={loading}
                      >
                        <option value="individual">Individual</option>
                        <option value="team">Team</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Event Image</label>
                      <div className="image-upload-section">
                        <div className="image-upload-options">
                          <div className="upload-method-selector">
                            <button
                              type="button"
                              className={`method-btn ${imageUploadMethod === 'upload' ? 'active' : ''}`}
                              onClick={() => setImageUploadMethod('upload')}
                            >
                              <i className="fas fa-upload"></i> Upload File
                            </button>
                            <button
                              type="button"
                              className={`method-btn ${imageUploadMethod === 'url' ? 'active' : ''}`}
                              onClick={() => setImageUploadMethod('url')}
                            >
                              <i className="fas fa-link"></i> Use URL
                            </button>
                          </div>

                          {imageUploadMethod === 'upload' ? (
                            imagePreview ? (
                              <div className="image-preview-container">
                                <img src={imagePreview} alt="Event preview" className="preview-img" />
                                <button type="button" onClick={removeImage} className="remove-image-btn">
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            ) : eventForm.image ? (
                              <div className="image-preview-container">
                                <img src={eventForm.image} alt="Current event image" className="preview-img" />
                                <button type="button" onClick={() => setEventForm({ ...eventForm, image: '' })} className="remove-image-btn">
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            ) : (
                              <div className="image-upload-area">
                                <input
                                  type="file"
                                  id="editEventImage"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  disabled={loading}
                                  style={{ display: 'none' }}
                                />
                                <label htmlFor="editEventImage" className="upload-label">
                                  <i className="fas fa-cloud-upload-alt"></i>
                                  <span>Click to upload event image</span>
                                  <small>Supports: JPEG, PNG, GIF, WebP (Max 5MB)</small>
                                </label>
                              </div>
                            )
                          ) : (
                            <div className="url-input-section">
                              {imagePreview || eventForm.image ? (
                                <div className="image-preview-container">
                                  <img src={imagePreview || eventForm.image} alt="Event preview" className="preview-img" />
                                  <button type="button" onClick={removeImage} className="remove-image-btn">
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <input
                                    type="url"
                                    placeholder="Enter image URL..."
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="url-input"
                                    disabled={loading}
                                  />
                                  <button
                                    type="button"
                                    onClick={handleImageUrl}
                                    className="url-submit-btn"
                                    disabled={loading || !imageUrl.trim()}
                                  >
                                    <i className="fas fa-check"></i> Add Image
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Schedule & Logistics</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Start Time *</label>
                      <input
                        type="time"
                        name="time"
                        value={eventForm.time}
                        onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={eventForm.endTime}
                        onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Location *</label>
                      <input
                        type="text"
                        name="location"
                        value={eventForm.location}
                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Max Participants</label>
                      <input
                        type="number"
                        name="maxParticipants"
                        value={eventForm.maxParticipants}
                        onChange={(e) => setEventForm({ ...eventForm, maxParticipants: e.target.value })}
                        min="1"
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Volunteer Spots</label>
                      <input
                        type="number"
                        name="volunteerSpots"
                        value={eventForm.volunteerSpots}
                        onChange={(e) => setEventForm({ ...eventForm, volunteerSpots: e.target.value })}
                        min="0"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Registration Deadline</label>
                    <input
                      type="date"
                      name="registrationDeadline"
                      value={eventForm.registrationDeadline}
                      onChange={(e) => setEventForm({ ...eventForm, registrationDeadline: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Registration Settings</h3>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={eventForm.isFreeEvent}
                        onChange={(e) => setEventForm({
                          ...eventForm, 
                          isFreeEvent: e.target.checked,
                          registrationFee: e.target.checked ? 0 : eventForm.registrationFee
                        })}
                        disabled={loading}
                      />
                      Free Event (No Registration Fee)
                    </label>
                  </div>

                  {!eventForm.isFreeEvent && (
                    <div className="form-group">
                      <label>Registration Fee *</label>
                      <div className="fee-input-group">
                        <span className="currency-symbol">₹</span>
                        <input
                          type="number"
                          name="registrationFee"
                          value={eventForm.registrationFee}
                          onChange={(e) => setEventForm({ ...eventForm, registrationFee: e.target.value })}
                          placeholder="Enter registration fee"
                          min="0"
                          step="0.01"
                          required={!eventForm.isFreeEvent}
                          disabled={loading}
                        />
                      </div>
                      <small className="form-help">
                        Set the registration fee for this event. Leave as 0 for free events.
                      </small>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => {
                    setActiveTab('manage');
                    setEditingEvent(null);
                  }} disabled={loading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Event'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Participants Modal */}
      {showParticipants && (
        <div className="modal-overlay" onClick={closeParticipantsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Event Participants</h3>
              <button className="close-btn" onClick={closeParticipantsModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {loadingParticipants ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Loading participants...</p>
                </div>
              ) : participants.length > 0 ? (
                <div className="participants-list">
                  <div className="list-header">
                    <span>Total Participants: {participants.length}</span>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => exportRegistrations(selectedEvent)}
                    >
                      <i className="fas fa-download"></i> Export List
                    </button>
                  </div>
                  <div className="participants-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>University</th>
                          <th>Registration Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((participant, index) => (
                          <tr key={participant._id || index}>
                            <td>{participant.fullName || `${participant.firstName} ${participant.lastName}`}</td>
                            <td>{participant.email}</td>
                            <td>{participant.university || 'N/A'}</td>
                            <td>{new Date(participant.registeredAt || participant.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge ${participant.status || 'registered'}`}>
                                {participant.status || 'Registered'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No participants found for this event.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeParticipantsModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Volunteers Modal */}
      {showVolunteers && (
        <div className="modal-overlay" onClick={closeVolunteersModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Event Volunteers</h3>
              <button className="close-btn" onClick={closeVolunteersModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {loadingVolunteers ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Loading volunteers...</p>
                </div>
              ) : volunteers.length > 0 ? (
                <div className="volunteers-list">
                  <div className="list-header">
                    <span>Total Volunteers: {volunteers.length}</span>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => exportVolunteers(selectedEvent)}
                    >
                      <i className="fas fa-download"></i> Export List
                    </button>
                  </div>
                  <div className="volunteers-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>University</th>
                          <th>Phone</th>
                          <th>Skills</th>
                          <th>Registration Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {volunteers.map((volunteer, index) => (
                          <tr key={volunteer._id || index}>
                            <td>{volunteer.fullName || `${volunteer.firstName} ${volunteer.lastName}`}</td>
                            <td>{volunteer.email}</td>
                            <td>{volunteer.university || 'N/A'}</td>
                            <td>{volunteer.phone || 'N/A'}</td>
                            <td>{volunteer.skills || volunteer.experience || 'N/A'}</td>
                            <td>{new Date(volunteer.registeredAt || volunteer.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge ${volunteer.status || 'registered'}`}>
                                {volunteer.status || 'Registered'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No volunteers found for this event.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeVolunteersModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;