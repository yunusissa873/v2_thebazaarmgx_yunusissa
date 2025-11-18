import { Routes, Route } from 'react-router-dom';
import ReviewModeration from './ReviewModeration';
import BannerManagement from './BannerManagement';

export default function Content() {
  return (
    <Routes>
      <Route index element={<ReviewModeration />} />
      <Route path="reviews" element={<ReviewModeration />} />
      <Route path="banners" element={<BannerManagement />} />
    </Routes>
  );
}


