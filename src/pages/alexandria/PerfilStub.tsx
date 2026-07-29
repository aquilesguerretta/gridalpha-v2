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

import { useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import type { PlatformUser } from '@/lib/auth/authApi';
import { AlexandriaShell } from '@/components/alexandria/shell/AlexandriaShell';
import { MOCK_BADGE_PROGRESS, MOCK_USER_PROGRESS } from '@/lib/data/alexandria-progress-mock';
import { ALEXANDRIA_BADGES } from '@/lib/data/alexandria-badges';
import { getTrilhaByLevel } from '@/lib/data/alexandria-trilhas';
import { A, A2, AT, AS, AR, AE } from '@/design/alexandria-tokens';

/** O id de `alexandria` no catálogo canônico que o backend serve em
 *  `/api/products/me`. Não é lista local: o catálogo vem do servidor
 *  justamente para o front não manter uma segunda cópia que deriva. */
const PRODUTO = 'alexandria';

/** Mesma forma de data que o `/conta` da plataforma usa, para os dois
 *  lados da mesma conta não escreverem a mesma data de jeitos diferentes. */
function formatarData(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function PerfilStub() {
  const { user, loading, myProducts, activateProduct, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [ativadoEm, setAtivadoEm] = useState<string | null>(null);
  const [saindo, setSaindo] = useState(false);

  // Sair devolve à entrada da Alexandria, não ao portal: quem estava aqui
  // estava lendo a Alexandria, e é para lá que faz sentido voltar sem
  // sessão. O guard acima continua protegendo /perfil.
  async function sair() {
    setSaindo(true);
    await logout();
    navigate('/alexandria', { replace: true });
  }

  // Ativação automática: estar nesta página já é intenção de uso, então
  // não existe botão "ativar Alexandria" — seria fricção sem decisão.
  //
  // A ativação só DISPARA quando necessário. `myProducts()` é consultado
  // primeiro; se `alexandria` já está lá, `activateProduct` não é chamado.
  // A rota é idempotente no backend (constraint no banco), mas idempotente
  // não é motivo para gastar uma escrita a cada visita.
  useEffect(() => {
    if (!user) return;
    const ctrl = new AbortController();
    let vivo = true;

    myProducts(ctrl.signal)
      .then(async ({ products }) => {
        const ja = products.find((p) => p.productId === PRODUTO);
        if (ja) {
          if (vivo) setAtivadoEm(ja.activatedAt);
          return;
        }
        const r = await activateProduct(PRODUTO);
        if (vivo) setAtivadoEm(r.activatedAt);
      })
      .catch((err: unknown) => {
        // Falha aqui não pode derrubar a página: o Perfil continua útil
        // sem a data de ativação. Fica em null e a linha some.
        if (err instanceof Error && err.name === 'AbortError') return;
      });

    return () => {
      vivo = false;
      ctrl.abort();
    };
  }, [user, myProducts, activateProduct]);

  if (loading) return <Carregando />;
  if (!user) return <Navigate to="/entrar" replace state={{ de: location.pathname }} />;

  return (
    <AlexandriaShell navAtivo="perfil">
      <div style={{ display: 'flex', flexDirection: 'column', gap: AS.xxl }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: AS.sm }}>
          <span style={{ ...AT.rotulo, color: A.terracota }}>Perfil</span>
          <h1 style={{ ...AT.h1, color: A.tintaSobreCreme, margin: 0 }}>
            Seu percurso, reunido
          </h1>
          <p style={{ ...AT.corpo, fontSize: '14px', color: A.tintaSuave, margin: 0 }}>
            Identidade vem da sua conta GridAlpha. O que você vê abaixo é só
            a Alexandria — os outros produtos e a assinatura ficam no perfil
            de plataforma.
          </p>
        </div>

        <IdentidadeSecao user={user} ativadoEm={ativadoEm} onSair={sair} saindo={saindo} />
        <ProgressoSecao />
        <CertificadoSecao />
      </div>
    </AlexandriaShell>
  );
}

// ── Identidade — o único bloco com dado REAL de conta ──────────────
function IdentidadeSecao({
  user,
  ativadoEm,
  onSair,
  saindo,
}: {
  user: PlatformUser;
  ativadoEm: string | null;
  onSair: () => void;
  saindo: boolean;
}) {
  // Nome, email e "membro desde" são três fatos do mesmo nível sobre a
  // mesma conta — peso igual de propósito, sem eleger um dominante.
  const linhas: [string, string][] = [
    ['Nome', user.name],
    ['Email', user.email],
    ['Membro desde', formatarData(user.createdAt)],
  ];
  if (ativadoEm) linhas.push(['Alexandria ativada em', formatarData(ativadoEm)]);

  return (
    <Secao rotulo="Identidade">
      <dl style={{ display: 'flex', flexDirection: 'column', margin: 0 }}>
        {linhas.map(([rotulo, valor], i) => (
          <div
            key={rotulo}
            style={{
              display: 'grid',
              gridTemplateColumns: '190px 1fr',
              gap: AS.lg,
              padding: `${AS.md} 0`,
              borderTop: i > 0 ? `1px solid ${A2.fioClaroSobreCreme}` : 'none',
            }}
          >
            <dt style={{ ...AT.rotulo, fontSize: '10px', color: A2.tintaMetadado }}>{rotulo}</dt>
            <dd style={{ ...AT.corpo, fontSize: '14px', color: A.tintaSobreCreme, margin: 0 }}>
              {valor}
            </dd>
          </div>
        ))}
      </dl>

      <div style={{ display: 'flex', alignItems: 'center', gap: AS.xl, flexWrap: 'wrap' }}>
        {/* O Perfil da Alexandria não lista outro produto nem assinatura —
            isso é o /conta de plataforma. Um link de saída basta. */}
        <Link
          to="/conta"
          style={{
            ...AT.dado,
            fontSize: '12px',
            color: A.terracota,
            textDecoration: 'none',
            borderBottom: `1px solid ${A.terracota}`,
          }}
        >
          Gerenciar conta →
        </Link>
        <button
          type="button"
          onClick={onSair}
          disabled={saindo}
          style={{
            ...AT.rotulo,
            fontSize: '10px',
            color: A2.tintaMetadado,
            background: 'none',
            border: 'none',
            borderBottom: `1px solid ${A.fioSobreCreme}`,
            borderRadius: AR.none,
            padding: `0 0 ${AS.xs} 0`,
            cursor: saindo ? 'default' : 'pointer',
            transition: `color ${AE.estado} ${AE.easing}`,
          }}
        >
          {saindo ? 'Saindo…' : 'Sair da conta'}
        </button>
      </div>
    </Secao>
  );
}

// ── Progresso — MOCK, e a tela diz isso ────────────────────────────
function ProgressoSecao() {
  const p = MOCK_USER_PROGRESS;
  const conquistados = MOCK_BADGE_PROGRESS.filter((b) => b.status === 'conquistado');
  const porId = new Map(ALEXANDRIA_BADGES.map((b) => [b.id, b]));

  const numeros: [string, string][] = [
    ['Aulas concluídas', `${p.aulasCompleted} de ${p.aulasTotal} confirmadas`],
    ['Nível 1', `${p.byLevel[1]}%`],
    ['Insígnias', `${p.badgesEarned} de ${p.badgesTotal}`],
    ['Sequência', `${p.studyStreakDays} dias`],
  ];

  return (
    <Secao rotulo="Progresso na Alexandria">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: AS.md,
        }}
      >
        {numeros.map(([rotulo, valor]) => (
          <div
            key={rotulo}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: AS.xs,
              padding: AS.md,
              background: A2.cremeSuperficie,
              border: `1px solid ${A.fioSobreCreme}`,
              borderRadius: AR.none,
            }}
          >
            <span style={{ ...AT.rotulo, fontSize: '9px', color: A2.tintaMetadado }}>{rotulo}</span>
            <span style={{ ...AT.corpo, fontSize: '15px', color: A.tintaSobreCreme }}>{valor}</span>
          </div>
        ))}
      </div>

      {conquistados.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ ...AT.rotulo, fontSize: '10px', color: A2.tintaMetadado, paddingBottom: AS.sm }}>
            Insígnias conquistadas
          </span>
          {conquistados.map((c, i) => {
            const badge = porId.get(c.badgeId);
            if (!badge) return null;
            return (
              <div
                key={c.badgeId}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  padding: `${AS.sm} 0`,
                  borderTop: i > 0 ? `1px solid ${A2.fioClaroSobreCreme}` : 'none',
                }}
              >
                <span style={{ ...AT.corpo, fontSize: '14px', color: A.oliva }}>
                  {badge.name} · +{badge.expReward} XP
                </span>
                <span style={{ ...AT.dado, fontSize: '11px', lineHeight: 1.45, color: A.tintaSuave }}>
                  {badge.criterion}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* A nota honesta. O progresso acima é o mesmo mock que alimenta o
          rail direito desde a FOUNDRY Wave 3 — não é desta conta, e a
          página não finge que é. Persistir de verdade é wave de backend;
          simular com localStorage seria ilusão presa a um aparelho, que
          contradiz a própria ideia de conta que atravessa dispositivo. */}
      <div
        style={{
          border: `1px dashed ${A.terracota}`,
          borderRadius: AR.none,
          padding: AS.lg,
          display: 'flex',
          flexDirection: 'column',
          gap: AS.xs,
        }}
      >
        <span style={{ ...AT.rotulo, color: A.terracota }}>Ainda não é o seu progresso</span>
        <p style={{ ...AT.corpo, fontSize: '13px', color: A.tintaSuave, maxWidth: '58ch', margin: 0 }}>
          Os números acima são de demonstração, iguais para toda conta. A
          Alexandria ainda não registra aula concluída por usuário — sua
          identidade é real, seu percurso ainda não. Rastreamento persistente
          por conta depende de endpoint de progresso no backend.
        </p>
      </div>
    </Secao>
  );
}

