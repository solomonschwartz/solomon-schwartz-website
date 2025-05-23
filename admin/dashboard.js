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

  // Complete the login redirect flow if needed
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

  // Check if user is authenticated
  const user = await auth0.getUser();
  if (!user) {
    window.location.href = '/admin/';
    return;
  }

  // Logged in
  const token = await auth0.getTokenSilently();

  console.log("Logged in as:", user?.email || user?.nickname);

  localStorage.setItem('netlify-cms-user', JSON.stringify({
    backendName: 'github',
    token,
    login: user?.nickname || user?.email || 'editor'
  }));

  // Load Netlify CMS
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/netlify-cms@^2.10.0/dist/netlify-cms.js';
  document.body.appendChild(script);
})();
