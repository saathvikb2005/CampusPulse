const { spawn } = require('child_process');
const axios = require('axios');

console.log('🚀 Starting Backend Server and API Tests...');

// Start the backend server
const backendProcess = spawn('node', ['src/app.js'], {
    cwd: './Backend',
    stdio: 'pipe'
});

backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data.toString()}`);
});

backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data.toString()}`);
});

// Wait a moment then test
setTimeout(async () => {
    console.log('\n🧪 Testing API connection...');
    
    try {
        // Test health endpoint
        const healthResponse = await axios.get('http://127.0.0.1:5000/health');
        console.log('✅ Health check passed:', healthResponse.status);
        
        // Test login
        const loginResponse = await axios.post('http://127.0.0.1:5000/api/auth/login', {
            email: 'admin@campuspulse.com',
            password: 'password123'
        });
        console.log('✅ Login test passed:', loginResponse.status);
        
        // Now run full comprehensive test
        const { runAllTests } = require('./comprehensive-api-test');
        await runAllTests();
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
        
        // If connection failed, let's try running the comprehensive test anyway
        console.log('\n🔄 Running comprehensive test suite directly...');
        try {
            const { runAllTests } = require('./comprehensive-api-test');
            await runAllTests();
        } catch (testError) {
            console.error('❌ Comprehensive test failed:', testError.message);
        }
    }
    
    // Clean up
    setTimeout(() => {
        backendProcess.kill();
        process.exit(0);
    }, 5000);
    
}, 3000); // Wait 3 seconds for server to start