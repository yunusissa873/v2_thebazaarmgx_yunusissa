/**
 * File Uploader Component
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText } from "lucide-react";

interface FileUploaderProps {
  accept?: string;
  maxSize?: number; // in bytes
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  label?: string;
  required?: boolean;
}

export default function FileUploader({
  accept = "image/jpeg,image/png,application/pdf",
  maxSize = 5 * 1024 * 1024, // 5MB default
  onFileSelect,
  onRemove,
  label,
  required = false,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);

    // Validate file size
    if (selectedFile.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    // Validate file type
    const acceptTypes = accept.split(",").map((t) => t.trim());
    if (!acceptTypes.some((type) => selectedFile.type.match(type.replace("*", ".*")))) {
      setError("Invalid file type. Please upload JPG, PNG, or PDF files.");
      return;
    }

    setFile(selectedFile);
    onFileSelect(selectedFile);
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onRemove?.();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id={`file-upload-${label?.replace(/\s+/g, "-")}`}
        />
        {!file ? (
          <label
            htmlFor={`file-upload-${label?.replace(/\s+/g, "-")}`}
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
            <span className="text-xs text-gray-500 mt-1">JPG, PNG, or PDF (max {Math.round(maxSize / 1024 / 1024)}MB)</span>
          </label>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-900">{file.name}</span>
              <span className="text-xs text-gray-500">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