// ── Certificado — bloqueado, com a razão real ──────────────────────
function CertificadoSecao() {
  const t1 = getTrilhaByLevel(1);
  return (
    <Secao rotulo="Certificado">
      <div
        style={{
          border: `1px dashed ${A.terracota}`,
          borderRadius: AR.none,
          padding: AS.lg,
          display: 'flex',
          flexDirection: 'column',
          gap: AS.xs,
        }}
      >
        <span style={{ ...AT.rotulo, color: A.terracota }}>Nível 1 · indisponível</span>
        <p style={{ ...AT.corpo, fontSize: '13px', color: A.tintaSuave, maxWidth: '58ch', margin: 0 }}>
          O certificado de nível exige a trilha inteira, e a Trilha 1 ainda
          não tem tamanho conhecido: {t1?.totalAulas ?? 0} aulas estão
          confirmadas em 3 dos 5 módulos, e os dois restantes seguem sem
          conteúdo extraído. Emitir certificado sobre um denominador
          desconhecido seria certificar o que ninguém mediu.
        </p>
      </div>
    </Secao>
  );
}

/** Cabeçalho de seção — rótulo Cinzel sobre fio, o mesmo registro que a
 *  Biblioteca e o Glossário já usam. */
function Secao({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: AS.md }}>
      <span
        style={{
          ...AT.rotulo,
          color: A.terracota,
          paddingBottom: AS.xs,
          borderBottom: `1px solid ${A.fioSobreCreme}`,
        }}
      >
        {rotulo}
      </span>
      {children}
    </section>
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
