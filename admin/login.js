import { createAuth0Client } from 'https://cdn.skypack.dev/@auth0/auth0-spa-js';

let auth0;

async function initAuth0() {
  auth0 = await createAuth0Client({
    domain: 'dev-m5hthz5fslmknhxt.us.auth0.com',
    client_id: 'OGXc8XyXVGkRT9JySuUVWITDgxB259wT',
    cacheLocation: 'localstorage',
    useRefreshTokens: true
  });

  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    // Already logged in, skip to dashboard
    window.location.href = '/admin/dashboard.html';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await initAuth0();

  document.getElementById('loginBtn')?.addEventListener('click', async () => {
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
