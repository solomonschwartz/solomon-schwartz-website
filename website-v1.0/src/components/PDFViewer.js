// PDFViewer.js
import React from "react";
import {useEffect} from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import "./PDFViewer.css"; // Import the CSS file

// Ensure pdfjs.workerSrc property is set correctly
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
// PDFViewer.js

const PDFViewer = ({ file }) => {
  const [numPages, setNumPages] = React.useState(null);
  const [pageNumber, setPageNumber] = React.useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

useEffect(() => {
  console.log('useEffect hook executed');
  const viewer = document.getElementById('pdf-viewer');
  if (viewer) {
    console.log('Viewer element found:', viewer);

    const handleScroll = () => {
      const pageHeight = viewer.scrollHeight / numPages;
      const currentPage = Math.floor(viewer.scrollTop / pageHeight) + 1;
      setPageNumber(currentPage);
    };
    viewer.addEventListener('scroll', handleScroll);
    return () => {
      viewer.removeEventListener('scroll', handleScroll);
    };
  } else {
    console.log('Viewer element not found');
  }
}, [numPages]);


  return (
    <div className="pdf-viewer" id="pdf-viewer">
      <h3 className="pdf-title">
        Preview ______________________________________________________ Page {pageNumber} of {numPages}
      </h3>
      <div className="pdf-document">
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="pdf-doc">
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page_${index + 1}`} className="page">
              <Page pageNumber={index + 1} width={784} className='pdf-page' />
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;