// ModuloAulaList — as aulas de um módulo.
//
// Contagem e numeração são REAIS: vêm de `CurriculumModule.totalAulas`,
// extraído do HTML do módulo pela FOUNDRY Wave 2 com três sinais
// independentes concordando. "Aula 3 de 9" é verdade.
//
// Título de aula é mock e está rotulado como tal — `CurriculumAula` não
// tem dado real ainda. O que NÃO se faz aqui é inventar lista onde
// `totalAulas` é null: módulo em produção mostra estado de produção, sem
// lista fake de tamanho arbitrário.

import { useNavigate } from 'react-router-dom';
import type { CurriculumTrilha } from '@/lib/types/alexandria';
import { A, A2, AT, AS, AR, AE } from '@/design/alexandria-tokens';
import type { ModuloComEstado } from '@/pages/alexandria/AlexandriaRouter';

interface ModuloAulaListProps {
  item: ModuloComEstado;
  trilha: CurriculumTrilha;
  /** O router é quem conhece as rotas — este componente só diz qual aula. */
  onAbrirAula: (numero: number) => void;
}

export function ModuloAulaList({ item, trilha, onAbrirAula }: ModuloAulaListProps) {
  const navigate = useNavigate();
  const { modulo, estado, aulasFeitas } = item;

  const voltar = () => navigate(`/alexandria/trilha/${trilha.id}`);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: AS.xl }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: AS.sm }}>
        <button
          type="button"
          onClick={voltar}
          style={{
            ...AT.rotulo,
            alignSelf: 'flex-start',
            color: A2.tintaMetadado,
            background: 'none',
            border: 'none',
            borderRadius: AR.none,
            padding: 0,
            cursor: 'pointer',
          }}
        >
          ← {trilha.title}
        </button>

        <span style={{ ...AT.rotulo, color: A.terracota }}>
          Módulo {modulo.number} de {modulo.totalInTrilha}
        </span>

        <h1 style={{ ...AT.h1, color: A.tintaSobreCreme, margin: 0 }}>{modulo.title}</h1>
      </div>

      {modulo.totalAulas === null ? (
        <EmProducao />
      ) : (
        <ListaReal
          total={modulo.totalAulas}
          feitas={aulasFeitas ?? 0}
          bloqueado={estado === 'bloqueado'}
          onAbrirAula={onAbrirAula}
        />
      )}
    </div>
  );
}

/** Estado de produção — sem número, sem lista. O conteúdo não existe. */
function EmProducao() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: AS.md,
        borderLeft: `3px solid ${A.terracota}`,
        padding: `${AS.md} ${AS.xl}`,
      }}
    >
      <span style={{ ...AT.h3, color: A.terracota, letterSpacing: '0.08em' }}>
        Conteúdo em produção
      </span>
      <span style={{ ...AT.corpo, fontSize: '14px', color: A.tintaSuave, maxWidth: '58ch' }}>
        Este módulo está catalogado no Currículo Definitivo, mas as aulas ainda
        não foram escritas. Não há contagem a mostrar — o número de aulas será
        conhecido quando o conteúdo existir, e estimá-lo agora seria invenção.
      </span>
      <span style={{ ...AT.dado, fontSize: '12px', fontStyle: 'italic', color: A2.tintaMetadado }}>
        Três dos dezessete módulos têm conteúdo escrito hoje.
      </span>
    </div>
  );
}

/** Numeração e contagem reais. Título é mock, e o rodapé diz isso. */
function ListaReal({
  total,
  feitas,
  bloqueado,
  onAbrirAula,
}: {
  total: number;
  feitas: number;
  bloqueado: boolean;
  onAbrirAula: (numero: number) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: AS.lg }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: AS.md, flexWrap: 'wrap' }}>
        <span style={{ ...AT.rotulo, color: A2.tintaMetadado }}>Aulas</span>
        <span style={{ ...AT.dado, color: A.tintaSuave }}>
          {bloqueado ? `${total} aulas · módulo trancado` : `${feitas} de ${total} concluídas`}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {Array.from({ length: total }, (_, i) => {
          const numero = i + 1;
          const concluida = numero <= feitas;
          const atual = numero === feitas + 1 && !bloqueado;
          const disponivel = !bloqueado && numero <= feitas + 1;

          return (
            <button
              key={numero}
              type="button"
              disabled={!disponivel}
              onClick={disponivel ? () => onAbrirAula(numero) : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: AS.lg,
                textAlign: 'left',
                background: 'none',
                border: 'none',
                borderTop: `1px solid ${i === 0 ? 'transparent' : A2.fioClaroSobreCreme}`,
                // Fio de 3px à esquerda marca a aula atual — mesmo idioma
                // do item ativo de rail no handoff.
                borderLeft: `3px solid ${atual ? A.terracota : 'transparent'}`,
                borderRadius: AR.none,
                padding: `${AS.md} ${AS.md}`,
                font: 'inherit',
                cursor: disponivel ? 'pointer' : 'default',
                transition: `border-color ${AE.estado} ${AE.easing}`,
              }}
            >
              <span
                style={{
                  ...AT.dado,
                  flex: 'none',
                  width: '3ch',
                  color: concluida ? A.oliva : A2.tintaMetadado,
                }}
              >
                {String(numero).padStart(2, '0')}
              </span>

              <span
                style={{
                  ...AT.corpo,
                  fontSize: '14px',
                  flex: 1,
                  minWidth: 0,
                  maxWidth: 'none',
                  color: disponivel ? A.tintaSobreCreme : A2.tintaMetadado,
                }}
              >
                Aula {numero} de {total}
              </span>

              <span
                style={{
                  ...AT.dado,
                  fontSize: '11px',
                  flex: 'none',
                  color: concluida ? A.oliva : atual ? A.terracota : A2.tintaMetadado,
                }}
              >
                {concluida ? 'concluída' : atual ? 'continuar' : bloqueado ? '' : 'a seguir'}
              </span>
            </button>
          );
        })}
      </div>

      <span
        style={{
          ...AT.dado,
          fontSize: '11px',
          fontStyle: 'italic',
          color: A2.tintaMetadado,
          borderTop: `1px solid ${A.fioSobreCreme}`,
          paddingTop: AS.md,
        }}
      >
        Numeração e contagem são reais, extraídas do HTML do módulo. Os títulos
        de aula chegam com o viewer.
      </span>
    </div>
  );
}

export default ModuloAulaList;
