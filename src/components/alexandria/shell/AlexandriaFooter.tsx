// AlexandriaFooter — a cartela do atlas.
//
// Quatro seções, como a caixa de legenda no canto de uma carta náutica
// de 1890: quem assina, como se navega, de onde vem o dado, e um
// instrumento de ambientação.
//
//   marca e propósito · navegação · fontes primárias · ambientação
//
// Altura vem de padding, não de valor fixo: o handoff não declara
// footerHeight em lugar nenhum (busca exaustiva — nenhum height,
// min-height ou max-height nos rodapés). Os dois rodapés reais são
// dimensionados por conteúdo, ambos com border-top 1px navy-line.
// Reproduzo esse padrão em vez de inventar um número.
//
// DIVERGÊNCIA REGISTRADA: o brief pede a faixa de blueprint aqui, e é
// o que está implementado. O handoff descreve 'rodapé navy com faixa
// de blueprint' em prosa (L1084) mas nenhum dos rodapés de produto
// (L1312, L1835) carrega background-image. A faixa existe no arquivo
// só como chrome do próprio documento de handoff.
//
// ─────────────────────────────────────────────────────────────
// RESTRIÇÃO ESTRUTURAL QUE ESTE ARQUIVO HERDA — leia antes de crescer.
//
// AlexandriaShell é `height: 100vh` + `overflow: hidden`, e o rodapé
// fica FORA do <main> que rola, com `flex: none`. Ou seja: isto não é
// rodapé de fim de página, é FAIXA PERMANENTE — cada pixel de altura
// aqui é um pixel a menos de canvas de leitura, em toda tela do
// produto, o tempo inteiro.
//
// Por isso a composição é densa e baixa em vez de arejada: quatro
// colunas numa faixa, gravura pequena de acento, e a régua de fecho
// numa linha só. É também o que a regra de densidade pede (40-60
// elementos por tela) — as duas restrições apontam para o mesmo lugar.
//
// Se um dia o rodapé precisar crescer, o caminho NÃO é aumentar o
// padding daqui: é mover <AlexandriaFooter/> para dentro do <main>
// no Shell, e aí ele rola com o conteúdo. Isso é mudança de uma linha,
// mas em arquivo fora da posse desta wave.
// ─────────────────────────────────────────────────────────────

import { Link } from 'react-router-dom';
import { A, A2, AT, AS, AR, AE, ALAYOUT } from '../../../design/alexandria-tokens';
import type { AlexandriaNavItem } from './AlexandriaHeader';
import { ALEXANDRIA_TRILHAS, ALEXANDRIA_MODULES } from '../../../lib/data/alexandria-trilhas';

// ── ESTATÍSTICA — derivada dos catálogos, nunca digitada ──────
//
// Mesma disciplina da Wave 3: se o número for escrito à mão aqui, ele
// diverge no dia em que um módulo ganhar HTML. `totalAulas: null`
// significa 'sem fonte', não 'zero' — por isso a contagem de aulas soma
// só o que tem procedência, e o rótulo diz 'com fonte' em vez de fingir
// que 29 é o total do currículo.
const TOTAL_TRILHAS = ALEXANDRIA_TRILHAS.length;
const TOTAL_MODULOS = ALEXANDRIA_MODULES.length;
const MODULOS_COM_FONTE = ALEXANDRIA_MODULES.filter((m) => m.totalAulas !== null).length;
const AULAS_COM_FONTE = ALEXANDRIA_MODULES.reduce((s, m) => s + (m.totalAulas ?? 0), 0);

const ESTATISTICA: ReadonlyArray<{ rotulo: string; valor: number; nota?: string }> = [
  { rotulo: 'Trilhas', valor: TOTAL_TRILHAS },
  { rotulo: 'Módulos', valor: TOTAL_MODULOS, nota: `${MODULOS_COM_FONTE} com fonte` },
  { rotulo: 'Aulas', valor: AULAS_COM_FONTE, nota: 'extraídas' },
];

