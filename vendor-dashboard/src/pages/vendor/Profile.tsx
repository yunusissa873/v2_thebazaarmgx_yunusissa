import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save, 
  Upload, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  Eye,
  Users,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

interface VendorProfile {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  category: string;
  logo?: string;
  banner?: string;
  slug: string;
  isLive: boolean;
  kycStatus: "pending" | "verified" | "rejected";
  setupProgress: number;
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<VendorProfile>({
    businessName: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    category: "",
    slug: "",
    isLive: false,
    kycStatus: "pending",
    setupProgress: 0,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("vendorProfile");
    const savedEmail = localStorage.getItem("vendorEmail");

    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      setLogoPreview(parsed.logo || null);
      setBannerPreview(parsed.banner || null);
      
      // Calculate setup progress
      const fields = ['businessName', 'email', 'phone', 'address', 'description', 'category', 'slug'];
      const filled = fields.filter(f => parsed[f]).length;
      setProfile(prev => ({ ...prev, setupProgress: Math.round((filled / fields.length) * 100) }));
    } else if (savedEmail) {
      setProfile(prev => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from business name
    if (name === "businessName") {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      setProfile(prev => ({ ...prev, slug }));
    }
  };

  const handleFileUpload = (type: "logo" | "banner", e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        if (type === "logo") {
          setLogoPreview(preview);
          setProfile(prev => ({ ...prev, logo: preview }));
        } else {
          setBannerPreview(preview);
          setProfile(prev => ({ ...prev, banner: preview }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKYCUpload = (type: "id" | "certificate" | "bank", _e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle KYC document upload
    console.log(`Uploading ${type} document`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      localStorage.setItem("vendorProfile", JSON.stringify(profile));
      localStorage.setItem("vendorEmail", profile.email);
      setIsSaving(false);
      alert("Profile updated successfully!");
    }, 500);
  };

  const categories = [
    "Electronics",
    "Fashion & Apparel",
    "Home & Garden",
    "Health & Beauty",
    "Food & Beverages",
    "Sports & Outdoors",
    "Books & Media",
    "Toys & Games",
    "Automotive",
    "Other",
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Store Profile</h1>
          <p className="text-sm text-netflix-light-gray mt-1">
            Your digital storefront, identity, and customer-facing presence
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-netflix-light-gray">Go Live</span>
            <button
              onClick={() => setProfile(prev => ({ ...prev, isLive: !prev.isLive }))}
              className="relative"
            >
              {profile.isLive ? (
                <ToggleRight className="h-6 w-6 text-green-500" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Setup Progress Tracker */}
      <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Setup Progress</h2>
          <span className="text-netflix-red font-bold">{profile.setupProgress}%</span>
        </div>
        <div className="w-full bg-netflix-medium-gray rounded-full h-3">
          <div
            className="bg-netflix-red h-3 rounded-full transition-all"
            style={{ width: `${profile.setupProgress}%` }}
          />
        </div>
        <p className="text-sm text-netflix-light-gray mt-2">
          Complete your profile to improve visibility and unlock more features
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store Profile Card */}
          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Store Profile Card</h2>
            
            {/* Banner Upload */}
            <div className="mb-6">
              <Label className="text-white mb-2 block">Store Banner</Label>
              <div className="relative h-32 bg-netflix-medium-gray rounded-lg overflow-hidden">
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-netflix-light-gray">
                    <Upload className="h-8 w-8" />
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="h-6 w-6 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload("banner", e)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="mb-6">
              <Label className="text-white mb-2 block">Store Logo</Label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 bg-netflix-medium-gray rounded-lg overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-netflix-light-gray">
                      <Building2 className="h-8 w-8" />
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="h-4 w-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload("logo", e)}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-netflix-light-gray">
                    Upload a square logo (recommended: 512x512px)
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="businessName" className="text-white">
                  Store Name *
                </Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={profile.businessName}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
                  placeholder="Your store name"
                />
              </div>

              <div>
                <Label htmlFor="slug" className="text-white">
                  Store URL Slug
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-netflix-light-gray">thebazaar.com/vendors/</span>
                  <Input
                    id="slug"
                    name="slug"
                    value={profile.slug}
                    onChange={handleChange}
                    className="flex-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
                    placeholder="your-store-slug"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-white">
                  Store Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={profile.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="mt-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
                  placeholder="Tell customers about your store..."
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-white">
                  Store Category *
                </Label>
                <select
                  id="category"
                  name="category"
                  value={profile.category}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2 bg-netflix-medium-gray border border-netflix-medium-gray rounded-md text-white focus:border-netflix-red"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-white">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    required
                    className="mt-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={handleChange}
                    required
                    className="mt-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
                    placeholder="+254 700 000 000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-white">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Business Address *
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
                  placeholder="Your business address"
                />
              </div>

              <div className="pt-4 border-t border-netflix-medium-gray">
                <Button type="submit" disabled={isSaving} className="bg-netflix-red hover:bg-[#c11119] text-white font-semibold">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>

          {/* KYC/KYB Section */}
          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">KYC/KYB Verification</h2>
              {profile.kycStatus === "verified" && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              )}
              {profile.kycStatus === "pending" && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
              )}
              {profile.kycStatus === "rejected" && (
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Rejected</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white mb-2 block">National ID / Business Certificate</Label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-netflix-medium-gray rounded-lg cursor-pointer hover:border-netflix-red transition-colors">
                  <Upload className="h-8 w-8 text-netflix-light-gray mb-2" />
                  <span className="text-sm text-netflix-light-gray">Click to upload</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleKYCUpload("id", e)}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <Label className="text-white mb-2 block">Bank Details</Label>
                <Input
                  placeholder="Bank account number"
                  className="bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
                />
              </div>

              <Button variant="outline" className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
                Submit for Verification
              </Button>
            </div>
          </div>

          {/* Multi-user Access Control */}
          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Team Access</h2>
              <Button variant="outline" className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
                <Users className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </div>
            <p className="text-sm text-netflix-light-gray mb-4">
              Add staff members with limited roles (e.g., order fulfillment, customer support)
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-netflix-medium-gray rounded">
                <div>
                  <div className="text-white font-medium">Owner</div>
                  <div className="text-sm text-netflix-light-gray">you@example.com</div>
                </div>
                <span className="text-xs bg-netflix-red px-2 py-1 rounded">Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Storefront Preview */}
          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Storefront Preview</h3>
            <div className="bg-netflix-medium-gray rounded-lg p-4 mb-4">
              <div className="aspect-video bg-netflix-dark-gray rounded mb-2"></div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-netflix-dark-gray rounded"></div>
                <div>
                  <div className="text-white font-medium">{profile.businessName || "Your Store Name"}</div>
                  <div className="text-xs text-netflix-light-gray">{profile.category || "Category"}</div>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
              onClick={() => window.open(`/vendors/${profile.slug || "your-store"}`, "_blank")}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Storefront
            </Button>
          </div>

          {/* Notification Preferences */}
          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Notification Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-white text-sm">New Orders</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-white text-sm">Low Stock Alerts</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-white text-sm">Customer Messages</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-white text-sm">Weekly Reports</span>
                <input type="checkbox" className="rounded" />
              </label>
            </div>
          </div>

          {/* Theme Customization */}
          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Theme Customization</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-white text-sm mb-2 block">Accent Color</Label>
                <div className="flex gap-2">
                  {["#E50914", "#0066CC", "#00AA44", "#FF9900", "#9900CC"].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-netflix-medium-gray hover:border-white transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
