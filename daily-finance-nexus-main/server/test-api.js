import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:4000/api';

// Function to make API requests
async function makeRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const responseData = await response.json();
    return { status: response.status, data: responseData };
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error.message);
    return { status: 500, error: error.message };
  }
}

// Test functions
async function testRegisterUser() {
  console.log('\n--- Testing User Registration ---');
  const userData = {
    role: 'finance',
    name: 'Test Finance',
    financeName: 'Test Finance Company',
    uniqueId: `FIN${Date.now()}`,
    password: 'password123'
  };

  const result = await makeRequest('/auth/register', 'POST', userData);
  console.log(`Status: ${result.status}`);
  console.log('Response:', result.data);
  return result;
}

async function testCreateLoan() {
  console.log('\n--- Testing Loan Creation ---');
  const loanData = {
    loanId: `LOAN${Date.now()}`,
    shopkeeperName: 'Test Shopkeeper',
    shopkeeperPhone: '9876543210',
    amount: 10000,
    startDate: new Date().toISOString().split('T')[0],
    duration: 30,
    dailyEmi: 350,
    status: 'active'
  };

  const result = await makeRequest('/loans', 'POST', loanData);
  console.log(`Status: ${result.status}`);
  console.log('Response:', result.data);
  return result;
}

async function testCreatePayment(loanId) {
  console.log('\n--- Testing Payment Recording ---');
  const paymentData = {
    loanId,
    date: new Date().toISOString(),
    status: 'paid'
  };

  const result = await makeRequest('/payments', 'POST', paymentData);
  console.log(`Status: ${result.status}`);
  console.log('Response:', result.data);
  return result;
}

async function testGetLoans() {
  console.log('\n--- Testing Get Loans ---');
  const result = await makeRequest('/loans');
  console.log(`Status: ${result.status}`);
  console.log('Response:', result.data);
  return result;
}

async function testGetPayments() {
  console.log('\n--- Testing Get Payments ---');
  const result = await makeRequest('/payments');
  console.log(`Status: ${result.status}`);
  console.log('Response:', result.data);
  return result;
}

// Run all tests
async function runTests() {
  try {
    console.log('Starting API tests...');
    
    // Register a user
    const userResult = await testRegisterUser();
    
    // Create a loan
    const loanResult = await testCreateLoan();
    let loanId;
    
    if (loanResult.status === 201 && loanResult.data) {
      loanId = loanResult.data._id;
      
      // Record a payment for the created loan
      if (loanId) {
        await testCreatePayment(loanId);
      }
    }
    
    // Get all loans and payments to verify data was stored
    await testGetLoans();
    await testGetPayments();
    
    console.log('\nAPI tests completed!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();