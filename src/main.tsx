import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import Admin from './pages/Admin';
import Home from './pages/Home';
import Recipe from './pages/Recipe';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = ReactDOM.createRoot(rootElement);

import { msalConfig } from '../authConfig';
const instance = new PublicClientApplication(msalConfig);

root.render(
    <React.StrictMode>
        <MsalProvider instance={instance}>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<App />}>
                        <Route index element={<Home />} />
                        <Route path='admin' element={<Admin />} />
                        <Route path='Recipe' element={<Recipe />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </MsalProvider>
    </React.StrictMode>
);
