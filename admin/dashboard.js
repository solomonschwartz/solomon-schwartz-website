import createAuth0Client from 'https://cdn.skypack.dev/@auth0/auth0-spa-js';

(async () => {
  const auth0 = await createAuth0Client({
    domain: 'dev-m5hthz5fslmknhxt.us.auth0.com',
    clientId: 'OGXc8XyXVGkRT9JySuUVWITDgxB259wT',
    cacheLocation: 'localstorage',
    useRefreshTokens: true,
    authorizationParams: {
      redirect_uri: 'https://www.solomonschwartz.com/admin/dashboard.html'
    }
  });

  // 🔁 Handle Auth0 redirect (if coming from login)
  if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
    try {
      await auth0.handleRedirectCallback();
      window.history.replaceState({}, document.title, '/admin/dashboard.html');
    } catch (e) {
      console.error('Auth0 callback error:', e);
      alert("Login failed. Please try again.");
      window.location.href = '/admin/';
      return;
    }
  }

  // 🔒 Check if user is authenticated
  const isAuthenticated = await auth0.isAuthenticated();
  if (!isAuthenticated) {
    // 🚫 Not logged in – kick back to login page
    window.location.href = '/admin/';
    return;
  }

  // ✅ Logged in – continue
  const user = await auth0.getUser();
  const token = await auth0.getTokenSilently();

  console.log("Logged in as:", user?.email || user?.nickname);

  // Inject GitHub token into Netlify CMS
  const cmsAuth = {
    backendName: 'github',
    token,
    login: user?.nickname || user?.email || 'editor'
  };

  localStorage.setItem('netlify-cms-user', JSON.stringify(cmsAuth));

  // Load CMS after authentication
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/netlify-cms@^2.10.0/dist/netlify-cms.js';
  document.body.appendChild(script);
})();
