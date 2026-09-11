import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check, FileText } from "lucide-react";
import { FamilyEmblem } from "../../components/g2/Brand";
import {
  NivarShell,
  Provenance,
  SectionLabel,
  TextLink,
} from "../../components/g2/NivarShell";
import { ALEXANDRIA_TRILHAS } from "../../lib/data/alexandria-trilhas";
import { ALEXANDRIA_BLOCKS } from "../../lib/data/alexandria-blocks";
import { DESTINOS_BR } from "../../lib/data/br-destinos";
import { TerminalPreview } from "../terminal-brasil/TerminalBrasil";
import { NotFound } from "../NotFound";
import "./g2-pages.css";

function FamilyHeader({
  id,
  verb,
  name,
}: {
  id: string;
  verb: string;
  name: string;
}) {
  return (
    <div className="g2-family-header g2-container">
      <Link to="/br">A casa</Link>
      <span>/</span>
      <span>{name}</span>
      <div>
        <FamilyEmblem family={id} size={35} />
        <span className="g2-mono">{verb}</span>
      </div>
    </div>
  );
}
function FamilyClose({
  text = "Uma pergunta melhor é um bom começo.",
}: {
  text?: string;
}) {
  return (
    <section className="g2-family-close g2-container">
      <h2>{text}</h2>
      <TextLink to="/br/metodo">O método da casa</TextLink>
    </section>
  );
}

