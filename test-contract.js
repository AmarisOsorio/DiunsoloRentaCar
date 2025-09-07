// Test script for contract download endpoint
const testContractDownload = async () => {
  try {
    console.log('Testing contract download endpoint...');
    
    const response = await fetch('http://localhost:4000/api/vehicles/contract-download/68a15273498735723b58dd01');
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.downloadUrl) {
      console.log('✅ Success! Download URL received:', data.downloadUrl);
    } else {
      console.log('❌ No download URL in response');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testContractDownload();
