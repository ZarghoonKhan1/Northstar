import { initializeAuthState, isConfigured, resetPassword, signIn } from './supabase-app.js';

const elements = {
  form: document.getElementById('loginForm'),
  email: document.getElementById('loginEmail'),
  password: document.getElementById('loginPassword'),
  submit: document.getElementById('loginSubmit'),
  reset: document.getElementById('passwordResetButton'),
  toggle: document.getElementById('togglePassword'),
  message: document.getElementById('loginMessage'),
  title: document.getElementById('loginTitle'),
  description: document.getElementById('loginDescription')
};

function setMessage(message, isError = false) {
  elements.message.textContent = message;
  elements.message.classList.toggle('is-success', !isError && Boolean(message));
}

function postSignInPath() {
  const requested = new URLSearchParams(window.location.search).get('returnTo');
  if (requested) {
    try {
      const target = new URL(requested, window.location.origin);
      const targetPath = target.pathname.replace(/\/+$/, '').toLowerCase();
      if (
        target.origin === window.location.origin
        && ['/admin', '/admin.html', '/superadmin', '/superadmin.html'].includes(targetPath)
      ) {
        return targetPath;
      }
    } catch {
      return '/index.html';
    }
  }
  return '/index.html';
}

elements.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  elements.submit.disabled = true;
  setMessage('');

  try {
    await signIn(elements.email.value.trim(), elements.password.value);
    window.location.replace(postSignInPath());
  } catch (error) {
    setMessage(error.message || 'Unable to sign in. Please try again.', true);
  } finally {
    elements.submit.disabled = false;
  }
});

elements.toggle?.addEventListener('click', () => {
  const showing = elements.password.type === 'text';
  elements.password.type = showing ? 'password' : 'text';
  elements.toggle.textContent = showing ? 'Show password' : 'Hide password';
  elements.toggle.setAttribute('aria-pressed', String(!showing));
});

elements.reset.addEventListener('click', async () => {
  const email = elements.email.value.trim();
  if (!email) {
    setMessage('Enter your email address first to receive a password reset link.', true);
    elements.email.focus();
    return;
  }

  elements.reset.disabled = true;
  try {
    await resetPassword(email);
    setMessage('If an account exists for that email, a password reset link has been sent.');
  } catch (error) {
    setMessage(error.message || 'Unable to request a password reset.', true);
  } finally {
    elements.reset.disabled = false;
  }
});

async function initializeLoginPage() {
  if (!isConfigured()) {
    elements.title.textContent = 'Connect your account';
    elements.description.textContent =
      'Supabase is not configured. Copy .env.example to .env, add your Supabase project URL and anon key, and restart the dev server.';
    elements.email.disabled = true;
    elements.password.disabled = true;
    elements.submit.disabled = true;
    elements.reset.disabled = true;
    return;
  }

  const error = new URLSearchParams(window.location.search).get('error');
  if (error === 'profile') {
    setMessage('Your account profile could not be loaded. Check your connection or contact an administrator.', true);
  } else if (error === 'connection') {
    setMessage('Authentication could not be initialized. Refresh the page or try again later.', true);
  } else if (error === 'reauth') {
    setMessage('Your account access changed. Sign in again to continue.', true);
  } else if (error === 'disabled') {
    setMessage('This account is disabled. Contact an administrator if you believe this is a mistake.', true);
  }

  try {
    await initializeAuthState((user, authError) => {
      if (authError) {
        setMessage(authError.message || 'Unable to load your account profile.', true);
        return;
      }
      if (user) window.location.replace(postSignInPath());
    });
  } catch (initializationError) {
    console.error('Supabase authentication could not be initialized:', initializationError);
    setMessage('Authentication could not be initialized. Refresh the page or try again later.', true);
  }
}

initializeLoginPage();
