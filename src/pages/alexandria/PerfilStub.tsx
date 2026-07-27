// PerfilStub — estado inicial da superfície de Perfil.
//
// Não é "em breve" genérico nem pedido de desculpa: é o mesmo registro que
// `VideoArea` e o nó de módulo em produção já usam — contorno tracejado em
// terracota, dizendo o que vai existir ali e o que falta para existir.
//
// A página real é de outra wave. Aqui não tem conteúdo de perfil nenhum:
// nem progresso, nem certificado, nem nome de aluno. Só o contrato de rota.
//
// O bloco visual é repetido nos três stubs de propósito, em vez de extraído
// para um quarto arquivo: cada stub vai ser substituído por uma wave
// diferente, e cada um precisa poder ser apagado sem quebrar os outros.

import { AlexandriaShell } from '@/components/alexandria/shell/AlexandriaShell';
import { A, A2, AT, AS, AR } from '@/design/alexandria-tokens';

export function PerfilStub() {
  return (
    <AlexandriaShell navAtivo="perfil">
      <div style={{ display: 'flex', flexDirection: 'column', gap: AS.xl }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: AS.sm }}>
          <span style={{ ...AT.rotulo, color: A.terracota }}>Perfil</span>
          <h1 style={{ ...AT.h1, color: A.tintaSobreCreme, margin: 0 }}>
            Seu percurso, reunido
          </h1>
        </div>

        <div
          style={{
            border: `1px dashed ${A.terracota}`,
            borderRadius: AR.none,
            padding: `${AS.xl} ${AS.xl}`,
            display: 'flex',
            flexDirection: 'column',
            gap: AS.md,
          }}
        >
          <span style={{ ...AT.rotulo, color: A.terracota }}>Superfície em produção</span>
          <p
            style={{
              ...AT.corpo,
              fontSize: '14px',
              lineHeight: 1.65,
              color: A.tintaSuave,
              maxWidth: '58ch',
              margin: 0,
            }}
          >
            Vai reunir num lugar só o que hoje está espalhado pelo rail direito:
            aulas concluídas por trilha, as treze insígnias com o critério de
            cada uma, sequência de estudo, e os certificados de nível quando
            existirem.
          </p>
          <span
            style={{ ...AT.dado, fontSize: '11px', fontStyle: 'italic', color: A2.tintaMetadado }}
          >
            Depende de um modelo de conta — hoje o progresso é um mock único,
            sem usuário por trás.
          </span>
        </div>
      </div>
    </AlexandriaShell>
  );
}

export default PerfilStub;
