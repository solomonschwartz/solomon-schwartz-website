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

  const user = await auth0.getUser();
  if (!user) {
    window.location.href = '/admin/';
    return;
  }

  const token = await auth0.getTokenSilently();

  localStorage.setItem('netlify-cms-user', JSON.stringify({
    backendName: 'github',
    token,
    login: user?.nickname || user?.email || 'editor'
  }));

  initAdminDashboard();

  function initAdminDashboard() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.clear();
      window.location.href = '/admin';
    });

    document.getElementById('blogForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('blogTitle').value;
      const date = document.getElementById('blogDate').value;
      const body = document.getElementById('blogBody').value;

      const content = `---\ntitle: "${title}"\ndate: ${date}\n---\n\n${body}`;
      const filename = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;

      await uploadToGitHub('posts', filename, content);
      alert('Blog post uploaded!');
      window.location.href = '/blog';
    });

    document.getElementById('videoForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('videoTitle').value;
      const url = document.getElementById('videoURL').value;
      const description = document.getElementById('videoDescription').value;

      const content = `title: "${title}"\nyoutube: "${url}"\ndescription: "${description}"`;
      const filename = `${title.toLowerCase().replace(/\s+/g, '-')}.yaml`;

      await uploadToGitHub('_videos', filename, content);
      alert('Video uploaded!');
    });
  }

  async function uploadToGitHub(folder, filename, content) {
    const token = JSON.parse(localStorage.getItem('netlify-cms-user')).token;
    const url = `https://api.github.com/repos/solomonschwartz/solomon-schwartz-website/contents/${folder}/${filename}`;
    const message = `Add ${filename}`;
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        content: encodedContent,
        branch: 'main'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("GitHub upload failed:", error);
      alert("Upload failed. Check the console.");
    }
  }
})();
