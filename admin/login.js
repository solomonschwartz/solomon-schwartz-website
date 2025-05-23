import { createAuth0Client } from 'https://cdn.skypack.dev/@auth0/auth0-spa-js';

let auth0 = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Auth0
  auth0 = await createAuth0Client({
    domain: 'dev-m5hthz5fslmknhxt.us.auth0.com',
    client_id: 'OGXc8XyXVGkRT9JySuUVWITDgxB259wT',
    cacheLocation: 'localstorage',
    useRefreshTokens: true
  });

  // Check if already logged in
  const isAuthenticated = await auth0.isAuthenticated();
  if (isAuthenticated) {
    window.location.href = '/admin/dashboard.html';
    return;
  }

  // Enable the login button only after auth0 is ready
  const btn = document.getElementById('loginBtn');
  btn.disabled = false;
  btn.innerText = "Log in with GitHub";

  // Handle click
  btn.addEventListener('click', async () => {
    try {
      await auth0.loginWithRedirect({
        redirect_uri: window.location.origin + '/admin/dashboard.html'
      });
    } catch (e) {
      console.error("Login failed:", e);
      alert("Login failed: " + e.message);
    }
  });
});
