/**
 * main.jsx - Entry Point of the React Application
 *
 * This is the first file that runs when the app starts.
 * It renders the App component into the HTML page.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Import global styles (Tailwind CSS)
import App from './App.jsx'; // Import the main App component

// Find the HTML element with id="root" and render our React app inside it
// StrictMode helps catch potential problems in development
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
