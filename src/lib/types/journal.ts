// FORGE contract — Trade Journal types.
// Owned by FORGE; consumed by the Trader Nest's Journal tab and store.

export type EntryStance = 'long' | 'short' | 'flat' | 'observation';

export interface JournalAttachment {
  /** unique id */
  id: string;
  /** filename as uploaded */
  name: string;
  /** image MIME type, e.g. 'image/png' */
  mimeType: string;
  /** base64-encoded image data — capped at 5 MB per file */
  dataUrl: string;
  /** ISO timestamp when added */
  attachedAt: string;
}

export interface JournalEntry {
  id: string;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp of last edit */
  updatedAt: string;
  /** Free-form date the entry pertains to (defaults to creation date) */
  tradingDate: string;
  /** Title — short summary of the day or trade */
  title: string;
  /** Body — markdown-ish text. Use \n\n for paragraph breaks. */
  body: string;
  /** PJM zone IDs this entry relates to (e.g., ['WEST_HUB', 'PSEG']) */
  zones: string[];
  /** Tags for theme/strategy (e.g., 'congestion', 'spark-spread', 'gas-spike') */
  tags: string[];
  /** Position context */
  stance: EntryStance;
  /** Realized P&L for this entry. Null = no position result yet. */
  pnl: number | null;
  /** Optional screenshot attachments */
  attachments: JournalAttachment[];
  /** Was this entry reviewed in a weekly review? */
  reviewed: boolean;
  /** ISO timestamp of last review */
  reviewedAt: string | null;
}

export interface ReviewPrompt {
  id: string;
  /** Type of prompt */
  type: 'pattern' | 'consistency' | 'reflection' | 'opportunity';
  /** Question text */
  question: string;
  /** Optional context — IDs of journal entries related to the prompt */
  relatedEntryIds: string[];
  /** Generation timestamp */
  generatedAt: string;
}
