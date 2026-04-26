import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './index.css';
import GlobalShell from './components/GlobalShell';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupCredentialsPage } from './pages/auth/SignupCredentialsPage';
import { SignupProfilePage } from './pages/auth/SignupProfilePage';
import { SignupDetailsPage } from './pages/auth/SignupDetailsPage';
import { SignupSuccessPage } from './pages/auth/SignupSuccessPage';
import { AuthLayout } from './components/editorial/AuthLayout';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupCredentialsPage />} />
          <Route path="/signup/profile" element={<SignupProfilePage />} />
          <Route path="/signup/details" element={<SignupDetailsPage />} />
          <Route path="/signup/success" element={<SignupSuccessPage />} />
        </Route>

        <Route path="/nest" element={<GlobalShell initialView="nest" />} />
        <Route path="/atlas" element={<GlobalShell initialView="atlas" />} />
        <Route path="/peregrine" element={<GlobalShell initialView="peregrine" />} />
        <Route path="/analytics" element={<GlobalShell initialView="analytics" />} />
        <Route path="/vault" element={<GlobalShell initialView="vault" />} />
        {/* Vault sub-routes — same shell; the Vault component reads
            useParams() to switch between VaultIndex / Alexandria /
            CaseStudyView. ATLAS owns that internal routing. */}
        <Route path="/vault/alexandria" element={<GlobalShell initialView="vault" />} />
        <Route path="/vault/:id" element={<GlobalShell initialView="vault" />} />

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
