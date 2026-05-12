import { View, Image, Text, StyleSheet } from '@react-pdf/renderer';

// CONDUIT-2 — chart image block. V1 supports raster (PNG/JPEG) data
// URLs only — chart owners (or the export entry point) rasterize SVG
// to PNG via the browser canvas before composing the document. The
// `svgToPngDataUrl` helper in `services/pdfExport.ts` does this for
// callers that have an SVG element handy.
//
// V2 should add a true vector path that parses SVG into the
// `@react-pdf/renderer` `<Svg>` primitives so the output is fully
// resolution-independent.

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 14,
  },
  image: {
    width: '100%',
    objectFit: 'contain',
  },
  caption: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#71717A',
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    marginTop: 6,
    textAlign: 'center',
  },
  empty: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 10,
    color: '#71717A',
    textAlign: 'center',
    paddingVertical: 36,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
  },
});

interface Props {
  /** PNG or JPEG data URL (e.g. `data:image/png;base64,...`). When
   *  omitted, the component renders a placeholder so missing chart
   *  rasterizations don't break the document. */
  src?: string;
  caption?: string;
  /** Height in PDF points. Default 220. */
  height?: number;
}

export function PDFChartImage({ src, caption, height = 220 }: Props) {
  return (
    <View style={styles.container}>
      {src ? (
        <Image src={src} style={[styles.image, { height }]} />
      ) : (
        <Text style={[styles.empty, { paddingVertical: height / 2 - 18 }]}>
          (chart not rasterized for V1 — see methodology)
        </Text>
      )}
      {caption && <Text style={styles.caption}>{caption}</Text>}
    </View>
  );
}
