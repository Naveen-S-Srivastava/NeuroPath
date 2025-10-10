import React, { useEffect } from 'react';

export const ReportPreviewModal = ({ isOpen, onClose, url, title, fileType }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPdf = (fileType && fileType.toLowerCase() === 'pdf') || (url && url.toLowerCase().endsWith('.pdf'));
  const isImage = (fileType && /^(jpg|jpeg|png|gif|webp)$/i.test(fileType)) || (url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative max-w-4xl w-full mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title || 'Report Preview'}</h3>
          <div className="flex items-center space-x-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Open in new tab
            </a>
            <button
              onClick={() => {
                // Download by opening link with download attr if same-origin; fallback to open
                const a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.rel = 'noreferrer';
                a.click();
              }}
              className="text-sm px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              Download
            </button>
            <button onClick={onClose} className="text-sm px-3 py-1 rounded bg-red-50 dark:bg-red-600 text-red-700 dark:text-white">Close</button>
          </div>
        </div>
        <div className="p-4 h-[70vh]">
          {isPdf ? (
            <iframe src={url} title={title} className="w-full h-full rounded" />
          ) : isImage ? (
            <img src={url} alt={title} className="w-full h-full object-contain rounded" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300">
              <p>Preview not available. You can open the file in a new tab.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
