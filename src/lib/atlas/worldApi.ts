// src/lib/atlas/worldApi.ts
// Alexandria — Atlas Mundial (Wave 27). Camada de dado: busca os 188
// perfis reais do backend (CURSOR Wave 10) e os junta com a geometria
// de fronteira da Natural Earth 110m, indexados por ISO alpha-3.
//
// ── PROCEDÊNCIA DA GEOMETRIA ─────────────────────────────────────────
// public/alexandria/geo/world-110m.json é cópia byte-idêntica
// (MD5 0aa0a4363768f1e281ef8b92100c2592) de
// https://unpkg.com/world-atlas@2.0.2/countries-110m.json — a
// distribuição TopoJSON canônica da Natural Earth 110m. 177 geometrias;
// 174 com id ISO 3166-1 NUMÉRICO; nenhuma propriedade alpha-3 no
// arquivo (medido, não presumido). As 3 sem id são Kosovo, Chipre do
// Norte e Somalilândia — entidades sem código ISO próprio.
//
// ── A TABELA NUMÉRICO → ALPHA-3 ──────────────────────────────────────
// O backend fala alpha-3; o TopoJSON fala numérico. As 174 entradas
// abaixo foram DERIVADAS das propriedades do GeoJSON Natural Earth
// 110m (ISO_N3 → ISO_A3, com ADM0_A3 quando ISO_A3 = -99, o defeito
// conhecido da NE que atinge França e Noruega), não digitadas de
// memória. Uma única correção manual: '578': 'NOR' — a NE marca o
// ISO_N3 da Noruega como -99, mas o world-atlas carrega o id 578, e
// 578 → NOR é a atribuição ISO 3166-1 padrão.
//
// ── DIVERGÊNCIA TOPOJSON × BACKEND, MEDIDA ───────────────────────────
// 8 polígonos com ISO sem dado no backend (TWN GRL ESH PRI NCL FLK ATF
// ATA — fora do critério "membro da ONU" da Wave 10) + 3 sem ISO.
// Todos continuam desenhados; o hover mostra ausência honesta.
// 22 países do backend SEM polígono a 110m — micro-Estados insulares
// (SGP MLT BHR MDV BRB…): têm perfil, não têm geometria nesta
// resolução. Limitação real do 110m, registrada, não escondida.

