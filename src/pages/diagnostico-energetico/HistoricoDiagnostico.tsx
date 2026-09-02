// HistoricoDiagnostico — ARCHITECT, Diagnóstico Energético Wave 2, Fase 4.
//
// A superfície de acompanhamento: histórico de evento à esquerda,
// troca de mensagem à direita. É o que separa este produto dos dois
// Advisory anteriores — CLE e Solar são disparo único; um diagnóstico
// dura semanas e o cliente precisa saber onde está.
//
// ─── TIMELINE NÃO É CHAT ─────────────────────────────────────────────
// A recon desta trilha mediu os candidatos. O `AIAssistant` do terminal
// americano é balão colorido com `alignSelf` alternado — vocabulário de
// SaaS, em tokens de outro sistema, e nem é conversa entre dois humanos.
// Foi descartado como precedente.
//
// O precedente certo é do PRÓPRIO NIVAR:
//   · `PublicationList` / `PublicationCard` (components/editorial/) —
//     lista de itens datados, bordas colapsadas, meta em mono tabular.
//   · `Collapsible` (components/structure/) — marcador `+`/`−` em mono,
//     nunca chevron girando; revelação é o fio de 700ms, altura NUNCA
//     anima.
// Os dois existiam só no skill; o CSS vem portado aqui, verbatim.
//
// ─── DADO MOCK, DECLARADO ────────────────────────────────────────────
// ZERO rede. Os eventos e as mensagens abaixo são amostra construída
// para demonstração, rotulada na tela no idioma `--ilustrativa-*` do
// sistema. O backend deste produto está sendo construído em paralelo
// por outra sessão; a fiação é a próxima wave.
//
// A thread é MOCK EM DOIS SENTIDOS, e isso é deliberado: não existe
// entidade de mensagem em lugar nenhum do produto (a recon confirmou
// — nem frontend, nem backend). Um campo de escrita que não persiste
// seria pior que a ausência dele, então o compositor aparece
// DESABILITADO, com a razão escrita ao lado.

import { useState, type CSSProperties, type ReactNode } from 'react';

/** CSS portado do skill: `.nv-publista`/`.nv-pub*` de
 *  `components/editorial/editorial.css` e `.nv-recol*` de
 *  `components/structure/structure.css`, mais as duas animações de
 *  revelação que o `Collapsible` usa. Valores verbatim. */
export function EstilosHistorico() {
  return (
    <style>{`
      .nv-publista{display:grid;gap:0;list-style:none;margin:0;padding:0;border-top:var(--fio) solid var(--rule-strong)}
      .nv-pub{display:grid;grid-template-columns:146px minmax(0,1fr) auto;align-items:baseline;gap:5px 20px;padding:12px 0;border-bottom:var(--fio) solid var(--rule)}
      .nv-pub__fam{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-body);font-weight:500;font-size:11px;line-height:1.1;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);white-space:nowrap}
      .nv-pub__ponto{width:7px;height:7px;border-radius:50%;flex:none}
      .nv-pub__corpo{display:grid;gap:3px;min-width:0}
      .nv-pub__titulo{font-family:var(--font-display);font-weight:500;font-size:17px;line-height:1.2;letter-spacing:-.006em;color:var(--text-strong);margin:0;text-wrap:pretty}
      .nv-pub__resumo{font-family:var(--font-body);font-weight:300;font-size:13px;line-height:1.5;color:var(--text-muted);margin:0;text-wrap:pretty}
      .nv-pub__meta{display:grid;gap:3px;justify-items:end;text-align:right;font-family:var(--font-data);font-weight:400;font-size:10.5px;line-height:1.3;letter-spacing:.06em;text-transform:uppercase;color:var(--text-faint);font-variant-numeric:tabular-nums lining-nums;white-space:nowrap}
      .nv-pub__tipo{color:var(--text-muted);font-weight:500}

      /* SECAO RECOLHIVEL — marcador + / − em mono, nunca chevron girando.
         A revelacao e o fio de 1px se desenhando em 700ms; altura nunca anima. */
      .nv-recol{display:grid}
      .nv-recol--fio{border-top:var(--fio) solid var(--rule)}
      .nv-recol__cab{margin:0}
      .nv-recol__b{display:flex;align-items:baseline;gap:10px;width:100%;text-align:left;background:none;border:0;border-radius:0;padding:11px 0;cursor:pointer;transition:color var(--dur-hover) var(--ease)}
      .nv-recol__marca{flex:none;width:11px;font-family:var(--font-data);font-weight:500;font-size:13px;line-height:1.2;color:var(--text-faint);transition:color var(--dur-hover) var(--ease)}
      .nv-recol__t{flex:1 1 auto;font-family:var(--font-display);font-weight:500;font-size:15px;line-height:1.24;letter-spacing:-.006em;color:var(--text-strong);transition:color var(--dur-hover) var(--ease)}
      .nv-recol__nota{flex:none;font-family:var(--font-data);font-weight:400;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-faint);font-variant-numeric:tabular-nums}
      .nv-recol__b:hover .nv-recol__t,.nv-recol__b:hover .nv-recol__marca{color:var(--fg-hover)}
      .nv-recol__b:focus-visible{outline:var(--fio-forte) solid var(--accent-focus);outline-offset:-2px}
      .nv-recol--aberta .nv-recol__marca{color:var(--text-strong)}
      .nv-recol__corpo{display:grid;gap:11px;padding-bottom:14px}
      .nv-recol__fio-desenho{display:block;width:100%;height:1px;overflow:visible}
      .nv-recol__fio-desenho line{stroke:var(--rule);stroke-width:1;vector-effect:non-scaling-stroke;stroke-dasharray:1000;stroke-dashoffset:1000;animation:nv-fio-desenha var(--dur-desenho) var(--ease) forwards}
      .nv-recol__interno{display:grid;gap:9px;padding-left:21px;opacity:0;animation:nv-surge var(--dur-hover) var(--ease) 140ms forwards}
      .nv-recol__interno p{font-family:var(--font-body);font-weight:300;font-size:13.5px;line-height:1.55;color:var(--text-body);max-width:64ch;margin:0}

      /* MENSAGEM — não é balão. Fio à esquerda separa quem falou, e a
         autoria é etiqueta versalete, não cor de fundo. O sistema não
         tem balão de chat, e inventar um traria vocabulário de fora. */
      .nv-msg{display:grid;gap:5px;padding:12px 0 12px 16px;border-left:var(--fio-forte) solid var(--rule);border-bottom:var(--fio) solid var(--rule)}
      .nv-msg--casa{border-left-color:var(--accent-house)}
      .nv-msg__cab{display:flex;align-items:baseline;justify-content:space-between;gap:14px}
      .nv-msg__autor{font-family:var(--font-body);font-weight:500;font-size:11px;line-height:1.1;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted)}
      .nv-msg__quando{font-family:var(--font-data);font-weight:400;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-faint);font-variant-numeric:tabular-nums;white-space:nowrap}
      .nv-msg__corpo{font-family:var(--font-body);font-weight:300;font-size:13.5px;line-height:1.55;color:var(--text-body);margin:0;text-wrap:pretty}
    `}</style>
  );
}

