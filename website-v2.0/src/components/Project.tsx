import React, { useState } from 'react';
import { Link } from 'react-router-dom';


interface ProjectProps {
  project: {
    _id: string;
    title: string;
    description: string;
    youtube_url: string;
    github_link: string;
  };
}

const Project: React.FC<ProjectProps> = ({ project }) => {

  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu\.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|&v=|watch\?vi=|vi\/|watch\?v%3D)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };


  const videoId = getYouTubeVideoId(project.youtube_url);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';

  return (
    <div className="project bg-white p-6 rounded-lg shadow-md hover:bg-gray-100 transition duration-200 ease-in-out text-center">
      <h3 className="text-2xl font-bold mb-2">
        {project.title}
      </h3>
      {<p className="text-gray-700 mb-4">{project.description}</p>}

      {videoId && (
        <div className="aspect-w-16 aspect-h-9 mb-4">
          <iframe
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      )}
      <a href={project.github_link} className="text-primary-color hover:underline mb-4 block">GitHub Repository</a>
    </div>
  );
};

export default Project;
