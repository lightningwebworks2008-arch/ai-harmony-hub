import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DashboardPreview from './pages/DashboardPreview';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard/preview/:id" element={<DashboardPreview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
