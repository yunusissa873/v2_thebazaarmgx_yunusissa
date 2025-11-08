import { Routes, Route } from 'react-router-dom';
import PlatformSettings from './PlatformSettings';

export default function Settings() {
  return (
    <Routes>
      <Route index element={<PlatformSettings />} />
    </Routes>
  );
}


