class Auth {
  // Store authentication data
  static setAuthData(token, userData) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('lastActivity', Date.now());
  }

  // Clear authentication data
  static clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
  }

  // Get stored token
  static getToken() {
    return localStorage.getItem('token');
  }

  // Get user data
  static getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return !!this.getToken();
  }

  // Handle login response
  static async handleLoginResponse(response) {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    this.setAuthData(data.token, data.user);
    return data;
  }

  // Validate token with server
  static async validateToken() {
    try {
      const response = await fetch('/api/users/validate-token', {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  // Refresh expired token
  static async refreshToken() {
    try {
      const response = await fetch('/api/users/refresh-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      return await this.handleLoginResponse(response);
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuthData();
      throw error;
    }
  }

  // Check authentication status with automatic token refresh
  static async checkAuth() {
    if (!this.isAuthenticated()) {
      this.redirectToLogin();
      return false;
    }

    // Check token expiration (client-side check)
    const lastActivity = localStorage.getItem('lastActivity');
    const idleTime = Date.now() - (lastActivity || 0);
    const maxIdleTime = 55 * 60 * 1000; // 55 minutes (just under 1 hour token expiry)

    if (idleTime > maxIdleTime) {
      try {
        await this.refreshToken();
      } catch (error) {
        this.redirectToLogin();
        return false;
      }
    }

    // Validate token with server
    if (!await this.validateToken()) {
      this.redirectToLogin();
      return false;
    }

    // Update last activity time
    localStorage.setItem('lastActivity', Date.now());
    return true;
  }

  // Handle login
  static async login(email, password) {
    const response = await fetch('/api/users/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return this.handleLoginResponse(response);
  }

  // Handle signup
  static async signup(username, email, password) {
    const response = await fetch('/api/users/createaccount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    return this.handleLoginResponse(response);
  }

  // Handle logout
  static async logout() {
    try {
      await fetch('/api/users/signout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
      this.redirectToLogin();
    }
  }

  // Redirect to login page
  static redirectToLogin() {
    // Store current location for post-login redirect
    sessionStorage.setItem('redirectUrl', window.location.pathname);
    window.location.href = '/signin';
  }

  // Initialize session monitoring
  static initSessionMonitor() {
    // Update activity time on user interaction
    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now());
    };

    // Add event listeners for user activity
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    // Check session every 5 minutes
    setInterval(async () => {
      await this.checkAuth();
    }, 5 * 60 * 1000);
  }
}

// Initialize session monitoring when loaded
document.addEventListener('DOMContentLoaded', () => {
  // Don't monitor on auth pages
  if (!['/signin', '/createaccount', '/'].includes(window.location.pathname)) {
    Auth.initSessionMonitor();
    
    // Check auth status on page load
    Auth.checkAuth().then(isAuthenticated => {
      if (!isAuthenticated) {
        Auth.redirectToLogin();
      } else {
        // Redirect back to original requested page if exists
        const redirectUrl = sessionStorage.getItem('redirectUrl');
        if (redirectUrl && !redirectUrl.includes('/signin')) {
          sessionStorage.removeItem('redirectUrl');
          window.location.href = redirectUrl;
        }
      }
    });
  }
});

// Make Auth class available globally
window.Auth = Auth;