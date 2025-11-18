import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@thebazaar/ui/table";
import { Button } from "@thebazaar/ui/button";
import { AddProductDialog } from "./add-product-dialog";
import { Product } from "@thebazaar/types";

const mockProducts: Product[] = [
  { id: "1", name: "Classic T-Shirt", description: "A comfortable cotton t-shirt.", price: 25.99, stock: 100, image: "https://via.placeholder.com/150" },
  { id: "2", name: "Denim Jeans", description: "Stylish and durable denim jeans.", price: 79.99, stock: 50, image: "https://via.placeholder.com/150" },
  { id: "3", name: "Leather Jacket", description: "A cool leather jacket.", price: 199.99, stock: 20, image: "https://via.placeholder.com/150" },
];

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddProduct = (product: Omit<Product, 'id'>) => {
    setProducts([...products, { ...product, id: (products.length + 1).toString() }]);
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