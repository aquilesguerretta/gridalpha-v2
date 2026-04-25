import { useState } from 'react';

/**
 * Tiny hover-state hook for terminal components that need a CSS-pseudo-class
 * style hover effect but render via inline styles. Spread `bind` onto the
 * target element and read `hovered` to swap style values.
 *
 *   const hover = useHoverState();
 *   return <div {...hover.bind} style={hover.hovered ? a : b} />;
 */
export function useHoverState() {
  const [hovered, setHovered] = useState(false);
  const bind = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };
  return { hovered, bind };
}
