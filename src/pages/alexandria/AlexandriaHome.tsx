// AlexandriaHome — ponto de entrada do produto.
//
// Única responsabilidade: ler o `?trilha=` que o portal BR manda e
// traduzir para track. Não decide layout, não monta shell — cada rota
// interna monta o próprio, porque a configuração de rail varia entre o
// hub e a visão de trilha.
//
// O contrato do `?trilha=` foi criado pelo ARCHITECT na Portal BR Wave 1
// e ficou inerte desde então ("herdado, não resolvido: AlexandriaHome
// ainda não lê ?trilha="). Fecha aqui.

import { useSearchParams } from 'react-router-dom';
import type { CurriculumTrack } from '@/lib/types/alexandria';
import { AlexandriaRouter } from './AlexandriaRouter';

const TRACKS_VALIDOS: CurriculumTrack[] = ['universal', 'brasil', 'usa'];

/** Aceita só os três valores do tipo. Qualquer outra coisa — parâmetro
 *  ausente, vazio, com typo, ou injetado — vira null, e o hub não
 *  destaca nada. Nunca lança, nunca esconde trilha. */
function lerTrack(bruto: string | null): CurriculumTrack | null {
  if (!bruto) return null;
  const normalizado = bruto.trim().toLowerCase();
  return TRACKS_VALIDOS.find((t) => t === normalizado) ?? null;
}

export function AlexandriaHome() {
  const [searchParams] = useSearchParams();
  const trackDeEntrada = lerTrack(searchParams.get('trilha'));

  return <AlexandriaRouter trackDeEntrada={trackDeEntrada} />;
}

export default AlexandriaHome;
