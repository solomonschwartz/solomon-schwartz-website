import { createAuth0Client } from 'https://cdn.skypack.dev/@auth0/auth0-spa-js';

document.addEventListener('DOMContentLoaded', async () => {
  const auth0 = await createAuth0Client({
    domain: 'dev-m5hthz5fslmknhxt.us.auth0.com',
    client_id: "FVUDfy6PvGFHOaOtazaAP67FfuF74oL8",
    cacheLocation: 'localstorage',
    redirect_uri: window.location.origin + '/admin/dashboard.html',
    useRefreshTokens: true
  });

  const isAuthenticated = await auth0.isAuthenticated();
  if (!isAuthenticated) {
    await auth0.loginWithRedirect({
      redirect_uri: window.location.origin + '/admin/dashboard.html'
    });
  } else {
    window.location.href = '/admin/dashboard.html';
  }
});
