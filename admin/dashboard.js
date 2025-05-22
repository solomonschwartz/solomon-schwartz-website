// dashboard.js
import { createAuth0Client } from 'https://cdn.skypack.dev/@auth0/auth0-spa-js';

(async () => {
  const auth0 = await createAuth0Client({
    domain: 'dev-m5hthz5fslmknhxt.us.auth0.com',         // ← Replace this
    client_id: 'OGXc8XyXVGkRT9JySuUVWITDgxB259wT',   // ← Replace this
    cacheLocation: 'localstorage',
    useRefreshTokens: true
  });

  if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
    try {
      await auth0.handleRedirectCallback();
    } catch (e) {
      console.error('Auth0 callback error:', e);
    }
    window.history.replaceState({}, document.title, '/admin/dashboard.html');
  }

  const isAuthenticated = await auth0.isAuthenticated();
  if (!isAuthenticated) {
    window.location.href = '/';
    return;
  }

  const user = await auth0.getUser();
  const token = await auth0.getTokenSilently();

  const githubUsername = user?.nickname || user?.email || "editor";

  const cmsAuth = {
    backendName: 'github',
    token: token,
    login: githubUsername
  };

  localStorage.setItem('netlify-cms-user', JSON.stringify(cmsAuth));

  // Load Netlify CMS
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/netlify-cms@^2.10.0/dist/netlify-cms.js';
  document.body.appendChild(script);
})();
