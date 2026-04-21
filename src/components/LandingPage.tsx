import { useEffect } from 'react';
import { C } from '@/design/tokens';
import { EDITORIAL_BG } from '@/design/editorial';

import { Nav } from './landing/Nav';
import { Hero } from './landing/Hero';
import { GridBackground } from './landing/GridBackground';
import { Wedge } from './landing/Wedge';
import { Stack } from './landing/Stack';
import { Profiles } from './landing/Profiles';
import { LiveDemo } from './landing/LiveDemo';
import { ThreeMarkets } from './landing/ThreeMarkets';
import { Divider } from './landing/Divider';
import { TheCase } from './landing/TheCase';
import { FounderNote } from './landing/FounderNote';
import { Pricing } from './landing/Pricing';
import { FinalCta } from './landing/FinalCta';
import { Footer } from './landing/Footer';
import { ScrollProgress } from './landing/ScrollProgress';

export function LandingPage() {
  // The terminal (GlobalShell) runs in a full-height, no-scroll shell via
  // global rules in index.css. The landing page needs normal document flow —
  // re-enable scrolling and release the fixed viewport for the lifetime of
  // the landing route only. Restore on unmount so returning to the terminal
  // keeps its no-scroll chrome.
  useEffect(() => {
    const root = document.getElementById('root');
    const prev = {
      htmlOverflowX: document.documentElement.style.overflowX,
      htmlOverflowY: document.documentElement.style.overflowY,
      bodyOverflowX: document.body.style.overflowX,
      bodyOverflowY: document.body.style.overflowY,
      bodyHeight: document.body.style.height,
      htmlHeight: document.documentElement.style.height,
      rootOverflowX: root?.style.overflowX ?? '',
      rootOverflowY: root?.style.overflowY ?? '',
      rootHeight: root?.style.height ?? '',
      rootWidth: root?.style.width ?? '',
    };
    document.documentElement.style.overflowY = 'auto';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowY = 'auto';
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.height = 'auto';
    document.body.style.height = 'auto';
    if (root) {
      root.style.overflowY = 'visible';
      root.style.overflowX = 'hidden';
      root.style.height = 'auto';
      root.style.width = '100%';
    }
    return () => {
      document.documentElement.style.overflowX = prev.htmlOverflowX;
      document.documentElement.style.overflowY = prev.htmlOverflowY;
      document.body.style.overflowX = prev.bodyOverflowX;
      document.body.style.overflowY = prev.bodyOverflowY;
      document.documentElement.style.height = prev.htmlHeight;
      document.body.style.height = prev.bodyHeight;
      if (root) {
        root.style.overflowX = prev.rootOverflowX;
        root.style.overflowY = prev.rootOverflowY;
        root.style.height = prev.rootHeight;
        root.style.width = prev.rootWidth;
      }
    };
  }, []);

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        backgroundColor: EDITORIAL_BG,
        color: C.textPrimary,
        overflowX: 'hidden',
      }}
    >
      <style>{`html { scroll-behavior: smooth; }`}</style>
      <ScrollProgress />
      <GridBackground />
      <div className="relative z-10">
        <Nav />
        <Hero />
        <Divider />
        <Wedge />
        <Divider />
        <Stack />
        <Divider />
        <Profiles />
        <Divider />
        <LiveDemo />
        <Divider />
        <ThreeMarkets />
        <Divider />
        <TheCase />
        <Divider />
        <FounderNote />
        <Divider />
        <Pricing />
        <Divider />
        <FinalCta />
        <Footer />
      </div>
    </div>
  );
}
