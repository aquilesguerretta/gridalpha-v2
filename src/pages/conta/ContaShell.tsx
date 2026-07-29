// src/pages/conta/ContaShell.tsx
// ARCHITECT — Identidade de Plataforma, Wave 1.
//
// Chassi comum das três telas de conta (/entrar, /criar-conta, /conta).
//
// DESVIO MÍNIMO DE POSSE, declarado: o brief lista três arquivos de
// página. Este quarto existe porque as três dividem o mesmo quadro
// (marca, campo de papel, botão, rodapé de contexto) e duplicar isso
// em triplicata é exatamente o tipo de deriva que a folha de tokens
// da Wave 3 foi criada para impedir. Mesmo diretório, nenhuma regra
// de sistema nova.
//
// REGISTRO VISUAL: Jaguar, sem token novo. Identidade é da PLATAFORMA
// e a superfície de plataforma que existe hoje é o Portal Brasil —
// mesmo papel, mesma tinta, mesma escala JT. O Falcon (escuro) é o
// registro do terminal americano; usá-lo aqui seria dizer que conta é
// coisa do terminal, que é justamente o que a Wave 9 desfez.

import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { J, JF, JT } from '../../design/jaguar-tokens';

const MEDIDA_FORM = '440px';

/** Fonte Geist Sans + estilos que precisam de pseudo-classe (foco,
 *  placeholder, hover) — inline não alcança nenhum dos três. */
export function EstilosConta() {
  return (
    <style>{`
      @font-face {
        font-family: 'Geist Sans';
        src: url('/fonts/Geist-Variable.woff2') format('woff2');
        font-weight: 100 900;
        font-style: normal;
        font-display: swap;
      }
      .conta-campo {
        width: 100%;
        box-sizing: border-box;
        font-family: inherit;
        font-size: 15px;
        color: ${J.tintaPrimaria};
        background: ${J.papelRaised};
        border: 1px solid ${J.bordaDefault};
        border-radius: 0;
        padding: 11px 13px;
        transition: border-color 140ms ease;
      }
      .conta-campo::placeholder { color: ${J.tintaMuted}; }
      .conta-campo:hover { border-color: ${J.bordaStrong}; }
      .conta-campo:focus {
        outline: 2px solid ${J.acenteOcreEscuro};
        outline-offset: 1px;
        border-color: ${J.acenteOcreEscuro};
      }
      .conta-campo[aria-invalid='true'] { border-color: ${J.acenteOcreEscuro}; }
      .conta-botao {
        width: 100%;
        font-family: inherit;
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.02em;
        color: ${J.tintaInversa};
        background: ${J.tintaPrimaria};
        border: 1px solid ${J.tintaPrimaria};
        border-radius: 0;
        padding: 12px 16px;
        cursor: pointer;
        transition: opacity 140ms ease;
      }
      .conta-botao:hover:not(:disabled) { opacity: 0.86; }
      .conta-botao:disabled { opacity: 0.45; cursor: default; }
      .conta-botao:focus-visible {
        outline: 2px solid ${J.acenteOcreEscuro};
        outline-offset: 2px;
      }
      .conta-link {
        color: ${J.tintaPrimaria};
        text-decoration: underline;
        text-underline-offset: 3px;
        outline-color: ${J.acenteOcreEscuro};
      }
    `}</style>
  );
}

export interface ContaShellProps {
  /** Rótulo mono acima do título. */
  eyebrow: string;
  titulo: string;
  /** Uma linha de contexto sob o título. Opcional. */
  subtitulo?: string;
  children: ReactNode;
  /** Rodapé da prancha — o link para a tela irmã. */
  rodape?: ReactNode;
  /** Prancha larga (perfil) em vez da coluna de formulário. */
  largura?: 'formulario' | 'prancha';
}

