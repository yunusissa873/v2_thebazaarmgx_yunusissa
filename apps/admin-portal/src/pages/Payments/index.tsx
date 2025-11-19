import { Routes, Route } from 'react-router-dom';
import PaymentList from './PaymentList';

export default function Payments() {
  return (
    <Routes>
      <Route index element={<PaymentList />} />
    </Routes>
  );
}


