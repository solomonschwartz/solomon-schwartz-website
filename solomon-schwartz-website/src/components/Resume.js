// Resume.js
import React from 'react';
import './Resume.css'; // Import the CSS file

const Resume = () => {
  return (
    <div id="resume">
       <a href="https://docs.google.com/document/d/1W6O9U6x5VeoKOVWkQjLF7HZogn3Wm7t5CK3USA2MzNo/edit" className="resume-button">Open Resume</a>
      <iframe src="https://docs.google.com/document/d/1W6O9U6x5VeoKOVWkQjLF7HZogn3Wm7t5CK3USA2MzNo/edit" title="Resume" className="resume-iframe"></iframe>
    </div>
  );
}

export default Resume;
