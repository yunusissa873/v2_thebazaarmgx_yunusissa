import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      // Store auth state (in real app, use proper auth)
      localStorage.setItem("vendorAuth", "true");
      localStorage.setItem("vendorEmail", email);
      setIsLoading(false);
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-6">
            <div className="text-4xl font-bold text-white">
              <span className="text-netflix-red">The</span> Bazaar
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your vendor account
          </h2>
          <p className="mt-2 text-center text-sm text-netflix-light-gray">
            Or{" "}
            <Link to="/signup" className="font-medium text-netflix-red hover:text-[#c11119] transition-colors">
              create a new vendor account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-netflix-dark-gray p-8 rounded-lg border border-netflix-medium-gray shadow-lg" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
                placeholder="your-email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-netflix-red focus:ring-netflix-red border-netflix-medium-gray rounded bg-netflix-dark-gray"
              />
              <Label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                Remember me
              </Label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-netflix-red hover:text-[#c11119] transition-colors">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-netflix-red hover:bg-[#c11119] text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-netflix-medium-gray" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-netflix-dark-gray text-netflix-light-gray">New to The Bazaar?</span>
              </div>
            </div>
            <div className="mt-6">
              <Link to="/signup">
                <Button type="button" variant="outline" className="w-full border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
                  Create your vendor account
                </Button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
