import { Routes, Route } from 'react-router-dom';
import AdminStaffManagement from './AdminStaffManagement';

export default function AdminStaff() {
  return (
    <Routes>
      <Route index element={<AdminStaffManagement />} />
    </Routes>
  );
}


