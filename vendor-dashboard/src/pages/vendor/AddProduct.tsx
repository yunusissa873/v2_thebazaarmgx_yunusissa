import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save, 
  Upload, 
  X, 
  Plus, 
  Sparkles,
  DollarSign,
  Image as ImageIcon
} from "lucide-react";

interface Variant {
  id: string;
  name: string;
  type: "size" | "color" | "weight" | "storage" | "material" | "other";
  values: string[];
}

interface ProductFormData {
  itemName: string;
  briefDescription: string;
  fullDescription: string;
  priceKSH: string;
  priceUSD: string;
  variants: Variant[];
  category: string;
  subCategory: string;
  brand: string;
  images: File[];
  stockQuantity: string;
  businessModel: "b2b" | "b2c" | "";
  targetClients: "local" | "international" | "";
  fulfillment: "vendor" | "bazaar" | "";
}

const categories = [
  "Electronics",
  "Fashion & Apparel",
  "Home & Garden",
  "Health & Beauty",
  "Sports & Outdoors",
  "Books & Media",
  "Toys & Games",
  "Food & Beverages",
  "Automotive",
  "Other",
];

const subCategories: Record<string, string[]> = {
  "Electronics": ["Smartphones", "Laptops", "Tablets", "Accessories", "Audio"],
  "Fashion & Apparel": ["Men's Clothing", "Women's Clothing", "Shoes", "Accessories", "Jewelry"],
  "Home & Garden": ["Furniture", "Decor", "Kitchen", "Garden", "Lighting"],
  "Health & Beauty": ["Skincare", "Makeup", "Haircare", "Fragrance", "Wellness"],
  "Sports & Outdoors": ["Fitness", "Camping", "Outdoor Gear", "Sports Equipment"],
  "Books & Media": ["Books", "E-books", "Music", "Movies"],
  "Toys & Games": ["Action Figures", "Board Games", "Puzzles", "Educational"],
  "Food & Beverages": ["Snacks", "Beverages", "Cooking Ingredients", "Specialty Foods"],
  "Automotive": ["Parts", "Accessories", "Tools", "Maintenance"],
  "Other": ["Miscellaneous"],
};

const variantTypes = [
  { value: "size", label: "Size" },
  { value: "color", label: "Color" },
  { value: "weight", label: "Weight" },
  { value: "storage", label: "Storage Space" },
  { value: "material", label: "Material" },
  { value: "other", label: "Other" },
];

