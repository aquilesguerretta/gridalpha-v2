import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Minus, Plus, X } from "lucide-react";
import { Wordmark } from "./Brand";
import "./house-finale.css";

const SAMPLES = [68, 64, null, 81, null, 108] as const;
const HOURS = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];
const plotX = (index: number) => 16 + index * 89.6;
const plotY = (value: number) => 90 - (value - 60) * 1.5;
const TRACES = [
  { patron: "Hefesto", verb: "Medir", title: "Um instante preservado.", note: "68 MW · 00:00 · amostra 01", target: "measure" },
  { patron: "Ariadne", verb: "Organizar", title: "Cada valor, no seu contexto.", note: "Uma origem. Seis intervalos. A mesma unidade.", target: "organize" },
  { patron: "Argos", verb: "Observar", title: "A ausência também aparece.", note: "Quatro observações. Duas lacunas preservadas.", target: "observe" },
  { patron: "Sócrates", verb: "Questionar", title: "O aumento prova uma tendência?", note: "Os intervalos ausentes impedem essa conclusão.", target: "question" },
  { patron: "Perseu", verb: "Transmitir", title: "Levar adiante. Com os limites.", note: "A leitura pode ser compartilhada. A incerteza acompanha.", target: "transmit" },
] as const;

/** The closing scene holds the question, lantern and invitation together.
 * EV-001 remains a declared synthetic lesson, never telemetry. */
