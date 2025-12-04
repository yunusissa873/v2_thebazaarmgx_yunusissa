/**
 * Vendor Portal Layout Component
 * 
 * Provides consistent layout with sidebar navigation for vendor portal
 * Matches PRD requirements: left sidebar, top summary bar, vendor-specific header
 * 
 * @author The Bazaar Development Team
 */

import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  MessageSquare,
  DollarSign,
  User,
  HelpCircle,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const navigation = [
  { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/vendor/products', icon: Package },
  { name: 'Orders', href: '/vendor/orders', icon: ShoppingCart },
  { name: 'Analytics', href: '/vendor/analytics', icon: BarChart3 },
  { name: 'Messages', href: '/vendor/messages', icon: MessageSquare },
  { name: 'Financials', href: '/vendor/financials', icon: DollarSign },
  { name: 'Profile', href: '/vendor/profile', icon: User },
  { name: 'Help', href: '/vendor/help', icon: HelpCircle },
];

export default function VendorPortalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#1F1F1F] border-r border-[#2F2F2F] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-[#2F2F2F]">
            <Link to="/vendor/dashboard" className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                <span className="text-[#E50914]">The</span> Bazaar
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#E50914] text-white'
                      : 'text-gray-300 hover:bg-[#2F2F2F] hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-[#2F2F2F]">
            <div className="flex items-center gap-3 mb-3 px-4 py-2">
              <div className="h-8 w-8 rounded-full bg-[#E50914] flex items-center justify-center text-sm font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'V'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email || 'Vendor'}</p>
                <p className="text-xs text-gray-400">Vendor Account</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-[#2F2F2F]"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-[#1F1F1F] border-b border-[#2F2F2F] sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1" />
            {/* Quick stats or notifications can go here */}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
