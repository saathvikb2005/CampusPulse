const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';

async function testFeedbackUserEndpoint() {
  try {
    // Login first
    console.log('Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'superadmin@campuspulse.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.data.accessToken;
    console.log('Login successful, token obtained');
    
    // Test the getUserFeedback endpoint
    console.log('Testing feedbackAPI.getUserFeedback...');
    const response = await axios.get(`${BASE_URL}/feedback/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('Error details:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
  }
}

testFeedbackUserEndpoint();