export function HouseFinale() {
  const [active, setActive] = useState(0);
  const [sourceOpen, setSourceOpen] = useState(false);
  const notebook = useRef<HTMLDialogElement>(null);
  const select = (index: number) => setActive(index);

  return <section className="g22-finale" id="a-pergunta-continua" aria-labelledby="g22-finale-title" data-source-open={sourceOpen}>
    <div className="g22-finale-stage g2-container">
      <header className="g22-finale-heading">
        <span className="g22-finale-kicker">06 / A CASA · DIÓGENES</span>
        <h2 id="g22-finale-title">A pergunta<br /><em>permanece aberta.</em></h2>
        <p>O compromisso é com a pergunta.<br />Mesmo quando a resposta muda.</p>
      </header>
      <div className="g22-finale-figure" aria-hidden="true">
        <img src="/g2/g22/finale/diogenes-gesture-1536.webp" srcSet="/g2/g22/finale/diogenes-gesture-900.webp 900w, /g2/g22/finale/diogenes-gesture-1536.webp 1536w" sizes="(max-width: 700px) 590px, 80vw" width="1536" height="1024" loading="lazy" decoding="async" alt="" />
      </div>
      <div className="g22-finale-aperture">
        <div className="g22-finale-aperture-head"><span>EV–001 / O MESMO REGISTRO</span><span>ESTUDO DIDÁTICO · MW</span></div>
        <div className="g22-finale-evidence" aria-label="Série sintética: quatro observações e duas lacunas">
          <div className="g22-finale-origin"><strong>68<small>MW</small></strong><span>00:00 / AMOSTRA 01</span></div>
          <svg viewBox="0 0 480 123" role="img" aria-label="68, 64, ausência, 81, ausência, 108 MW; somente as duas primeiras observações são conectadas.">
            <line className="g22-plot-axis" x1="16" y1="95" x2="464" y2="95" />
            <path className="g22-plot-supported" d={`M${plotX(0)} ${plotY(68)} L${plotX(1)} ${plotY(64)}`} />
            {SAMPLES.map((value, index) => <g key={HOURS[index]}>{value === null ? <g className="g22-plot-gap"><line x1={plotX(index)} x2={plotX(index)} y1="18" y2="95" /><path d={`M${plotX(index) - 5} 97l4 -4 4 4 4 -4`} /></g> : <circle className="g22-plot-point" cx={plotX(index)} cy={plotY(value)} r={index === 0 ? 5 : 3.5} />}<text x={plotX(index)} y="119" textAnchor="middle">{HOURS[index].slice(0,2)}h</text></g>)}
          </svg>
        </div>
        <div className="g22-finale-aperture-copy">
          <p>Quatro observações. Duas lacunas.<br /><em>A trajetória permanece desconhecida.</em></p>
          <span>Série sintética NIVAR. Sem correspondência com uma usina real.</span>
        </div>
        <button className="g22-finale-reveal" type="button" aria-expanded={sourceOpen} aria-controls="g22-finale-source" onClick={() => setSourceOpen(value => !value)}><span>{sourceOpen ? "Recolher a origem" : "Iluminar origem e limites"}</span>{sourceOpen ? <Minus size={16} /> : <Plus size={16} />}</button>
        <aside className="g22-finale-source-note" id="g22-finale-source" hidden={!sourceOpen}>
          <span className="g22-finale-kicker">DIÓGENES / EXAMINAR A ORIGEM</span>
          <p>Uma série criada para examinar o método.</p>
          <dl><div><dt>Fonte</dt><dd>Série sintética NIVAR · EV-001</dd></div><div><dt>Período</dt><dd>Dia didático · 00:00–20:00</dd></div><div><dt>Limite</dt><dd>Sem dado em 08:00 e 16:00. Sem interpolação. Sem conclusão sobre uma instalação real.</dd></div></dl>
          <Link to="/br/metodo">Abrir fonte e método <ArrowUpRight size={14} /></Link>
        </aside>
        <button className="g22-finale-notebook-open" type="button" onClick={() => notebook.current?.showModal()}>Examinar os cinco gestos <ArrowUpRight size={14} /></button>
      </div>
      <footer className="g22-finale-resolution">
        <div className="g22-finale-open-question"><span>06 / PROCURAR</span><p>O que falta medir?</p></div>
        <Link className="g22-finale-enter" to="/criar-conta">Entre na casa <ArrowRight size={19} /></Link>
        <div className="g22-finale-signature"><Wordmark height={25} /><span>Nullius in verba.</span></div>
      </footer>
    </div>
    <dialog className="g22-finale-notebook" ref={notebook} aria-labelledby="g22-notebook-title" onClick={event => { if (event.target === event.currentTarget) notebook.current?.close(); }}>
      <div className="g22-notebook-paper" data-active-trace={TRACES[active].target}>
        <header className="g22-notebook-header"><div><span className="g22-finale-kicker">EV–001 / UM REGISTRO. CINCO GESTOS.</span><h3 id="g22-notebook-title">O método deixa vestígios.</h3></div><button type="button" aria-label="Fechar caderno" onClick={() => notebook.current?.close()}><X size={21} /></button></header>
      <div className="g22-finale-traces" aria-label="Vestígios das cinco famílias">
        <p>Um registro.<br /><em>Cinco gestos.</em></p>
        <div role="group" aria-label="Examinar um gesto do método">{TRACES.map((trace, index) => <button key={trace.patron} type="button" aria-pressed={active === index} onClick={() => select(index)}><span>0{index + 1}</span><b>{trace.verb}</b><small>{trace.patron}</small></button>)}</div>
      </div>
      <div className="g22-finale-trace-reading" aria-live="polite"><strong>{TRACES[active].title}</strong><span>{TRACES[active].note}</span></div>
      <article className="g22-finale-folio" aria-label="EV-001, vestígios de um método">
        <div className="g22-folio-head"><span>EV–001 / CADERNO ABERTO</span><span>SÉRIE DIDÁTICA · MW</span></div>
        <div className="g22-folio-measure" data-trace="measure">
          <span className="g22-folio-registration">01 / REGISTRO</span>
          <div><strong>68<span>MW</span></strong><span className="g22-folio-time">00:00<br /><b>Um instante.<br />Não uma conclusão.</b></span></div>
        </div>
        <div className="g22-folio-sequence" data-trace="organize" aria-label="Seis intervalos da série didática">
          {SAMPLES.map((value, i) => <div key={HOURS[i]} data-missing={value === null}><span>{HOURS[i]}</span><b>{value ?? "—"}</b>{value === null && <small>ausente</small>}</div>)}
        </div>
        <div className="g22-folio-observation" data-trace="observe">
          <svg className="g22-folio-plot" viewBox="0 0 480 104" role="img" aria-label="Amostra didática: 68 e 64 MW conectados; 81 e 108 MW isolados por lacunas. Não se interpola a ausência.">
            <line className="g22-plot-axis" x1="16" y1="95" x2="464" y2="95" />
            <path className="g22-plot-supported" d={`M${plotX(0)} ${plotY(68)} L${plotX(1)} ${plotY(64)}`} />
            {[2, 4].map(index => <g className="g22-plot-gap" key={index}><line x1={plotX(index)} x2={plotX(index)} y1="18" y2="95" /><path d={`M${plotX(index) - 5} 97l4 -4 4 4 4 -4`} /></g>)}
            {SAMPLES.map((value, index) => value === null ? null : <circle className="g22-plot-point" cx={plotX(index)} cy={plotY(value)} r={index === 0 ? 5 : 3.5} key={index} />)}
          </svg>
          <p><span>4 observações / 2 lacunas</span>O que não foi medido continua visível.</p>
        </div>
        <div className="g22-folio-examination">
          <div className="g22-folio-question" data-trace="question"><span>HIPÓTESE SOB EXAME</span><p>“O aumento prova<br />uma tendência?”</p><small>Há dois intervalos que não permitem afirmá-la.</small></div>
          <div className="g22-folio-reading" data-trace="transmit"><span>LEITURA A TRANSMITIR</span><p>Entre as medições,<br />a trajetória <em>permanece<br />desconhecida.</em></p></div>
        </div>
        <div className="g22-folio-source"><span>Origem: série sintética NIVAR.</span><span>Sem correspondência com uma usina real.</span></div>
      </article>

      </div>
    </dialog>
  </section>;
}
