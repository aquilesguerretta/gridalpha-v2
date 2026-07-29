// PerfilStub — a superfície de Perfil da Alexandria.
//
// O nome do arquivo fica: é o contrato de rota que a Wave 6 registrou, e
// `AlexandriaRouter.tsx` não é posse desta wave. O corpo deixou de ser
// stub na Wave 23.
//
// ROTA PROTEGIDA. O mecanismo NÃO é inventado aqui — é o mesmo que o
// ARCHITECT já usa em `PerfilPlataforma.tsx`: `<Navigate to="/entrar">`
// carregando `state={{ de: location.pathname }}`, que o `EntrarView` lê
// (`location.state.de`) e para onde volta depois do login. Reaproveitar
// significa que entrar pelo Perfil da Alexandria devolve ao Perfil da
// Alexandria, não ao `/conta` genérico.
//
// `loading === true` mostra estado de carregamento, nunca redireciona:
// enquanto `/api/auth/me` não respondeu, ninguém pode concluir "não
// logado" — só "ainda não sabemos". Redirecionar aí expulsaria quem TEM
// sessão válida a cada carga de página.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { AlexandriaShell } from '@/components/alexandria/shell/AlexandriaShell';
import { A, A2, AT, AS, AR } from '@/design/alexandria-tokens';

export function PerfilStub() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Carregando />;
  if (!user) return <Navigate to="/entrar" replace state={{ de: location.pathname }} />;

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

/** Estado de espera enquanto `/api/auth/me` não respondeu. Monta o shell
 *  inteiro para não haver salto de layout quando a resposta chegar. */
function Carregando() {
  return (
    <AlexandriaShell navAtivo="perfil">
      <div style={{ display: 'flex', flexDirection: 'column', gap: AS.sm }}>
        <span style={{ ...AT.rotulo, color: A.terracota }}>Perfil</span>
        <span style={{ ...AT.corpo, fontSize: '14px', color: A.tintaSuave }}>
          Verificando sua sessão…
        </span>
      </div>
    </AlexandriaShell>
  );
}

export default PerfilStub;
