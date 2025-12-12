import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store.tsx";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Provider store={store}>
        <Theme
          accentColor="grass"
          grayColor="gray"
          panelBackground="solid"
          scaling="100%"
          radius="full"
        >
          <App />
        </Theme>
      </Provider>
    </Router>
  </StrictMode>
);
