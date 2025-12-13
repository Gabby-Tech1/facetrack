import "./App.css";
import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/auth/login";
import { ThemeProvider } from "next-themes";
import "@radix-ui/themes/styles.css";
import Dashboard from "./pages/dashboard/dashboard";

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
