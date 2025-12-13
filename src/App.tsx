import "./App.css";
import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/auth/login";
import { ThemeProvider } from "next-themes";
import "@radix-ui/themes/styles.css";

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
