// AulaViewer — a aula completa.
//
//   VideoArea (estado "em produção" nas nove)
//   → abas: Referência Técnica · Apostila · Notas · Transcrição
//   → InstrumentPanel, onde a aula tiver instrumento
//   → ExercicioBlock ao final
//
// Aba sem conteúdo real mostra estado próprio dizendo por quê — nunca
// painel vazio sem explicação. Mesma disciplina do módulo em produção.

import { useState } from 'react';
import type { CurriculumAula } from '@/lib/types/alexandria';
import { getCorpoAula, getLeadAula } from '@/lib/data/alexandria-curriculo';
import { A, A2, AT, AS, AR, AE } from '@/design/alexandria-tokens';
import { VideoArea } from './VideoArea';
import { ApostilaPanel } from './ApostilaPanel';
import { InstrumentPanel } from './InstrumentPanel';
import { ExercicioBlock } from './ExercicioBlock';

type Aba = 'referencia' | 'apostila' | 'notas' | 'transcricao';

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'referencia', rotulo: 'Referência técnica' },
  { id: 'apostila', rotulo: 'Apostila' },
  { id: 'notas', rotulo: 'Notas' },
  { id: 'transcricao', rotulo: 'Transcrição' },
];

export function AulaViewer({ aula }: { aula: CurriculumAula }) {
  // Apostila é a única com conteúdo real hoje, então é a aba inicial.
  const [aba, setAba] = useState<Aba>('apostila');

  // Resolvido pelo id da aula, não por módulo fixo — ver
  // `alexandria-curriculo.ts`.
  const blocos = getCorpoAula(aula.id);
  const lead = getLeadAula(aula.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: AS.xxl }}>
      <VideoArea video={aula.video} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Faixa de abas. Ativa é fio de 2px embaixo — o mesmo idioma que o
            handoff usa em tab strip. Nunca caixa, nunca pílula. */}
        <div
          role="tablist"
          style={{ display: 'flex', gap: AS.xl, borderBottom: `1px solid ${A.fioSobreCreme}` }}
        >
          {ABAS.map((t) => {
            const ativa = t.id === aba;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={ativa}
                type="button"
                onClick={() => setAba(t.id)}
                style={{
                  ...AT.rotulo,
                  fontSize: '10px',
                  color: ativa ? A.tintaSobreCreme : A2.tintaMetadado,
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${ativa ? A.terracota : 'transparent'}`,
                  borderRadius: AR.none,
                  padding: `0 0 ${AS.sm}`,
                  marginBottom: '-1px',
                  cursor: 'pointer',
                  transition: `color ${AE.estado} ${AE.easing}, border-color ${AE.estado} ${AE.easing}`,
                }}
              >
                {t.rotulo}
              </button>
            );
          })}
        </div>

        <div style={{ paddingTop: AS.xl }}>
          {aba === 'apostila' && (
            <ApostilaPanel lead={lead} blocos={blocos} gravuras={aula.illustrations} />
          )}

          {aba === 'referencia' && (
            <AbaVazia
              titulo="Sem referência nesta aula"
              corpo="Os módulos extraídos reúnem as fontes numa seção própria de fim de módulo (§ Ref), não por aula — por isso `references` está vazio em todas elas. Quando a extração alcançar o aparato, elas aparecem aqui."
            />
          )}

          {aba === 'notas' && (
            <AbaVazia
              titulo="Notas do aluno ainda não existem"
              corpo="Anotar exige persistência por usuário, que a Alexandria ainda não tem. O primitivo de anotação da Wave 1 (leader-line, bracket, detail-frame) foi feito para esta camada."
            />
          )}

          {aba === 'transcricao' && (
            <AbaVazia
              titulo="Sem transcrição"
              corpo="Transcrição é derivada de vídeo, e nenhuma aula extraída tem gravação — os HTML de origem não trazem vídeo nenhum. O texto da aula está na Apostila, e é a aula inteira, não um resumo."
            />
          )}
        </div>
      </div>

      {aula.instruments.map((inst) => (
        <InstrumentPanel key={inst.id} instrumento={inst} />
      ))}

      <ExercicioBlock atividades={aula.activities} />
    </div>
  );
}

/** Aba sem conteúdo real. Diz o que falta e por quê — nunca vazio mudo. */
function AbaVazia({ titulo, corpo }: { titulo: string; corpo: string }) {
  return (
    <div
      style={{
        borderLeft: `3px solid ${A2.fioColunaSobreCreme}`,
        padding: `${AS.sm} ${AS.lg}`,
        display: 'flex',
        flexDirection: 'column',
        gap: AS.sm,
      }}
    >
      <span style={{ ...AT.h3, fontSize: '13px', color: A.tintaSuave, letterSpacing: '0.08em' }}>
        {titulo}
      </span>
      <span
        style={{
          ...AT.corpo,
          fontSize: '14px',
          lineHeight: 1.6,
          color: A2.tintaMetadado,
          maxWidth: '58ch',
        }}
      >
        {corpo}
      </span>
    </div>
  );
}

export default AulaViewer;