// ── NAVEGAÇÃO — espelha o header ─────────────────────────────
//
// DUPLICAÇÃO DELIBERADA. `NAV_PADRAO` não é exportado por
// AlexandriaHeader, e o header está fora da posse desta wave (o brief
// diz NUNCA MODIFICAR). Duplicar a lista é o menor dos males; o tipo
// `AlexandriaNavItem` vem importado do header, então pelo menos a FORMA
// não pode divergir sem o compilador reclamar.
//
// Pendência para quem abrir o header de novo: exportar NAV_PADRAO e
// importar aqui, deletando esta constante.
const NAV_RODAPE: ReadonlyArray<AlexandriaNavItem> = [
  { id: 'biblioteca', rotulo: 'Biblioteca', destino: '/alexandria' },
  { id: 'trilhas', rotulo: 'Trilhas', destino: '/alexandria' },
  { id: 'atlas', rotulo: 'Atlas', destino: '/alexandria/atlas' },
  { id: 'glossario', rotulo: 'Glossário', destino: '/alexandria/glossario' },
];

// ── FONTES PRIMÁRIAS ─────────────────────────────────────────
//
// PROCEDÊNCIA ASSIMÉTRICA, registrada em vez de silenciada. Três das
// quatro razões sociais aparecem escritas por extenso em fonte do
// próprio repositório; a da ANEEL não aparece em lugar nenhum.
//
//   ONS   — 'Operador Nacional do Sistema Elétrico'
//           src/lib/data/alexandria-modulo-01-content.ts L230 (aula 03),
//           mais 5 ocorrências nos HTML de `Alexandria modulos/`.
//   CCEE  — 'Câmara de Comercialização de Energia Elétrica'
//           3 ocorrências nos HTML dos módulos.
//   EPE   — 'Empresa de Pesquisa Energética'
//           1 ocorrência nos HTML dos módulos.
//   ANEEL — SEM PROCEDÊNCIA INTERNA. A sigla aparece 12+ vezes nos
//           módulos ('ANEEL define faixas para tensão entregue…',
//           'ANEEL nas revisões tarifárias periódicas…'), mas a forma
//           por extenso não ocorre uma única vez no repositório.
//           O nome abaixo é razão social pública, não extração — é a
//           única linha desta seção que não tem citação, e fica
//           marcada como tal para quem auditar.
const FONTES: ReadonlyArray<{ sigla: string; nome: string; comFonte: boolean }> = [
  { sigla: 'ONS', nome: 'Operador Nacional do Sistema Elétrico', comFonte: true },
  { sigla: 'ANEEL', nome: 'Agência Nacional de Energia Elétrica', comFonte: false },
  { sigla: 'CCEE', nome: 'Câmara de Comercialização de Energia Elétrica', comFonte: true },
  { sigla: 'EPE', nome: 'Empresa de Pesquisa Energética', comFonte: true },
];

// ── GRAVURAS TIER B ──────────────────────────────────────────
//
// Só `orn-` entra aqui. `orn-` é mobília de interface — foi separada na
// Wave 5 justamente por nunca mapear para aula. Gravura de conteúdo
// (`fis-`, `ger-`, `red-`…) pertence à prancha da apostila e não pode
// virar decoração de rodapé.
//
// Medido nos arquivos antes de escolher (decodificação de palette +
// tRNS, não inspeção visual): as seis candidatas são 1536x1024, fundo
// com alpha 0 nos quatro cantos, e tinta média entre #ab9b82 e
// #d2c5aa. Isso dá 6,7:1 a 10,7:1 contra o navy do rodapé e apenas
// 1,4:1 a 2,3:1 contra o creme — a coleção `orn-` foi desenhada para
// campo escuro. O rodapé navy é o campo certo para ela.
//
// Legenda derivada do nome do arquivo, com acento reposto (nome de
// arquivo é ASCII) — mesma convenção da Prancha na Wave 5.
const GRAVURA_BASE = '/alexandria/gravuras';

interface Gravura {
  arquivo: string;
  legenda: string;
  altura: number;
}

