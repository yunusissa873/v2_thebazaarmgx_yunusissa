import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, LogOut, User, Building2, Mail, Phone, MapPin } from "lucide-react";

interface VendorProfile {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  logo?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<VendorProfile>({
    businessName: "",
    email: "",
    phone: "",
    address: "",
    description: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem("vendorProfile");
    const savedEmail = localStorage.getItem("vendorEmail");

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else if (savedEmail) {
      setProfile({
        businessName: "",
        email: savedEmail,
        phone: "",
        address: "",
        description: "",
      });
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Save to localStorage (in real app, save to backend)
    setTimeout(() => {
      localStorage.setItem("vendorProfile", JSON.stringify(profile));
      localStorage.setItem("vendorEmail", profile.email);
      setIsSaving(false);
      alert("Profile updated successfully!");
    }, 500);
  };

  const handleLogout = () => {
    localStorage.removeItem("vendorAuth");
    localStorage.removeItem("vendorEmail");
    navigate("/login");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Business Information</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName">
                    <Building2 className="inline h-4 w-4 mr-1" />
                    Business Name *
                  </Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={profile.businessName}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    placeholder="Your business/store name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    placeholder="your-email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    placeholder="+254 700 000 000"
                  />
                </div>

                <div>
                  <Label htmlFor="address">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Business Address *
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    placeholder="Your business address"
                  />
                </div>

                <div>
                  <Label htmlFor="description">
                    <User className="inline h-4 w-4 mr-1" />
                    Business Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={profile.description}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1"
                    placeholder="Tell customers about your business..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        {/* Profile Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Profile Summary</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Business Name</div>
                <div className="font-medium">{profile.businessName || "Not set"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-medium">{profile.email || "Not set"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Phone</div>
                <div className="font-medium">{profile.phone || "Not set"}</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-900">Account Security</h3>
            <p className="text-sm text-blue-800 mb-4">
              Keep your account secure by regularly updating your password.
            </p>
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
