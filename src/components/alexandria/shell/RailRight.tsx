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
// Este arquivo é dono do CHASSI e do ESTADO VAZIO. O conteúdo populado
// de cada slot é montado pelos componentes `Slot*` em
// `src/pages/alexandria/AlexandriaRouter.tsx` e chega aqui pronto, como
// `ReactNode` — a tipografia dele é definida lá, não aqui, e estilo
// inline de filho não é sobrescritível pelo pai.

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

/** Estado vazio de uma seção.
 *
 *  MEDIDO ANTES DE MUDAR (Wave 14). O computado dizia:
 *
 *    rótulo de seção .......... 11px, normal, ouro
 *    placeholder .............. 14px, ITÁLICO, #8CA0B8
 *    conteúdo populado ........ 11-12px, normal
 *
 *  Ou seja: o placeholder já era o MAIOR texto do rail. A hierarquia não
 *  quebrava por tamanho — quebrava por peso ótico. O rótulo é Cinzel
 *  caixa-alta com tracking .18em em ouro, que grita; o conteúdo era
 *  itálico na tinta mais fraca da paleta navy, que sussurra. Subir o
 *  corpo não resolveria nada e ainda deixaria o estado VAZIO maior que o
 *  estado POPULADO, que é o contrário do que a tela precisa dizer.
 *
 *  Então a correção é nas duas propriedades que realmente causavam o
 *  problema:
 *
 *  1. Itálico sai. A regra do produto reserva itálico para ênfase
 *     editorial — o lead da Apostila. Dado de estado é informação
 *     funcional e vai em romano.
 *  2. Contraste sobe de `tintaMetadadoNavy` (#8CA0B8, sem rótulo de
 *     token no handoff) para `tintaSobreNavySuave` (#A9B6C8, declarado
 *     'on-navy-muted' com 6.9:1). Passa a ser o nível de tinta
 *     secundária, não o de metadado.
 *
 *  O tamanho fica em `AT.dado` (14px) de propósito. O brief pede "nunca
 *  abaixo do corpo da Apostila", que mede 16px — mas a Apostila é
 *  superfície de leitura com medida de 68ch, e o rail é chrome de 300px.
 *  Aplicar piso de superfície de leitura ao chrome brigaria com a regra
 *  de densidade (40-60 elementos por tela). 14px já é o topo da escala
 *  de dado e 27% maior que o rótulo. */
function Placeholder({ texto }: { texto: string }) {
  return (
    <span
      style={{
        ...AT.dado,
        color: A2.tintaSobreNavySuave,
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