const G = {
  // Ambientação. Objeto mais 'instrumento científico' da coleção e o
  // único radialmente simétrico — ancora a ponta direita da cartela sem
  // apontar para lugar nenhum, que é o que ambientação deve fazer.
  astrolabio: { arquivo: 'orn-15-astrolabio.png', legenda: 'Astrolábio', altura: 92 },

  // Junto do link de Atlas. O objeto é literalmente o destino.
  mapa: { arquivo: 'orn-13-mapa-dobrado.png', legenda: 'Mapa dobrado', altura: 30 },

  // Acento da coluna de fontes. ESCOLHIDA sobre orn-04-estante-arquivo
  // por três razões: (1) são quatro volumes empilhados para quatro
  // fontes primárias — a rima é numérica, não forçada; (2) a massa é
  // horizontal e baixa, que é a proporção desta faixa, enquanto a
  // estante é objeto alto e estreito e encolheria a nada; (3) 'fonte
  // primária' é o documento publicado — o livro É a fonte, o gaveteiro
  // é o continente, um nível acima do que a seção nomeia.
  livros: { arquivo: 'orn-01-pilha-livros.png', legenda: 'Pilha de livros', altura: 44 },

  // Acento da coluna de navegação. ESCOLHIDA sobre orn-05-compasso por
  // três razões: (1) sextante é o instrumento de NAVEGAR — mede o
  // ângulo do astro para achar posição; compasso é de traçar em
  // prancheta, pertence ao desenho e não à navegação; (2) densidade de
  // traço medida no arquivo — o compasso tem 0,9% de pixels opacos
  // contra 15,5% do sextante, e a 40px sobre navy ele vira fiapo
  // invisível; (3) o compasso é altíssimo e estreito, o sextante é
  // compacto e encosta bem numa coluna de links.
  sextante: { arquivo: 'orn-11-sextante.png', legenda: 'Sextante', altura: 40 },
} as const satisfies Record<string, Gravura>;

/** Gravura decorativa. `aria-hidden` + alt vazio: é mobília, não
 *  conteúdo — um leitor de tela não ganha nada anunciando 'sextante'.
 *
 *  PESO, registrado honestamente: as quatro somam ~1,8 MB e o rodapé é
 *  faixa permanente, então `loading="lazy"` não economiza nada aqui (o
 *  elemento está sempre em viewport). O que dá para fazer de dentro
 *  desta posse é tirá-las do caminho crítico — `fetchPriority="low"` +
 *  `decoding="async"` fazem o browser servir o conteúdo antes da
 *  decoração. A correção de verdade é converter os `orn-` para tamanho
 *  de exibição, e `public/alexandria/gravuras/` é somente-leitura nesta
 *  wave. Mesma classe da pendência do logo de 1.342 KB da Wave 6. */
function GravuraOrn({ g, opacidade = 0.82 }: { g: Gravura; opacidade?: number }) {
  return (
    <img
      src={`${GRAVURA_BASE}/${g.arquivo}`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      style={{
        display: 'block',
        height: `${g.altura}px`,
        width: 'auto',
        flex: 'none',
        opacity: opacidade,
        borderRadius: AR.none,
        pointerEvents: 'none',
      }}
    />
  );
}

/** Rótulo de seção da cartela — Cinzel caixa alta, com o fio embaixo
 *  que é o idioma de separação do sistema (nunca caixa, nunca fundo). */
function RotuloSecao({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        ...AT.rotulo,
        fontSize: '10px',
        color: A2.tintaMetadadoNavy,
        display: 'block',
        paddingBottom: AS.xs,
        borderBottom: `1px solid ${A.fioSobreNavy}`,
        marginBottom: AS.md,
      }}
    >
      {children}
    </span>
  );
}

