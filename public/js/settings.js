document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settingsForm');
  const themeSelect = document.getElementById('themeSelect');

  fetch('/api/settings')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const { username, email, monthlyBudget, notifications, theme } = data.settings;
        document.getElementById('username').value = username || '';
        document.getElementById('email').value = email || '';
        document.getElementById('monthlyBudget').value = monthlyBudget || '';
        document.getElementById('notifications').checked = notifications;
        themeSelect.value = theme || 'system';
        applyTheme(theme || 'system');
      }
    })
    .catch(err => console.error('Error loading settings:', err));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const saveBtn = form.querySelector('button[type="submit"]');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const settings = {
      username: document.getElementById('username').value.trim(),
      email: document.getElementById('email').value.trim(),
      monthlyBudget: parseFloat(document.getElementById('monthlyBudget').value) || 0,
      notifications: document.getElementById('notifications').checked,
      newPassword: document.getElementById('newPassword').value,
      theme: themeSelect.value
    };

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const result = await response.json();
      if (result.success) {
        alert('Settings updated successfully!');
        applyTheme(settings.theme);
      } else {
        alert('Error updating settings: ' + result.message);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Settings';
    }
  });

  themeSelect.addEventListener('change', () => {
    const theme = themeSelect.value;
    applyTheme(theme);
    localStorage.setItem('expensewise-theme', theme);
  });

  function applyTheme(theme) {
    document.body.classList.remove('light', 'dark');
    if (theme === 'light') {
      document.body.classList.add('light');
    } else if (theme === 'dark') {
      document.body.classList.add('dark');
    }
  }

  const savedTheme = localStorage.getItem('expensewise-theme');
  if (savedTheme) {
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);
  }
});
