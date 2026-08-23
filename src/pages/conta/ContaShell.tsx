// src/pages/conta/ContaShell.tsx
// ARCHITECT — Identidade de Plataforma, Wave 1.
// ARCHITECT — Portal BR Wave [N] · Migração de conta para tokens NIVAR.
//
// Chassi comum das três telas de conta (/entrar, /criar-conta, /conta).
//
// DESVIO MÍNIMO DE POSSE, declarado: o brief lista três arquivos de
// página. Este quarto existe porque as três dividem o mesmo quadro
// (marca, campo, botão, rodapé de contexto) e duplicar isso em
// triplicata é exatamente o tipo de deriva que a folha de tokens foi
// criada para impedir. Mesmo diretório, nenhuma regra de sistema nova.
//
// REGISTRO VISUAL: NIVAR, sem token novo. A folha Jaguar (Portal
// Brasil, era pré-marca) saiu — a plataforma inteira fala NIVAR desde
// a Portal BR Wave 5. Migração é só APRESENTAÇÃO: nenhuma linha de
// lógica de auth, validação ou submissão muda nesta wave.
//
// Mesmo padrão da Portal BR Wave 5 (`PortalBR.tsx`): só os arquivos de
// VARIÁVEL do NIVAR entram (fonts/colors/typography/space/motion).
// `base.css` fica de fora de propósito — ele restila elemento global
// (`body`, `h1-h6`, `a`, barra de rolagem) sem escopo nenhum, e
// vazaria para as outras superfícies do app que não pediram NIVAR. O
// que o `base.css` daria para foco, seleção e link entra abaixo,
// preso a classes próprias (`.conta-*`) — mesma disciplina que a
// ARCHITECT já aplicou no Portal.
import { useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import '../../design/nivar/fonts.css';
import '../../design/nivar/colors.css';
import '../../design/nivar/typography.css';
import '../../design/nivar/space.css';
import '../../design/nivar/motion.css';

const MEDIDA_FORM = '440px';

// ─── Papéis tipográficos NIVAR ──────────────────────────────────────
// O idioma do repo é estilo inline; os VALORES moram nos tokens CSS de
// src/design/nivar — aqui só referência var(), nunca literal de
// escala. Exportado para as três telas consumirem — a alternativa
// (cada arquivo declarando os próprios papéis) é o padrão que o
// Portal usa para evitar ciclo página→componente→página, mas aqui as
// três telas JÁ importam de ContaShell (Campo, AvisoErro), então
// centralizar aqui não cria ciclo nenhum — só evita retriplicar o
// mesmo objeto.
export const NT = {
  /** Etiqueta versalete — Work Sans 500, 11px. Rótulo de campo, dado
   *  de perfil, estado "Ativado"/"Não ativado". Mesmo papel do
   *  `.nv-campo__rotulo` do sistema. */
  etiqueta: {
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    fontSize: 'var(--ts-etiqueta)',
    lineHeight: 'var(--lh-etiqueta)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-etiqueta)',
    textTransform: 'uppercase',
  } satisfies CSSProperties,
  /** Eyebrow — JetBrains Mono 500, 10.5px, cor de acento. Mesmo papel
   *  do `.nv-acesso__eyebrow` do sistema (components/forms/field.css). */
  eyebrow: {
    fontFamily: 'var(--font-data)',
    fontWeight: 500,
    fontSize: '10.5px',
    lineHeight: 1.2,
    letterSpacing: '.11em',
    textTransform: 'uppercase',
  } satisfies CSSProperties,
  /** Título de prancha — Zilla Slab 500, 24px. Mesmo papel do
   *  `.nv-acesso__titulo`. */
  titulo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--fw-display)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-titulo)',
    lineHeight: 'var(--lh-titulo)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-titulo)',
  } satisfies CSSProperties,
  /** Título de componente — Zilla Slab 500, 19px. Nome de produto na
   *  lista, título de seção. Mesmo papel do `.nv-sech__t`. */
  titulo2: {
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--fw-display)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-titulo-2)',
    lineHeight: 'var(--lh-titulo-2)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-titulo-2)',
  } satisfies CSSProperties,
  /** Corpo — Work Sans 400, 15px. */
  corpo: {
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--fw-corpo)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-corpo)',
    lineHeight: 'var(--lh-corpo)' as CSSProperties['lineHeight'],
  } satisfies CSSProperties,
  /** Lede — Work Sans 300, 13.5px. Subtítulo da prancha. Mesmo papel
   *  do `.nv-acesso__lede`. */
  lede: {
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--fw-corpo-leve)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-corpo-2)',
    lineHeight: 'var(--lh-corpo-2)' as CSSProperties['lineHeight'],
  } satisfies CSSProperties,
  /** Nota — Work Sans 400, 12px. Ajuda de campo, disclaimer curto. */
  nota: {
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--fw-corpo)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-nota)',
    lineHeight: 'var(--lh-nota)' as CSSProperties['lineHeight'],
  } satisfies CSSProperties,
} as const;