import { feature as topoFeature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';

// ─────────────────────────────────────────────────────────────────────
// Tipos — espelho do contrato real (docs/v2-backend-contract.md § Wave
// 10). Toda métrica é anulável: o backend usa null para "fonte não
// declara", nunca zero inventado.
// ─────────────────────────────────────────────────────────────────────

export interface MatrizGeracao {
  fossilPct: number | null;
  nuclearPct: number | null;
  hydroPct: number | null;
  windPct: number | null;
  solarPct: number | null;
  biofuelPct: number | null;
  otherRenewablesExcBiofuelPct: number | null;
}

export interface PaisResumo {
  isoCode: string;
  countryName: string;
  year: number;
  population: number | null;
  electricityGenerationTwh: number | null;
  renewablesShareElecPct: number | null;
  carbonIntensityElecGco2PerKwh: number | null;
  energyPerCapitaKwh: number | null;
  fuelMix: MatrizGeracao;
}

export interface FonteCampo {
  unit: string;
  sourceCitation: string;
}

/** Perfil completo: mesmo shape do resumo + citação por campo.
 *  As chaves de fieldSources são os nomes snake_case do OWID —
 *  deliberado no backend, rastreável ao codebook sem tabela de
 *  tradução. */
export interface PaisPerfil extends PaisResumo {
  fieldSources: Record<string, FonteCampo>;
}

interface EnvelopeMeta {
  timestamp: string;
  source: string;
  count?: number;
  year?: string;
}

interface Envelope<T> {
  meta: EnvelopeMeta;
  data: T;
  summary: string;
}

/** Propriedades anotadas em cada feature na junção. */
export interface PaisFeatureProps {
  name: string;      // nome do TopoJSON (inglês, curto)
  a3: string | null; // alpha-3 via tabela; null = entidade sem ISO
  n3: string | null; // id numérico original do TopoJSON
}

export type PaisFeature = Feature<Geometry, PaisFeatureProps>;

export interface MundoAtlas {
  features: PaisFeature[];
  /** Índice O(1) alpha-3 → perfil resumido. Nunca busca linear no
   *  array a cada movimento de mouse. */
  porIso: Map<string, PaisResumo>;
  meta: EnvelopeMeta;
}

// ─────────────────────────────────────────────────────────────────────
// Correspondência ISO numérico → alpha-3 (procedência no cabeçalho).
// ─────────────────────────────────────────────────────────────────────

const N3_PARA_A3: Record<string, string> = {
  '004': 'AFG', '008': 'ALB', '010': 'ATA', '012': 'DZA', '024': 'AGO', '031': 'AZE',
  '032': 'ARG', '036': 'AUS', '040': 'AUT', '044': 'BHS', '050': 'BGD', '051': 'ARM',
  '056': 'BEL', '064': 'BTN', '068': 'BOL', '070': 'BIH', '072': 'BWA', '076': 'BRA',
  '084': 'BLZ', '090': 'SLB', '096': 'BRN', '100': 'BGR', '104': 'MMR', '108': 'BDI',
  '112': 'BLR', '116': 'KHM', '120': 'CMR', '124': 'CAN', '140': 'CAF', '144': 'LKA',
  '148': 'TCD', '152': 'CHL', '156': 'CHN', '158': 'TWN', '170': 'COL', '178': 'COG',
  '180': 'COD', '188': 'CRI', '191': 'HRV', '192': 'CUB', '196': 'CYP', '203': 'CZE',
  '204': 'BEN', '208': 'DNK', '214': 'DOM', '218': 'ECU', '222': 'SLV', '226': 'GNQ',
  '231': 'ETH', '232': 'ERI', '233': 'EST', '238': 'FLK', '242': 'FJI', '246': 'FIN',
  '250': 'FRA', '260': 'ATF', '262': 'DJI', '266': 'GAB', '268': 'GEO', '270': 'GMB',
  '275': 'PSE', '276': 'DEU', '288': 'GHA', '300': 'GRC', '304': 'GRL', '320': 'GTM',
  '324': 'GIN', '328': 'GUY', '332': 'HTI', '340': 'HND', '348': 'HUN', '352': 'ISL',
  '356': 'IND', '360': 'IDN', '364': 'IRN', '368': 'IRQ', '372': 'IRL', '376': 'ISR',
  '380': 'ITA', '384': 'CIV', '388': 'JAM', '392': 'JPN', '398': 'KAZ', '400': 'JOR',
  '404': 'KEN', '408': 'PRK', '410': 'KOR', '414': 'KWT', '417': 'KGZ', '418': 'LAO',
  '422': 'LBN', '426': 'LSO', '428': 'LVA', '430': 'LBR', '434': 'LBY', '440': 'LTU',
  '442': 'LUX', '450': 'MDG', '454': 'MWI', '458': 'MYS', '466': 'MLI', '478': 'MRT',
  '484': 'MEX', '496': 'MNG', '498': 'MDA', '499': 'MNE', '504': 'MAR', '508': 'MOZ',
  '512': 'OMN', '516': 'NAM', '524': 'NPL', '528': 'NLD', '540': 'NCL', '548': 'VUT',
  '554': 'NZL', '558': 'NIC', '562': 'NER', '566': 'NGA', '578': 'NOR', '586': 'PAK',
  '591': 'PAN', '598': 'PNG', '600': 'PRY', '604': 'PER', '608': 'PHL', '616': 'POL',
  '620': 'PRT', '624': 'GNB', '626': 'TLS', '630': 'PRI', '634': 'QAT', '642': 'ROU',
  '643': 'RUS', '646': 'RWA', '682': 'SAU', '686': 'SEN', '688': 'SRB', '694': 'SLE',
  '703': 'SVK', '704': 'VNM', '705': 'SVN', '706': 'SOM', '710': 'ZAF', '716': 'ZWE',
  '724': 'ESP', '728': 'SSD', '729': 'SDN', '732': 'ESH', '740': 'SUR', '748': 'SWZ',
  '752': 'SWE', '756': 'CHE', '760': 'SYR', '762': 'TJK', '764': 'THA', '768': 'TGO',
  '780': 'TTO', '784': 'ARE', '788': 'TUN', '792': 'TUR', '795': 'TKM', '800': 'UGA',
  '804': 'UKR', '807': 'MKD', '818': 'EGY', '826': 'GBR', '834': 'TZA', '840': 'USA',
  '854': 'BFA', '858': 'URY', '860': 'UZB', '862': 'VEN', '887': 'YEM', '894': 'ZMB',
};

// ─────────────────────────────────────────────────────────────────────
// Fetch — caminho RELATIVO, nunca URL absoluta do Railway. Cookie de
// sessão é SameSite=lax e o proxy do Vite já encaminha /api em dev
// (decisão medida da ARCHITECT · Identidade Wave 1). Dado público,
// sem credenciais.
// ─────────────────────────────────────────────────────────────────────

async function buscarJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`${url} respondeu ${res.status}`);
  }
  return (await res.json()) as T;
}

export function buscarPaisesMundo(signal?: AbortSignal): Promise<Envelope<PaisResumo[]>> {
  return buscarJson<Envelope<PaisResumo[]>>('/api/atlas/world/countries', signal);
}

export function buscarPerfilPais(iso: string, signal?: AbortSignal): Promise<Envelope<PaisPerfil>> {
  return buscarJson<Envelope<PaisPerfil>>(
    `/api/atlas/world/countries/${encodeURIComponent(iso)}`,
    signal,
  );
}

// ─────────────────────────────────────────────────────────────────────
// Junção geometria × dado — uma vez por sessão, com cache de módulo.
// ─────────────────────────────────────────────────────────────────────

type TopoMundo = Topology<{ countries: GeometryCollection<{ name: string }> }>;

