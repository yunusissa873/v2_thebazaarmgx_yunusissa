/**
 * Attributes Data Transformation Script
 */

import fs from 'fs';
import path from 'path';

export function transformAttributes() {
  console.log('Transforming attributes...');
  
  const attributes = [
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
      attribute_id: 'attr_06',
      name: 'Material',
      slug: 'material',
      type: 'select',
      is_filterable: true,
      is_required: false,
      description: 'Product material composition',
      options: ['Cotton', 'Polyester', 'Leather', 'Synthetic', 'Metal', 'Plastic', 'Wood', 'Glass', 'Ceramic', 'Fabric', 'Rubber', 'Silk', 'Wool', 'Denim', 'Canvas'],
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
    {
      attribute_id: 'attr_09',
      name: 'Graphics Card',
      slug: 'graphics-card',
      type: 'text',
      is_filterable: true,
      is_required: false,
      description: 'Graphics card model for gaming laptops and computers',
      created_at: '2024-11-02T00:00:00Z',
      updated_at: '2024-11-02T00:00:00Z',
    },
    {
      attribute_id: 'attr_10',
      name: 'Pattern',
      slug: 'pattern',
      type: 'select',
      is_filterable: true,
      is_required: false,
      description: 'Fabric or design pattern',
      options: ['Solid', 'Striped', 'Checked', 'Plaid', 'Floral', 'Geometric', 'Abstract', 'Print', 'Paisley', 'Polka Dot'],
      created_at: '2024-11-02T00:00:00Z',
      updated_at: '2024-11-02T00:00:00Z',
    },
    {
      attribute_id: 'attr_12',
      name: 'Age Range',
      slug: 'age-range',
      type: 'select',
      is_filterable: true,
      is_required: false,
      description: 'Recommended age range for baby/kids products',
      options: ['0-6 months', '6-12 months', '12-24 months', '2-3 years', '3-5 years', '5-8 years', '8-12 years', '12+ years'],
      created_at: '2024-11-02T00:00:00Z',
      updated_at: '2024-11-02T00:00:00Z',
    },
    {
      attribute_id: 'attr_16',
      name: 'Skin Type',
      slug: 'skin-type',
      type: 'select',
      is_filterable: true,
      is_required: false,
      description: 'Recommended skin type for skincare products',
      options: ['All Skin Types', 'Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'],
      created_at: '2024-11-02T00:00:00Z',
      updated_at: '2024-11-02T00:00:00Z',
    },
    {
      attribute_id: 'attr_17',
      name: 'SPF',
      slug: 'spf',
      type: 'select',
      is_filterable: true,
      is_required: false,
      description: 'Sun Protection Factor',
      options: ['SPF 15', 'SPF 30', 'SPF 50', 'SPF 50+', 'No SPF'],
      created_at: '2024-11-02T00:00:00Z',
      updated_at: '2024-11-02T00:00:00Z',
    },
  ];
  
  const outputDir = path.join(__dirname, '../src/data/transformed');
  
  const tsContent = `// Auto-generated attributes data
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

const attributes: ProductAttribute[] = ${JSON.stringify(attributes, null, 2)};

export default attributes;
`;
  
  fs.writeFileSync(path.join(outputDir, 'attributes.ts'), tsContent);
  fs.writeFileSync(
    path.join(outputDir, 'attributes_flat.json'),
    JSON.stringify(attributes, null, 2)
  );
  
  console.log(`   ✅ Created ${attributes.length} attributes`);
}

