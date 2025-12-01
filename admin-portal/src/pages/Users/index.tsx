import { Routes, Route } from 'react-router-dom';
import UserList from './UserList';
import UserDetail from './UserDetail';

export default function Users() {
  return (
    <Routes>
      <Route index element={<UserList />} />
      <Route path=":id" element={<UserDetail />} />
    </Routes>
  );
}


