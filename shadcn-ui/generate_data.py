import json
import random
import os
from datetime import datetime
from faker import Faker
from slugify import slugify

# --- Configuration ---
OUTPUT_DIR = "/workspace/shadcn-ui/src/data/mock"
NUM_VENDORS = 20
PRODUCTS_PER_VENDOR = 20
KES_TO_USD_RATE = 0.0077

# Initialize Faker
fake = Faker()

# --- Main Data Structures ---
categories_data = []
category_attributes_data = []
vendors_data = []
products_data = []
product_variants_data = []
leaf_categories = []

# --- Helper Functions ---
def generate_seo_metadata(name, entity_type="item"):
    return {
        "seo_title": f"Best {name} in Kenya | The Bazaar",
        "seo_description": f"Shop for high-quality {name} at The Bazaar. Fast delivery, great prices, and top-rated sellers.",
        "meta_keywords": f"{name}, {entity_type}, online shopping, kenya, {slugify(name, separator=',')}"
    }

def generate_slug(text):
    return slugify(text)

# --- 1. Generate Category Tree ---
def generate_categories():
    print("Generating category tree...")
    global categories_data, leaf_categories
    departments = {
        "Fashion & Apparel": ["Clothing", "Shoes", "Accessories", "Jewelry"],
        "Electronics": ["Computers & Laptops", "Mobile Phones & Accessories", "Cameras & Photography", "Audio & Video"],
        "Home & Kitchen": ["Home Décor", "Kitchen & Dining", "Furniture", "Bedding & Bath"],
        "Beauty & Cosmetics": ["Skincare", "Makeup", "Haircare", "Fragrances"],
        "Books & Education": ["Fiction", "Non-Fiction", "Textbooks", "Children's Books"],
        "Toys & Games": ["Action Figures", "Board Games", "Educational Toys", "Dolls"],
        "Sports & Outdoors": ["Fitness & Exercise", "Camping & Hiking", "Cycling", "Team Sports"],
        "Automotive & Tools": ["Car Care", "Power Tools", "Hand Tools", "Motorcycle Parts"],
        "Health & Personal Care": ["Vitamins & Supplements", "Personal Care Appliances", "Medical Supplies"],
        "Groceries & Gourmet Food": ["Pantry Staples", "Snacks", "Beverages", "Organic Foods"],
        "Office Products": ["Stationery", "Office Furniture", "Printers & Ink"],
        "Pet Supplies": ["Dog Supplies", "Cat Supplies", "Fish & Aquatic Pets"],
        "Music & Instruments": ["Guitars", "Keyboards", "DJ Equipment"],
        "Movies & TV": ["Blu-ray", "DVD", "Streaming"],
        "Garden & Outdoor": ["Gardening Tools", "Patio Furniture", "Grills & Outdoor Cooking"],
        "Handmade Products": ["Crafts", "Artisan Jewelry", "Handmade Decor"],
        "Industrial & Scientific": ["Lab Equipment", "Janitorial Supplies", "Test & Measurement"],
        "Baby Products": ["Diapering", "Baby Gear", "Nursery"],
        "Software": ["Business Software", "Antivirus", "Operating Systems"],
        "Video Games": ["PlayStation", "Xbox", "Nintendo Switch"]
    }

    category_id_counter = 1000
    for dept_name, cats in departments.items():
        dept_id = category_id_counter
        categories_data.append({
            "id": dept_id, "parent_id": None, "slug": generate_slug(dept_name),
            "name": dept_name, "level": 1, **generate_seo_metadata(dept_name, "department")
        })
        category_id_counter += 100

        for cat_name in cats:
            cat_id = category_id_counter
            categories_data.append({
                "id": cat_id, "parent_id": dept_id, "slug": generate_slug(cat_name),
                "name": cat_name, "level": 2, **generate_seo_metadata(cat_name, "category")
            })
            category_id_counter += 10

            sub_cat_name = f"{cat_name} General"
            sub_cat_id = category_id_counter
            categories_data.append({
                "id": sub_cat_id, "parent_id": cat_id, "slug": generate_slug(sub_cat_name),
                "name": sub_cat_name, "level": 3, **generate_seo_metadata(sub_cat_name, "subcategory")
            })
            category_id_counter += 1

            leaf_node = {
                "id": sub_cat_id, "parent_id": cat_id, "slug": generate_slug(sub_cat_name),
                "name": sub_cat_name, "level": 3, **generate_seo_metadata(sub_cat_name, "products")
            }
            leaf_categories.append(leaf_node)
    print(f"Generated {len(categories_data)} categories and sub-categories.")

