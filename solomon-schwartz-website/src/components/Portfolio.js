// import React from 'react';
// import './Portfolio.css';
//
// const Portfolio = () => {
//   return (
//     <section id="portfolio">
//       <h2>Portfolio</h2>
//         <div className="video-container">
//             <iframe width="560" height="315" src="https://www.youtube.com/embed/W8mCjIS26KY?si=NGUvzLp7_OhWafxU"
//                     title="YouTube video player" frameBorder="0"
//                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//                     referrerPolicy="strict-origin-when-cross-origin" allowFullScreen>
//             </iframe>
//             <div className="project-details">
//                 <h3>Bethpage Tee Times Bot</h3>
//                 <p>A simple bot that automates the process of getting golf tee times at the extremely competitive
//                     Bethpage State Park in Bethpage, New York. There are many other bots in use that are vying
//                     for tee times at this course so this required significant optimization to fractions of a second
//                     in order to secure competitive tee times.</p>
//             </div>
//         </div>
//     </section>
//   );
// }
//
// export default Portfolio;

import React from 'react';
import './Portfolio.css';

const Portfolio = () => {
  const projects = [
    {
      id: 1,
      title: "Bethpage Tee Times Bot",
      videoId: "W8mCjIS26KY?si=NGUvzLp7_OhWafxU",
      description: "A simple bot that automates the process of getting golf tee times at the extremely competitive\n" +
          "                    Bethpage State Park in Bethpage, New York. There are many other bots in use that are vying\n" +
          "                    for tee times at this course so this required significant optimization to fractions of a second\n" +
          "                    in order to secure competitive tee times.",
    },
    // Add more projects as needed
  ];

  return (
    <section id="portfolio">
      <h2>Portfolio</h2>
      <div className="projects-container">
        {projects.map((project) => (
            <div className="project-box" key={project.id}>
                <iframe width="560" height="315" src={`https://www.youtube.com/embed/${project.videoId}`}
                        title="YouTube video player" frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin" allowFullScreen>
                </iframe>
                <div className="project-details">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                </div>
            </div>
        ))}
      </div>
    </section>
  );
}

export default Portfolio;
