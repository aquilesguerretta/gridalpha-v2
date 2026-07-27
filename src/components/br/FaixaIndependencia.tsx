// FaixaIndependencia — ARCHITECT, Portal BR Wave 4.
//
// A versão de negação da Wave 1 foi REJEITADA na revisão de design
// (spec §4): a seção não podia ser uma lista do que a GridAlpha não
// faz. Esta é a versão AFIRMATIVA — o que a GridAlpha FAZ — escrita
// pelo implementador sob a autorização aberta da Wave 4.
//
// COPY SUJEITA A VETO DO AQUILES. Três compromissos, todos afirmação:
// a análise é o produto, o dado tem origem citada, a remuneração vem
// de quem lê. Nenhuma promessa de economia — regra do projeto.

import { J, JT } from '../../design/jaguar-tokens';

interface Compromisso {
  id: string;
  titulo: string;
  detalhe: string;
}

const COMPROMISSOS: Compromisso[] = [
  {
    id: 'analise-e-o-produto',
    titulo: 'A análise é o produto',
    detalhe:
      'A única receita da GridAlpha é o trabalho analítico entregue a quem o contrata — relatório, diagnóstico e formação.',
  },
  {
    id: 'dado-com-origem',
    titulo: 'Todo dado tem origem citada',
    detalhe:
      'ONS, ANEEL, CCEE, EPE e IBGE aparecem nomeados onde o dado aparece; o que é estimativa vem marcado como estimativa.',
  },
  {
    id: 'remuneracao-de-quem-le',
    titulo: 'A remuneração vem de quem lê',
    detalhe:
      'Quem paga pela análise é quem a recebe. É isso que mantém a leitura do mercado limpa de interesse de venda.',
  },
];

export function FaixaIndependencia() {
  return (
    <section
      aria-labelledby="br-independencia"
      style={{
        padding: '56px 0 64px',
        borderTop: `1px solid ${J.bordaDefault}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{ ...JT.rotulo, color: J.acenteOcreEscuro }} id="br-independencia">
          Independência
        </span>
        <h2 style={{ ...JT.h2, margin: 0, color: J.tintaPrimaria }}>
          A análise é o produto inteiro.
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          borderTop: `1px solid ${J.bordaDefault}`,
          borderBottom: `1px solid ${J.bordaDefault}`,
        }}
      >
        {COMPROMISSOS.map((c, i) => (
          <div
            key={c.id}
            style={{
              padding: `24px ${i === COMPROMISSOS.length - 1 ? '0' : '28px'} 26px ${
                i === 0 ? '0' : '28px'
              }`,
              borderLeft: i > 0 ? `1px solid ${J.bordaDefault}` : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <h3 style={{ ...JT.h3, margin: 0, color: J.tintaPrimaria }}>{c.titulo}</h3>
            <p style={{ ...JT.corpo, margin: 0, fontSize: '15px', color: J.tintaSecundaria }}>
              {c.detalhe}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FaixaIndependencia;
