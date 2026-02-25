document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    const submitBtn = contactForm.querySelector('.submit-btn');
    const formMessage = document.getElementById('formMessage');

    if (!validateForm(name, email, subject, message)) {
      showMessage('Please fill in all fields correctly.', 'error', formMessage);
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/send_contact_email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            name,
            email,
            subject,
            message,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        showMessage('Message sent successfully! I\'ll get back to you soon.', 'success', formMessage);
        contactForm.reset();
      } else {
        showMessage('Failed to send message. Please try again.', 'error', formMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('An error occurred. Please try again later.', 'error', formMessage);
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });

  function validateForm(name, email, subject, message) {
    if (!name || !email || !subject || !message) {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function showMessage(text, type, element) {
    element.textContent = text;
    element.className = `form-message ${type}`;

    setTimeout(() => {
      element.className = 'form-message';
    }, 5000);
  }
});
