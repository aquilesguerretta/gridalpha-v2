// src/pages/conta/PerfilPlataforma.tsx
// ARCHITECT — Identidade de Plataforma, Wave 1. Rota /conta.
//
// Perfil da PLATAFORMA, não de produto. O perfil da Alexandria (com
// progresso, trilhas, conquistas) é superfície própria dela e é wave
// do LYCEUM — esta tela não sabe nada sobre currículo.
//
// Três seções, todas de estado real:
//   · Dados pessoais — só o que `users` tem de fato.
//   · Assinatura     — não existe sistema de pagamento. Declarado como
//                      ausência, no mesmo idioma de "em produção" que
//                      o resto do sistema já usa. Zero plano, zero preço.
//   · Produtos       — catálogo do BACKEND (não cópia local), com
//                      ativado / não-ativado por item.
//
// Rota protegida: sem sessão, volta para /entrar carregando o destino
// pretendido, para a pessoa cair aqui de novo depois de entrar.

import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { J, JT } from '../../design/jaguar-tokens';
import { DESTINOS_BR } from '../../lib/data/br-destinos';
import { useAuth } from '../../lib/auth/AuthContext';
import type { ProductsResponse } from '../../lib/auth/authApi';
import { ContaShell } from './ContaShell';

/**
 * Rótulo humano por id de produto.
 *
 * O CATÁLOGO (quais produtos existem) vem do backend — o contrato diz
 * que ele é servido justamente para o front não manter uma segunda
 * cópia que deriva. O que mora aqui é só a APRESENTAÇÃO, e só para os
 * ids que o portal brasileiro já nomeia.
 *
 * LOCALIZADO (Topologia de Shell Wave 3, fase 1): a entrada abaixo é o
 * remanescente ESTÁTICO do lado americano — a única menção a ele que
 * sobrou no `/conta`. Não é dirigida pelo `catalog`: o laço que itera o
 * array está em L217 e apenas CONSULTA este mapa por `rotularProduto`.
 *
 * O backend já fechou o lado dele — `us-terminal` saiu do
 * `PRODUCT_CATALOG` (a única ocorrência que resta em Python é o
 * comentário que documenta a remoção). Sem o id no catálogo,
 * `rotularProduto('us-terminal')` nunca é chamado e esta entrada é
 * código morto. Sai na fase 2.
 */
const TITULO_EXTRA: Record<string, string> = {
  'us-terminal': 'Terminal Estados Unidos',
};

/** Id do catálogo → rótulo. Deriva do id quando ninguém nomeou ainda,
 *  em vez de esconder o produto ou inventar nome. */