export function ContaShell({
  eyebrow,
  titulo,
  subtitulo,
  children,
  rodape,
  largura = 'formulario',
}: ContaShellProps) {
  return (
    <div
      lang="pt-BR"
      style={{
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        background: J.papelBase,
        color: J.tintaPrimaria,
        fontFamily: JF.sans,
        borderRadius: 0,
      }}
    >
      <EstilosConta />

      <header
        style={{
          flexShrink: 0,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 32px',
          borderBottom: `1px solid ${J.bordaDefault}`,
        }}
      >
        <Link
          to="/br"
          style={{
            fontSize: '16px',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: J.tintaPrimaria,
            textDecoration: 'none',
            outlineColor: J.acenteOcreEscuro,
          }}
        >
          GridAlpha
        </Link>
        <span
          aria-hidden="true"
          style={{ width: '1px', height: '14px', background: J.bordaDefault }}
        />
        <span style={{ ...JT.rotulo, color: J.tintaSecundaria }}>Conta</span>
      </header>

      {/* `margin: auto` num item de coluna flex centraliza vertical e
          horizontalmente E respeita o overflow — se o formulário
          crescer além da viewport, o topo não é cortado (o que
          `align-items: center` faria). A prancha do perfil não
          centraliza: conteúdo longo lê melhor ancorado no topo. */}
      <main
        style={{
          width: '100%',
          maxWidth: largura === 'prancha' ? '1000px' : MEDIDA_FORM,
          margin: largura === 'prancha' ? '0 auto' : 'auto',
          padding: largura === 'prancha' ? '48px 32px 72px' : '48px 32px 56px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ ...JT.rotulo, color: J.acenteOcreEscuro }}>{eyebrow}</span>
          <h1 style={{ ...JT.h2, margin: 0, color: J.tintaPrimaria }}>{titulo}</h1>
          {subtitulo && (
            <p style={{ ...JT.corpo, margin: 0, fontSize: '15px', color: J.tintaSecundaria }}>
              {subtitulo}
            </p>
          )}
        </div>

        <div style={{ marginTop: '32px' }}>{children}</div>

        {rodape && (
          <div
            style={{
              marginTop: '28px',
              paddingTop: '18px',
              borderTop: `1px solid ${J.bordaDefault}`,
              fontSize: '14px',
              color: J.tintaSecundaria,
            }}
          >
            {rodape}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Campo de formulário ──────────────────────────────────────────

export interface CampoProps {
  id: string;
  rotulo: string;
  tipo: 'email' | 'password' | 'text';
  valor: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  /** Mensagem de erro do próprio campo. */
  erro?: string;
  /** Dica permanente sob o campo (ex.: regra de senha). */
  dica?: string;
  autoFocus?: boolean;
}

export function Campo({
  id,
  rotulo,
  tipo,
  valor,
  onChange,
  autoComplete,
  erro,
  dica,
  autoFocus,
}: CampoProps) {
  const idAjuda = erro ? `${id}-erro` : dica ? `${id}-dica` : undefined;
  const estiloAuxiliar: CSSProperties = { fontSize: '13px', lineHeight: 1.45 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={id} style={{ ...JT.rotulo, color: J.tintaSecundaria }}>
        {rotulo}
      </label>
      <input
        id={id}
        className="conta-campo"
        type={tipo}
        value={valor}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-invalid={erro ? 'true' : undefined}
        aria-describedby={idAjuda}
        onChange={(e) => onChange(e.target.value)}
      />
      {erro ? (
        <span id={`${id}-erro`} style={{ ...estiloAuxiliar, color: J.acenteOcreEscuro }}>
          {erro}
        </span>
      ) : dica ? (
        <span id={`${id}-dica`} style={{ ...estiloAuxiliar, color: J.tintaSecundaria }}>
          {dica}
        </span>
      ) : null}
    </div>
  );
}

// ─── Aviso de erro da requisição ──────────────────────────────────

/**
 * Erro vindo do servidor, acima do botão.
 *
 * `role="alert"` para o leitor de tela anunciar sem precisar de foco —
 * quem submeteu está esperando resposta e precisa saber que veio.
 */
export function AvisoErro({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      style={{
        fontSize: '14px',
        lineHeight: 1.5,
        color: J.tintaPrimaria,
        background: J.acenteOcreWash,
        border: `1px solid ${J.bordaAcento}`,
        borderRadius: 0,
        padding: '10px 13px',
      }}
    >
      {children}
    </div>
  );
}
