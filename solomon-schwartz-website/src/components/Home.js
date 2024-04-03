import React from 'react';
import './Home.css'; // Import the CSS file
import headshot from "../files/headshot.jpg"; // Adjust the file path and name as needed

const Home = () => {
  return (
    <div id="home">
      <h2 className="home-title">Solomon (Shlomo) Schwartz</h2>
      <div className="home-container">
        <div className="bio">
            <h3 className="home-subtitle">Honors CS Student and President of Yeshiva College Student Council</h3>
          {/* Add your bio content here */}
          <p>I am fortunate to hold many varied passions and interests. Aside from my hobbies, which include golf, long-distance running, dry-aging meat, and more, I like to be involved in many side projects. While I try to stay focused on any given project, the truth is that I almost always have my feet in many pools at the same time. I am currently studying at Yeshiva University, where I am blessed to study and grow with many close friends. I am majoring in Computer Science with a concentration in Artificial Intelligence and a minor in Math.</p>
        </div>
        <div className="profile-picture">
          {/* Add your profile picture here */}
          <img src={headshot} alt="Profile" />
        </div>
      </div>
    </div>
  );
}

export default Home;
