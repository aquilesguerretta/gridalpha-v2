import { Document, Page, StyleSheet } from '@react-pdf/renderer';
import { PDFHeader } from './components/PDFHeader';
import { PDFFooter } from './components/PDFFooter';
import type { PDFDocumentMeta } from './types';

// CONDUIT-2 — base wrapper that every concrete PDF template renders
// inside. Owns page setup (Letter portrait, 0.75" margins, white
// background), default font family, and the fixed header/footer chrome
// that repeats on every page.
//
// Font policy for V1: ship with the @react-pdf/renderer built-in
// PostScript family fallbacks (Helvetica = sans, Times-Roman = serif,
// Courier = mono). These render reliably without an asset-loading step
// and match the design standard within the brief's allowance for
// system fallbacks. V2 should register the real GridAlpha typefaces
// (Inter, Instrument Serif, Geist Mono) via `Font.register()`.

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingRight: 54,
    paddingBottom: 72,
    paddingLeft: 54,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    color: '#0B0F19',
    fontSize: 11,
    lineHeight: 1.45,
  },
  body: {
    flexGrow: 1,
  },
});

interface BasePDFTemplateProps {
  meta: PDFDocumentMeta;
  children: React.ReactNode;
}

export function BasePDFTemplate({ meta, children }: BasePDFTemplateProps) {
  return (
    <Document
      title={meta.documentTitle}
      author={meta.authorName}
      subject={meta.documentType}
      creator="GridAlpha"
      producer="GridAlpha (CONDUIT-2 PDF pipeline)"
    >
      <Page size="LETTER" style={styles.page}>
        <PDFHeader
          documentType={meta.documentType}
          generatedDate={meta.generatedDate}
        />
        {children}
        <PDFFooter
          brandLine={meta.brandLine ?? 'GridAlpha · PJM Market Intelligence'}
        />
      </Page>
    </Document>
  );
}
