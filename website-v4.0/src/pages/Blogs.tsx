function Blogs() {
  return (
    <main className="min-h-screen bg-white text-gray-800 p-8">
      <h1 className="text-3xl font-bold mb-4">Blog Posts</h1>
      <p className="text-gray-600">This page will list all blog posts sourced from your GitHub repo.</p>
      {/* Later: Fetch and render posts from GitHub or a JSON manifest */}
    </main>
  );
}

export default Blogs;
