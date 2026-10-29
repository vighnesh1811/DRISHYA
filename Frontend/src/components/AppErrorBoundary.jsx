import { Component } from 'react';

export default class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="content-page container error-state">
          <p className="eyebrow">Something went wrong</p>
          <h1>Let’s get you<br /><em>back on frame.</em></h1>
          <button className="btn btn-primary" type="button" onClick={() => window.location.reload()}>Reload page</button>
        </main>
      );
    }
    return this.props.children;
  }
}
