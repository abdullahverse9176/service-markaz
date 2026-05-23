"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, CheckCircle, XCircle, Clock, AlertCircle, Eye, FileText } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  approved: "bg-green-50 text-green-700 ring-1 ring-green-200",
  rejected: "bg-red-50 text-red-600 ring-1 ring-red-200",
  resubmission_required: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
};

const STATUS_ICON = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  resubmission_required: AlertCircle,
};

const PAGE_SIZE = 10;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function VerificationsPage() {
  const { token } = useAuth();

  const [verifications, setVerifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0, resubmission_required: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Reset to page 1 whenever filter changes
  useEffect(() => { setPage(1); }, [statusFilter]);

  const fetchVerifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page, limit: PAGE_SIZE });
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/verifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setVerifications(json.data.verifications);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
        setSummary(json.data.summary);
      } else {
        setError(json.message || "Failed to load verifications.");
      }
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter]);

  useEffect(() => { fetchVerifications(); }, [fetchVerifications]);

  const handleReview = (verification) => {
    setSelectedVerification(verification);
    setShowReviewModal(true);
  };

  const summaryCards = [
    { label: "Total Requests", value: total, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending", value: summary.pending, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Approved", value: summary.approved, color: "text-green-600", bg: "bg-green-50" },
    { label: "Rejected", value: summary.rejected, color: "text-red-600", bg: "bg-red-50" },
  ];

  const pages = buildPageList(page, totalPages);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Business Verifications</h2>
          <p className="text-sm text-gray-500 mt-0.5">Review and approve business verification requests.</p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryCards.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl px-5 py-4 border border-white`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-gray-100">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="resubmission_required">Resubmission Required</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
                <th className="px-6 py-3 text-left">Business</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Submitted</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    <p className="text-sm">Loading verifications…</p>
                  </td>
                </tr>
              ) : verifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No verification requests found.
                  </td>
                </tr>
              ) : (
                verifications.map((v) => {
                  const StatusIcon = STATUS_ICON[v.status];
                  return (
                    <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {v.business?.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{v.business?.name || "N/A"}</p>
                            <p className="text-xs text-gray-400">{v.business?.email || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-gray-600 font-medium">{v.business?.owner?.name || "N/A"}</p>
                        <p className="text-xs text-gray-400">{v.business?.owner?.email || "N/A"}</p>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 text-xs font-medium">
                        {v.business?.category || "N/A"}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 text-xs">
                        {new Date(v.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${STATUS_STYLE[v.status] ?? ""}`}>
                          <StatusIcon size={12} />
                          {v.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleReview(v)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                        >
                          <Eye size={14} />
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{verifications.length}</span> of{" "}
              <span className="font-semibold text-gray-700">{total}</span> requests
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-sm rounded-lg text-gray-500 hover:bg-gray-100 transition disabled:opacity-40"
              >
                Prev
              </button>
              {pages.map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1.5 text-sm rounded-lg font-semibold transition ${
                      p === page ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm rounded-lg text-gray-500 hover:bg-gray-100 transition disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedVerification && (
        <ReviewModal
          verification={selectedVerification}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedVerification(null);
          }}
          onSuccess={() => {
            fetchVerifications();
            setShowReviewModal(false);
            setSelectedVerification(null);
          }}
          token={token}
        />
      )}
    </div>
  );
}

