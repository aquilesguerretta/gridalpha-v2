import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import './index.css';
import GlobalShell from './components/GlobalShell';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupCredentialsPage } from './pages/auth/SignupCredentialsPage';
import { SignupProfilePage } from './pages/auth/SignupProfilePage';
import { SignupDetailsPage } from './pages/auth/SignupDetailsPage';
import { SignupSuccessPage } from './pages/auth/SignupSuccessPage';
import { AuthLayout } from './components/editorial/AuthLayout';
import { AlexandriaHome } from './pages/alexandria/AlexandriaHome';
import { PortalBR } from './pages/br/PortalBR';
import { AuthProvider } from './lib/auth/AuthContext';
import { EntrarView } from './pages/conta/EntrarView';
import { CriarContaView } from './pages/conta/CriarContaView';
import { PerfilPlataforma } from './pages/conta/PerfilPlataforma';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* Identidade de plataforma envolve a árvore INTEIRA — uma conta
          por pessoa, lida do mesmo lugar por Portal Brasil, Alexandria
          e o futuro terminal americano. Nenhum produto guarda estado de
          login próprio. `/alexandria/*` está dentro de propósito, mesmo
          que ainda não consuma: o contexto existe antes do consumidor,
          e a wave do LYCEUM só precisa chamar useAuth(). */}
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Fluxo LEGADO do terminal americano — NÃO é conta de
              plataforma. Auditado na Fase 1 desta wave: nunca chamou API
              nenhuma. `/login` valida formato e navega para /nest
              (`// TODO: Replace with Supabase auth`); `/signup/*` grava
              arquétipo de perfil (trader / analyst / storage / …) em
              zustand+sessionStorage. Escolhe QUAL TERMINAL você vê, não
              QUEM você é. Intocado — as rotas de identidade são
              /entrar, /criar-conta e /conta. */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupCredentialsPage />} />
            <Route path="/signup/profile" element={<SignupProfilePage />} />
            <Route path="/signup/details" element={<SignupDetailsPage />} />
            <Route path="/signup/success" element={<SignupSuccessPage />} />
          </Route>

          {/* Identidade de plataforma (Endpoints 16-21 do backend).
              Nomes em português: são superfícies da plataforma, cuja
              face pública hoje é brasileira. Sem colisão com o fluxo
              legado acima — auditado na Fase 1. */}
          <Route path="/entrar" element={<EntrarView />} />
          <Route path="/criar-conta" element={<CriarContaView />} />
          {/* Protegida — o próprio componente redireciona para /entrar
              quando não há sessão, depois de `loading` resolver. */}
          <Route path="/conta" element={<PerfilPlataforma />} />

          <Route path="/nest" element={<GlobalShell initialView="nest" />} />
          <Route path="/atlas" element={<GlobalShell initialView="atlas" />} />
          <Route path="/peregrine" element={<GlobalShell initialView="peregrine" />} />
          <Route path="/analytics" element={<GlobalShell initialView="analytics" />} />
          <Route path="/vault" element={<GlobalShell initialView="vault" />} />
          {/* Vault sub-routes — same shell; the Vault component reads
              useParams() to switch between VaultIndex / Alexandria /
              CaseStudyView. ATLAS owns that internal routing. */}
          <Route path="/vault/alexandria" element={<GlobalShell initialView="vault" />} />
          <Route path="/vault/alexandria/lesson/:lessonId" element={<GlobalShell initialView="vault" />} />
          <Route path="/vault/alexandria/entry/:entrySlug" element={<GlobalShell initialView="vault" />} />
          <Route path="/vault/:id" element={<GlobalShell initialView="vault" />} />

          <Route path="/alexandria/*" element={<AlexandriaHome />} />

          {/* Portais de mercado. Mercado é segmento de URL, não estado em
              store: link compartilhável, bookmark funciona, sem hidratação.
              `/alexandria` fica fora do prefixo de propósito — tem trilhas
              universal / brasil / usa, então pertence aos dois portais.
              `/us` é alias da superfície de entrada americana existente;
              quando o portal US ganhar página própria, só este element
              muda. */}
          <Route path="/br" element={<PortalBR />} />
          <Route path="/us" element={<Navigate to="/" replace />} />

          <Route path="*" element={<LandingPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
