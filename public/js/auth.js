document.addEventListener('DOMContentLoaded', function () {
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');
  const logoutBtn = document.getElementById('logout-btn');

  if (signinForm) {
    signinForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const submitBtn = signinForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

        const response = await fetch('/api/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include'
        });

        const data = await response.json();
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;

        if (response.ok && data.success && data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          window.location.href = '/dashboard';
        } else {
          showError(data.error || 'Invalid email or password');
        }
      } catch (error) {
        console.error('Error:', error);
        showError('An error occurred during login');
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
      }

      try {
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

        const response = await fetch('/api/createaccount', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
          credentials: 'include'
        });

        const data = await response.json();
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;

        if (response.ok && data.success && data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          window.location.href = '/dashboard';
        } else {
          showError(data.error || 'Account creation failed');
        }
      } catch (error) {
        console.error('Error:', error);
        showError('An error occurred during registration');
      }

      const passwordInput = document.getElementById('password');
      const passwordStrength = document.getElementById('password-strength');

      if (passwordInput && passwordStrength) {
        passwordInput.addEventListener('input', function () {
          const strength = calculatePasswordStrength(this.value);
          updatePasswordStrengthIndicator(strength);
        });
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function () {
      try {
        const response = await fetch('/api/logout', { method: 'GET', credentials: 'include' });
        const data = await response.json();
        if (response.ok && data.success) {
          localStorage.removeItem('currentUser');
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error:', error);
        showError('Failed to logout');
      }
    });
  }

  if (!["/", "/signin", "/createaccount"].includes(window.location.pathname)) {
    checkAuthStatus();
  }

  function showError(message) {
    document.querySelectorAll('.error-message').forEach(e => e.remove());
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    const form = document.querySelector('form');
    (form || document.body).insertBefore(errorElement, (form || document.body).firstChild);
    setTimeout(() => errorElement.remove(), 5000);
  }

  async function checkAuthStatus() {
    try {
      const response = await fetch('/api/dashboard/summary', { credentials: 'include' });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.user) localStorage.setItem('currentUser', JSON.stringify(data.user));
    } catch {
      window.location.href = '/signin';
    }
  }

  function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 5);
  }

  function updatePasswordStrengthIndicator(strength) {
    const strengthText = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'];
    const strengthColors = ['#ff5252', '#ff7946', '#ffb142', '#33d9b2', '#218c74'];
    const passwordStrength = document.getElementById('password-strength');
    passwordStrength.textContent = strengthText[strength - 1] || '';
    passwordStrength.style.color = strengthColors[strength - 1] || '#000';
    const strengthBars = document.querySelectorAll('.strength-bar span');
    strengthBars.forEach((bar, i) => {
      bar.style.backgroundColor = i < strength ? strengthColors[strength - 1] : '#ddd';
    });
  }
});