const API_URL = 'http://localhost:5000/api/auth';

export const authService = {
  async login(username: string, password: string) {
    const response = await fetch(`${API_URL}/login`, {
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