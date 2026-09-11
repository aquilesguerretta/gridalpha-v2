import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  FileSearch,
  Inbox,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { Wordmark } from "../../components/g2/Brand";
import { nomeDoProduto, PRODUTOS_COM_FILA } from "../../lib/operador/catalogo";
import { FILA_MOCK, pendentes } from "../../lib/operador/mock";
import "../../components/g2/g2.css";
import "./g2-operations.css";

export function EstilosConsole() {
  return null;
}

export function ConsoleLayout() {
  const { pathname } = useLocation();
  const [dark, setDark] = useState(false);
  const [menu, setMenu] = useState(false);
  const selected = pathname.replace(/^\/operador\/?/, "").split("/")[0];
  return (
    <div
      className="g2 g2-ops"
      data-ops-theme={dark ? "dark" : "light"}
      lang="pt-BR"
    >
      <header className="g2-ops__header">
        <Link
          to="/br"
          className="g2-ops__brand"
          aria-label="NIVAR — Portal Brasil"
        >
          <Wordmark height={23} />
        </Link>
        <span className="g2-ops__product">
          Advisory <span>/</span> Bancada de análise
        </span>
        <div className="g2-ops__header-right">
          <span className="g2-ops__sample-label">AMOSTRA ILUSTRATIVA</span>
          <Link to="/conta">
            Conta <ArrowUpRight size={13} />
          </Link>
          <button
            className="g2-ops__menu-toggle"
            type="button"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? "Fechar navegação" : "Abrir navegação"}
            aria-expanded={menu}
          >
            {menu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>
      <div className="g2-ops__body">
        <aside className="g2-ops__sidebar" data-open={menu}>
          <div className="g2-ops__sidebar-top">
            <span>ESPAÇO DE TRABALHO</span>
            <strong>Sócrates questiona.</strong>
          </div>
          <nav aria-label="Fila de análise">
            <Link
              to="/operador"
              className="g2-ops__nav-item"
              aria-current={!selected ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              <Inbox size={16} />
              <span>Todos os pedidos</span>
              <b>{FILA_MOCK.length}</b>
            </Link>
            <div className="g2-ops__nav-label">POR PRODUTO</div>
            {PRODUTOS_COM_FILA.map((p) => (
              <Link
                className="g2-ops__nav-item g2-ops__nav-item--product"
                key={p.produtoId}
                to={`/operador/${p.produtoId}`}
                aria-current={selected === p.produtoId ? "page" : undefined}
                onClick={() => setMenu(false)}
              >
                <span>{nomeDoProduto(p.produtoId)}</span>
                <b>{pendentes(p.produtoId)}</b>
              </Link>
            ))}
          </nav>
          <div className="g2-ops__sidebar-method">
            <FileSearch size={20} />
            <p>A conclusão vem depois.</p>
            <span>
              Evidência, premissas e contrapontos permanecem visíveis durante
              toda a análise.
            </span>
          </div>
          <div className="g2-ops__sidebar-bottom">
            <Link to="/br/advisory">
              Conhecer Advisory <ArrowUpRight size={13} />
            </Link>
            <button type="button" onClick={() => setDark(!dark)}>
              {dark ? <Sun size={15} /> : <Moon size={15} />}{" "}
              {dark ? "Modo claro" : "Modo escuro"}
            </button>
          </div>
        </aside>
        <main className="g2-ops__main">
          <div className="g2-ops__truth">
            <span>G2 EXPERIMENTAL</span>
            <p>
              Pedidos e nomes ilustrativos · sem acesso à fila real · rascunhos
              locais, sem envio.
            </p>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
