// dashboard.js
import { createAuth0Client } from 'https://cdn.skypack.dev/@auth0/auth0-spa-js';

const auth0 = await createAuth0Client({
  domain: 'YOUR_AUTH0_DOMAIN', // e.g. dev-abc123.us.auth0.com
  client_id: 'YOUR_AUTH0_CLIENT_ID',
  cacheLocation: 'localstorage',
  useRefreshTokens: true
});

if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
  try {
    await auth0.handleRedirectCallback();
  } catch (e) {
    console.error('Auth0 callback error:', e);
  }
  // Clean up the URL
  window.history.replaceState({}, document.title, '/admin/dashboard.html');
}

const isAuthenticated = await auth0.isAuthenticated();
if (!isAuthenticated) {
  // Redirect unauthenticated user to homepage
  window.location.href = '/';
} else {
  // Logged in – inject GitHub token for Netlify CMS
  const user = await auth0.getUser();
  const token = await auth0.getTokenSilently();

  const githubUsername = user?.nickname || user?.email || "editor";

  const cmsAuth = {
    backendName: 'github',
    token: token,
    login: githubUsername
  };

  localStorage.setItem('netlify-cms-user', JSON.stringify(cmsAuth));

  // Load the CMS after token injection
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/netlify-cms@^2.10.0/dist/netlify-cms.js';
  document.body.appendChild(script);
}