const NOTES = [
  {
    type: "Mercado",
    title: "O preço mudou. A explicação também?",
    desc: "Como examinar um movimento sem confundir correlação e causa.",
    slug: "",
  },
  {
    type: "Método",
    title: "Um número precisa de companhia.",
    desc: "Fonte, unidade e período fazem parte do dado.",
    slug: "fonte",
  },
  {
    type: "Hidrologia",
    title: "Um reservatório não conta a história inteira.",
    desc: "O que observar antes de comparar duas fotografias do sistema.",
    slug: "hidrologia",
  },
  {
    type: "Método",
    title: "O lugar da dúvida em uma boa análise.",
    desc: "Declarar o limite melhora a qualidade da decisão.",
    slug: "incerteza",
  },
];
function Intelligence() {
  const [topic, setTopic] = useState("Todos");
  return (
    <NivarShell
      family="intelligence"
      title="Intelligence · A leitura do que muda"
    >
      <FamilyHeader
        id="intelligence"
        name="Intelligence"
        verb="ARGOS / OBSERVAR"
      />
      <section className="g2-intelligence-masthead g2-container">
        <span className="g2-eyebrow">NIVAR INTELLIGENCE</span>
        <h1>
          O que muda.
          <br />
          <em>O que isso significa.</em>
        </h1>
        <p className="g2-lead">
          Atenção contínua ao mercado. Leitura com contexto.
          <br />E espaço para o que ainda não sabemos.
        </p>
      </section>
      <section className="g2-intelligence-cover g2-container">
        <figure>
          <img
            src="/g2/reservoir-landscape.webp"
            alt="Reservatório e infraestrutura, paisagem ilustrativa gerada"
          />
          <figcaption className="g2-caption">
            ILUSTRAÇÃO GERADA · NÃO REPRESENTA UMA USINA IDENTIFICADA
          </figcaption>
        </figure>
        <article>
          <div className="g2-cover-label">
            <span>ENERGY BRIEF</span>
            <span>Nº 00 / MÉTODO</span>
          </div>
          <h2>
            O preço mudou.
            <br />
            <em>A explicação também?</em>
          </h2>
          <p>
            Uma leitura sobre como observar o mercado: separar o que foi medido,
            o que foi inferido e o que falta examinar.
          </p>
          <TextLink to="/br/brief">Ler a edição de método</TextLink>
          <span className="g2-caption">
            EDIÇÃO DEMONSTRATIVA · A PUBLICAÇÃO REGULAR ESTÁ EM DESENVOLVIMENTO
          </span>
        </article>
      </section>
      <section className="g2-section g2-container">
        <SectionLabel number="01">Caderno aberto</SectionLabel>
        <div
          className="g2-topic-tabs"
          role="group"
          aria-label="Filtrar leituras por tema"
        >
          {["Todos", "Mercado", "Hidrologia", "Método"].map((t) => (
            <button
              key={t}
              aria-pressed={topic === t}
              onClick={() => setTopic(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="g2-notes-list">
          {NOTES.filter((n) => topic === "Todos" || n.type === topic).map(
            (n, i) => (
              <Link
                to={`/br/brief${n.slug ? "?nota=" + n.slug : ""}`}
                key={n.title}
              >
                <span className="g2-mono">
                  0{i + 1} / {n.type.toUpperCase()}
                </span>
                <div>
                  <h3>{n.title}</h3>
                  <p>{n.desc}</p>
                </div>
                <span className="g2-mono">LEITURA DE MÉTODO</span>
                <ArrowUpRight />
              </Link>
            ),
          )}
        </div>
      </section>
      <section className="g2-source-register g2-container">
        <SectionLabel number="02">As fontes entram na conversa</SectionLabel>
        <div className="g2-section-intro">
          <h2>
            Ver a origem.
            <br />
            <em>Examinar a leitura.</em>
          </h2>
          <p className="g2-lead">
            As instituições abaixo são portas para dados primários. Consultá-las
            é diferente de atribuir a elas uma interpretação da NIVAR.
          </p>
        </div>
        {[
          {
            name: "ONS",
            detail: "Operação do Sistema Interligado Nacional",
            url: "https://www.ons.org.br/",
          },
          {
            name: "CCEE",
            detail: "Comercialização e preços de energia",
            url: "https://www.ccee.org.br/",
          },
          {
            name: "ANEEL",
            detail: "Regulação e informações do setor",
            url: "https://www.gov.br/aneel/",
          },
          {
            name: "EPE",
            detail: "Estudos e planejamento energético",
            url: "https://www.epe.gov.br/",
          },
        ].map((s) => (
          <a href={s.url} target="_blank" rel="noreferrer" key={s.name}>
            <strong>{s.name}</strong>
            <span>{s.detail}</span>
            <span className="g2-mono">FONTE PRIMÁRIA</span>
            <ArrowUpRight size={20} />
          </a>
        ))}
      </section>
      <FamilyClose text="A primeira leitura não precisa ser a última." />
    </NivarShell>
  );
}

function Advisory() {
  const [stage, setStage] = useState(0);
  const stages = [
    {
      label: "Evidência",
      title: "O que foi apresentado?",
      text: "Uma proposta comercial afirma retorno em 3,2 anos. A afirmação entra como promessa a verificar, acompanhada de sua origem.",
      foot: "AMOSTRA SOLAR · AFIRMAÇÃO NÃO VALIDADA",
    },
    {
      label: "Contraditório",
      title: "E se a premissa mudar?",
      text: "Que geração foi considerada? Qual reajuste tarifário? Custos de manutenção e desempenho aparecem no cálculo?",
      foot: "QUESTÕES DE ANÁLISE · NÃO SÃO UMA CONCLUSÃO",
    },
    {
      label: "Parecer",
      title: "O que podemos concluir?",
      text: "Sem o documento e a verificação das premissas, a conclusão permanece em aberto. A incerteza pertence ao parecer.",
      foot: "EVIDÊNCIA INSUFICIENTE · CONCLUSÃO SUSPENSA",
    },
  ];
  return (
    <NivarShell family="advisory" title="Advisory · Parecer e contraditório">
      <FamilyHeader
        id="advisory"
        name="Advisory"
        verb="SÓCRATES / QUESTIONAR"
      />
      <section className="g2-advisory-hero g2-container">
        <div>
          <span className="g2-eyebrow">A DECISÃO É SUA. O RIGOR É NOSSO.</span>
          <h1>
            Uma boa decisão
            <br />
            suporta perguntas
            <br />
            <em>difíceis.</em>
          </h1>
          <p className="g2-lead">
            Examinamos a evidência antes de defender uma conclusão. Inclusive
            quando a conclusão é: ainda não sabemos.
          </p>
          <Link className="g2-primary" to="/conta-de-luz-express">
            Começar pela sua fatura
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <aside className="g2-argument">
          <div className="g2-argument-top">
            <FamilyEmblem family="advisory" size={70} />
            <span className="g2-mono">UM CASO. TRÊS EXAMES.</span>
          </div>
          <div
            className="g2-argument-tabs"
            role="tablist"
            aria-label="Etapas de exame"
          >
            {stages.map((s, i) => (
              <button
                role="tab"
                id={`argument-tab-${i}`}
                aria-selected={i === stage}
                aria-controls="argument-panel"
                tabIndex={i === stage ? 0 : -1}
                key={s.label}
                onClick={() => setStage(i)}
                onKeyDown={(event) => {
                  const next =
                    event.key === "ArrowRight"
                      ? (i + 1) % stages.length
                      : event.key === "ArrowLeft"
                        ? (i + stages.length - 1) % stages.length
                        : event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? stages.length - 1
                            : null;
                  if (next === null) return;
                  event.preventDefault();
                  setStage(next);
                  document.getElementById(`argument-tab-${next}`)?.focus();
                }}
              >
                0{i + 1}
                <span>{s.label}</span>
              </button>
            ))}
          </div>
          <div
            className="g2-argument-body"
            role="tabpanel"
            id="argument-panel"
            aria-labelledby={`argument-tab-${stage}`}
          >
            <h3>{stages[stage].title}</h3>
            <p>{stages[stage].text}</p>
            <span className="g2-mono">{stages[stage].foot}</span>
          </div>
        </aside>
      </section>
      <section className="g2-section g2-container">
        <SectionLabel number="01">
          Questões concretas. Exame independente.
        </SectionLabel>
        <div className="g2-service-list">
          {DESTINOS_BR.filter((d) =>
            [
              "conta-de-luz-express",
              "solar-proposal-validator",
              "diagnostico-energetico",
            ].includes(d.id),
          ).map((d, i) => (
            <article key={d.id}>
              <span className="g2-mono">0{i + 1}</span>
              <div>
                <span className="g2-status">
                  {d.status === "disponivel"
                    ? "ENVIO DISPONÍVEL"
                    : "EM DESENVOLVIMENTO"}
                </span>
                <h2>{d.titulo}</h2>
                <p>{d.descricao}</p>
              </div>
              <dl>
                <dt>O QUE ENTRA</dt>
                <dd>
                  {i === 0
                    ? "Uma fatura industrial, em PDF ou imagem."
                    : i === 1
                      ? "Uma proposta comercial de sistema solar."
                      : "O escopo energético de uma operação."}
                </dd>
                <dt>O QUE SE EXAMINA</dt>
                <dd>
                  {i === 0
                    ? "Modalidade, demanda e oportunidades a validar."
                    : i === 1
                      ? "Geração estimada, compensação e premissas da promessa."
                      : "Enquadramento, consumo, contratos e exposição."}
                </dd>
                <dt>O QUE SAI</dt>
                <dd>Parecer humano, com limites e contraditório explícitos.</dd>
              </dl>
              <TextLink
                to={
                  d.status === "disponivel"
                    ? (d.rota ?? `/${d.id}`)
                    : `/operador/${d.id}`
                }
              >
                {d.status === "disponivel"
                  ? "Enviar uma fatura"
                  : "Examinar a amostra do analista"}
              </TextLink>
            </article>
          ))}
        </div>
      </section>
      <section className="g2-independence g2-container">
        <SectionLabel number="02">Independência por construção</SectionLabel>
        <h2>
          Nosso interesse não depende
          <br />
          da resposta que você recebe.
        </h2>
        <div>
          <p>
            A NIVAR não vende energia, não intermedeia contratos e não recebe
            comissão pela conclusão do parecer.
          </p>
          <p>
            O trabalho é examinar o que sustenta uma decisão. A recomendação
            pode mudar. O compromisso com o método permanece.
          </p>
        </div>
        <TextLink to="/operador">
          Explorar o ambiente demonstrativo do analista
        </TextLink>
      </section>
      <FamilyClose />
    </NivarShell>
  );
}

function Academy() {
  const [path, setPath] = useState(0);
  const counts = {
    trilhas: ALEXANDRIA_TRILHAS.length,
    modulos: ALEXANDRIA_BLOCKS.length,
    aulas: ALEXANDRIA_TRILHAS.reduce((sum, t) => sum + (t.totalAulas ?? 0), 0),
  };
  const tracks = [
    {
      name: "Começar do fundamento",
      desc: "Física, redes e tecnologias. Entenda os conceitos que sustentam a leitura do setor.",
      tag: "FUNDAMENTOS UNIVERSAIS",
      id: "universal",
    },
    {
      name: "Ler o Brasil em contexto",
      desc: "Instituições, tarifas, geração e mercado. Conecte as peças do setor elétrico brasileiro.",
      tag: "SETOR ELÉTRICO BRASILEIRO",
      id: "brasil",
    },
    {
      name: "Aprofundar o julgamento",
      desc: "Economia, estratégia e análise. Amplie seu repertório para decisões mais exigentes.",
      tag: "ESPECIALIZAÇÃO ESTRATÉGICA",
      id: "brasil",
    },
  ];
  return (
    <NivarShell
      family="academy"
      title="Academy · Conhecimento que se torna capacidade"
    >
      <FamilyHeader id="academy" name="Academy" verb="PERSEU / TRANSMITIR" />
      <section className="g2-academy-hero g2-container">
        <div>
          <span className="g2-eyebrow">
            CONHECIMENTO PARA PENSAR POR CONTA PRÓPRIA
          </span>
          <h1>
            Entender muda
            <br />o que você
            <br />
            <em>consegue fazer.</em>
          </h1>
          <p className="g2-lead">
            Do vocabulário à fluência. Formação para quem quer participar da
            conversa, examinar um argumento e construir a própria leitura.
          </p>
          <TextLink to="/alexandria?trilha=brasil">
            Entrar na Alexandria
          </TextLink>
        </div>
        <figure>
          <img
            src="/g2/academy-study.webp"
            alt="Cena ilustrativa de estudo coletivo com documentos e diagramas"
          />
          <figcaption className="g2-caption">
            O CONHECIMENTO SE CONSTRÓI EM RELAÇÃO · ILUSTRAÇÃO GERADA
          </figcaption>
        </figure>
      </section>
      <section className="g2-section g2-container">
        <SectionLabel number="01">
          Um ponto de partida para cada pergunta
        </SectionLabel>
        <div className="g2-learning-path">
          <div className="g2-path-options">
            {tracks.map((t, i) => (
              <button
                key={t.name}
                aria-pressed={path === i}
                onClick={() => setPath(i)}
              >
                <span className="g2-mono">0{i + 1}</span>
                <span>{t.name}</span>
                <ArrowRight size={20} />
              </button>
            ))}
          </div>
          <article>
            <span className="g2-eyebrow">{tracks[path].tag}</span>
            <h2>{tracks[path].name}</h2>
            <p>{tracks[path].desc}</p>
            <div className="g2-learning-method">
              <span>
                <Check size={15} /> Leitura com contexto
              </span>
              <span>
                <Check size={15} /> Conceitos conectados
              </span>
              <span>
                <Check size={15} /> Aplicação do raciocínio
              </span>
            </div>
            <TextLink to={`/alexandria/trilha/${ALEXANDRIA_TRILHAS[path].id}`}>
              Explorar esta trilha
            </TextLink>
          </article>
        </div>
      </section>
      <section className="g2-alexandria-feature g2-container">
        <div>
          <span className="g2-eyebrow">O PRODUTO DE FORMAÇÃO DA CASA</span>
          <h2>Alexandria.</h2>
          <p className="g2-lead">
            Uma biblioteca de energia para atravessar o setor com repertório. Um
            universo de conhecimento com sua própria identidade.
          </p>
          <TextLink to="/alexandria?trilha=brasil">Abrir a biblioteca</TextLink>
        </div>
        <div className="g2-academy-counts">
          {[
            [counts.trilhas, "trilhas de formação"],
            [counts.modulos, "módulos catalogados"],
            [counts.aulas, "aulas confirmadas"],
          ].map(([n, label]) => (
            <div key={label}>
              <strong>{n}</strong>
              <span>{label}</span>
            </div>
          ))}
          <Provenance>
            Contagens derivadas do catálogo de Alexandria. Nenhuma alteração no
            conteúdo ou no produto.
          </Provenance>
        </div>
      </section>
      <FamilyClose text="A autonomia se aprende. E se pratica." />
    </NivarShell>
  );
}

function Software() {
  return (
    <NivarShell
      family="software"
      title="Software · Instrumentos para atravessar a complexidade"
    >
      <FamilyHeader id="software" name="Software" verb="ARIADNE / ORGANIZAR" />
      <section className="g2-software-hero g2-container">
        <span className="g2-eyebrow">INSTRUMENTOS DE LEITURA E OPERAÇÃO</span>
        <h1>
          Complexidade não precisa
          <br />
          significar <em>perder o fio.</em>
        </h1>
        <div className="g2-software-intro">
          <p className="g2-lead">
            Uma região leva a uma série. Uma mudança leva a uma pergunta. Uma
            leitura leva à fonte. Software que torna o percurso legível.
          </p>
          <Link className="g2-primary" to="/br/terminal">
            Explorar o Terminal Brasil
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <TerminalPreview />
        <Provenance>
          Demonstração funcional · séries sintéticas identificadas · conexão de
          dados brasileiros em desenvolvimento
        </Provenance>
      </section>
      <section className="g2-section g2-container">
        <SectionLabel number="01">O instrumento e o raciocínio</SectionLabel>
        <div className="g2-software-mechanisms">
          {[
            {
              n: "01",
              title: "Selecione um contexto.",
              text: "Região e período permanecem no campo de visão. A leitura acompanha a seleção.",
            },
            {
              n: "02",
              title: "Observe a relação.",
              text: "Um gráfico ganha contexto junto da geografia, da unidade e da interpretação.",
            },
            {
              n: "03",
              title: "Volte à origem.",
              text: "A fonte, a natureza da série e as transformações ficam acessíveis na mesma tela.",
            },
          ].map((m) => (
            <article key={m.n}>
              <span className="g2-mono">{m.n}</span>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="g2-integration-register g2-container">
        <SectionLabel number="02">Um sistema em construção</SectionLabel>
        <h2>
          O que existe.
          <br />
          <em>O que vem a seguir.</em>
        </h2>
        <div>
          <article>
            <span className="g2-status">DEMONSTRAÇÃO DISPONÍVEL</span>
            <h3>Terminal Brasil</h3>
            <p>
              Exploração por região, período e série. Contexto, método e
              exportação de dados demonstrativos.
            </p>
            <TextLink to="/br/terminal">Abrir o instrumento</TextLink>
          </article>
          <article>
            <span className="g2-status">EM DESENVOLVIMENTO</span>
            <h3>Séries conectadas, API e alertas</h3>
            <p>
              A conexão com dados brasileiros e os serviços de integração ainda
              não estão disponíveis nesta experiência.
            </p>
            <Provenance>
              Disponibilidade declarada. Sem simulação de integração ativa.
            </Provenance>
          </article>
        </div>
      </section>
      <FamilyClose text="Um caminho claro deixa espaço para pensar." />
    </NivarShell>
  );
}

function Hardware() {
  const [active, setActive] = useState(0);
  const specs = [
    {
      name: "Grandeza",
      text: "O que está sendo medido?",
      body: "Tensão, corrente, potência e energia respondem a perguntas diferentes. A unidade acompanha o registro.",
    },
    {
      name: "Instrumento",
      text: "Com que condição de leitura?",
      body: "Faixa, calibração, instalação e limitações definem o que se pode afirmar a partir de uma medição.",
    },
    {
      name: "Tempo",
      text: "Qual é a janela observada?",
      body: "Um instante, um intervalo e uma série histórica têm significados diferentes. O recorte fica registrado.",
    },
    {
      name: "Origem",
      text: "Como o registro chegou até aqui?",
      body: "Identificação do ponto, método de coleta e transformações precisam acompanhar o dado ao longo do percurso.",
    },
  ];
  return (
    <NivarShell family="hardware" title="Hardware · O mundo antes do dado">
      <FamilyHeader
        id="hardware"
        name="Hardware"
        verb="HEFESTO / MEDIR E CONSTRUIR"
      />
      <section className="g2-hardware-hero g2-container">
        <div>
          <span className="g2-eyebrow">A REALIDADE ANTES DA INTERPRETAÇÃO</span>
          <h1>
            O mundo não
            <br />
            começa na
            <br />
            <em>planilha.</em>
          </h1>
          <p className="g2-lead">
            Instrumentação, medição em campo e telemetria. O contato da NIVAR
            com aquilo que existe antes de se tornar dado.
          </p>
          <span className="g2-status">FRENTE EM DESENVOLVIMENTO</span>
        </div>
        <figure>
          <img
            src="/g2/grid-meter.webp"
            alt="Medidor e transformadores de corrente em painel elétrico industrial, ilustração gerada"
          />
          <figcaption className="g2-caption">
            ESTUDO CONCEITUAL GERADO · NÃO É UM PRODUTO DISPONÍVEL PARA VENDA
          </figcaption>
        </figure>
      </section>
      <section className="g2-section g2-container">
        <SectionLabel number="01">Anatomia de uma medição</SectionLabel>
        <div className="g2-instrument-study">
          <figure>
            <img
              src="/g2/grid-meter.webp"
              alt="Medição elétrica e instalação em painel, ilustração gerada"
              loading="lazy"
            />
            <figcaption className="g2-caption">
              GRANDEZA, INSTALAÇÃO E ORIGEM · ILUSTRAÇÃO GERADA
            </figcaption>
          </figure>
          <div>
            <h2>
              O número é só
              <br />
              <em>uma parte do registro.</em>
            </h2>
            <div className="g2-spec-list">
              {specs.map((s, i) => (
                <div key={s.name}>
                  <button
                    aria-expanded={active === i}
                    onClick={() => setActive(active === i ? -1 : i)}
                  >
                    <span className="g2-mono">0{i + 1}</span>
                    <strong>{s.name}</strong>
                    <span>{active === i ? "−" : "+"}</span>
                  </button>
                  {active === i && (
                    <div className="g2-spec-detail">
                      <h3>{s.text}</h3>
                      <p>{s.body}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="g2-hardware-availability g2-container">
        <FileText size={24} />
        <div>
          <span className="g2-eyebrow">ESTADO DA FRENTE</span>
          <h2>
            Engenharia se prova
            <br />
            no mundo real.
          </h2>
          <p>
            Hardware faz parte da arquitetura da NIVAR. O catálogo ainda não tem
            instrumentos disponíveis. Especificações, certificações e condições
            de instalação serão apresentadas quando houver um produto validado.
          </p>
          <Provenance>
            Conceitos de medição · sem especificações ou certificações
            comerciais anunciadas
          </Provenance>
        </div>
      </section>
      <FamilyClose text="Medir bem é começar uma pergunta melhor." />
    </NivarShell>
  );
}

export function G2FamilyPage({ family: given }: { family?: string }) {
  const { familiaId } = useParams();
  const family = given ?? familiaId;
  switch (family) {
    case "intelligence":
      return <Intelligence />;
    case "advisory":
      return <Advisory />;
    case "academy":
      return <Academy />;
    case "software":
      return <Software />;
    case "hardware":
      return <Hardware />;
    default:
      return <NotFound />;
  }
}