// Review Modal Component
function ReviewModal({ verification, onClose, onSuccess, token }) {
  const [action, setAction] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!action) {
      toast.error("Please select an action");
      return;
    }

    if ((action === "reject" || action === "request_resubmission") && !rejectionReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/verification", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          verificationId: verification._id,
          action,
          rejectionReason: rejectionReason.trim(),
          adminNotes: adminNotes.trim(),
        }),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(
          action === "approve"
            ? "Verification approved successfully"
            : action === "reject"
            ? "Verification rejected"
            : "Resubmission requested"
        );
        onSuccess();
      } else {
        toast.error(json.message || "Action failed");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const isPending = verification.status === "pending";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Review Verification</h2>
            <p className="text-sm text-gray-500 mt-0.5">{verification.business?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={submitting}
          >
            <XCircle size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Business Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Business Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Business Name</p>
                <p className="font-medium text-gray-900">{verification.business?.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Category</p>
                <p className="font-medium text-gray-900">{verification.business?.category}</p>
              </div>
              <div>
                <p className="text-gray-500">Owner</p>
                <p className="font-medium text-gray-900">{verification.business?.owner?.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{verification.business?.owner?.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{verification.business?.phone}</p>
              </div>
              <div>
                <p className="text-gray-500">City</p>
                <p className="font-medium text-gray-900">{verification.business?.city}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Submitted Documents</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* CNIC Front */}
              <DocumentPreview
                label="CNIC Front"
                url={verification.documentUrls?.cnicFront}
                error={verification.urlError}
              />
              {/* CNIC Back */}
              <DocumentPreview
                label="CNIC Back"
                url={verification.documentUrls?.cnicBack}
                error={verification.urlError}
              />
              {/* Business Proof */}
              {verification.documentUrls?.businessProof?.map((url, index) => (
                <DocumentPreview
                  key={index}
                  label={`Business Proof ${index + 1}`}
                  url={url}
                  error={verification.urlError}
                />
              ))}
              {/* Utility Bill */}
              <DocumentPreview
                label="Utility Bill"
                url={verification.documentUrls?.utilityBill}
                error={verification.urlError}
              />
            </div>
          </div>

          {/* Review Section (only for pending) */}
          {isPending && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Review Action</h3>
              
              {/* Action Selection */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setAction("approve")}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-semibold transition ${
                    action === "approve"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <CheckCircle size={18} className="inline mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => setAction("request_resubmission")}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-semibold transition ${
                    action === "request_resubmission"
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <AlertCircle size={18} className="inline mr-2" />
                  Request Resubmission
                </button>
                <button
                  onClick={() => setAction("reject")}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-semibold transition ${
                    action === "reject"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <XCircle size={18} className="inline mr-2" />
                  Reject
                </button>
              </div>

              {/* Reason (for reject/resubmission) */}
              {(action === "reject" || action === "request_resubmission") && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why the verification is being rejected or what needs to be corrected..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    rows={3}
                  />
                </div>
              )}

              {/* Admin Notes (optional) */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes (not visible to provider)..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  rows={2}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting || !action}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          )}

          {/* Already Reviewed */}
          {!isPending && (
            <div className="border-t border-gray-100 pt-6">
              <div className={`p-4 rounded-xl ${STATUS_STYLE[verification.status]}`}>
                <p className="text-sm font-semibold mb-1">
                  Status: {verification.status.replace(/_/g, " ").toUpperCase()}
                </p>
                {verification.rejectionReason && (
                  <p className="text-sm">Reason: {verification.rejectionReason}</p>
                )}
                {verification.reviewedBy && (
                  <p className="text-xs mt-2">
                    Reviewed by {verification.reviewedBy.name} on{" "}
                    {new Date(verification.reviewedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Document Preview Component
function DocumentPreview({ label, url, error }) {
  const [imageError, setImageError] = useState(false);

  if (error || !url) {
    return (
      <div className="border border-gray-200 rounded-xl p-4 text-center">
        <FileText size={32} className="text-gray-400 mx-auto mb-2" />
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xs text-red-500 mt-1">Failed to load</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-700">{label}</p>
      </div>
      {imageError ? (
        <div className="p-4 text-center">
          <FileText size={32} className="text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-red-500">Failed to load image</p>
        </div>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
          <img
            src={url}
            alt={label}
            className="w-full h-48 object-cover group-hover:opacity-90 transition"
            onError={() => setImageError(true)}
          />
          <div className="bg-blue-600 text-white text-xs font-semibold py-2 text-center opacity-0 group-hover:opacity-100 transition">
            Click to view full size
          </div>
        </a>
      )}
    </div>
  );
}
