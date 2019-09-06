import React, { Component } from 'react';
import { captureException } from '@sentry/browser';

export default function (ComposedComponent) {
  class ErrorBoundary extends Component {
    componentDidCatch(error) {
      captureException(error);
    }

    render() {
      return <ComposedComponent {...this.props} />;
    }
  }

  return ErrorBoundary;
}
