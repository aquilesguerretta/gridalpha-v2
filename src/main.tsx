import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GlobalShell from './components/GlobalShell'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalShell />
  </StrictMode>,
)
