// InstrumentPanel — um componente para os nove `kind` de instrumento.
//
// Lê `fields` do `Instrument`, renderiza número / range / select conforme
// declarado, chama a função de `INSTRUMENT_CALCULATORS` a cada mudança e
// mostra os `outputs` reais mais o veredito quando existir.
//
// Caso do diagrama: quando `formula` é null e `outputs` é vazio, o
// instrumento não imprime número — desenha. É o `Controles · Triângulo de
// potência` (INST 05), que na fonte tem zero `.instrument-output` porque os
// readouts moram no bloco de visualização do corpo, não no instrumento.
//
// Raio zero, sem sombra, tinta e fio do sistema Alexandria.

import { useMemo, useState } from 'react';
import type { Instrument, InstrumentField } from '@/lib/types/alexandria';
import {
  INSTRUMENT_CALCULATORS,
  type EntradaInstrumento,
} from '@/lib/data/alexandria-instrument-calculators';
import { A, A2, AT, AS, AR } from '@/design/alexandria-tokens';

/** O LAB 01 é comparador de dois lados. A coluna vem prefixada no rótulo
 *  ("Fábrica A · Demanda máxima"), porque `InstrumentField` não tem campo
 *  de agrupamento e inventar um não era necessário. */
function separaColuna(label: string): { coluna: string | null; texto: string } {
  const m = label.match(/^(Fábrica [AB])\s*·\s*(.+)$/);
  return m ? { coluna: m[1], texto: m[2] } : { coluna: null, texto: label };
}

const fmt = (v: number, casas = 2) =>
  v.toLocaleString('pt-BR', { maximumFractionDigits: casas });

