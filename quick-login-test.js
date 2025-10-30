/**
 * Quick Login Test to Debug Authentication Issues
 */

const axios = require('axios');

const testLogin = async () => {
    try {
        console.log('🔍 Testing login with admin credentials...');
        
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@campuspulse.com',
            password: 'password123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Login successful!');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        if (response.data.token) {
            console.log('🎯 Token received, testing protected route...');
            
            const profileResponse = await axios.get('http://localhost:5000/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${response.data.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Protected route accessible!');
            console.log('Profile data:', JSON.stringify(profileResponse.data, null, 2));
        }
        
    } catch (error) {
        console.log('❌ Login failed!');
        console.log('Status:', error.response?.status || 'No response');
        console.log('Error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('\n🔍 Testing user exists...');
            try {
                const userCheck = await axios.get(`http://localhost:5000/api/users`);
                console.log('Users endpoint accessible');
            } catch (userError) {
                console.log('Users endpoint error:', userError.response?.data || userError.message);
            }
        }
    }
};

testLogin();