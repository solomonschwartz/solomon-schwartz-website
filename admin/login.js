import createAuth0Client from 'https://cdn.skypack.dev/@auth0/auth0-spa-js';

let auth0 = null;

async function configureClient() {
  auth0 = await createAuth0Client({
    domain: 'dev-m5hthz5fslmknhxt.us.auth0.com',
    clientId: 'OGXc8XyXVGkRT9JySuUVWITDgxB259wT',
    redirect_uri: window.location.origin + '/admin/dashboard.html',
    cacheLocation: 'localstorage',
    useRefreshTokens: true
  });
}

window.addEventListener('load', async () => {
  await configureClient();

  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    // Already logged in, go straight to dashboard
    window.location.href = '/admin/dashboard.html';
    return;
  }

  // Not logged in – enable button
  const loginBtn = document.getElementById('loginBtn');
  loginBtn.disabled = false;
  loginBtn.innerText = 'Log in with GitHub';

  loginBtn.addEventListener('click', async () => {
    await auth0.loginWithRedirect();
  });
});
