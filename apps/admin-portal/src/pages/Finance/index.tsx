import { Routes, Route } from 'react-router-dom';
import FinanceDashboard from './FinanceDashboard';
import PayoutManagement from './PayoutManagement';
import Subscriptions from './Subscriptions';
import EscrowAccounts from './EscrowAccounts';

export default function Finance() {
  return (
    <Routes>
      <Route index element={<FinanceDashboard />} />
      <Route path="payouts" element={<PayoutManagement />} />
      <Route path="subscriptions" element={<Subscriptions />} />
      <Route path="escrow" element={<EscrowAccounts />} />
    </Routes>
  );
}


