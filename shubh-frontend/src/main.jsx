/**
 * main.jsx — Application entry point
 *
 * Mount order (outermost → innermost):
 *
 *  React.StrictMode      — catches side-effect bugs in development
 *  HelmetProvider        — enables per-page <title> / meta via <Helmet>
 *  BrowserRouter         — HTML5 history routing
 *  ThemeProvider         — dark / dim theme toggle + CSS var overrides
 *  AuthProvider          — user session, login / logout helpers
 *  App                   — route tree
 *  Toaster               — toast notifications (bottom-right)
 *
 * Why this order?
 *  - AuthProvider needs BrowserRouter for any potential navigation side-effects.
 *  - ThemeProvider sits outside Auth because theme preference exists even
 *    when the user is not logged in.
 *  - Toaster is a sibling of App (not a wrapper) so it renders above all
 *    page content without affecting the layout tree.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider }  from './context/AuthContext';

import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App />

            {/*
              Toast configuration — matches the Dark Academia palette.
              Placement: bottom-right so it doesn't cover the primary content.
              Duration: 4 s for success, 6 s for error (more time to read).
            */}
            <Toaster
              position="bottom-right"
              gutter={8}
              toastOptions={{
                // Base styles
                style: {
                  background:  '#151515',
                  color:       '#FFFFFF',
                  border:      '1px solid #222222',
                  fontFamily:  '"Inter", system-ui, sans-serif',
                  fontSize:    '13px',
                  borderRadius: '0',
                  padding:     '12px 16px',
                  maxWidth:    '360px',
                },
                duration: 4000,
                // Success: crimson check
                success: {
                  duration: 4000,
                  iconTheme: { primary: '#8B0000', secondary: '#ffffff' },
                },
                // Error: longer display
                error: {
                  duration: 6000,
                  iconTheme: { primary: '#EF4444', secondary: '#ffffff' },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
