// src/app/services/auth.ts

const getApiUrl = async () => {
  // Try to connect to local backend first
  try {
    const response = await fetch('http://localhost:5000/api/health');
    if (response.ok) {
      return 'http://localhost:5000';
    }
  } catch (error) {
    console.log('Local backend not available, using Render backend');
  }
  // Fall back to Render backend if local is not available
  return 'https://lebaincode-backend.onrender.com';
};

export const authService = {
  async login(username: string, password: string) {
    const apiUrl = await getApiUrl();
    console.log('Current API URL:', apiUrl); // Debug line

    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    // Store token in localStorage
    localStorage.setItem('token', data.token);
    return data;
  }
};