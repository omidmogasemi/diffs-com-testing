import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  /** Changing this clears a previous error, so a new selection gets a fresh try. */
  resetKey: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * The point of this page is to let people put the library into states its
 * callers would hit, and some of those throw — a patch with the wrong number of
 * files, for one. Without a boundary the whole route unmounts and the panel
 * goes with it, leaving no way back except a reload.
 */
export default class PreviewBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Preview failed to render", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="preview-error" role="alert">
          <h2 className="preview-error__title">
            The library rejected this combination
          </h2>
          <pre className="preview-error__message">
            {this.state.error.message}
          </pre>
          <p className="preview-error__hint">
            Pick different content or another component to carry on.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
