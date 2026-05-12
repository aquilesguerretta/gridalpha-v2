// src/components/shared/ErrorBoundary.tsx
// Wraps any component that could throw (3D cards, data cards).
// A crash inside the boundary shows the platform's ErrorBoundaryFallback
// (CHROMA Wave 4), not a blank page.

import { Component, type ErrorInfo, type ReactNode } from "react";
import { captureError } from "../../lib/shared/error-tracking";
import { ErrorBoundaryFallback } from "../terminal/ErrorBoundaryFallback";

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

    // CHROMA Wave 4 default — token-driven card fallback. The legacy
    // inline rendering was scoped to mono caps text + minimal chrome;
    // ErrorBoundaryFallback gives the same affordance with the
    // platform's card hierarchy.
    return (
      <ErrorBoundaryFallback
        error={this.state.error}
        onRetry={this.handleReset}
        label={this.props.label ? `${this.props.label.toUpperCase()} UNAVAILABLE` : undefined}
      />
    );
  }
}
