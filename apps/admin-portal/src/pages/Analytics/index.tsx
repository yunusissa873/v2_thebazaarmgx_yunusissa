import { Routes, Route } from 'react-router-dom';
import AnalyticsDashboard from './AnalyticsDashboard';

export default function Analytics() {
  return (
    <Routes>
      <Route index element={<AnalyticsDashboard />} />
    </Routes>
  );
}


