/**
 * KYC Wizard Component
 * Multi-step form for KYC/KYB verification
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import StatusBadge from "./StatusBadge";

type VendorType = "individual" | "business";

export default function KYCWizard() {
  const [vendorType, setVendorType] = useState<VendorType>("individual");
  const [step, setStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});

  const individualFields = [
    { key: "national_id_front", label: "National ID Front" },
    { key: "national_id_back", label: "National ID Back" },
    { key: "selfie_photo", label: "Selfie Photo" },
    { key: "bank_proof", label: "Bank Statement" },
    { key: "business_address", label: "Business Address Proof" },
    { key: "tax_pin", label: "Tax PIN Certificate" },
  ];

  const businessFields = [
    { key: "certificate_of_incorporation", label: "Certificate of Incorporation" },
    { key: "registration_number", label: "Business Registration Number" },
    { key: "business_license", label: "Business License" },
    { key: "bank_statement", label: "Bank Statement" },
    { key: "director_ids", label: "Director IDs" },
    { key: "tax_certificate", label: "Tax Certificate" },
  ];

  const fields = vendorType === "individual" ? individualFields : businessFields;

  const handleFileUpload = (key: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      alert("Only JPG, PNG, and PDF files are allowed");
      return;
    }
    setUploadedFiles({ ...uploadedFiles, [key]: file });
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(uploadedFiles).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });
    // Submit to API
    console.log("Submitting KYC documents", formData);
    // Redirect after submission
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">KYC/KYB Verification</h2>
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setVendorType("individual")}
            className={`px-4 py-2 rounded-md ${
              vendorType === "individual" ? "bg-[#E50914] text-white" : "bg-gray-200"
            }`}
          >
            Individual
          </button>
          <button
            onClick={() => setVendorType("business")}
            className={`px-4 py-2 rounded-md ${
              vendorType === "business" ? "bg-[#E50914] text-white" : "bg-gray-200"
            }`}
          >
            Business
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">{field.label}</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(field.key, file);
                }}
                className="hidden"
                id={field.key}
              />
              <label
                htmlFor={field.key}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200"
              >
                <Upload className="h-4 w-4" />
                Upload File
              </label>
              {uploadedFiles[field.key] && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {uploadedFiles[field.key]?.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-[#E50914] text-white rounded-md hover:bg-[#c11119]"
        >
          Submit for Review
        </button>
      </div>
    </div>
  );
}
