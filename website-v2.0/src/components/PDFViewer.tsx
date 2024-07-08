import React, { useState } from 'react';

interface PDFViewerProps {
  file: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onIframeLoad = (event: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    const iframe = event.currentTarget;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (iframeDoc) {
      const pages = iframeDoc.querySelectorAll('.page');
      setNumPages(pages.length);
      setPageNumber(1);

      iframeDoc.addEventListener('scroll', () => {
        const currentPage = Math.floor((iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop) / iframeDoc.documentElement.clientHeight) + 1;
        setPageNumber(currentPage);
      });
    }
  };

  return (
    <div className="pdf-viewer">
      <h3 className="pdf-title">
        Preview ______________________________________________________ Page {pageNumber} of {numPages}
      </h3>
      <div className="pdf-document">
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(file)}&embedded=true`}
          title="PDF Viewer"
          className="pdf-iframe"
          onLoad={onIframeLoad}
        >
          <p>Your browser does not support iframes.</p>
        </iframe>
      </div>
    </div>
  );
};

export default PDFViewer;