// ─── Dado de demonstração ────────────────────────────────────────────
// Datas FIXAS, não relativas a "hoje" — a mesma disciplina do progresso
// mock da Alexandria. A sequência é o percurso real que um diagnóstico
// percorre; o conteúdo é construído.

interface EventoDiag {
  id: string;
  tipo: string;
  titulo: string;
  resumo: string;
  data: string;
  /** Detalhe que abre no `Collapsible`. Ausente = evento sem detalhe. */
  detalhe?: string;
}

const EVENTOS: readonly EventoDiag[] = [
  {
    id: 'e4',
    tipo: 'Apuração',
    titulo: 'Demanda contratada em revisão',
    resumo:
      'A demanda registrada nos últimos doze ciclos fica abaixo da contratada em dez deles.',
    data: '2026-08-28',
    detalhe:
      'A leitura preliminar aponta folga persistente entre demanda contratada e medida. Antes de qualquer recomendação, a apuração precisa confirmar se a folga é sazonal ou estrutural — reduzir contrato sobre uma série de doze meses que inclui parada de manutenção produziria multa no primeiro pico. O contraditório desta conclusão entra no parecer.',
  },
  {
    id: 'e3',
    tipo: 'Documento',
    titulo: 'Contrato vigente recebido',
    resumo: 'Instrumento de compra e aditivos entraram na análise.',
    data: '2026-08-21',
  },
  {
    id: 'e2',
    tipo: 'Escopo',
    titulo: 'Escopo confirmado com o time de energia',
    resumo:
      'Setor, faixa de consumo e prioridades acordados; a apuração começa pela estrutura tarifária.',
    data: '2026-08-19',
    detalhe:
      'O escopo enviado no formulário foi revisto em chamada. A prioridade declarada — multa por demanda — orienta a ordem da apuração, mas não a limita: a leitura cobre a estrutura inteira, porque um custo raramente tem causa única.',
  },
  {
    id: 'e1',
    tipo: 'Abertura',
    titulo: 'Diagnóstico aberto',
    resumo: 'Escopo recebido pelo formulário.',
    data: '2026-08-18',
  },
];

interface MensagemDiag {
  id: string;
  autor: 'casa' | 'cliente';
  nome: string;
  quando: string;
  corpo: string;
}

const MENSAGENS: readonly MensagemDiag[] = [
  {
    id: 'm3',
    autor: 'casa',
    nome: 'NIVAR',
    quando: '2026-08-28 · 16:12',
    corpo:
      'A série de demanda dos últimos doze ciclos está na apuração. Antes de fechar a recomendação, precisamos saber se houve parada programada em algum mês — isso muda a leitura da folga.',
  },
  {
    id: 'm2',
    autor: 'cliente',
    nome: 'Você',
    quando: '2026-08-21 · 09:40',
    corpo: 'Enviei o contrato vigente e os dois aditivos de 2025.',
  },
  {
    id: 'm1',
    autor: 'casa',
    nome: 'NIVAR',
    quando: '2026-08-19 · 11:05',
    corpo:
      'Escopo confirmado. Para começar pela estrutura tarifária, o contrato de compra vigente é o próximo documento necessário.',
  },
];

