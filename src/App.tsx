import "./App.css";
import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import { ThemeProvider } from "next-themes";
import "@radix-ui/themes/styles.css";
import Dashboard from "./pages/dashboard/Dashboard";

const App: React.FC = () => {
  return (
    <div>
      <ThemeProvider defaultTheme="dark" attribute="class">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
};

export default App;
