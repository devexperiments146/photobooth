import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Camera from './Camera';
import './App.css';

const App: React.FC = () => {
  const token = localStorage.getItem("auth_token");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to="/camera" replace /> : <Login />}
        />
        <Route path="/camera" element={<Camera />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
