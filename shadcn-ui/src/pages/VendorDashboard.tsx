import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VendorDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // This is a placeholder for the vendor dashboard.
    // In a real application, you would fetch vendor data and display a dashboard.
    // For now, we will just redirect to the new dashboard project.
    // The URL will be determined by how the new dashboard is served.
    // Assuming it's served at '/vendor-dashboard-app/'
    window.location.href = '/vendor-dashboard/';
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Redirecting to Vendor Dashboard...</h1>
        <p>Please wait while we take you to your dashboard.</p>
      </div>
    </div>
  );
};

export default VendorDashboard;