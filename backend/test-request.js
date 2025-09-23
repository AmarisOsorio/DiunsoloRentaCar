// Simple test script to test the download contract endpoint
import fetch from 'node-fetch';

const testEndpoint = async () => {
  try {
    console.log('Testing download contract endpoint...');
    
    const response = await fetch('http://localhost:4000/api/vehicles/68a15273498735723b58dd01/download-lease-contract', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Request failed:', error);
  }
};

testEndpoint();
