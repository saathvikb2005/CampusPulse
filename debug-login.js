const axios = require('axios');

async function testLogin() {
    console.log('🔍 Testing Login...');
    
    try {
        const response = await axios.post('http://127.0.0.1:5000/api/auth/login', {
            email: 'admin@campuspulse.com',
            password: 'password123'
        });
        
        console.log('✅ Login successful!');
        console.log('Status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Login failed:');
        console.error('Status:', error.response?.status);
        console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
    }
}

testLogin();