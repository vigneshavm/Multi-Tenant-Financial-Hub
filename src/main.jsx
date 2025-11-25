import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// This file is the standard entry point for a React 18 application.

// It is assumed that global CSS (like Tailwind setup) is handled either
// externally or compiled via a build process, which is typical for large projects.

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Could not find the root element with ID 'root'.");
}
