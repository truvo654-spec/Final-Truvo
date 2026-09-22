import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './theme/ThemeContext';
import { setupButtonIconCleaner } from './utils/buttonIconCleaner';

// Initialize platform-wide button icon cleaner to remove icons from buttons with text
setupButtonIconCleaner();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

