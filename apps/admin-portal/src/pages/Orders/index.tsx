import { Routes, Route } from 'react-router-dom';
import OrderList from './OrderList';
import OrderDetail from './OrderDetail';

export default function Orders() {
  return (
    <Routes>
      <Route index element={<OrderList />} />
      <Route path=":id" element={<OrderDetail />} />
    </Routes>
  );
}