# --- 2. Generate Category Attributes (JSON format as requested) ---
def generate_category_attributes():
    print("Generating category attributes...")
    global category_attributes_data
    base_attributes = {
        "Fashion & Apparel": {"canonical": ["brand", "color", "size", "material", "gender"], "optional": ["pattern", "occasion", "origin"]},
        "Electronics": {"canonical": ["brand", "model", "color", "storage_capacity"], "optional": ["screen_size", "features", "year"]},
        "Home & Kitchen": {"canonical": ["brand", "material", "color", "dimensions"], "optional": ["style", "weight", "capacity"]},
        "Beauty & Cosmetics": {"canonical": ["brand", "skin_type", "item_form", "finish_type"], "optional": ["scent", "volume", "spf"]},
        "default": {"canonical": ["brand", "color", "material"], "optional": ["weight", "dimensions", "origin"]}
    }
    
    for leaf_cat in leaf_categories:
        parent_cat = next((c for c in categories_data if c["id"] == leaf_cat["parent_id"]), None)
        if not parent_cat: continue
        parent_dept = next((c for c in categories_data if c["id"] == parent_cat["parent_id"]), None)
        if not parent_dept: continue
        
        attrs = base_attributes.get(parent_dept["name"], base_attributes["default"])
        category_attributes_data.append({
            "category_id": leaf_cat["id"],
            "attributes": attrs
        })
    print(f"Generated attributes for {len(leaf_categories)} leaf categories.")

# --- 3. Generate Vendors (JSON format as requested) ---
def generate_vendors():
    print("Generating vendors...")
    global vendors_data
    departments = [c for c in categories_data if c["level"] == 1]
    dept_map = {d['name']: d['id'] for d in departments}

    vendor_distribution = {
        "Fashion & Apparel": 0.20, "Electronics": 0.15, "Home & Kitchen": 0.20,
        "Beauty & Cosmetics": 0.10, "Furniture & Bedding": 0.10, "Stationery & Office": 0.05,
        "Books & Education": 0.05, "Toys & Games": 0.05, "Automotive & Tools": 0.05
    }
    
    assigned_depts = []
    
    # Handle combined categories for distribution logic
    num_fashion = round(NUM_VENDORS * vendor_distribution["Fashion & Apparel"])
    assigned_depts.extend([dept_map["Fashion & Apparel"]] * num_fashion)
    
    num_electronics = round(NUM_VENDORS * vendor_distribution["Electronics"])
    assigned_depts.extend([dept_map["Electronics"]] * num_electronics)

    num_home = round(NUM_VENDORS * (vendor_distribution["Home & Kitchen"] + vendor_distribution.get("Furniture & Bedding", 0)))
    assigned_depts.extend([dept_map["Home & Kitchen"]] * num_home)

    # Assign remaining categories
    for dept_name, percentage in vendor_distribution.items():
        if dept_name not in ["Fashion & Apparel", "Electronics", "Home & Kitchen", "Furniture & Bedding"]:
            dept_id = dept_map.get(dept_name)
            if dept_id:
                num_vendors_for_dept = round(NUM_VENDORS * percentage)
                assigned_depts.extend([dept_id] * num_vendors_for_dept)

    while len(assigned_depts) < NUM_VENDORS:
        assigned_depts.append(random.choice(departments)['id'])
    
    assigned_depts = assigned_depts[:NUM_VENDORS]
    random.shuffle(assigned_depts)

    for i in range(NUM_VENDORS):
        vendor_id = f"vend_{1001 + i}"
        business_name = fake.company()
        slug = generate_slug(business_name)
        dept_id = assigned_depts[i]
        dept_name = next(d['name'] for d in departments if d['id'] == dept_id)
        
        vendor = {
            "vendor_id": vendor_id, "slug": slug, "business_name": business_name,
            "email": f"{slug.replace('-', '')}@thebazaar.com",
            "profile_url": f"https://thebazaar.com/vendors/{slug}",
            "department_focus": dept_name,
            "rating": round(random.uniform(3.5, 5.0), 1),
            "established_year": random.randint(2010, 2022),
            "kyc_status": "verified",
            "seo_metadata": generate_seo_metadata(business_name, "vendor")
        }
        vendors_data.append(vendor)
    print(f"Generated {len(vendors_data)} vendors.")

