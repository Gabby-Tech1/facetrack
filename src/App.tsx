import "./App.css";
import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import { ThemeProvider } from "next-themes";
import "@radix-ui/themes/styles.css";
import Dashboard from "./pages/dashboard/Dashboard";
import Members from "./pages/member/Members";
import { Toaster } from "sonner";

const App: React.FC = () => {
  return (
    <div>
      <ThemeProvider defaultTheme="dark" attribute="class">
        <Toaster />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
};

export default App;
