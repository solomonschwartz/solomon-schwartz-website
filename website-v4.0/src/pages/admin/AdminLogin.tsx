import React from 'react';

const AdminLogin: React.FC = () => {
  const handleLogin = () => {
    const domain = "dev-m5hthz5fslmknhxt.us.auth0.com";
    const clientId = "FVUDfy6PvGFHOaOtazaAP67FfuF74oL8";
    const redirectUri = encodeURIComponent(window.location.origin + '/admin/dashboard.html');
    const scope = encodeURIComponent("openid profile email");
    const responseType = "code";

    const url = `https://${domain}/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

    window.location.href = url;
  };

  return (
    <div className="bg-gray-50 text-center p-10 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold mb-6">Solomon's Admin Portal</h1>
      <p className="mb-6">Only authorized users can proceed.</p>
      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Log in with GitHub
      </button>
    </div>
  );
};

export default AdminLogin;
