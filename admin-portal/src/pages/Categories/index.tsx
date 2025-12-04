import { Routes, Route } from 'react-router-dom';
import CategoryManagement from './CategoryManagement';

export default function Categories() {
  return (
    <Routes>
      <Route index element={<CategoryManagement />} />
    </Routes>
  );
}


