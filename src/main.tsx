import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store.tsx";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Provider store={store}>
        <Theme accentColor="grass">
          <App />
        </Theme>
      </Provider>
    </Router>
  </StrictMode>
);
