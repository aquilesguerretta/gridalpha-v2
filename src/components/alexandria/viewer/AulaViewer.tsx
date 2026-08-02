// AulaViewer — a aula completa.
//
//   VideoArea (estado "em produção" nas nove)
//   → abas: Referência Técnica · Apostila · Notas · Transcrição
//   → InstrumentPanel, onde a aula tiver instrumento
//   → ExercicioBlock ao final
//   → ConclusaoAula — LYCEUM Wave 31, ver abaixo
//
// Aba sem conteúdo real mostra estado próprio dizendo por quê — nunca
// painel vazio sem explicação. Mesma disciplina do módulo em produção.
//
// PROGRESSO REAL — LYCEUM Wave 31. `aula_iniciada` dispara uma vez por
// `aula.id` genuinamente aberta (dependência do efeito é `aula.id`, não
// toda renderização — trocar de aula via "Próxima aula" re-renderiza este
// mesmo componente sem desmontar, e é exatamente aí que o efeito precisa
// refirar). Falha de rede no evento é best-effort: loga e segue, nunca
// bloqueia a leitura da aula.
//
// Não existia ponto de conclusão explícito na interface antes desta wave
// (sem botão "terminei", exercícios sem checagem, `activities: []` em
// boa parte das aulas). Confirmado com o Aquiles: em vez de reaproveitar
// "Próxima aula/Voltar" como afirmação implícita de conclusão, entra um
// botão dedicado — `ConclusaoAula`, ao final, depois do `ExercicioBlock`.

import { useEffect, useState } from 'react';
import type { CurriculumAula } from '@/lib/types/alexandria';
import { getCorpoAula, getLeadAula } from '@/lib/data/alexandria-curriculo';
import { recordEvent, type AulaStatusInfo } from '@/lib/progress/progressApi';
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

  // `null` = ainda não sabemos (efeito não resolveu, ou falhou). Nunca
  // afirma "concluído" sem confirmação real do backend.
  const [status, setStatus] = useState<AulaStatusInfo['status'] | null>(null);
  const [marcando, setMarcando] = useState(false);
  const [erroMarcar, setErroMarcar] = useState<string | null>(null);

  useEffect(() => {
    // Troca de aula (Próxima/Anterior não desmonta este componente) —
    // limpa o status da aula anterior antes de perguntar pela nova, para
    // não mostrar "concluído" da aula que acabou de sair de cena.
    setStatus(null);
    setErroMarcar(null);
    let vivo = true;

    recordEvent('aula_iniciada', aula.id)
      .then((r) => {
        if (vivo && r.aulaStatus) setStatus(r.aulaStatus.status);
      })
      .catch((err: unknown) => {
        // Best-effort: a aula continua legível mesmo sem registrar.
        console.error('[alexandria] falha ao registrar aula_iniciada', err);
      });

    return () => {
      vivo = false;
    };
  }, [aula.id]);

  async function marcarConcluida() {
    setMarcando(true);
    setErroMarcar(null);
    try {
      const r = await recordEvent('aula_concluida', aula.id);
      setStatus(r.aulaStatus?.status ?? 'concluido');
    } catch (err) {
      console.error('[alexandria] falha ao registrar aula_concluida', err);
      setErroMarcar('Não foi possível salvar agora. Tente de novo.');
    } finally {
      setMarcando(false);
    }
  }

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

      <ConclusaoAula
        status={status}
        marcando={marcando}
        erro={erroMarcar}
        onMarcar={marcarConcluida}
      />
    </div>
  );
}

/** O único ponto de conclusão explícito da aula — LYCEUM Wave 31. Estado
 *  desconhecido (efeito ainda não resolveu ou falhou) mostra o botão, não
 *  um terceiro estado visual: nunca afirma "concluído" sem confirmação. */
function ConclusaoAula({
  status,
  marcando,
  erro,
  onMarcar,
}: {
  status: AulaStatusInfo['status'] | null;
  marcando: boolean;
  erro: string | null;
  onMarcar: () => void;
}) {
  if (status === 'concluido') {
    return (
      <div
        style={{
          borderTop: `1px solid ${A.fioSobreCreme}`,
          paddingTop: AS.lg,
          display: 'flex',
          alignItems: 'center',
          gap: AS.sm,
        }}
      >
        <span style={{ ...AT.corpo, fontSize: '14px', color: A.oliva }}>
          ✓ Aula concluída
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        borderTop: `1px solid ${A.fioSobreCreme}`,
        paddingTop: AS.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: AS.sm,
        alignItems: 'flex-start',
      }}
    >
      <button
        type="button"
        onClick={onMarcar}
        disabled={marcando}
        style={{
          ...AT.rotulo,
          fontSize: '10px',
          color: marcando ? A2.tintaMetadado : A.terracota,
          background: 'none',
          border: `1px solid ${marcando ? A2.fioClaroSobreCreme : A.terracota}`,
          borderRadius: AR.none,
          padding: `${AS.sm} ${AS.lg}`,
          cursor: marcando ? 'default' : 'pointer',
          transition: `color ${AE.estado} ${AE.easing}, border-color ${AE.estado} ${AE.easing}`,
        }}
      >
        {marcando ? 'Marcando…' : 'Marcar aula como concluída'}
      </button>
      {erro && (
        <span style={{ ...AT.dado, fontSize: '11px', color: A.terracota }}>{erro}</span>
      )}
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