// AI suggestion function (simulated)
const getAISuggestions = (category: string): Variant[] => {
  const suggestions: Variant[] = [];
  
  if (category.toLowerCase().includes("fashion") || category.toLowerCase().includes("apparel")) {
    suggestions.push({
      id: "1",
      name: "Size",
      type: "size",
      values: ["XS", "S", "M", "L", "XL", "XXL"],
    });
    suggestions.push({
      id: "2",
      name: "Color",
      type: "color",
      values: ["Black", "White", "Blue", "Red", "Green", "Gray"],
    });
  } else if (category.toLowerCase().includes("electronics")) {
    suggestions.push({
      id: "1",
      name: "Storage",
      type: "storage",
      values: ["64GB", "128GB", "256GB", "512GB", "1TB"],
    });
    suggestions.push({
      id: "2",
      name: "Color",
      type: "color",
      values: ["Black", "White", "Silver", "Gold", "Blue"],
    });
  } else if (category.toLowerCase().includes("home")) {
    suggestions.push({
      id: "1",
      name: "Size",
      type: "size",
      values: ["Small", "Medium", "Large", "Extra Large"],
    });
    suggestions.push({
      id: "2",
      name: "Material",
      type: "material",
      values: ["Wood", "Metal", "Plastic", "Glass", "Fabric"],
    });
  }
  
  return suggestions;
};

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProductFormData>({
    itemName: "",
    briefDescription: "",
    fullDescription: "",
    priceKSH: "",
    priceUSD: "",
    variants: [],
    category: "",
    subCategory: "",
    brand: "",
    images: [],
    stockQuantity: "",
    businessModel: "",
    targetClients: "",
    fulfillment: "",
  });

  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Variant[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [exchangeRate] = useState(110); // KSH to USD exchange rate

  // Auto-convert KSH to USD
  useEffect(() => {
    if (formData.priceKSH) {
      const usd = (parseFloat(formData.priceKSH) / exchangeRate).toFixed(2);
      setFormData(prev => ({ ...prev, priceUSD: usd }));
    }
  }, [formData.priceKSH, exchangeRate]);

  // Generate AI suggestions when category changes
  useEffect(() => {
    if (formData.category && formData.itemName) {
      const suggestions = getAISuggestions(formData.category);
      setAiSuggestions(suggestions);
      setShowAISuggestions(true);
    }
  }, [formData.category, formData.itemName]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const addVariant = () => {
    const newVariant: Variant = {
      id: crypto.randomUUID(),
      name: "",
      type: "size",
      values: [],
    };
    setFormData(prev => ({ ...prev, variants: [...prev.variants, newVariant] }));
  };

  const removeVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== id),
    }));
  };

  const updateVariant = (id: string, field: keyof Variant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    }));
  };

  const addVariantValue = (variantId: string, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.map(v =>
          v.id === variantId
            ? { ...v, values: [...v.values, value.trim()] }
            : v
        ),
      }));
    }
  };

  const removeVariantValue = (variantId: string, valueIndex: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v =>
        v.id === variantId
          ? { ...v, values: v.values.filter((_, i) => i !== valueIndex) }
          : v
      ),
    }));
  };

  const applyAISuggestion = (variant: Variant) => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { ...variant, id: crypto.randomUUID() }],
    }));
    setShowAISuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Product data:", formData);
    alert("Product added successfully!");
    navigate("/products");
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Add New Product</h1>
          <p className="text-sm text-netflix-light-gray mt-1">
            Create a new product listing for your store
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/products")}
          className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Basic Information</h2>
          
          <div>
            <Label htmlFor="itemName" className="text-white">1. Item Name *</Label>
            <Input
              id="itemName"
              name="itemName"
              value={formData.itemName}
              onChange={handleInputChange}
              required
              className="mt-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <Label htmlFor="briefDescription" className="text-white">2. Brief Item Description *</Label>
            <Textarea
              id="briefDescription"
              name="briefDescription"
              value={formData.briefDescription}
              onChange={handleInputChange}
              required
              rows={3}
              className="mt-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
              placeholder="Short description for product cards (max 150 characters)"
              maxLength={150}
            />
            <p className="text-xs text-netflix-light-gray mt-1">
              {formData.briefDescription.length}/150 characters
            </p>
          </div>

          <div>
            <Label htmlFor="fullDescription" className="text-white">3. Full Item Description *</Label>
            <Textarea
              id="fullDescription"
              name="fullDescription"
              value={formData.fullDescription}
              onChange={handleInputChange}
              required
              rows={6}
              className="mt-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
              placeholder="Detailed description for product page"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            4. Pricing
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priceKSH" className="text-white">Price (KES) *</Label>
              <Input
                id="priceKSH"
                name="priceKSH"
                type="number"
                value={formData.priceKSH}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="mt-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="priceUSD" className="text-white">Price (USD) *</Label>
              <Input
                id="priceUSD"
                name="priceUSD"
                type="number"
                value={formData.priceUSD}
                readOnly
                className="mt-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray opacity-70"
                placeholder="Auto-calculated"
              />
              <p className="text-xs text-netflix-light-gray mt-1">
                Auto-converted from KES (Rate: 1 USD = {exchangeRate} KES)
              </p>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">5. Add Variants</h2>
            {showAISuggestions && aiSuggestions.length > 0 && (
              <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">AI Suggestions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((variant, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyAISuggestion(variant)}
                      className="text-xs bg-blue-800/50 hover:bg-blue-800/70 text-blue-200 px-2 py-1 rounded"
                    >
                      {variant.name} ({variant.values.length} options)
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {formData.variants.map((variant) => (
            <div key={variant.id} className="bg-netflix-medium-gray rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white text-sm">Variant Name</Label>
                    <Input
                      value={variant.name}
                      onChange={(e) => updateVariant(variant.id, "name", e.target.value)}
                      className="mt-1 bg-netflix-dark-gray border-netflix-medium-gray text-white"
                      placeholder="e.g., Size"
                    />
                  </div>
                  <div>
                    <Label className="text-white text-sm">Variant Type</Label>
                    <select
                      value={variant.type}
                      onChange={(e) => updateVariant(variant.id, "type", e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-netflix-dark-gray border border-netflix-medium-gray rounded-md text-white"
                    >
                      {variantTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeVariant(variant.id)}
                  className="ml-4"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Label className="text-white text-sm">Variant Values</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {variant.values.map((value, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-netflix-dark-gray px-2 py-1 rounded text-white text-sm"
                    >
                      {value}
                      <button
                        type="button"
                        onClick={() => removeVariantValue(variant.id, idx)}
                        className="hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <Input
                    placeholder="Add value"
                    className="inline-block w-32 bg-netflix-dark-gray border-netflix-medium-gray text-white"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addVariantValue(variant.id, e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addVariant}
            className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variant
          </Button>
        </div>

        {/* Category & Brand */}
        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">6. Category & Brand</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-white">Category *</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
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
            <div>
              <Label htmlFor="subCategory" className="text-white">Sub-Category *</Label>
              <select
                id="subCategory"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleInputChange}
                required
                disabled={!formData.category}
                className="mt-1 w-full px-3 py-2 bg-netflix-medium-gray border border-netflix-medium-gray rounded-md text-white focus:border-netflix-red disabled:opacity-50"
              >
                <option value="">Select sub-category</option>
                {formData.category && subCategories[formData.category]?.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="brand" className="text-white">7. Brand *</Label>
            <Input
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              required
              className="mt-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
              placeholder="Enter brand name"
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            8. Product Images
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-netflix-medium-gray"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-netflix-medium-gray rounded-lg cursor-pointer hover:border-netflix-red transition-colors">
              <Upload className="h-8 w-8 text-netflix-light-gray mb-2" />
              <span className="text-sm text-netflix-light-gray">Upload</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Stock & Business Settings */}
        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Stock & Business Settings</h2>
          
          <div>
            <Label htmlFor="stockQuantity" className="text-white">9. Stock Quantity *</Label>
            <Input
              id="stockQuantity"
              name="stockQuantity"
              type="number"
              value={formData.stockQuantity}
              onChange={handleInputChange}
              required
              min="0"
              className="mt-1 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
              placeholder="Enter stock quantity"
            />
          </div>

          <div>
            <Label className="text-white">10. Business Model *</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="businessModel"
                  value="b2b"
                  checked={formData.businessModel === "b2b"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-white">B2B</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="businessModel"
                  value="b2c"
                  checked={formData.businessModel === "b2c"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-white">B2C</span>
              </label>
            </div>
          </div>

          <div>
            <Label className="text-white">11. Target Clients *</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="targetClients"
                  value="local"
                  checked={formData.targetClients === "local"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-white">Local</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="targetClients"
                  value="international"
                  checked={formData.targetClients === "international"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-white">International</span>
              </label>
            </div>
          </div>

          <div>
            <Label className="text-white">12. Fulfillment *</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="fulfillment"
                  value="vendor"
                  checked={formData.fulfillment === "vendor"}
                  onChange={handleInputChange}
                  disabled={formData.targetClients === "international"}
                  className="mr-2"
                />
                <span className="text-white">Vendor Fulfillment</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="fulfillment"
                  value="bazaar"
                  checked={formData.fulfillment === "bazaar"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-white">The Bazaar Fulfillment</span>
              </label>
            </div>
            {formData.targetClients === "international" && (
              <p className="text-xs text-netflix-light-gray mt-2">
                International sales are fulfilled by The Bazaar only.
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/products")}
            className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-netflix-red hover:bg-[#c11119] text-white font-semibold"
          >
            <Save className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
