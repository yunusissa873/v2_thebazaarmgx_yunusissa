export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  // Add other product properties as needed
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  // Add other vendor properties as needed
}