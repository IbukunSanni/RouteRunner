import './App.css'
import { Routes, Route } from 'react-router-dom';
import IntegrationList from '@/pages/IntegrationList';
import IntegrationEditor from '@/pages/IntegrationEditor';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IntegrationList />} />
      <Route path="/integrations/:id" element={<IntegrationEditor />} />
    </Routes>
  );
}