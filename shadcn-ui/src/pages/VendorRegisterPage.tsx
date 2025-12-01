import { Link } from 'react-router-dom';
import RegisterPage from './Auth/RegisterPage';

export default function VendorRegisterPage() {
  // For now, redirect to register with vendor role
  // In a full implementation, this would be a separate vendor registration flow
  return <RegisterPage />;
}

