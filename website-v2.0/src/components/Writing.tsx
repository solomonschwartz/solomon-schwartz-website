import React, { useState } from 'react';
import PDFViewer from './PDFViewer'; // Import the PDFViewer component

// Import images and files
import bigDataImage from '../files/big_data.jpeg';
import quicksortImage from '../files/Quicksort.gif';
import samuelImage from '../files/samuel.jpeg';
import supplyZeroImage from '../files/supply_zero.png';
import imagenetImage from '../files/imagenet.jpeg';

import bigDataFile from '../files/BigDataOwnership.pdf';
import quickPivotFile from '../files/QuickPivot.pdf';
import samuelFile from '../files/Shoftim9.pdf';
import supplyZeroFile from '../files/Supply and Demand Below Zero.pdf';
import Layout from "./Layout";

const papers = [
  {
    title: 'Big Data Ownership in Jewish Law',
    description: '"Big data" is often discussed in contexts of privacy and malpractice, where the focus of the discourse is centered around misuse by companies of collected data. However, I would instead like to focus on a different aspect of this new phenomenon: ownership. Who exactly owns the data that is collected? Is it the company that collects the data? Is it the user about whom the data was collected?',
    image: bigDataImage,
    file: bigDataFile
  },
  {
    title: 'Quasi-Deterministic Quick Pivot Selection Algorithm *(In Progress)',
    description: 'Using the Central Limit Theorem, we can achieve an O(1) Pivot selection algorithm that results in worst-case performance of O(nlogn) performance for quicksort and improves the average performance by a constant.',
    image: quicksortImage,
    file: quickPivotFile
  },
  {
    title: "Samuel's View on Monarchy",
    description: 'Samuel\'s view on the ideal representation of monarchy as seen in Shoftim 9.',
    image: samuelImage,
    file: samuelFile
  },
  {
    title: "Supply and Demand Below Zero",
    description: 'A two-part theory regarding a necessary extension of the demand curve. This paper calls for the demand curve to be extended to include “demand below zero” - instances in which consumers are paid by producers to use a given good.\nThe paper further outlines three basic instances of supply below zero: that of inferior goods, nonphysical goods/services and surplus. A case-study is found in late April 2020 when crude oil was being supplied at a price below zero.\nFinally, the paper describes the relationship between supply and demand below zero.',
    image: supplyZeroImage,
    file: supplyZeroFile
  },
  {
    title: "Using Pre-Models to Optimize Image-Net (Upcoming)",
    description: 'Using a pre-model, we can determine which kernels to run through a given image in the input layer of ImageNet and skip any kernels that will have no activation on the given image.',
    image: imagenetImage,
    file: null
  }
];

const Writing: React.FC = () => {
  const [selectedPaper, setSelectedPaper] = useState<string | null>(null);

  const openViewer = (file: string) => {
    setSelectedPaper(file);
  };

  const closeViewer = () => {
    setSelectedPaper(null);
  };

  return (
      <Layout>
    <div id="writing" className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {papers.map((paper, index) => (
          <div key={index} className="border rounded-lg shadow-lg p-4 flex flex-col">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">{paper.title}</h3>
              <p className="text-gray-700 mb-4">{paper.description}</p>
            </div>
            {paper.file && (
              <button
                onClick={() => openViewer(paper.file)}
                className="mt-4 py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Open Paper
              </button>
            )}
            {paper.image && (
              <div className="mt-4">
                <img src={paper.image} alt={`Image for ${paper.title}`} className="w-full h-auto rounded" />
              </div>
            )}
          </div>
        ))}
      </div>
      {selectedPaper && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg w-3/4 h-3/4 relative">
            <button
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
              onClick={closeViewer}
            >
              Close
            </button>
            <PDFViewer file={selectedPaper} />
          </div>
        </div>
      )}
    </div>
        </Layout>
  );
};

export default Writing;
