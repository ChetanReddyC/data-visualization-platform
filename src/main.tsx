import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App/App';
import './styles/global.css'; // Global styles
import './styles/responsive.css'; // Responsive styles
import { Provider } from 'react-redux';
import { store } from './store/store';

// Set document title - this overrides whatever was set in index.html
document.title = 'Data Viz Platform';

// Add viewport meta tag for responsive design
const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
document.getElementsByTagName('head')[0].appendChild(meta);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
