import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import PetList from './components/PetList';
import PetDetail from './components/PetDetail';
import PetForm from './components/PetForm';
import './index.css';

function App() {
  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">🐾 Pet Store</Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/pets/new" className="btn-add-nav">+ Add Pet</Link>
        </div>
      </nav>
      <main className="container">
        <Routes>
          <Route path="/" element={<PetList />} />
          <Route path="/pets/new" element={<PetForm />} />
          <Route path="/pets/:id/edit" element={<PetForm />} />
          <Route path="/pets/:id" element={<PetDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
