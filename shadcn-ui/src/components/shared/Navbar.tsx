import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount] = useState(3); // TODO: Connect to cart state
  const [isLoggedIn] = useState(false); // TODO: Connect to auth state

  const navLinks = [
    { name: 'Vendors', href: '/vendors' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-netflix-dark-gray bg-netflix-black/95 backdrop-blur supports-[backdrop-filter]:bg-netflix-black/80">
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
              <div className="relative w-full max-w-lg">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products, vendors..."
                  className="w-full bg-netflix-dark-gray border-netflix-medium-gray pl-10 text-white placeholder:text-gray-400 focus-visible:ring-netflix-red"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-gray-300 hover:text-white"
              >
                <Search className="h-5 w-5" />
              </Button>

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
                  {isLoggedIn ? (
                    <>
                      <DropdownMenuLabel className="text-white">
                        My Account
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-netflix-medium-gray" />
                      <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-netflix-medium-gray">
                        <Link to="/profile" className="w-full">
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-netflix-medium-gray">
                        <Link to="/orders" className="w-full">
                          Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-netflix-medium-gray">
                        <Link to="/wishlist" className="w-full">
                          Wishlist
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-netflix-medium-gray" />
                      <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-netflix-medium-gray">
                        Logout
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
  );
}