export function AlexandriaFooter() {
  const ano = new Date().getFullYear();

  return (
    <footer
      style={{
        position: 'relative',
        flex: 'none',
        background: A2.navyProfundo,
        borderTop: `1px solid ${A.fioSobreNavy}`,
        borderRadius: AR.none,
        padding: `${ALAYOUT.footerPaddingY} ${ALAYOUT.footerPaddingX}`,
        overflow: 'hidden',
      }}
    >
      {/* Hover e foco por classe: o sistema é inline-style com tokens,
          mas :hover e :focus-visible não existem em style inline, e o
          Shell já abre precedente para uma folha local. Prefixo próprio
          para não colidir com nada. */}
      <style>{`
        .alx-rod-link {
          color: ${A2.tintaSobreNavySuave};
          text-decoration: none;
          border-bottom: 1px solid transparent;
          border-radius: ${AR.none};
          transition: color ${AE.estado} ${AE.easing},
                      border-color ${AE.estado} ${AE.easing};
        }
        .alx-rod-link:hover {
          color: ${A.tintaSobreNavy};
          border-bottom-color: ${A2.terracotaClara};
        }
        .alx-rod-link:focus-visible {
          outline: 1px solid ${A2.ouroSobreNavy};
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .alx-rod-link { transition: none; }
        }
      `}</style>

      {/* Banda de blueprint — decorativa, atrás do conteúdo, opacidade baixa. */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/alexandria/textura/texture-blueprint-band-on-navy.png)',
          // O asset é uma faixa de 2400x400 (6:1). O rodapé é muito mais
          // largo que alto, então `cover` ampliava a faixa e mostrava só
          // um recorte central. `auto 100%` + repeat-x preserva a
          // proporção e deixa a faixa correr na horizontal.
          backgroundSize: 'auto 100%',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'left center',
          opacity: 0.1,
          pointerEvents: 'none',
        }}
      />

      {/* Cartela — quatro seções numa faixa. `auto` na última para o
          astrolábio ocupar só o que a gravura mede. */}
      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.85fr 1.35fr auto',
          gap: AS.xxl,
          alignItems: 'start',
        }}
      >
        {/* ── 1 · MARCA E PROPÓSITO ─────────────────────────── */}
        {/* Focal da cartela, e não por enfeite: é a coluna mais larga
            (1.15fr), carrega a identidade e é a única que mostra dado
            derivado do currículo. As outras três são serviço. */}
        <section data-focal>
          <RotuloSecao>Marca e propósito</RotuloSecao>

          <span
            style={{
              ...AT.nav,
              fontSize: '15px',
              color: A.tintaSobreNavy,
              display: 'block',
              lineHeight: 1,
            }}
          >
            Alexandria
          </span>
          <span
            style={{
              ...AT.rotulo,
              fontSize: '8px',
              letterSpacing: '0.24em',
              color: A2.tintaMetadadoNavy,
              display: 'block',
              marginTop: '5px',
            }}
          >
            Atlas vivo da energia do Brasil
          </span>

          {/* Estatística real. Números derivados dos catálogos em tempo
              de render — não há literal digitado nesta grade. */}
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              columnGap: AS.md,
              rowGap: '3px',
              margin: `${AS.md} 0 0 0`,
              alignItems: 'baseline',
            }}
          >
            {ESTATISTICA.map((e) => (
              <div key={e.rotulo} style={{ display: 'contents' }}>
                <dd
                  style={{
                    ...AT.dado,
                    fontSize: '15px',
                    color: A2.ouroSobreNavy,
                    margin: 0,
                    textAlign: 'right',
                    minWidth: '22px',
                  }}
                >
                  {e.valor}
                </dd>
                <dt
                  style={{
                    ...AT.rotulo,
                    fontSize: '9px',
                    color: A2.tintaMetadadoNavy,
                  }}
                >
                  {e.rotulo}
                  {e.nota && (
                    <span
                      style={{
                        ...AT.corpo,
                        fontSize: '10px',
                        fontStyle: 'italic',
                        letterSpacing: 'normal',
                        textTransform: 'none',
                        color: A2.tintaSobreNavySuave,
                        marginLeft: AS.sm,
                        maxWidth: 'none',
                      }}
                    >
                      {e.nota}
                    </span>
                  )}
                </dt>
              </div>
            ))}
          </dl>
        </section>

        {/* ── 2 · NAVEGAÇÃO ─────────────────────────────────── */}
        <section>
          <RotuloSecao>Navegação</RotuloSecao>

          <div style={{ display: 'flex', gap: AS.md, alignItems: 'flex-start' }}>
            <nav
              aria-label="Rodapé"
              style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: 0 }}
            >
              {NAV_RODAPE.map((item) => (
                <span
                  key={item.id}
                  style={{ display: 'flex', alignItems: 'center', gap: AS.sm }}
                >
                  <Link
                    to={item.destino}
                    className="alx-rod-link"
                    style={{ ...AT.dado, fontSize: '13px' }}
                  >
                    {item.rotulo}
                  </Link>
                  {/* Mapa dobrado junto do link de Atlas — o objeto é o
                      destino. Só aqui; em qualquer outro item seria
                      decoração solta. */}
                  {item.id === 'atlas' && <GravuraOrn g={G.mapa} opacidade={0.72} />}
                </span>
              ))}
            </nav>

            <GravuraOrn g={G.sextante} opacidade={0.7} />
          </div>
        </section>

        {/* ── 3 · FONTES PRIMÁRIAS ──────────────────────────── */}
        <section>
          <RotuloSecao>Fontes primárias</RotuloSecao>

          <div style={{ display: 'flex', gap: AS.lg, alignItems: 'flex-start' }}>
            <dl
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: AS.md,
                rowGap: '3px',
                margin: 0,
                flex: 1,
                minWidth: 0,
                alignItems: 'baseline',
              }}
            >
              {FONTES.map((f) => (
                <div key={f.sigla} style={{ display: 'contents' }}>
                  <dt
                    style={{
                      ...AT.rotulo,
                      fontSize: '10px',
                      color: A.tintaSobreNavy,
                    }}
                  >
                    {f.sigla}
                  </dt>
                  <dd
                    style={{
                      ...AT.corpo,
                      fontSize: '11px',
                      lineHeight: 1.35,
                      color: A2.tintaSobreNavySuave,
                      margin: 0,
                      maxWidth: 'none',
                    }}
                  >
                    {f.nome}
                  </dd>
                </div>
              ))}
            </dl>

            <GravuraOrn g={G.livros} opacidade={0.78} />
          </div>
        </section>

        {/* ── 4 · AMBIENTAÇÃO ───────────────────────────────── */}
        {/* Figura com legenda, como prancha de monografia. A legenda é
            do objeto desenhado, não uma frase de marketing. */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: AS.xs,
          }}
        >
          <GravuraOrn g={G.astrolabio} opacidade={0.9} />
          <span
            style={{
              ...AT.rotulo,
              fontSize: '8px',
              letterSpacing: '0.22em',
              color: A2.tintaMetadadoNavy,
              textAlign: 'center',
            }}
          >
            {G.astrolabio.legenda}
          </span>
        </section>
      </div>

      {/* ── RÉGUA DE FECHO ──────────────────────────────────── */}
      {/* Uma linha só. Frase da Wave 2 preservada (conteúdo já no ar),
          agora acompanhada da proveniência honesta do que está
          renderizado hoje e do ano. */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: AS.xl,
          flexWrap: 'wrap',
          marginTop: AS.lg,
          paddingTop: AS.md,
          borderTop: `1px solid ${A.fioSobreNavy}`,
        }}
      >
        <span
          data-focal
          style={{
            ...AT.corpo,
            fontSize: '13px',
            fontStyle: 'italic',
            lineHeight: 1.5,
            color: A2.tintaSobreNavySuave,
            maxWidth: 'none',
          }}
        >
          Um atlas se lê devagar — e se corrige sempre.
        </span>

        <span
          style={{
            ...AT.rotulo,
            fontSize: '9px',
            color: A2.tintaMetadadoNavy,
            textAlign: 'right',
          }}
        >
          Currículo em extração · {MODULOS_COM_FONTE} de {TOTAL_MODULOS} módulos verificados
          <span style={{ color: A.fioSobreNavy, margin: `0 ${AS.sm}` }}>·</span>
          Alexandria · GridAlpha · {ano}
        </span>
      </div>
    </footer>
  );
}

export default AlexandriaFooter;
