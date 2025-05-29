function Home() {
  return (
    <div className="bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="py-6 bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex justify-between items-center">
            <a href="/" className="text-3xl font-bold">Shlomo Schwartz</a>
            <ul className="flex space-x-6">
              <li><a href="/blogs" className="hover:text-blue-600">Blog</a></li>
              <li><a href="/videos" className="hover:text-blue-600">Videos</a></li>
              <li><a href="/admin" className="hover:text-blue-600">Admin</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <section>
          <h1 className="text-4xl font-bold mb-4">Shlomo Schwartz</h1>
          <p className="text-xl mb-8">My UI could've been a little better :)</p>
          <h2 className="text-2xl font-semibold mb-4">Experience</h2>
          <ul className="list-disc list-inside">
            <li><strong>Forward Deployed Software Engineer</strong> at Palantir (2024–Present)</li>
            <li><strong>President</strong> of Yeshiva College Student Council (2023–2024)</li>
          </ul>
        <h2 className="text-2xl font-semibold mb-4">Eduaction</h2>
          <ul className="list-disc list-inside">
            <li><strong>Yeshiva University </strong> Bachelor of Arts in Computer Science</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default Home;
