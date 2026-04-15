import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Punto de entrada de la aplicación React
// Renderizamos App dentro del div root del index.html
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* StrictMode ayuda a detectar problemas durante desarrollo */}
    <App />
  </React.StrictMode>
);