export function InstrumentPanel({ instrumento }: { instrumento: Instrument }) {
  // Semeia TODO campo que declara default, número ou string.
  //
  // Até a Wave 18 esta linha era `if (typeof f.defaultValue === 'number')`,
  // e todo `kind:'select'` ficava de fora — porque select entrega string
  // ('500' kV, 'ger'). O Módulo 01 não tem select nenhum, então o buraco
  // nunca apareceu; no Módulo 02, que tem seis, o instrumento nascia com
  // `∞` e `NaN` nas saídas e só passava a calcular depois que o aluno
  // mexia no controle. Campo com `defaultValue: ''` (a Lei de Ohm, que
  // começa vazia de propósito) continua fora — string vazia não é valor.
  const inicial = useMemo(() => {
    const o: Record<string, EntradaInstrumento> = {};
    for (const f of instrumento.fields) {
      if (f.defaultValue !== '' && f.defaultValue !== undefined) o[f.id] = f.defaultValue;
    }
    return o;
  }, [instrumento]);

  const [valores, setValores] = useState<Record<string, EntradaInstrumento>>(inicial);

  const calc = INSTRUMENT_CALCULATORS[instrumento.id];
  const resultado = useMemo(
    () => (calc ? calc(valores) : { valores: {} as Record<string, number> }),
    [calc, valores],
  );

  // Guarda número quando o valor É numérico, e a string crua quando não é.
  //
  // `Number(bruto)` cego quebraria os selects CATEGÓRICOS do Módulo 02 — o
  // Explorador de camadas ('ger'/'tra'/'dis'/'con') e a Cadeia por perfil
  // ('a2'/'a4'/'bt') viravam NaN ao primeiro clique. Os selects numéricos
  // ('500' kV, '2' circuitos) seguem chegando como número, que é o que as
  // calculadoras esperam.
  const setCampo = (id: string, bruto: string) => {
    setValores((v) => {
      const proximo = { ...v };
      if (bruto === '') delete proximo[id];
      else {
        const comoNumero = Number(bruto);
        proximo[id] = Number.isFinite(comoNumero) ? comoNumero : bruto;
      }
      return proximo;
    });
  };

  // Campos que a própria calculadora resolveu (Lei de Ohm preenche a
  // incógnita) aparecem no campo, em vez de só no veredito.
  const mostrado = (f: InstrumentField) => {
    const doUsuario = valores[f.id];
    if (doUsuario !== undefined) return String(doUsuario);
    const resolvido = resultado.valores[f.id];
    return resolvido === undefined ? '' : String(Math.round(resolvido * 1000) / 1000);
  };

  const colunas = [...new Set(instrumento.fields.map((f) => separaColuna(f.label).coluna))].filter(
    (c): c is string => c !== null,
  );

  const ehDiagrama = instrumento.formula === null && instrumento.outputs.length === 0;

  return (
    <section
      style={{
        border: `1px solid ${A.fioSobreCreme}`,
        borderRadius: AR.none,
        background: A2.cremeSuperficie,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: AS.md,
          padding: `${AS.md} ${AS.lg}`,
          borderBottom: `1px solid ${A.fioSobreCreme}`,
        }}
      >
        <span style={{ ...AT.h3, color: A.tintaSobreCreme, letterSpacing: '0.06em' }}>
          {instrumento.title}
        </span>
        <span style={{ ...AT.rotulo, fontSize: '10px', color: A2.tintaMetadado }}>
          {instrumento.id.replace('-', ' · ').toUpperCase()}
        </span>
      </header>

      <div style={{ padding: AS.lg, display: 'flex', flexDirection: 'column', gap: AS.lg }}>
        {instrumento.formula && (
          <div
            style={{
              ...AT.dado,
              fontSize: '15px',
              color: A.terracota,
              borderLeft: `3px solid ${A.terracota}`,
              paddingLeft: AS.md,
            }}
          >
            {instrumento.formula}
          </div>
        )}

        {/* Campos. Comparador de dois lados vira duas colunas. */}
        {colunas.length > 0 ? (
          <>
            <CamposGrade
              campos={instrumento.fields.filter((f) => separaColuna(f.label).coluna === null)}
              mostrado={mostrado}
              setCampo={setCampo}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${colunas.length}, 1fr)`,
                borderTop: `1px solid ${A.fioSobreCreme}`,
              }}
            >
              {colunas.map((col, ci) => (
                <div
                  key={col}
                  style={{
                    padding: `${AS.md} ${AS.md} 0`,
                    borderLeft: ci > 0 ? `1px solid ${A.fioSobreCreme}` : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: AS.md,
                  }}
                >
                  <span style={{ ...AT.rotulo, color: A.terracota }}>{col}</span>
                  <CamposGrade
                    campos={instrumento.fields.filter((f) => separaColuna(f.label).coluna === col)}
                    mostrado={mostrado}
                    setCampo={setCampo}
                    umaColuna
                  />
                  <Saidas
                    saidas={instrumento.outputs.filter(
                      (o) => separaColuna(o.label).coluna === col,
                    )}
                    valores={resultado.valores}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <CamposGrade campos={instrumento.fields} mostrado={mostrado} setCampo={setCampo} />
        )}

        {colunas.length === 0 && instrumento.outputs.length > 0 && (
          <Saidas saidas={instrumento.outputs} valores={resultado.valores} />
        )}

        {ehDiagrama && <TrianguloDePotencia valores={resultado.valores} />}

        {resultado.veredito && (
          <p
            style={{
              ...AT.corpo,
              fontSize: '13px',
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 'none',
              color: A.tintaSuave,
              borderTop: `1px solid ${A2.fioClaroSobreCreme}`,
              paddingTop: AS.md,
            }}
          >
            {resultado.veredito}
          </p>
        )}

        {instrumento.note && (
          <p
            style={{
              ...AT.corpo,
              fontSize: '12.5px',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 'none',
              color: A2.tintaMetadado,
            }}
            dangerouslySetInnerHTML={{ __html: instrumento.note }}
          />
        )}
      </div>
    </section>
  );
}

function CamposGrade({
  campos,
  mostrado,
  setCampo,
  umaColuna = false,
}: {
  campos: InstrumentField[];
  mostrado: (f: InstrumentField) => string;
  setCampo: (id: string, v: string) => void;
  umaColuna?: boolean;
}) {
  if (!campos.length) return null;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: umaColuna ? '1fr' : `repeat(${Math.min(campos.length, 3)}, 1fr)`,
        gap: AS.lg,
      }}
    >
      {campos.map((f) => {
        const { texto } = separaColuna(f.label);
        return (
          <label key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: AS.xs }}>
            <span style={{ ...AT.rotulo, fontSize: '10px', color: A2.tintaMetadado }}>
              {texto}
              {f.unit && <span style={{ color: A.terracota }}> · {f.unit}</span>}
            </span>

            {f.kind === 'select' ? (
              <select
                value={mostrado(f)}
                onChange={(e) => setCampo(f.id, e.target.value)}
                style={campoEstilo}
              >
                {(f.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                value={mostrado(f)}
                min={f.min}
                max={f.max}
                step={f.step}
                onChange={(e) => setCampo(f.id, e.target.value)}
                style={campoEstilo}
              />
            )}

            {f.kind === 'range' && (
              <input
                type="range"
                value={mostrado(f) || f.min || 0}
                min={f.min}
                max={f.max}
                step={f.step}
                onChange={(e) => setCampo(f.id, e.target.value)}
                style={{ width: '100%', accentColor: A.terracota }}
              />
            )}
          </label>
        );
      })}
    </div>
  );
}

const campoEstilo: React.CSSProperties = {
  ...AT.dado,
  color: A.tintaSobreCreme,
  background: A.cremePapel,
  border: 'none',
  borderBottom: `1px solid ${A2.fioColunaSobreCreme}`,
  borderRadius: AR.none,
  padding: `${AS.xs} 0`,
  outline: 'none',
  width: '100%',
};

function Saidas({
  saidas,
  valores,
}: {
  saidas: { id: string; label: string; unit: string | null }[];
  valores: Record<string, number>;
}) {
  if (!saidas.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {saidas.map((o, i) => {
        const v = valores[o.id];
        const { texto } = separaColuna(o.label);
        const total = /fatura estimada/i.test(texto);
        return (
          <div
            key={o.id}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: AS.md,
              padding: `${AS.sm} 0`,
              borderTop: i > 0 ? `1px solid ${A2.fioClaroSobreCreme}` : 'none',
            }}
          >
            <span style={{ ...AT.dado, fontSize: '12px', color: A.tintaSuave }}>{texto}</span>
            <span
              style={{
                ...AT.dado,
                fontSize: total ? '17px' : '15px',
                color: total ? A.terracota : A.tintaSobreCreme,
              }}
            >
              {v === undefined ? '—' : `${o.unit === 'R$' ? 'R$ ' : ''}${fmt(v, o.unit === 'R$' ? 0 : 2)}`}
              {o.unit && o.unit !== 'R$' && (
                <span style={{ color: A2.tintaMetadado }}> {o.unit}</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** O diagrama do INST 05. Geometria portada do original: origem (40,240),
 *  comprimento máximo 200 px, escalas MAX_KW 1500 e MAX_KVAR 1200. */
function TrianguloDePotencia({ valores }: { valores: Record<string, number> }) {
  const kw = valores['tri-kw'] ?? 0;
  const kvar = valores['tri-kvar'] ?? 0;
  const kva = valores['tri-kva'] ?? 0;
  const fp = valores['tri-fp'] ?? 1;
  const ang = valores['tri-angulo'] ?? 0;

  const OX = 40, OY = 240, MAX_LEN = 200, MAX_KW = 1500, MAX_KVAR = 1200;
  const fimX = OX + (kw / MAX_KW) * MAX_LEN;
  const fimY = OY - (kvar / MAX_KVAR) * (MAX_LEN * 0.85);
  const rad = (ang * Math.PI) / 180;
  const r = 30;

  const corFp = fp >= 0.92 ? A.oliva : fp >= 0.85 ? A2.ouroSobreNavy : A.terracota;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: AS.xl, alignItems: 'center' }}>
      <svg viewBox="0 0 300 270" style={{ width: '100%', maxWidth: 320, overflow: 'visible' }}>
        <line x1={OX} y1={OY} x2={OX + MAX_LEN} y2={OY} stroke={A2.fioClaroSobreCreme} strokeWidth="1" />
        <line x1={OX} y1={OY} x2={OX} y2={OY - MAX_LEN} stroke={A2.fioClaroSobreCreme} strokeWidth="1" />
        <path
          d={`M ${OX + r} ${OY} A ${r} ${r} 0 0 0 ${(OX + r * Math.cos(-rad)).toFixed(2)} ${(OY + r * Math.sin(-rad)).toFixed(2)}`}
          fill="none"
          stroke={A2.tintaMetadado}
          strokeWidth="1"
        />
        <line x1={OX} y1={OY} x2={fimX} y2={OY} stroke={A.tintaSobreCreme} strokeWidth="2" />
        <line x1={fimX} y1={OY} x2={fimX} y2={fimY} stroke={A.terracota} strokeWidth="2" />
        <line x1={OX} y1={OY} x2={fimX} y2={fimY} stroke={corFp} strokeWidth="2.5" />
        <text x={OX + 8} y={OY + 16} style={{ ...AT.rotulo, fontSize: '9px' }} fill={A2.tintaMetadado}>
          kW
        </text>
        <text x={fimX + 6} y={(OY + fimY) / 2} style={{ ...AT.rotulo, fontSize: '9px' }} fill={A.terracota}>
          kVAr
        </text>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: AS.sm, minWidth: 130 }}>
        {[
          ['Potência aparente', `${fmt(kva, 0)} kVA`, A.tintaSobreCreme],
          ['Fator de potência', fmt(fp, 2), corFp],
          ['Ângulo φ', `${fmt(ang, 1)}°`, A.tintaSuave],
        ].map(([r0, r1, cor], i) => (
          <div
            key={r0 as string}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              paddingTop: i > 0 ? AS.sm : 0,
              borderTop: i > 0 ? `1px solid ${A2.fioClaroSobreCreme}` : 'none',
            }}
          >
            <span style={{ ...AT.rotulo, fontSize: '9px', color: A2.tintaMetadado }}>{r0}</span>
            <span style={{ ...AT.dado, fontSize: '17px', color: cor as string }}>{r1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InstrumentPanel;
