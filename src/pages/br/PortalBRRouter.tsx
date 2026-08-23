// PortalBRRouter — ARCHITECT, Portal BR Wave 8.
//
// A primeira sub-rota do Portal Brasil. Até esta wave `/br` era rota
// RASA — a auditoria de terreno (`docs/portal-br-familia-audit.md`,
// Fase 3) mediu isso e registrou as duas convenções disponíveis no app.
//
// CONVENÇÃO HERDADA, NÃO INVENTADA: este router é modelado no da
// Alexandria (`src/pages/alexandria/AlexandriaRouter.tsx`), o único
// padrão de sub-rota que o app já tinha — `main.tsx` casa um splat
// (`/br/*`), o componente declara `<Routes>` com `<Route index>`,
// caminhos RELATIVOS e um catch-all. `familia/:familiaId` ocupa aqui o
// mesmo lugar que `trilha/:trilhaId` ocupa lá.
//
// Rota rasa (`/br/advisory` ao lado de `/br` em main.tsx) era a outra
// opção. Ficou de fora porque o segmento nu compete com qualquer outra
// sub-página futura do Portal (`/br/precos`, `/br/sobre`) e obrigaria a
// desambiguar depois; o prefixo `familia/` diz o que o segmento é.
//
// O catch-all manda endereço desconhecido para o Portal, não para uma
// página de erro — mesmo comportamento que o `*` de `main.tsx` já tem.

import { Route, Routes } from 'react-router-dom';

import { PortalBR } from './PortalBR';
import { FamiliaPage } from './FamiliaPage';

export function PortalBRRouter() {
  return (
    <Routes>
      <Route index element={<PortalBR />} />
      <Route path="familia/:familiaId" element={<FamiliaPage />} />
      <Route path="*" element={<PortalBR />} />
    </Routes>
  );
}

export default PortalBRRouter;
