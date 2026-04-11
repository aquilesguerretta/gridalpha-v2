// src/components/shared/ErrorBoundary.tsx
// Wraps any component that could throw (3D cards, data cards).
// A crash inside the boundary shows CardErrorState, not a blank page.

import { Component, type ErrorInfo, type ReactNode } from "react";
import { captureError } from "../../lib/shared/error-tracking";
import { C, F } from '@/design/tokens';

interface Props {
  children:  ReactNode;
  label?:    string;
  fallback?: ReactNode | ((props: { error: Error; reset: () => void }) => ReactNode);
}

interface State {
  hasError: boolean;
  error:    Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    captureError(error, {
      label:          this.props.label,
      componentStack: info.componentStack ?? undefined,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError || !this.state.error) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return typeof this.props.fallback === "function"
        ? this.props.fallback({ error: this.state.error, reset: this.handleReset })
        : this.props.fallback;
    }

    return (
      <div style={{
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        justifyContent:  "center",
        height:          "100%",
        padding:         24,
        gap:             12,
        fontFamily:      F.mono,
      }}>
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.15em", color: C.alertCritical, textTransform: "uppercase" }}>
          {this.props.label ?? "COMPONENT"} ERROR
        </span>
        <span style={{ fontSize: "0.55rem", color: C.textMuted, textAlign: "center", maxWidth: 200 }}>
          {this.state.error.message}
        </span>
        <button
          onClick={this.handleReset}
          style={{
            marginTop:    8,
            padding:      "4px 12px",
            background:   "transparent",
            border:       `1px solid ${C.electricBlue}`,
            borderRadius: 4,
            color:        C.electricBlue,
            fontFamily:   F.mono,
            fontSize:     "0.55rem",
            letterSpacing:"0.1em",
            cursor:       "pointer",
          }}
        >
          RETRY
        </button>
      </div>
    );
  }
}
