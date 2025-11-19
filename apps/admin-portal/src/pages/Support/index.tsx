import { Routes, Route } from 'react-router-dom';
import SupportTickets from './SupportTickets';

export default function Support() {
  return (
    <Routes>
      <Route index element={<SupportTickets />} />
    </Routes>
  );
}


