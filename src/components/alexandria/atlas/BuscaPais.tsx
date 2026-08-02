// BuscaPais — busca de país do modo imersivo do Atlas (revisão 3
// pós-Wave 28: "com essa barra de busca e outras futuras ferramentas").
//
// Campo sem caixa — fio embaixo, o padrão ⌘K do handoff — e resultados
// em cartão de papel. Busca acento-insensível cobrindo o nome pt-BR,
// o nome do backend e o código ISO. Só países com geometria no globo:
// os 22 micro-Estados sem polígono a 1:110m ficam de fora, a mesma
// limitação registrada desde a Wave 27.

import { useMemo, useRef, useState } from 'react';
import { A, A2, AF, AT, AE, AS, AR } from '../../../design/alexandria-tokens';
import { nomePaisPt, type MundoAtlas, type PaisFeature } from '../../../lib/atlas/worldApi';

interface BuscaPaisProps {
  mundo: MundoAtlas;
  aoEscolher: (f: PaisFeature) => void;
}

function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function BuscaPais({ mundo, aoEscolher }: BuscaPaisProps) {
  const [termo, setTermo] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const indice = useMemo(
    () =>
      mundo.features
        .map((f) => {
          const resumo = f.properties.a3 ? mundo.porIso.get(f.properties.a3) : undefined;
          const nome = nomePaisPt(f.properties, resumo?.countryName);
          return {
            f,
            nome,
            a3: f.properties.a3,
            temDado: resumo !== undefined,
            chave: normalizar(
              `${nome} ${resumo?.countryName ?? ''} ${f.properties.a3 ?? ''} ${f.properties.name}`,
            ),
          };
        })
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [mundo],
  );

  const q = normalizar(termo.trim());
  const resultados = q === '' ? [] : indice.filter((e) => e.chave.includes(q)).slice(0, 8);

  const escolher = (f: PaisFeature) => {
    setTermo('');
    inputRef.current?.blur();
    aoEscolher(f);
  };

  return (
    <div style={{ position: 'relative', width: 'min(360px, 60vw)', pointerEvents: 'auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: AS.md,
          borderBottom: `1px solid ${A.fioSobreCreme}`,
          paddingBottom: AS.xs,
          background: 'transparent',
        }}
      >
        <span style={{ ...AT.rotulo, fontSize: '9px', color: A2.tintaMetadado }}>Buscar</span>
        <input
          ref={inputRef}
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && resultados.length > 0) {
              escolher(resultados[0].f);
            } else if (e.key === 'Escape' && termo !== '') {
              // limpa a busca sem sair do modo imersivo
              e.stopPropagation();
              setTermo('');
            }
          }}
          placeholder="país, código ISO…"
          aria-label="Buscar país no atlas"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: AF.corpo,
            fontSize: '14px',
            color: A.tintaSobreCreme,
          }}
        />
      </div>

      {resultados.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            margin: `${AS.xs} 0 0`,
            padding: 0,
            listStyle: 'none',
            background: A2.cremeSuperficie,
            border: `1px solid ${A.fioSobreCreme}`,
            borderRadius: AR.none,
            maxHeight: '304px',
            overflowY: 'auto',
          }}
        >
          {resultados.map((r) => (
            <li key={r.a3 ?? r.nome}>
              <button
                type="button"
                onClick={() => escolher(r.f)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: AS.md,
                  width: '100%',
                  padding: `${AS.sm} ${AS.md}`,
                  background: 'none',
                  border: 'none',
                  borderBottom: `1px solid ${A2.fioClaroSobreCreme}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: `background ${AE.estado} ${AE.easing}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = A2.cremeAfundado; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ ...AT.dado, fontSize: '13px', color: A.tintaSobreCreme }}>{r.nome}</span>
                <span style={{ ...AT.rotulo, fontSize: '8px', letterSpacing: '0.13em', color: r.temDado ? A2.tintaMetadado : A.terracota }}>
                  {r.temDado ? (r.a3 ?? '—') : 'sem dado'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BuscaPais;
