// ORACLE Wave 2 — Student Nest context provider.

import type { ContextProvider } from '../aiContext';
import {
  TODAY_EXPLAINER,
  STUDENT_CONCEPT_NODES,
  INTERVIEW_QUESTIONS,
} from '@/lib/mock/student-mock';

export const studentNestContextProvider: ContextProvider = (input) => {
  const zone = input.selectedZone ?? null;

  const description =
    `Student Nest. Today's market explainer headline: "${TODAY_EXPLAINER.headline}". ` +
    `Concept map shows ${STUDENT_CONCEPT_NODES.length} nodes from foundation ` +
    `through advanced. Interview-question rail surfaces ` +
    `${INTERVIEW_QUESTIONS.length} curated questions across difficulty tiers. ` +
    `The user is a student or career-switcher building energy market literacy.`;

  return {
    surfaceLabel: 'Student Nest',
    selectedZone: zone,
    visibleData: {
      description,
      metrics: {
        todayExplainer: TODAY_EXPLAINER.headline,
        conceptNodes: STUDENT_CONCEPT_NODES.length,
        interviewQuestions: INTERVIEW_QUESTIONS.length,
      },
    },
  };
};
