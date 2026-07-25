// RailRight — sempre presente, sempre navy, sempre 300px.
//
// Ordem das seções é FIXA e não configurável:
//   1 Progresso · 2 Lista de aulas · 3 Próxima aula
//   4 Conquistas · 5 Referências
//
// Cada seção é separada da seguinte por fio de 1px, nunca por card.
// Blocos irmãos, não caixas empilhadas — uma borda dentro de outra
// borda lê como formulário, não como prancha (handoff L1068).
//
// Nesta wave são slots com estrutura e rótulo; o conteúdo real chega
// quando o viewer de aula existir.

import type { ReactNode } from 'react';
import { A, A2, AT, AS, AR, ALAYOUT } from '../../../design/alexandria-tokens';

export interface RailRightSlots {
  progresso?: ReactNode;
  listaAulas?: ReactNode;
  proximaAula?: ReactNode;
  conquistas?: ReactNode;
  referencias?: ReactNode;
}

// Ordem fixa — a sequência é o contrato, não uma preferência.
const SECOES: { chave: keyof RailRightSlots; rotulo: string; vazio: string }[] = [
  { chave: 'progresso',   rotulo: 'Progresso',       vazio: 'Sem trilha em curso' },
  { chave: 'listaAulas',  rotulo: 'Lista de aulas',  vazio: 'Nenhuma aula carregada' },
  { chave: 'proximaAula', rotulo: 'Próxima aula',    vazio: 'Nada agendado' },
  { chave: 'conquistas',  rotulo: 'Conquistas',      vazio: 'Nenhuma conquista ainda' },
  { chave: 'referencias', rotulo: 'Referências',     vazio: 'Sem referências nesta tela' },
];

function Placeholder({ texto }: { texto: string }) {
  return (
    <span
      style={{
        ...AT.dado,
        fontStyle: 'italic',
        color: A2.tintaMetadadoNavy,
      }}
    >
      {texto}
    </span>
  );
}

export function RailRight({ slots = {} }: { slots?: RailRightSlots }) {
  return (
    <aside
      style={{
        width: ALAYOUT.railRight,
        flex: `0 0 ${ALAYOUT.railRight}`,
        background: A.navy,
        borderLeft: `1px solid ${A.fioSobreNavy}`,
        borderRadius: AR.none,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {SECOES.map((secao, i) => (
        <section
          key={secao.chave}
          style={{
            padding: `${AS.lg} ${AS.xl}`,
            // Fio entre irmãos — não no último, senão duplica com o rodapé.
            borderBottom: i < SECOES.length - 1 ? `1px solid ${A.fioSobreNavy}` : 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: AS.md,
          }}
        >
          <span style={{ ...AT.rotulo, color: A2.ouroSobreNavy }}>{secao.rotulo}</span>
          {slots[secao.chave] ?? <Placeholder texto={secao.vazio} />}
        </section>
      ))}
    </aside>
  );
}

export default RailRight;
