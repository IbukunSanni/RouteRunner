import './App.css'
import { Routes, Route } from 'react-router-dom';
import IntegrationList from '@/pages/IntegrationList';
import IntegrationEditor from '@/pages/IntegrationEditor';
import Header from '@/components/Header';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Header showBackButton />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<IntegrationList />} />
          <Route path="/integrations/:id" element={<IntegrationEditor />} />
        </Routes>
      </main>
    </div>
  );
}