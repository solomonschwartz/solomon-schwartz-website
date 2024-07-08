import React from 'react';
import headshot from "../files/headshot.jpg";
import Layout from "./Layout"; // Adjust the file path and name as needed

const Home: React.FC = () => {
  return (
      <Layout>
    <div id="home" className="flex flex-col items-center p-4 sm:p-8 bg-gray-100 min-h-screen">
      <h2 className="text-4xl font-bold mb-6">Solomon (Shlomo) Schwartz</h2>
      <div className="flex flex-col sm:flex-row items-center bg-white rounded-lg shadow-lg p-6 sm:p-10">
        <div className="flex-1 mb-6 sm:mb-0">
          <h3 className="text-2xl font-semibold mb-4">Honors CS Student and President of Yeshiva College Student Council</h3>
          <p className="text-gray-700">I am fortunate to hold many varied passions and interests. Aside from my hobbies, which include golf, long-distance running, dry-aging meat, and more, I like to be involved in many side projects. While I try to stay focused on any given project, the truth is that I almost always have my feet in many pools at the same time. I am currently studying at Yeshiva University, where I am blessed to study and grow with many close friends. I am majoring in Computer Science with a concentration in Artificial Intelligence and a minor in Math.</p>
        </div>
        <div className="flex-1 flex justify-center">
          <img src={headshot} alt="Profile" className="rounded-full w-48 h-48 sm:w-64 sm:h-64 object-cover shadow-lg" />
        </div>
      </div>
    </div>
      </Layout>
  );
}

export default Home;