/** Estilos que precisam de pseudo-classe (foco, placeholder, hover) —
 *  inline não alcança nenhum dos três. Reproduz, verbatim nos valores,
 *  o subconjunto de `components/forms/field.css`,
 *  `components/actions/button.css` e `components/navigation/
 *  navigation.css` (ModeToggle) que esta tela usa — os arquivos de
 *  CSS de componente do sistema não estão em `src/design/nivar/`
 *  ainda (só os tokens de variável chegaram lá até agora), então o
 *  idioma aqui é o mesmo que `portalChrome.tsx` já usa: copiar as
 *  regras, não os arquivos. */
export function EstilosConta() {
  return (
    <style>{`
      .conta-campo {
        width: 100%;
        box-sizing: border-box;
        font-family: var(--font-body);
        font-weight: 400;
        font-size: 14px;
        color: var(--text-strong);
        background: none;
        border: var(--fio) solid var(--campo-fio);
        border-radius: 0;
        padding: 9px 11px;
        transition: border-color var(--dur-estado) var(--ease);
      }
      .conta-campo::placeholder { color: var(--text-faint); font-weight: 300; }
      .conta-campo:hover { border-color: var(--fio-hover); }
      .conta-campo:focus {
        outline: 2px solid var(--accent-focus);
        outline-offset: 2px;
        border-color: var(--accent-focus);
      }
      .conta-campo[aria-invalid='true'] { border-color: var(--campo-erro-fio); }

      .conta-botao {
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-body);
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.02em;
        color: var(--btn-primario-fg);
        background: var(--btn-primario-bg);
        border: var(--fio) solid var(--btn-primario-fio);
        border-radius: 0;
        padding: 11px 16px;
        cursor: pointer;
        transition: border-color var(--dur-hover) var(--ease), opacity var(--dur-hover) var(--ease);
      }
      .conta-botao:hover:not(:disabled) {
        background: var(--btn-primario-bg-hover);
        border-color: var(--btn-primario-fio-hover);
      }
      .conta-botao:active:not(:disabled) {
        background: var(--btn-primario-bg-press);
        border-color: var(--btn-primario-fio-press);
        transition-duration: var(--dur-estado);
      }
      .conta-botao:disabled { opacity: 0.4; cursor: default; }
      .conta-botao:focus-visible {
        outline: 2px solid var(--accent-focus);
        outline-offset: 2px;
      }

      .conta-link {
        color: var(--link);
        text-decoration: none;
        border-bottom: var(--fio) solid var(--link-fio);
        transition: color var(--dur-hover) var(--ease), border-color var(--dur-hover) var(--ease);
      }
      .conta-link:hover { color: var(--link-hover); border-bottom-color: currentColor; }
      .conta-link:focus-visible { outline: 2px solid var(--accent-focus); outline-offset: 2px; }

      /* ModeToggle — CSS do sistema, verbatim
         (components/navigation/navigation.css). Mono, sem caixa, sem
         ícone; ativo = texto forte + fio no acento da casa. */
      .nv-modo { display: flex; align-items: baseline; gap: 8px; }
      .nv-modo__op {
        font-family: var(--font-data);
        font-weight: 400;
        font-size: 11px;
        line-height: 1.2;
        letter-spacing: .09em;
        text-transform: uppercase;
        color: var(--text-faint);
        background: none;
        border: 0;
        border-bottom: 1px solid transparent;
        padding: 0 0 3px;
        cursor: pointer;
        transition: color var(--dur-estado) var(--ease), border-color var(--dur-estado) var(--ease);
      }
      .nv-modo__op:hover { color: var(--fg-hover); }
      .nv-modo__op--ativo { color: var(--text-strong); font-weight: 500; border-bottom-color: var(--accent-house); }
      .nv-modo__op:focus-visible { outline: 2px solid var(--accent-focus); outline-offset: 3px; }
      .nv-modo__sep { font-family: var(--font-data); font-size: 11px; color: var(--rule-strong); }
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
  // Modo de exibição — data-mode="noturno" remapeia SÓ os aliases
  // semânticos (colors.css); nenhum valor da escala de incandescência
  // muda. Sem persistência própria (mesma pendência que a Portal BR
  // Wave 5 registrou para o Portal): o modo vive em estado de página
  // e volta ao claro na recarga — persistir é decisão de plataforma,
  // não desta wave.
  const [modo, setModo] = useState<'claro' | 'noturno'>('claro');

  return (
    <div
      lang="pt-BR"
      data-mode={modo === 'noturno' ? 'noturno' : undefined}
      style={{
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-page)',
        color: 'var(--text-body)',
        fontFamily: 'var(--font-body)',
        borderRadius: 0,
      }}
    >
      <EstilosConta />

      {/* Fio-gradiente de 4px — o único gradiente que o sistema
          permite fora do traço da marca, demarcando o topo do
          documento. Mesmo idioma do Portal Brasil. */}
      <span
        aria-hidden="true"
        style={{ flexShrink: 0, height: '4px', background: 'var(--gradiente-incandescente)' }}
      />

      <header
        style={{
          flexShrink: 0,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '0 32px',
          borderBottom: 'var(--fio) solid var(--rule)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/br"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 'var(--fw-display)' as CSSProperties['fontWeight'],
              fontSize: '16px',
              letterSpacing: '-0.01em',
              color: 'var(--text-strong)',
              textDecoration: 'none',
              outlineColor: 'var(--accent-focus)',
            }}
          >
            NIVAR
          </Link>
          <span
            aria-hidden="true"
            style={{ width: '1px', height: '14px', background: 'var(--rule)' }}
          />
          <span style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>Conta</span>
        </div>

        <div className="nv-modo" role="group" aria-label="Modo de exibição">
          <button
            type="button"
            className={`nv-modo__op${modo === 'claro' ? ' nv-modo__op--ativo' : ''}`}
            aria-pressed={modo === 'claro'}
            onClick={() => setModo('claro')}
          >
            claro
          </button>
          <span className="nv-modo__sep" aria-hidden="true">/</span>
          <button
            type="button"
            className={`nv-modo__op${modo === 'noturno' ? ' nv-modo__op--ativo' : ''}`}
            aria-pressed={modo === 'noturno'}
            onClick={() => setModo('noturno')}
          >
            noturno
          </button>
        </div>
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
          <span style={{ ...NT.eyebrow, color: 'var(--accent-house)' }}>{eyebrow}</span>
          <h1 style={{ ...NT.titulo, margin: 0, color: 'var(--text-strong)' }}>{titulo}</h1>
          {subtitulo && (
            <p style={{ ...NT.lede, margin: 0, color: 'var(--text-muted)' }}>{subtitulo}</p>
          )}
        </div>

        <div style={{ marginTop: '32px' }}>{children}</div>

        {rodape && (
          <div
            style={{
              marginTop: '28px',
              paddingTop: '18px',
              borderTop: 'var(--fio) solid var(--rule)',
              ...NT.lede,
              color: 'var(--text-muted)',
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={id} style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>
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
        // Mesmo idioma do desvio declarado do sistema para erro de
        // campo: o fio carrega a cor (glifo × em --campo-erro-fio), o
        // texto carrega a leitura (--campo-erro-texto — brasa no
        // claro, papel no noturno, porque brasa não lê sobre tinta).
        <span
          id={`${id}-erro`}
          style={{ ...NT.nota, display: 'flex', gap: '6px', color: 'var(--campo-erro-texto)' }}
        >
          <i aria-hidden="true" style={{ fontFamily: 'var(--font-data)', fontStyle: 'normal', color: 'var(--campo-erro-fio)' }}>
            ×
          </i>
          {erro}
        </span>
      ) : dica ? (
        <span id={`${id}-dica`} style={{ ...NT.nota, color: 'var(--text-faint)' }}>
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
 *
 * Sem semáforo: nada de fundo vermelho nem caixa preenchida. Segue o
 * idioma do `ErrorState` do sistema (`components/errors/errors.css`,
 * `.nv-erro`) — o sinal é o fio de 2px em `--advisory` no topo, o
 * texto carrega a leitura.
 */
export function AvisoErro({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      style={{
        ...NT.corpo,
        fontSize: '13.5px',
        color: 'var(--text-strong)',
        borderTop: '2px solid var(--advisory)',
        paddingTop: '10px',
      }}
    >
      {children}
    </div>
  );
}