let cacheMundo: Promise<MundoAtlas> | null = null;

async function montarMundo(): Promise<MundoAtlas> {
  const [topo, envelope] = await Promise.all([
    buscarJson<TopoMundo>('/alexandria/geo/world-110m.json'),
    buscarPaisesMundo(),
  ]);

  const fc = topoFeature(topo, topo.objects.countries);
  const features: PaisFeature[] = fc.features.map((f) => {
    const n3 = f.id !== undefined ? String(f.id) : null;
    return {
      ...f,
      properties: {
        name: f.properties?.name ?? '—',
        a3: n3 ? (N3_PARA_A3[n3] ?? null) : null,
        n3,
      },
    };
  });

  const porIso = new Map<string, PaisResumo>();
  for (const pais of envelope.data) {
    porIso.set(pais.isoCode, pais);
  }

  return { features, porIso, meta: envelope.meta };
}

/** Carrega TopoJSON + os 188 perfis em paralelo e devolve a junção.
 *  Cache de módulo: remontar a página não refaz nenhuma das duas
 *  buscas. Falha limpa o cache para permitir nova tentativa. */
export function carregarMundo(): Promise<MundoAtlas> {
  if (!cacheMundo) {
    cacheMundo = montarMundo().catch((err) => {
      cacheMundo = null;
      throw err;
    });
  }
  return cacheMundo;
}

// ─────────────────────────────────────────────────────────────────────
// Derivações de apresentação — calculadas do dado real, nunca
// inventadas.
// ─────────────────────────────────────────────────────────────────────

/** Rótulos pt-BR da matriz + a chave snake_case do OWID de cada campo,
 *  para o perfil citar a fonte exata via fieldSources. */
export const CAMPOS_MATRIZ: ReadonlyArray<{
  chave: keyof MatrizGeracao;
  rotulo: string;
  fonteCampo: string;
}> = [
  { chave: 'fossilPct', rotulo: 'Fóssil', fonteCampo: 'fossil_share_elec' },
  { chave: 'nuclearPct', rotulo: 'Nuclear', fonteCampo: 'nuclear_share_elec' },
  { chave: 'hydroPct', rotulo: 'Hidráulica', fonteCampo: 'hydro_share_elec' },
  { chave: 'windPct', rotulo: 'Eólica', fonteCampo: 'wind_share_elec' },
  { chave: 'solarPct', rotulo: 'Solar', fonteCampo: 'solar_share_elec' },
  { chave: 'biofuelPct', rotulo: 'Biocombustível', fonteCampo: 'biofuel_share_elec' },
  {
    chave: 'otherRenewablesExcBiofuelPct',
    rotulo: 'Outras renováveis',
    fonteCampo: 'other_renewables_share_elec_exc_biofuel',
  },
];

/** Chave snake_case do OWID dos campos fora da matriz. */
export const FONTE_CAMPO: Record<string, string> = {
  population: 'population',
  electricityGenerationTwh: 'electricity_generation',
  renewablesShareElecPct: 'renewables_share_elec',
  carbonIntensityElecGco2PerKwh: 'carbon_intensity_elec',
  energyPerCapitaKwh: 'energy_per_capita',
};

/** Maior participação entre os campos da matriz — null quando TODOS
 *  são null (nunca inventa dominância a partir de ausência). */
export function combustivelDominante(
  mix: MatrizGeracao,
): { rotulo: string; pct: number } | null {
  let melhor: { rotulo: string; pct: number } | null = null;
  for (const campo of CAMPOS_MATRIZ) {
    const v = mix[campo.chave];
    if (v !== null && (melhor === null || v > melhor.pct)) {
      melhor = { rotulo: campo.rotulo, pct: v };
    }
  }
  return melhor;
}

/** Nome do país em pt-BR via Intl.DisplayNames (CLDR do browser, dado
 *  padrão da plataforma — não é tradução inventada). O código de
 *  região aceita o ISO NUMÉRICO (M49), que é o que o TopoJSON carrega.
 *  Fallback: nome vindo do backend, depois o do TopoJSON. */
let displayNames: Intl.DisplayNames | null | undefined;

export function nomePaisPt(props: PaisFeatureProps, backendName?: string): string {
  if (displayNames === undefined) {
    try {
      displayNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' });
    } catch {
      displayNames = null;
    }
  }
  if (displayNames && props.n3) {
    try {
      const nome = displayNames.of(props.n3);
      // Intl devolve o próprio código quando não conhece a região.
      if (nome && nome !== props.n3) return nome;
    } catch {
      /* código fora do padrão — cai no fallback */
    }
  }
  return backendName ?? props.name;
}

// ─────────────────────────────────────────────────────────────────────
// Formatação pt-BR.
// ─────────────────────────────────────────────────────────────────────

export function fmtPct(v: number | null, casas = 1): string {
  if (v === null) return '—';
  return `${v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`;
}

export function fmtNum(v: number | null, casas = 0): string {
  if (v === null) return '—';
  return v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
}
