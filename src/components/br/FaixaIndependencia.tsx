// FaixaIndependencia — ARCHITECT, Portal BR Wave 1.
//
// O posicionamento, declarado sem rodeio. Quatro negativas e uma
// afirmação: não vendemos energia, não temos comercializadora, não
// recebemos comissão — a receita é exclusivamente analítica.
//
// Isto não é copy de marketing; é a razão pela qual uma análise nossa
// vale alguma coisa. Fica numa faixa de leitura obrigatória entre os
// destinos e o rodapé, com o mesmo peso tipográfico do resto — sem
// selo, sem caixa de destaque, sem cor de alerta.
//
// Nenhuma das linhas promete economia. A regra de linguagem do projeto
// vale aqui como vale no catálogo de destinos.

// TODO: substituir por tokens do portal BR quando a wave visual chegar
const BR = {
  tinta: '#F2F2F0',
  tintaSuave: 'rgba(242,242,240,0.62)',
  tintaFraca: 'rgba(242,242,240,0.34)',
  fio: 'rgba(242,242,240,0.14)',
};

interface Declaracao {
  id: string;
  chamada: string;
  detalhe: string;
}

const DECLARACOES: Declaracao[] = [
  {
    id: 'nao-vendemos',
    chamada: 'Não vendemos energia',
    detalhe: 'Nenhum contrato de suprimento passa por nós.',
  },
  {
    id: 'sem-comercializadora',
    chamada: 'Não temos comercializadora',
    detalhe: 'Nenhuma posição própria no mercado que analisamos.',
  },
  {
    id: 'sem-comissao',
    chamada: 'Não recebemos comissão',
    detalhe: 'Nenhum fornecedor nos remunera por indicação.',
  },
  {
    id: 'receita-analitica',
    chamada: 'Receita exclusivamente analítica',
    detalhe: 'O que vendemos é a análise. Só ela.',
  },
];

export function FaixaIndependencia() {
  return (
    <section
      aria-labelledby="br-independencia"
      style={{
        padding: '48px 0',
        borderTop: `1px solid ${BR.fio}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      <h2
        id="br-independencia"
        style={{
          margin: 0,
          fontSize: '10px',
          letterSpacing: '0.20em',
          textTransform: 'uppercase',
          fontWeight: 400,
          color: BR.tintaFraca,
        }}
      >
        Independência
      </h2>

      {/* Quatro colunas de peso deliberadamente igual, separadas por fio.
          Aqui não existe elemento dominante de propósito: as quatro
          declarações têm o mesmo valor e hierarquizar uma delas seria
          sugerir que as outras são secundárias. */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          borderTop: `1px solid ${BR.fio}`,
          borderBottom: `1px solid ${BR.fio}`,
        }}
      >
        {DECLARACOES.map((d, i) => (
          <div
            key={d.id}
            style={{
              padding: `22px ${i === DECLARACOES.length - 1 ? '0' : '24px'} 22px ${i === 0 ? '0' : '24px'}`,
              borderLeft: i > 0 ? `1px solid ${BR.fio}` : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1.35, color: BR.tinta }}>
              {d.chamada}
            </span>
            <span style={{ fontSize: '12px', lineHeight: 1.55, color: BR.tintaSuave }}>
              {d.detalhe}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FaixaIndependencia;
