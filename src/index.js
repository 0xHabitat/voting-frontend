import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router } from "react-router-dom";
import i18n from "./i18n";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "rimble-ui";
import theme from "./theme";

import { init as initSentry } from '@sentry/browser';
import fallbackError from './volt/components/fallbackError';

// Launch Sentry before anything else
console.log('Sentry Mode Engage!');
initSentry({dsn: "https://13ce52359fb6469ebddaf096b57d1d80@sentry.io/1553402"});

function Root() {
  return (
    <ThemeProvider theme={theme} style={{ height: "100%" }}>
      <I18nextProvider i18n={i18n}>
        <Router>
          <App />
        </Router>
      </I18nextProvider>
    </ThemeProvider>
  );
}

// GRoot = Guarded Root
const GRoot = fallbackError(Root);

ReactDOM.render(<GRoot/>, document.getElementById("root"));