# --- 4 & 5. Generate Products and Variants (JSON format as requested) ---
def generate_products_and_variants():
    print("Generating products and variants...")
    global products_data, product_variants_data
    product_id_counter = 50001
    variant_id_counter = 80001
    
    for vendor in vendors_data:
        vendor_dept_focus_name = vendor['department_focus']
        vendor_dept_id = next((c['id'] for c in categories_data if c['name'] == vendor_dept_focus_name and c['level'] == 1), None)

        primary_dept_cats = [c['id'] for c in categories_data if c['parent_id'] == vendor_dept_id]
        primary_dept_leaf_cats = [lc['id'] for lc in leaf_categories if lc['parent_id'] in primary_dept_cats]
        
        secondary_leaf_cats = [c['id'] for c in leaf_categories if c['id'] not in primary_dept_leaf_cats]

        for i in range(PRODUCTS_PER_VENDOR):
            # Assign category based on vendor's focus
            if i < (PRODUCTS_PER_VENDOR * 0.8) and primary_dept_leaf_cats:
                category_id = random.choice(primary_dept_leaf_cats)
            elif secondary_leaf_cats:
                category_id = random.choice(secondary_leaf_cats)
            elif primary_dept_leaf_cats: # Fallback to primary if secondary is empty
                category_id = random.choice(primary_dept_leaf_cats)
            else: # Fallback if no categories are found at all
                category_id = random.choice(leaf_categories)['id']
            
            cat_name = next(c['name'] for c in categories_data if c['id'] == category_id)
            product_base_name = ' '.join(fake.words(nb=2)).title()
            product_name = f"{product_base_name} {cat_name.replace(' General', '')}"
            slug = generate_slug(f"{vendor['business_name']} {product_name}")
            price_kes = round(random.uniform(500, 50000), -2)
            product_id = f"prod_{product_id_counter}"
            variant_group_id = f"vargrp_{product_id_counter}"

            image_search_term = slugify(cat_name.replace(' General', ''), separator='+')
            image_urls = [f"https://source.unsplash.com/600x600/?{image_search_term}" for _ in range(3)]
            
            products_data.append({
                "product_id": product_id, "vendor_id": vendor["vendor_id"], "category_id": category_id,
                "slug": slug, "title": product_name, "description": fake.paragraph(nb_sentences=5),
                "price_kes": price_kes, "price_usd": round(price_kes * KES_TO_USD_RATE, 2),
                "stock": random.randint(0, 200),
                "rating": round(random.uniform(3.0, 5.0), 1),
                "featured": random.choice([True, False]),
                "image_urls": image_urls,
                "seo_metadata": generate_seo_metadata(product_name, "product")
            })
            product_id_counter += 1

            colors = ["Red", "Blue", "Green", "Black", "White", "Silver", "Gold"]
            sizes = ["XS", "S", "M", "L", "XL"]
            num_variants = random.randint(1, 3)
            
            for j in range(num_variants):
                variant_id = f"var_{variant_id_counter}"
                sku = f"SKU-{product_id}-{variant_id_counter}"
                attributes = {"color": random.choice(colors), "size": random.choice(sizes)}
                
                variant_price_kes = max(100, price_kes + round(random.uniform(-500, 500), -2))

                product_variants_data.append({
                    "variant_id": variant_id,
                    "variant_group_id": variant_group_id,
                    "product_id": product_id,
                    "sku": sku,
                    "attributes": attributes,
                    "price_kes": variant_price_kes,
                    "stock": random.randint(5, 50)
                })
                variant_id_counter += 1
    print(f"Generated {len(products_data)} products and {len(product_variants_data)} variants.")

# --- 6. Write to Files ---
def write_files():
    print(f"Writing files to {OUTPUT_DIR}...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    file_map = {
        "category_tree.json": categories_data,
        "category_attributes.json": category_attributes_data,
        "vendors.json": vendors_data,
        "products.json": products_data,
        "product_variants.json": product_variants_data
    }

    for filename, data in file_map.items():
        path = os.path.join(OUTPUT_DIR, filename)
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"  - Wrote {len(data)} records to {filename}")

# --- Main Execution ---
def main():
    generate_categories()
    generate_category_attributes()
    generate_vendors()
    generate_products_and_variants()
    write_files()
    print("\nMock data generation complete.")

main()