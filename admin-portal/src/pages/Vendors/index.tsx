import { Routes, Route } from 'react-router-dom';
import VendorList from './VendorList';
import VendorDetail from './VendorDetail';

export default function Vendors() {
  return (
    <Routes>
      <Route index element={<VendorList />} />
      <Route path=":id" element={<VendorDetail />} />
    </Routes>
  );
}


