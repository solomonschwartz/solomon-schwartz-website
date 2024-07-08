import React from 'react';
import { useNavigate } from 'react-router-dom';
import Project from './Project';
import Layout from './Layout';

interface ProjectType {
  _id: string;
  title: string;
  description: string;
  impressions: number;
  youtube_url: string;
  github_link: string;
  contributors: { email: string; contribution: string }[];
}

const Portfolio: React.FC = () => {
  const navigate = useNavigate();

  const projects: ProjectType[] = [
    {
      _id: '1',
      title: 'Bethpage Bot',
      description: 'A bot to book tee times at Bethpage golf course.',
      impressions: 100,
      youtube_url: 'https://www.youtube.com/watch?v=W8mCjIS26KY',
      github_link: 'https://github.com/',
      contributors: [{ email: 'solomonschwartz01@gmail.com', contribution: 'Developer' }]
    },
    {
      _id: '2',
      title: 'Actovia Chrome Extension',
      description: 'A Google Chrome Extension to automate processes a client used in their real estate brokerage business.',
      impressions: 79,
      youtube_url: 'https://www.youtube.com/watch?v=Dx5nF7NmoY8',
      github_link: 'https://github.com/',
      contributors: [{ email: 'solomonschwartz01@gmail.com', contribution: 'Developer' }]
    },
    // Add more projects as needed
  ];


  return (
    <Layout>
      <div className="flex h-screen w-screen">
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-3xl font-bold mb-8 text-center">Portfolio</h1>
            <div className="project-section">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {projects.map(project => (
                  <Project key={project._id} project={project} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Portfolio;
