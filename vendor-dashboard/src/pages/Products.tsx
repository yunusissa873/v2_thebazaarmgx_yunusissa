import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductDialog } from "@/components/ProductDialog";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { Product } from "@/types";
import mockProductsData from "@/data/products.json";

// Define a type for the raw product data from the JSON file
interface RawProduct {
  product_id: string;
  title: string;
  description: string;
  price_kes: number;
  stock: number;
  image_urls: string[];
  vendor_id: string;
  category_id: number;
  slug: string;
  price_usd: number;
  seo_metadata?: {
    seo_title?: string;
    seo_description?: string;
  };
}

// Helper to transform raw mock data into the Product type our components expect
const transformMockProduct = (mockProduct: RawProduct): Product => ({
  ...mockProduct,
  id: mockProduct.product_id,
  name: mockProduct.title,
  price: mockProduct.price_kes,
  image: mockProduct.image_urls?.[0] || "https://via.placeholder.com/40", // Use first image or a placeholder
  brand: "Unknown", // Default brand
  seo_title: mockProduct.seo_metadata?.seo_title || mockProduct.title,
  seo_description: mockProduct.seo_metadata?.seo_description || mockProduct.description,
});

const initialProducts: Product[] = (mockProductsData as unknown as RawProduct[]).map(transformMockProduct);

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isProductDialogOpen, setProductDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleSaveProduct = (productData: Omit<Product, "id" | "image" | "product_id" | "vendor_id" | "category_id" | "slug" | "price_usd" | "brand" | "seo_title" | "seo_description" | "image_urls">, id?: string) => {
    if (id) {
      // Editing existing product
      setProducts(
        products.map((p) =>
          p.id === id ? { ...p, ...productData } : p
        )
      );
    } else {
      // Adding new product
      const newProduct: Product = {
        ...productData,
        id: crypto.randomUUID(), // Generate a unique ID for the new product
        product_id: crypto.randomUUID(),
        image: "https://via.placeholder.com/40", // Placeholder image
        // Add other required fields with default values
        vendor_id: "new-vendor",
        category_id: 0,
        slug: productData.name.toLowerCase().replace(/\s+/g, '-'),
        price_usd: productData.price / 110, // Example conversion
        brand: "Unknown",
        seo_title: productData.name,
        seo_description: productData.description,
        image_urls: ["https://via.placeholder.com/40"],
      };
      setProducts([newProduct, ...products]);
    }
  };

  const handleAddClick = () => {
    setProductToEdit(null);
    setProductDialogOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setProductDialogOpen(true);
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      setProducts(products.filter((p) => p.id !== productToDelete));
      setProductToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setProductToDelete(null);
    setDeleteDialogOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={handleAddClick}>Add Product</Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price (KES)</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/40'; }} // Fallback image
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                <TableCell>KES {product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(product)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(product.id)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ProductDialog
        isOpen={isProductDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}