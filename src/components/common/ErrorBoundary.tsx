import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/common/Button";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last-resort safety net: without this, any uncaught render error (e.g. a
 * null field in a Spotify API response) unmounts the whole React tree and
 * leaves only the dark page background visible — a "black screen" with no
 * way back short of restarting the app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Aurora crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-aurora-bg px-8 text-center text-aurora-text">
          <h1 className="text-xl font-semibold">Etwas ist schiefgelaufen</h1>
          <p className="max-w-sm text-sm text-aurora-muted">{this.state.error.message}</p>
          <Button onClick={() => this.setState({ error: null })}>Erneut versuchen</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
