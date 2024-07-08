// Writing.js
import React from 'react';
import './Writing.css'; // Import the CSS file
import PDFViewer from './PDFViewer'; // Import the PDFViewer component

const Writing = () => {
  const papers = [
    {
      title: 'Big Data Ownership in Jewish Law',
      description: '"Big data" is often discussed in contexts of privacy and malpractice, where the focus of the discourse is centered around misuse by companies of collected data. However, I would instead like to focus on a different aspect of this new phenomenon: ownership. Who exactly owns the data that is collected? Is it the company that collects the data? Is it the user about whom the data was collected?',
      image: require('../files/big_data.jpeg'),
      file: require('../files/BigDataOwnership.pdf')
    },
    {
      title: 'Quasi-Deterministic Quick Pivot Selection Algorithm *(In Progress)',
      description: 'Using the Central Limit Theorem, we can achieve an O(1) Pivot selection algorithm that results in worst-case performance of O(nlogn) performance for quicksort and improves the average performance by a constant.',
      image: require('../files/Quicksort.gif'),
      file: require('../files/QuickPivot.pdf')
    },
    {
      title: "Samuel's View on Monarchy",
      description: 'Samuel\'s view on the ideal represnetation of monarchy as seen in Shoftim 9.',
      image: require('../files/samuel.jpeg'),
      file: require('../files/Shoftim9.pdf')
    },
    {
      title: "Supply and Demand Below Zero",
      description: 'A two-part theory regarding a necessary extension of the demand curve  This paper calls for the demand curve to be extended to include “demand below zero” - instances in which consumers are paid by producers to use a given good.\n' +
          'The paper further outlines three basic instances of supply below zero: that of inferior goods, nonphysical goods/services and surplus. A case-study is found in late April 2020 when crude oil was being supplied at a price below zero.\n' +
          'Finally, the paper describes the relationship between supply and demand below zero. ',
      image: require('../files/supply_zero.png'),
      file: require('../files/Supply and Demand Below Zero.pdf')
    },
    {
      title: "Using Pre-Models to Optimize Image-Net (Upcoming) ",
      description: 'Using a pre-model, we can determine which kernels to run through a given image in the input layer of ImageNet and skip' +
          'any kernels that will have no activation on the given image.',
      image: require('../files/imagenet.jpeg'),
    }

    // Add more papers as needed
  ];

  const [selectedPaper, setSelectedPaper] = React.useState(null);

  const openViewer = (file) => {
    setSelectedPaper(file);
  };

  const closeViewer = () => {
    setSelectedPaper(null);
  };

  return (
    <div id="writing">
      <div className="writing-container">
        {papers.map((paper, index) => (
          <div key={index} className="paper-group">
            <div className="paper-info">
              <h3>{paper.title}</h3>
              <p>{paper.description}</p>
              <button onClick={() => openViewer(paper.file)}>Open Paper</button>
            </div>
            <div className="paper-image">
              <img src={paper.image} alt={`Image for ${paper.title}`} />
            </div>
          </div>
        ))}
      </div>
      {selectedPaper && (
        <div className="pdf-overlay">
          <div className="pdf-popup">
            <button className="close-button" onClick={closeViewer}>
              Close
            </button>
            <PDFViewer file={selectedPaper} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Writing;
