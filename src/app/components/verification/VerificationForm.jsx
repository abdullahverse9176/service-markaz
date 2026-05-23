"use client";

import { useState } from "react";
import { X, Upload, Loader2, CheckCircle, AlertCircle, FileImage } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

/**
 * VerificationForm Component
 * Multi-step form for uploading verification documents.
 * Handles file uploads to private S3 bucket and submission.
 */
export default function VerificationForm({ onClose }) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Success
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const [documents, setDocuments] = useState({
    cnicFront: null,
    cnicBack: null,
    businessProof: [],
    utilityBill: null,
  });

  const [previews, setPreviews] = useState({
    cnicFront: null,
    cnicBack: null,
    businessProof: [],
    utilityBill: null,
  });

  // Upload single file to private S3
  const uploadFile = async (file, fieldName) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "service-markaz/verifications");

    setUploadProgress((prev) => ({ ...prev, [fieldName]: 0 }));

    const res = await fetch("/api/upload-private", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Upload failed");
    }

    const data = await res.json();
    setUploadProgress((prev) => ({ ...prev, [fieldName]: 100 }));
    return data.data.key; // Returns S3 key
  };

  // Handle file selection
  const handleFileChange = async (e, fieldName, isMultiple = false) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file size (2MB max)
    const invalidFiles = files.filter((f) => f.size > 2 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error("Each file must be under 2 MB");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const invalidTypes = files.filter((f) => !validTypes.includes(f.type));
    if (invalidTypes.length > 0) {
      toast.error("Only JPG, PNG, and WebP images are allowed");
      return;
    }

    setUploading(true);

    try {
      if (isMultiple) {
        // Upload multiple files (business proof)
        const keys = await Promise.all(files.map((file) => uploadFile(file, fieldName)));
        setDocuments((prev) => ({
          ...prev,
          [fieldName]: [...prev[fieldName], ...keys],
        }));

        // Create previews
        const newPreviews = await Promise.all(
          files.map((file) => {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(file);
            });
          })
        );
        setPreviews((prev) => ({
          ...prev,
          [fieldName]: [...prev[fieldName], ...newPreviews],
        }));
      } else {
        // Upload single file
        const key = await uploadFile(files[0], fieldName);
        setDocuments((prev) => ({ ...prev, [fieldName]: key }));

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => ({ ...prev, [fieldName]: reader.result }));
        };
        reader.readAsDataURL(files[0]);
      }

      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  // Remove file
  const removeFile = (fieldName, index = null) => {
    if (index !== null) {
      // Remove from array (business proof)
      setDocuments((prev) => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index),
      }));
      setPreviews((prev) => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index),
      }));
    } else {
      // Remove single file
      setDocuments((prev) => ({ ...prev, [fieldName]: null }));
      setPreviews((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  // Submit verification
  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(documents),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Submission failed");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification-status"] });
      queryClient.invalidateQueries({ queryKey: ["my-business"] });
      setStep(3);
    },
    onError: (error) => {
      toast.error(error.message || "Submission failed");
    },
  });

  const handleSubmit = () => {
    // Validate all documents
    if (!documents.cnicFront || !documents.cnicBack || !documents.utilityBill) {
      toast.error("Please upload all required documents");
      return;
    }
    if (documents.businessProof.length === 0) {
      toast.error("Please upload at least one business proof document");
      return;
    }

    submitMutation.mutate();
  };

  const canProceed =
    documents.cnicFront &&
    documents.cnicBack &&
    documents.businessProof.length > 0 &&
    documents.utilityBill;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Business Verification</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {step === 1 && "Upload your documents"}
              {step === 2 && "Review your submission"}
              {step === 3 && "Verification submitted"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={submitMutation.isPending}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Upload Documents */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            {/* CNIC Front */}
            <FileUploadField
              label="CNIC Front Side"
              required
              file={previews.cnicFront}
              onFileChange={(e) => handleFileChange(e, "cnicFront")}
              onRemove={() => removeFile("cnicFront")}
              uploading={uploading && uploadProgress.cnicFront !== undefined}
              progress={uploadProgress.cnicFront}
            />

            {/* CNIC Back */}
            <FileUploadField
              label="CNIC Back Side"
              required
              file={previews.cnicBack}
              onFileChange={(e) => handleFileChange(e, "cnicBack")}
              onRemove={() => removeFile("cnicBack")}
              uploading={uploading && uploadProgress.cnicBack !== undefined}
              progress={uploadProgress.cnicBack}
            />

            {/* Business Proof */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Proof <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Upload registration certificate, license, shop photo, or selfie at shop (multiple files allowed)
              </p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {previews.businessProof.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Business proof ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeFile("businessProof", index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                <Upload size={18} className="text-gray-400" />
                <span className="text-sm text-gray-600">Add Business Proof</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, "businessProof", true)}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Utility Bill */}
            <FileUploadField
              label="Utility Bill (Address Verification)"
              required
              file={previews.utilityBill}
              onFileChange={(e) => handleFileChange(e, "utilityBill")}
              onRemove={() => removeFile("utilityBill")}
              uploading={uploading && uploadProgress.utilityBill !== undefined}
              progress={uploadProgress.utilityBill}
            />

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> All files will be converted to WebP format and stored securely. Maximum file size: 2 MB per file.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!canProceed || uploading}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review & Submit
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                Please review your documents before submitting. Once submitted, your request will be reviewed by our team.
              </p>
            </div>

            <div className="space-y-4">
              <ReviewItem label="CNIC Front" preview={previews.cnicFront} />
              <ReviewItem label="CNIC Back" preview={previews.cnicBack} />
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Business Proof ({documents.businessProof.length} files)</p>
                <div className="grid grid-cols-3 gap-2">
                  {previews.businessProof.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Business proof ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              </div>
              <ReviewItem label="Utility Bill" preview={previews.utilityBill} />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                disabled={submitMutation.isPending}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Review"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Submitted!</h3>
            <p className="text-gray-600 mb-6">
              Your verification request has been submitted successfully. Our team will review your documents and notify you once approved.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for file upload field
function FileUploadField({ label, required, file, onFileChange, onRemove, uploading, progress }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {file ? (
        <div className="relative group">
          <img
            src={file}
            alt={label}
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
          {uploading ? (
            <>
              <Loader2 size={24} className="text-blue-500 animate-spin mb-2" />
              <span className="text-sm text-gray-600">Uploading... {progress}%</span>
            </>
          ) : (
            <>
              <FileImage size={32} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Click to upload</span>
              <span className="text-xs text-gray-400 mt-1">Max 2 MB • JPG, PNG, WebP</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}

// Helper component for review item
function ReviewItem({ label, preview }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
      <img
        src={preview}
        alt={label}
        className="w-full h-32 object-cover rounded-lg border border-gray-200"
      />
    </div>
  );
}
