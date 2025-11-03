import { Link } from 'react-router-dom';
import { WifiOff, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-netflix-red/20 p-6">
            <WifiOff className="h-16 w-16 text-netflix-red" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-lg">
          It looks like you've lost your internet connection. Don't worry, you can still browse cached content.
        </p>

        {/* Features Available Offline */}
        <div className="bg-netflix-dark-gray rounded-lg p-6 space-y-3 text-left">
          <h2 className="text-white font-semibold mb-3">Available Offline:</h2>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-netflix-red">✓</span>
              Browse previously viewed products and vendors
            </li>
            <li className="flex items-center gap-2">
              <span className="text-netflix-red">✓</span>
              View your cart and wishlist
            </li>
            <li className="flex items-center gap-2">
              <span className="text-netflix-red">✓</span>
              View cached product details and images
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-500">✗</span>
              Search and filter (requires connection)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-500">✗</span>
              Add new items to cart (will sync when online)
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleRetry}
            className="bg-netflix-red hover:bg-netflix-red/90 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
          >
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Link>
          </Button>
        </div>

        {/* Hint */}
        <p className="text-gray-500 text-sm">
          Your offline data will sync automatically when you're back online.
        </p>
      </div>
    </div>
  );
}

