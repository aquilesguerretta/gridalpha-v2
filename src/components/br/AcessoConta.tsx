// src/components/br/AcessoConta.tsx
// ARCHITECT — Identidade de Plataforma, Wave 1 (adendo).
//
// A porta de entrada da conta no header do Portal Brasil. A Wave 1
// construiu /entrar, /criar-conta e /conta, mas nenhuma superfície
// linkava para elas — dava para chegar lá clicando um destino ou
// digitando a URL, e mais nada.
//
// Três estados, todos honestos sobre o que se sabe no momento:
//   · carregando — enquanto /api/auth/me não respondeu, NÃO diz
//     "Entrar". Dizer isso a quem tem sessão válida é mentira de
//     ~200ms que pisca em toda carga de página. Reserva o espaço e
//     não afirma nada.
//   · sem sessão — "Entrar", levando o destino atual junto para a
//     pessoa voltar para onde estava.
//   · com sessão — primeiro nome + link para /conta.
//
// Registro Jaguar, sem token novo: é o header do Portal Brasil.

import { Link, useLocation } from 'react-router-dom';

import { J, JT } from '../../design/jaguar-tokens';
import { useAuth } from '../../lib/auth/AuthContext';

/** Primeiro nome — o header é estreito e o nome completo empurraria o
 *  seletor de mercado. O nome inteiro está em /conta. */
function primeiroNome(nome: string): string {
  const limpo = nome.trim();
  if (!limpo) return 'Conta';
  return limpo.split(/\s+/)[0];
}

export function AcessoConta() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Espaço reservado com a mesma altura de linha do que vem depois,
  // para o header não pular quando a sessão resolve.
  if (loading) {
    return (
      <span
        aria-hidden="true"
        style={{ ...JT.rotulo, color: 'transparent', userSelect: 'none' }}
      >
        Entrar
      </span>
    );
  }

  if (!user) {
    return (
      // Caixa de fio, NÃO fio-embaixo: o sublinhado ocre de 2px é o
      // vocabulário do mercado ATIVO no SeletorMercado, ao lado. Usar
      // o mesmo tratamento aqui faria "Entrar" parecer um estado
      // ("você está em Entrar") em vez de uma ação. Retângulo de fio
      // é o idioma de ação deste sistema — raio zero, como tudo.
      <Link
        to="/entrar"
        state={{ de: location.pathname + location.search }}
        style={{
          ...JT.rotulo,
          color: J.tintaPrimaria,
          textDecoration: 'none',
          border: `1px solid ${J.bordaStrong}`,
          borderRadius: 0,
          padding: '5px 12px',
          outlineColor: J.acenteOcreEscuro,
        }}
      >
        Entrar
      </Link>
    );
  }

  return (
    <Link
      to="/conta"
      title={user.name}
      style={{
        ...JT.rotulo,
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '8px',
        color: J.tintaPrimaria,
        textDecoration: 'none',
        outlineColor: J.acenteOcreEscuro,
      }}
    >
      <span style={{ color: J.tintaSecundaria }}>Conta</span>
      <span>{primeiroNome(user.name)}</span>
    </Link>
  );
}

export default AcessoConta;
