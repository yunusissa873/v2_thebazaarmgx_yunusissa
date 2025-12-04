import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AddProductDialog } from "./add-product-dialog";
import { Product } from "@/types";

const mockProducts: Product[] = [
  { 
    id: "1", 
    product_id: "prod_1",
    name: "Classic T-Shirt", 
    description: "A comfortable cotton t-shirt.", 
    price: 25.99, 
    stock: 100, 
    image: "https://via.placeholder.com/150",
    vendor_id: "vend_1",
    category_id: 1,
    slug: "classic-t-shirt",
    price_usd: 25.99,
    brand: "Unknown",
    seo_title: "Classic T-Shirt",
    seo_description: "A comfortable cotton t-shirt.",
    image_urls: ["https://via.placeholder.com/150"]
  },
  { 
    id: "2", 
    product_id: "prod_2",
    name: "Denim Jeans", 
    description: "Stylish and durable denim jeans.", 
    price: 79.99, 
    stock: 50, 
    image: "https://via.placeholder.com/150",
    vendor_id: "vend_1",
    category_id: 1,
    slug: "denim-jeans",
    price_usd: 79.99,
    brand: "Unknown",
    seo_title: "Denim Jeans",
    seo_description: "Stylish and durable denim jeans.",
    image_urls: ["https://via.placeholder.com/150"]
  },
  { 
    id: "3", 
    product_id: "prod_3",
    name: "Leather Jacket", 
    description: "A cool leather jacket.", 
    price: 199.99, 
    stock: 20, 
    image: "https://via.placeholder.com/150",
    vendor_id: "vend_1",
    category_id: 1,
    slug: "leather-jacket",
    price_usd: 199.99,
    brand: "Unknown",
    seo_title: "Leather Jacket",
    seo_description: "A cool leather jacket.",
    image_urls: ["https://via.placeholder.com/150"]
  },
];

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddProduct = (product: Omit<Product, 'id' | 'product_id' | 'vendor_id' | 'category_id' | 'slug' | 'price_usd' | 'brand' | 'seo_title' | 'seo_description' | 'image_urls'>) => {
    const newProduct: Product = {
      ...product,
      id: (products.length + 1).toString(),
      product_id: `prod_${products.length + 1}`,
      vendor_id: "vend_1",
      category_id: 1,
      slug: product.name.toLowerCase().replace(/\s+/g, '-'),
      price_usd: product.price,
      brand: "Unknown",
      seo_title: product.name,
      seo_description: product.description,
      image_urls: [product.image]
    };
    setProducts([...products, newProduct]);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsDialogOpen(true)}>Add Product</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <img src={product.image} alt={product.name} className="h-16 w-16 object-cover rounded-md" />
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.description}</TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
              <TableCell>{product.stock}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AddProductDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
};

export default ProductList;