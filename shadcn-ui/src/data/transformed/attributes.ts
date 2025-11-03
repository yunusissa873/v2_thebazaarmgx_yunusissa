// Auto-generated attributes data
export interface ProductAttribute {
  attribute_id: string;
  name: string;
  slug: string;
  type: 'text' | 'select' | 'number';
  is_filterable: boolean;
  is_required: boolean;
  description: string;
  options?: string[];
  created_at: string;
  updated_at: string;
}

const attributes: ProductAttribute[] = [
  {
    attribute_id: 'attr_01',
    name: 'Brand',
    slug: 'brand',
    type: 'text',
    is_filterable: true,
    is_required: false,
    description: 'Product brand or manufacturer name',
    created_at: '2024-11-02T00:00:00Z',
    updated_at: '2024-11-02T00:00:00Z',
  },
  {
    attribute_id: 'attr_02',
    name: 'Color',
    slug: 'color',
    type: 'select',
    is_filterable: true,
    is_required: false,
    description: 'Product color',
    options: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Silver', 'Gold', 'Gray', 'Brown', 'Pink', 'Purple', 'Orange'],
    created_at: '2024-11-02T00:00:00Z',
    updated_at: '2024-11-02T00:00:00Z',
  },
  {
    attribute_id: 'attr_03',
    name: 'Storage Capacity',
    slug: 'storage-capacity',
    type: 'select',
    is_filterable: true,
    is_required: false,
    description: 'Storage capacity for electronic devices',
    options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'],
    created_at: '2024-11-02T00:00:00Z',
    updated_at: '2024-11-02T00:00:00Z',
  },
  {
    attribute_id: 'attr_04',
    name: 'Screen Size',
    slug: 'screen-size',
    type: 'select',
    is_filterable: true,
    is_required: false,
    description: 'Screen size in inches',
    options: ['5.0"', '5.5"', '6.0"', '6.1"', '6.5"', '6.7"', '13"', '14"', '15"', '15.6"', '16"', '17"', '21"', '24"', '27"', '32"'],
    created_at: '2024-11-02T00:00:00Z',
    updated_at: '2024-11-02T00:00:00Z',
  },
  {
    attribute_id: 'attr_05',
    name: 'Size',
    slug: 'size',
    type: 'select',
    is_filterable: true,
    is_required: false,
    description: 'Product size (clothing, shoes, etc.)',
    options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size'],
    created_at: '2024-11-02T00:00:00Z',
    updated_at: '2024-11-02T00:00:00Z',
  },
  {
    attribute_id: 'attr_07',
    name: 'RAM',
    slug: 'ram',
    type: 'select',
    is_filterable: true,
    is_required: false,
    description: 'RAM capacity for electronic devices',
    options: ['2GB', '4GB', '6GB', '8GB', '12GB', '16GB', '32GB', '64GB'],
    created_at: '2024-11-02T00:00:00Z',
    updated_at: '2024-11-02T00:00:00Z',
  },
];

export default attributes;

