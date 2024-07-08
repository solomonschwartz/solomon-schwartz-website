import React from 'react';
import Layout from './Layout';

const Resume: React.FC = () => {
  return (
    <Layout>
      <div id="resume" className="flex flex-col items-center justify-center h-screen w-screen">
        <a
          href="https://docs.google.com/document/d/1W6O9U6x5VeoKOVWkQjLF7HZogn3Wm7t5CK3USA2MzNo/edit"
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Open Resume
        </a>
        <iframe
          src="https://docs.google.com/document/d/1W6O9U6x5VeoKOVWkQjLF7HZogn3Wm7t5CK3USA2MzNo/edit"
          title="Resume"
          className="w-full h-full max-h-screen border-0"
        ></iframe>
        <div className="mobile-message mt-4 text-center text-red-500">iframe doesn't render for mobile.</div>
      </div>
    </Layout>
  );
}

export default Resume;
