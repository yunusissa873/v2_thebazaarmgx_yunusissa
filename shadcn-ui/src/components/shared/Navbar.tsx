import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { SearchBar } from '@/components/marketplace/SearchBar';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { getItemCount } = useCart();
  const cartCount = getItemCount();
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Pages where navbar should be static (not sticky)
  const staticNavbarPages = ['/', '/vendors', '/categories'];
  const isStaticNavbar = staticNavbarPages.includes(location.pathname);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setShowLogoutConfirm(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const navLinks = [
    { name: 'Vendors', href: '/vendors' },
    { name: 'Categories', href: '/categories' },
  ];

  return (
    <>
    <nav className={`${isStaticNavbar ? 'static' : 'sticky top-0'} z-50 w-full border-b border-netflix-dark-gray bg-netflix-black/95 backdrop-blur supports-[backdrop-filter]:bg-netflix-black/80`}>
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section: Logo and Navigation */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-netflix-red to-orange-500 bg-clip-text text-transparent">
                The Bazaar
              </div>
            </Link>
            <div className="hidden md:flex md:items-center md:space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section: Search, Actions, and Mobile Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex lg:flex-1 lg:justify-center lg:px-8">
              <SearchBar placeholder="Search products, vendors..." />
            </div>

            <div className="flex items-center gap-2">
              <div className="lg:hidden">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-white"
                  onClick={() => navigate('/products')}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>

              <Link to="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-white"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>

              <Link to="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-300 hover:text-white"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-netflix-red p-0 text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-300 hover:text-white"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-netflix-dark-gray border-netflix-medium-gray"
                >
                  {isAuthenticated ? (
                    <>
                      <DropdownMenuLabel className="text-white">
                        {user?.email || 'My Account'}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-netflix-medium-gray" />
                      
                      {/* My Profile */}
                      <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-netflix-medium-gray">
                        <Link to="/profile" className="w-full">
                          My Profile
                        </Link>
                      </DropdownMenuItem>

                      {/* Purchase History */}
                      <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-netflix-medium-gray">
                        <Link to="/orders" className="w-full">
                          Purchase History
                        </Link>
                      </DropdownMenuItem>

                      {/* Notifications & Alerts */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="text-gray-300 focus:text-white focus:bg-netflix-medium-gray">
                          Notifications & Alerts
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="bg-netflix-dark-gray border-netflix-medium-gray">
                          <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-netflix-medium-gray">
                            <Link to="/profile?tab=notifications" className="w-full">
                              Notification Settings
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-netflix-medium-gray">
                            <Link to="/orders" className="w-full">
                              Order Updates
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      {/* Settings */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="text-gray-300 focus:text-white focus:bg-netflix-medium-gray">
                          Settings
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="bg-netflix-dark-gray border-netflix-medium-gray">
                          <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-netflix-medium-gray">
                            <Link to="/profile?tab=settings" className="w-full">
                              Language & Currency
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-netflix-medium-gray">
                            <Link to="/profile?tab=payments" className="w-full">
                              Payment Methods
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      {/* Support & Help Center */}
                      <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-netflix-medium-gray">
                        <Link to="/help" className="w-full">
                          Support & Help Center
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-netflix-medium-gray" />
                      
                      {/* Logout */}
                      <DropdownMenuItem 
                        className="text-gray-300 focus:text-white focus:bg-netflix-medium-gray cursor-pointer text-red-400 hover:text-red-300"
                        onClick={handleLogoutClick}
                      >
                        Log Out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-netflix-medium-gray">
                        <Link to="/login" className="w-full">
                          Login
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-netflix-medium-gray">
                        <Link to="/register" className="w-full">
                          Register
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-gray-300 hover:text-white"
                  >
                    {isOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Menu className="h-5 w-5" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[300px] bg-netflix-black border-netflix-dark-gray"
                >
                  <div className="flex flex-col space-y-4 mt-8">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className="text-lg font-medium text-gray-300 transition-colors hover:text-white"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>

    {/* Logout Confirmation Dialog */}
    <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
      <AlertDialogContent className="bg-netflix-dark-gray border-netflix-medium-gray">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Confirm Logout</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            Are you sure you want to log out? You'll need to sign in again to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-netflix-medium-gray text-white border-netflix-medium-gray hover:bg-netflix-medium-gray/80">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSignOut}
            className="bg-netflix-red hover:bg-netflix-red/90 text-white"
          >
            Log Out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}