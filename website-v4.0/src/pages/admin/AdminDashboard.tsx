import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AdminDashboard = () => {
  const {
    isAuthenticated,
    isLoading,
    user,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  useEffect(() => {
    const storeToken = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          localStorage.setItem(
            'netlify-cms-user',
            JSON.stringify({
              backendName: 'github',
              token,
              login: user?.nickname || user?.email || 'editor',
            })
          );
        } catch (error) {
          console.error('Error fetching token:', error);
        }
      }
    };

    storeToken();
  }, [isAuthenticated, getAccessTokenSilently, user]);

  const uploadToGitHub = async (folder: string, filename: string, content: string, message?: string) => {
    try {
      const response = await fetch('/.netlify/functions/uploadToGitHub', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folder, filename, content, message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('GitHub upload failed:', errorData);
        alert('Upload failed.');
        return;
      }

      return await response.json();
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error during upload.');
    }
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = (document.getElementById('blogTitle') as HTMLInputElement).value;
    const date = (document.getElementById('blogDate') as HTMLInputElement).value;
    const body = (document.getElementById('blogBody') as HTMLTextAreaElement).value;
    const content = `---\ntitle: "${title}"\ndate: ${date}\n---\n\n${body}`;
    const filename = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    await uploadToGitHub('posts', filename, content);
    alert('Blog post uploaded!');
    window.location.href = '/blogs';
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = (document.getElementById('videoTitle') as HTMLInputElement).value;
    const url = (document.getElementById('videoURL') as HTMLInputElement).value;
    const description = (document.getElementById('videoDescription') as HTMLTextAreaElement).value;
    const content = `title: "${title}"\nyoutube: "${url}"\ndescription: "${description}"`;
    const filename = `${title.toLowerCase().replace(/\s+/g, '-')}.yaml`;
    await uploadToGitHub('_videos', filename, content);
    alert('Video uploaded!');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Let ProtectedRoute handle redirect logic
  }

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          className="text-sm text-red-600 hover:underline"
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin + '/admin/' } })
          }
        >
          Log Out
        </button>
      </header>

      <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Add Blog Post</h2>
          <form id="blogForm" className="space-y-4" onSubmit={handleBlogSubmit}>
            <input type="text" id="blogTitle" placeholder="Title" className="w-full border p-2 rounded" required />
            <input type="date" id="blogDate" className="w-full border p-2 rounded" required />
            <textarea id="blogBody" placeholder="Write your content here..." className="w-full border p-2 rounded h-40" required></textarea>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Upload Post</button>
          </form>
        </section>

        <section className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Add Video</h2>
          <form id="videoForm" className="space-y-4" onSubmit={handleVideoSubmit}>
            <input type="text" id="videoTitle" placeholder="Video Title" className="w-full border p-2 rounded" required />
            <input type="url" id="videoURL" placeholder="YouTube URL" className="w-full border p-2 rounded" required />
            <textarea id="videoDescription" placeholder="Optional description..." className="w-full border p-2 rounded h-20"></textarea>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Upload Video</button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