function formatarData(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Collapsible, portado ────────────────────────────────────────────
// API do `Collapsible.jsx` do skill: aceita estado controlado ou
// gerencia o próprio. Aqui só o interno é usado.

function Recolhivel({
  titulo,
  nota,
  padrao = false,
  children,
}: {
  titulo: string;
  nota?: string;
  padrao?: boolean;
  children: ReactNode;
}) {
  const [aberto, setAberto] = useState(padrao);
  const id = `recol-${titulo.replace(/\W+/g, '-').toLowerCase()}`;

  return (
    <div className={`nv-recol nv-recol--fio${aberto ? ' nv-recol--aberta' : ''}`}>
      <h4 className="nv-recol__cab">
        <button
          type="button"
          className="nv-recol__b"
          aria-expanded={aberto}
          aria-controls={`${id}-corpo`}
          onClick={() => setAberto((v) => !v)}
        >
          <span className="nv-recol__marca" aria-hidden="true">
            {aberto ? '−' : '+'}
          </span>
          <span className="nv-recol__t">{titulo}</span>
          {nota ? <span className="nv-recol__nota">{nota}</span> : null}
        </button>
      </h4>
      {aberto ? (
        <div className="nv-recol__corpo" id={`${id}-corpo`}>
          <svg
            className="nv-recol__fio-desenho"
            viewBox="0 0 1000 1"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line x1="0" y1="0.5" x2="1000" y2="0.5" />
          </svg>
          <div className="nv-recol__interno">{children}</div>
        </div>
      ) : null}
    </div>
  );
}

export function HistoricoDiagnostico({ NT }: { NT: Record<string, CSSProperties> }) {
  return (
    <section
      aria-label="Acompanhamento"
      style={{
        padding: '32px 0',
        borderTop: 'var(--fio) solid var(--rule)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
        <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>02</span>
        <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>Acompanhamento</span>
        <span
          aria-hidden="true"
          style={{ flex: 1, borderTop: 'var(--fio) solid var(--rule)', alignSelf: 'center' }}
        />
        <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>amostra ilustrativa</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* ─── Histórico ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gap: '12px', minWidth: 0 }}>
          <span style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>Histórico</span>
          <ol className="nv-publista">
            {EVENTOS.map((ev) => (
              <li key={ev.id} className="nv-pub">
                <span className="nv-pub__fam">
                  {/* Ponto na cor da família — o produto é Advisory. */}
                  <i
                    className="nv-pub__ponto"
                    style={{ background: 'var(--family-advisory)' }}
                    aria-hidden="true"
                  />
                  Advisory
                </span>
                <div className="nv-pub__corpo">
                  <h4 className="nv-pub__titulo">{ev.titulo}</h4>
                  <p className="nv-pub__resumo">{ev.resumo}</p>
                  {ev.detalhe ? (
                    <Recolhivel titulo="Detalhe da apuração" nota="ler">
                      <p>{ev.detalhe}</p>
                    </Recolhivel>
                  ) : null}
                </div>
                <div className="nv-pub__meta">
                  <span className="nv-pub__tipo">{ev.tipo}</span>
                  <span>{formatarData(ev.data)}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ─── Mensagens ─────────────────────────────────────────── */}
        {/* // gridalpha-detect-disable-next-line equal-weight-grid — rótulo, lista e compositor empilhados; a hierarquia é vertical, não focal */}
        <div style={{ display: 'grid', gap: '12px', minWidth: 0 }}>
          <span style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>Mensagens</span>
          <div style={{ borderTop: 'var(--fio) solid var(--rule-strong)' }}>
            {MENSAGENS.map((m) => (
              <div
                key={m.id}
                className={`nv-msg${m.autor === 'casa' ? ' nv-msg--casa' : ''}`}
              >
                <div className="nv-msg__cab">
                  <span className="nv-msg__autor">{m.nome}</span>
                  <span className="nv-msg__quando">{m.quando}</span>
                </div>
                <p className="nv-msg__corpo">{m.corpo}</p>
              </div>
            ))}
          </div>

          {/* Compositor DESABILITADO — e a razão escrita ao lado. Não
              existe entidade de mensagem em lugar nenhum do produto; um
              campo que aceita texto e o descarta seria pior que a
              ausência dele. */}
          <div style={{ display: 'grid', gap: '8px', paddingTop: '4px' }}>
            <div className="nv-campo nv-campo--desabilitado">
              <div className="nv-campo__caixa">
                <textarea
                  className="nv-campo__ctrl"
                  rows={2}
                  disabled
                  placeholder="Responder…"
                  aria-label="Responder — indisponível nesta versão"
                  style={{ resize: 'none' }}
                />
              </div>
            </div>
            <span
              style={{
                ...NT.proc,
                justifySelf: 'start',
                color: 'var(--ilustrativa-fg)',
                borderBottom: 'var(--fio) solid var(--ilustrativa-fio)',
                paddingBottom: '2px',
              }}
            >
              Amostra ilustrativa — conversa de demonstração; o envio abre com o backend
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