function rotularProduto(productId: string): string {
  const destino = DESTINOS_BR.find((d) => d.id === productId);
  if (destino) return destino.titulo;
  if (TITULO_EXTRA[productId]) return TITULO_EXTRA[productId];
  return productId
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

function formatarData(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function PerfilPlataforma() {
  const { user, loading, logout, myProducts } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<ProductsResponse | null>(null);
  const [erroProdutos, setErroProdutos] = useState(false);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    if (!user) return;
    const ctrl = new AbortController();
    myProducts(ctrl.signal)
      .then(setProdutos)
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setErroProdutos(true);
      });
    return () => ctrl.abort();
  }, [user, myProducts]);

  // Enquanto `/api/auth/me` não respondeu, ninguém pode concluir "não
  // logado" — só "ainda não sabemos". Redirecionar aqui expulsaria
  // quem TEM sessão válida, a cada carga de página.
  if (loading) {
    return (
      <ContaShell eyebrow="Conta GridAlpha" titulo="Perfil">
        <p style={{ ...JT.corpo, margin: 0, color: J.tintaSecundaria }}>Carregando…</p>
      </ContaShell>
    );
  }

  if (!user) {
    return <Navigate to="/entrar" replace state={{ de: location.pathname }} />;
  }

  const ativados = new Set((produtos?.products ?? []).map((p) => p.productId));
  const ativadoEm = new Map((produtos?.products ?? []).map((p) => [p.productId, p.activatedAt]));

  async function aoSair() {
    setSaindo(true);
    await logout();
    navigate('/br', { replace: true });
  }

  return (
    <ContaShell
      eyebrow="Conta GridAlpha"
      titulo="Perfil de plataforma"
      subtitulo="Uma conta para todos os produtos. Cada um ativa quando você entra nele."
      largura="prancha"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {/* ─── Dados pessoais ─────────────────────────────────── */}
        <Secao titulo="Dados pessoais">
          {/* Lista de pares rótulo/valor, de peso deliberadamente
              igual: nome, email e data de cadastro são três fatos do
              mesmo nível sobre a mesma conta, e eleger um como
              dominante inventaria hierarquia que o dado não tem. */}
          <dl
            style={{
              margin: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              columnGap: '40px',
              rowGap: '20px',
            }}
          >
            {[
              { rotulo: 'Nome', valor: user.name },
              { rotulo: 'Email', valor: user.email },
              { rotulo: 'Membro desde', valor: formatarData(user.createdAt) },
            ].map((d) => (
              <div key={d.rotulo} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <dt style={{ ...JT.rotulo, color: J.tintaSecundaria }}>{d.rotulo}</dt>
                <dd style={{ margin: 0, fontSize: '16px', color: J.tintaPrimaria }}>{d.valor}</dd>
              </div>
            ))}
          </dl>

          <div
            style={{
              marginTop: '22px',
              paddingTop: '16px',
              borderTop: `1px solid ${J.bordaDefault}`,
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={aoSair}
              disabled={saindo}
              className="conta-botao"
              style={{ width: 'auto' }}
            >
              {saindo ? 'Saindo…' : 'Sair da conta'}
            </button>
            <span style={{ fontSize: '13px', color: J.tintaSecundaria }}>
              Alterar nome, email ou senha ainda não existe — os endpoints de edição não
              foram construídos.
            </span>
          </div>
        </Secao>

        {/* ─── Assinatura ─────────────────────────────────────── */}
        {/* NÃO INVENTAR plano nem preço. O banco tem email, senha,
            google_id, nome e created_at — nada sobre cobrança. Estado
            honesto de ausência, mesmo idioma de "em produção" que o
            resto do sistema já usa. */}
        <Secao titulo="Assinatura">
          <div
            style={{
              border: `1px dashed ${J.bordaAcento}`,
              borderRadius: 0,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span style={{ ...JT.rotulo, color: J.acenteOcreEscuro }}>Ainda não existe</span>
            <p style={{ ...JT.corpo, margin: 0, fontSize: '15px', color: J.tintaSecundaria }}>
              Não há sistema de pagamento nem plano de assinatura — nem aqui, nem por trás.
              Nada é cobrado hoje, e o acesso ao que está aberto não depende disso. Esta
              seção passa a mostrar algo quando a base do produto estiver completa.
            </p>
          </div>
        </Secao>

        {/* ─── Produtos ───────────────────────────────────────── */}
        <Secao
          titulo="Produtos"
          nota={
            produtos
              ? `${ativados.size} de ${produtos.catalog.length} ativados`
              : undefined
          }
        >
          {erroProdutos ? (
            <p style={{ ...JT.corpo, margin: 0, fontSize: '15px', color: J.tintaSecundaria }}>
              Não foi possível carregar seus produtos agora. Recarregue a página.
            </p>
          ) : !produtos ? (
            <p style={{ ...JT.corpo, margin: 0, fontSize: '15px', color: J.tintaSecundaria }}>
              Carregando produtos…
            </p>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                borderTop: `1px solid ${J.bordaDefault}`,
              }}
            >
              {produtos.catalog.map((id) => {
                const ativo = ativados.has(id);
                const destino = DESTINOS_BR.find((d) => d.id === id);
                const rota = destino?.status === 'disponivel' ? destino.rota : null;
                return (
                  <li
                    key={id}
                    style={{
                      borderBottom: `1px solid ${J.bordaDefault}`,
                      padding: '16px 0',
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      gap: '20px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ ...JT.h3, color: J.tintaPrimaria }}>
                        {rotularProduto(id)}
                      </span>
                      <span style={{ fontSize: '13px', color: J.tintaSecundaria }}>
                        {ativo
                          ? `Ativado em ${formatarData(ativadoEm.get(id) ?? '')}`
                          : 'Ativa quando você entrar pela primeira vez.'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Mesma linguagem visual de disponível / em breve
                          que o DestinoCard estabeleceu no Portal. */}
                      {ativo ? (
                        <span
                          style={{
                            ...JT.rotulo,
                            color: J.acenteOcreEscuro,
                            background: J.acenteOcreWash,
                            border: `1px solid ${J.bordaAcento}`,
                            borderRadius: 0,
                            padding: '3px 8px',
                          }}
                        >
                          Ativado
                        </span>
                      ) : (
                        <span style={{ ...JT.rotulo, color: J.tintaSecundaria }}>
                          Não ativado
                        </span>
                      )}
                      {rota && (
                        <Link className="conta-link" to={rota}>
                          Abrir
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <p
            style={{
              marginTop: '16px',
              marginBottom: 0,
              fontSize: '13px',
              lineHeight: 1.5,
              color: J.tintaSecundaria,
            }}
          >
            O catálogo acima vem do próprio backend — a lista aqui nunca diverge da lista
            que o servidor reconhece.
          </p>
        </Secao>
      </div>
    </ContaShell>
  );
}

// ─── Peças da prancha ─────────────────────────────────────────────

function Secao({
  titulo,
  nota,
  children,
}: {
  titulo: string;
  nota?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '14px',
          paddingBottom: '10px',
          borderBottom: `1px solid ${J.bordaStrong}`,
        }}
      >
        <h2 style={{ ...JT.rotulo, margin: 0, color: J.tintaPrimaria }}>{titulo}</h2>
        {nota && <span style={{ ...JT.rotulo, color: J.tintaSecundaria }}>{nota}</span>}
      </div>
      {children}
    </section>
  );
}

export default PerfilPlataforma;
