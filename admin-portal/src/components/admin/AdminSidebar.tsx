import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  FolderTree,
  ShoppingCart,
  CreditCard,
  DollarSign,
  BarChart3,
  FileText,
  Settings,
  Shield,
  MessageSquare,
  TrendingUp,
  UserCog,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Vendors', href: '/vendors', icon: Store },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Categories', href: '/categories', icon: FolderTree },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Finance', href: '/finance', icon: DollarSign },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Content', href: '/content', icon: FileText },
  { name: 'Support', href: '/support', icon: MessageSquare },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { isSuperAdmin } = useAuth();

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">The Bazaar</h1>
        <p className="text-sm text-muted-foreground">Admin Portal</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
        {isSuperAdmin && (
          <Link
            to="/admin-staff"
            className={cn(
              'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              location.pathname === '/admin-staff'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <UserCog className="h-5 w-5" />
            Admin Staff
          </Link>
        )}
      </nav>
    </div>
  );
}

