import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Moon, Sun } from "lucide-react";
import { Wordmark } from "./Brand";
import "./g2.css";
import "./advisory-intake.css";

/** Visual frame only. Identity, entitlement, validation and API calls stay in each intake. */
export function AdvisoryIntakeHeader({
  title,
  mode,
  onModeChange,
  onNavigate,
}: {
  title: string;
  mode: "claro" | "noturno";
  onModeChange: (mode: "claro" | "noturno") => void;
  onNavigate: (path: string) => void;
}) {
  function navigate(event: MouseEvent<HTMLAnchorElement>, path: string) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    onNavigate(path);
  }
  return (
    <header className="g2-intake__header">
      <div className="g2-intake__identity">
        <Link
          to="/br"
          aria-label="NIVAR — voltar ao Portal Brasil"
          onClick={(event) => navigate(event, "/br")}
        >
          <Wordmark height={25} />
        </Link>
        <span className="g2-intake__product">{title}</span>
      </div>
      <nav aria-label="Navegação da análise">
        <Link
          to="/br/familia/advisory"
          onClick={(event) => navigate(event, "/br/familia/advisory")}
        >
          <ArrowLeft size={14} /> Advisory
        </Link>
        <Link to="/conta" onClick={(event) => navigate(event, "/conta")}>
          Minha conta <ArrowUpRight size={13} />
        </Link>
        <button
          type="button"
          aria-label={
            mode === "noturno" ? "Usar modo claro" : "Usar modo escuro"
          }
          onClick={() => onModeChange(mode === "noturno" ? "claro" : "noturno")}
        >
          {mode === "noturno" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </nav>
    </header>
  );
}

export { Wordmark };
