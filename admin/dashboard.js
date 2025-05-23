import createAuth0Client from 'https://cdn.skypack.dev/@auth0/auth0-spa-js';

(async () => {
  const auth0 = await createAuth0Client({
    domain: 'dev-m5hthz5fslmknhxt.us.auth0.com',
    clientId: 'FVUDfy6PvGFHOaOtazaAP67FfuF74oL8',
    cacheLocation: 'localstorage',
    useRefreshTokens: true,
    authorizationParams: {
      redirect_uri: window.location.origin + '/admin/dashboard.html'
    }
  });

  // Handle the Auth0 redirect if this page was just returned from login
  if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
    try {
      await auth0.handleRedirectCallback();
    } catch (e) {
      console.error('Auth0 callback error:', e);
    }

    // Clean up the URL (remove ?code=...&state=...)
    window.history.replaceState({}, document.title, '/admin/dashboard.html');
  }

  const isAuthenticated = await auth0.isAuthenticated();
  if (!isAuthenticated) {
    window.location.href = '/';
    return;
  }

  const user = await auth0.getUser();
  const token = await auth0.getTokenSilently();

  console.log("Logged in user:", user);

  const cmsAuth = {
    backendName: 'github',
    token,
    login: user?.nickname || user?.email || "editor"
  };

  localStorage.setItem('netlify-cms-user', JSON.stringify(cmsAuth));

  // Load Netlify CMS after token is injected
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/netlify-cms@^2.10.0/dist/netlify-cms.js';
  document.body.appendChild(script);
})();
