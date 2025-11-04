// Frontend Debug Script - Run this in browser console
console.log('🔍 CampusPulse Frontend Diagnostics');
console.log('Frontend URL:', window.location.origin);
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

// Test API connectivity
fetch('https://campuspulse-28.onrender.com/health')
  .then(response => {
    console.log('✅ Backend Health Check:', response.status);
    return response.json();
  })
  .then(data => console.log('Backend Response:', data))
  .catch(error => console.error('❌ Backend Connection Error:', error));

// Test login endpoint
fetch('https://campuspulse-28.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@campuspulse.com',
    password: 'admin123'
  })
})
.then(response => {
  console.log('Login Test Status:', response.status);
  if (!response.ok) {
    console.error('Login failed with status:', response.status);
  }
  return response.json();
})
.then(data => console.log('Login Response:', data))
.catch(error => console.error('❌ Login Error:', error));