import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    // Simulate registration
    setTimeout(() => {
      localStorage.setItem("vendorAuth", "true");
      localStorage.setItem("vendorEmail", formData.email);
      localStorage.setItem("vendorProfile", JSON.stringify({
        businessName: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      }));
      setIsLoading(false);
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="text-3xl font-bold text-gray-900">The Bazaar</div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your vendor account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-sm border border-gray-200" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                name="businessName"
                type="text"
                required
                value={formData.businessName}
                onChange={handleChange}
                className="mt-1"
                placeholder="Your business/store name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1"
                placeholder="your-email@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1"
                placeholder="+254 700 000 000"
              />
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1"
                placeholder="Minimum 8 characters"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1"
                placeholder="Re-enter your password"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="address">Business Address *</Label>
              <Input
                id="address"
                name="address"
                type="text"
                required
                value={formData.address}
                onChange={handleChange}
                className="mt-1"
                placeholder="Your business address"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </Label>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create vendor account"}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in instead
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
