import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Bell, MessageSquare, HelpCircle, Settings, LogOut, Sun, Moon } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { path: "/vendor/profile", label: "Profile" },
    { path: "/vendor/commerce", label: "Commerce" },
    { path: "/vendor/analytics", label: "Analytics" },
    { path: "/vendor/finance", label: "Finance" },
  ];

  const isActiveTab = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleLogout = () => {
    localStorage.removeItem("vendorAuth");
    localStorage.removeItem("vendorEmail");
    navigate("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-netflix-dark-gray border-b border-netflix-medium-gray">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/vendor/profile" className="flex items-center">
              <div className="text-2xl font-bold text-white">
                <span className="text-netflix-red">The</span> Bazaar
              </div>
              <div className="ml-2 text-xs text-netflix-light-gray">Vendor Portal</div>
            </Link>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveTab(tab.path)
                      ? "bg-netflix-red text-white"
                      : "text-netflix-light-gray hover:text-white hover:bg-netflix-medium-gray"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <button className="p-2 text-netflix-light-gray hover:text-white hover:bg-netflix-medium-gray rounded-md transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-netflix-red rounded-full"></span>
              </button>

              {/* Hamburger Menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-netflix-light-gray hover:text-white hover:bg-netflix-medium-gray rounded-md transition-colors"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full flex items-center justify-between p-2 text-netflix-light-gray hover:text-white"
            >
              <span className="font-medium">Menu</span>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            {isMobileMenuOpen && (
              <nav className="mt-2 space-y-1">
                {tabs.map((tab) => (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-md text-sm font-medium ${
                      isActiveTab(tab.path)
                        ? "bg-netflix-red text-white"
                        : "text-netflix-light-gray hover:text-white hover:bg-netflix-medium-gray"
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Hamburger Menu Drawer */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed right-0 top-16 bottom-0 w-64 bg-netflix-dark-gray border-l border-netflix-medium-gray z-50 overflow-y-auto">
            <div className="p-4 space-y-1">
              <div className="px-4 py-2 text-xs font-semibold text-netflix-light-gray uppercase">
                Quick Access
              </div>
              
              <button className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-netflix-medium-gray rounded-md transition-colors">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
                <span className="ml-auto bg-netflix-red text-white text-xs px-2 py-1 rounded-full">3</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-netflix-medium-gray rounded-md transition-colors">
                <MessageSquare className="h-5 w-5" />
                <span>Messages / Support</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-netflix-medium-gray rounded-md transition-colors">
                <HelpCircle className="h-5 w-5" />
                <span>Help Center</span>
              </button>

              <div className="border-t border-netflix-medium-gray my-2" />

              <div className="px-4 py-2 text-xs font-semibold text-netflix-light-gray uppercase">
                Settings
              </div>

              <button className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-netflix-medium-gray rounded-md transition-colors">
                <Settings className="h-5 w-5" />
                <span>Account Settings</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-netflix-medium-gray rounded-md transition-colors">
                <Sun className="h-5 w-5" />
                <span>Theme Mode</span>
              </button>

              <div className="border-t border-netflix-medium-gray my-2" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-netflix-medium-gray rounded-md transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
