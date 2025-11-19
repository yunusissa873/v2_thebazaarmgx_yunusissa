import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@thebazaar/ui/dialog";
import { Button } from "@thebazaar/ui/button";
import { Input } from "@thebazaar/ui/input";
import { Label } from "@thebazaar/ui/label";
import { Product } from "@thebazaar/types";

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, "image">, id?: string) => void;
  productToEdit?: Product | null;
}

export function ProductDialog({ isOpen, onClose, onSave, productToEdit }: ProductDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  const isEditing = !!productToEdit;

  useEffect(() => {
    if (isEditing) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setPrice(productToEdit.price.toString());
      setStock(productToEdit.stock.toString());
    } else {
      // Reset form when opening for a new product
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
    }
  }, [productToEdit, isEditing, isOpen]);

  useEffect(() => {
    setIsFormValid(name.trim() !== "" && description.trim() !== "" && price.trim() !== "" && stock.trim() !== "");
  }, [name, description, price, stock]);

  const handleSubmit = () => {
    if (!isFormValid) return;

    const productData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
    };

    onSave(productData, productToEdit?.id);

    // Reset form and close dialog
    onClose();
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of your product." : "Fill in the details below to add a new product to your store."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Artisan Mug"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 19.99"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">
              Stock
            </Label>
            <Input
              id="stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="e.g., 100"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={!isFormValid}>
            {isEditing ? "Save Changes" : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}