import { Routes, Route } from 'react-router-dom';
import SecurityDashboard from './SecurityDashboard';
import AuditLogs from './AuditLogs';
import FraudMonitoring from './FraudMonitoring';

export default function Security() {
  return (
    <Routes>
      <Route index element={<SecurityDashboard />} />
      <Route path="audit" element={<AuditLogs />} />
      <Route path="fraud" element={<FraudMonitoring />} />
    </Routes>
  );
}


