document.addEventListener('DOMContentLoaded', () => {
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profileSince = document.getElementById('profile-since');

  const editSection = document.getElementById('editProfileSection');
  const editBtn = document.getElementById('editProfileBtn');
  const cancelBtn = document.getElementById('cancelEdit');
  const form = document.getElementById('profileForm');
  const saveBtn = form.querySelector('button[type="submit"]');

  const editName = document.getElementById('editName');
  const editEmail = document.getElementById('editEmail');

  async function loadProfile() {
    try {
      const res = await fetch('/api/profile');
      const user = await res.json();

      profileName.textContent = user.name;
      profileEmail.textContent = user.email;
      profileSince.textContent = new Date(user.created_at).toLocaleDateString();

      editName.value = user.name;
      editEmail.value = user.email;
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }

  editBtn.addEventListener('click', () => editSection.classList.remove('hidden'));
  cancelBtn.addEventListener('click', () => editSection.classList.add('hidden'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const updatedName = editName.value.trim();
    const updatedEmail = editEmail.value.trim();

    if (!updatedName || !updatedEmail) {
      alert('Both name and email are required.');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
      return;
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: updatedName, email: updatedEmail })
      });

      if (!res.ok) throw new Error('Update failed');

      await loadProfile();
      editSection.classList.add('hidden');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
    }
  });

  loadProfile();
});
