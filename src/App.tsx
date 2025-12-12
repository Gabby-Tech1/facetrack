import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/auth/login";
import "@radix-ui/themes/styles.css";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
    </Routes>
  );
};

export default App;
