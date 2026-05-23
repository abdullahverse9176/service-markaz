"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  MessageSquare, Search, Eye, Trash2, Reply,
  X, Send, CheckCheck, Loader2, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { subjectLabelMap } from "@/lib/contact/constants";

const LIMIT = 10;

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({ value, label, colorClass }) {
  return (
    <div className={`${colorClass} rounded-2xl px-5 py-4`}>
      <p className="text-2xl font-bold">{value ?? "—"}</p>
      <p className="text-sm text-gray-600 mt-0.5">{label}</p>
    </div>
  );
}

function MessageRow({ msg, onView, onDelete, onToggleRead }) {
  return (
    <div
      className={`flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
        msg.status === "unread" ? "bg-blue-50/30" : ""
      }`}
    >
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {msg.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className={`text-sm font-semibold ${msg.status === "unread" ? "text-gray-900" : "text-gray-700"}`}>
            {msg.name}
          </span>
          <span className="text-xs text-gray-400">{msg.email}</span>
          {msg.status === "unread" && (
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" title="Unread" />
          )}
        </div>
        <p className={`text-sm truncate ${msg.status === "unread" ? "font-semibold text-gray-800" : "text-gray-600"}`}>
          {subjectLabelMap[msg.subject] ?? msg.subject}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{msg.message}</p>
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className="text-xs text-gray-400">{formatDate(msg.createdAt)}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(msg)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
            title="View & Reply"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => onToggleRead(msg)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition"
            title={msg.status === "unread" ? "Mark as Read" : "Mark as Unread"}
          >
            <CheckCheck size={14} />
          </button>
          <button
            onClick={() => onDelete(msg._id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageModal({ msg, token, onClose, onReplied, onDeleted }) {
  const [replyText, setReplyText] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | sent | error
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  async function handleReply(e) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setState("sending");
    try {
      const res = await fetch(`/api/admin/messages/${msg._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: "reply", replyText }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      setState("sent");
      onReplied(msg._id);
    } catch {
      setState("error");
    }
  }

  async function handleDelete() {
    const res = await fetch(`/api/admin/messages/${msg._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok && json.success) {
      onDeleted(msg._id);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600" />
            <span className="font-semibold text-gray-800 text-sm">Message Details</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
              {msg.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{msg.name}</p>
              <p className="text-xs text-gray-500">{msg.email}{msg.phone ? ` · ${msg.phone}` : ""}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Subject</p>
            <p className="text-sm text-gray-800 font-medium">{subjectLabelMap[msg.subject] ?? msg.subject}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Message</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl p-3 border border-gray-100">
              {msg.message}
            </p>
          </div>

          <p className="text-xs text-gray-400">{formatDate(msg.createdAt)}</p>

          {/* Reply */}
          {state !== "sent" ? (
            <form onSubmit={handleReply} className="space-y-3 pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                <Reply size={13} /> Reply to {msg.email}
              </p>
              <textarea
                ref={textareaRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                placeholder="Type your reply here…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              {state === "error" && (
                <p className="flex items-center gap-1.5 text-xs text-red-500">
                  <AlertCircle size={13} /> Failed to send. Try again.
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm rounded-lg text-red-500 hover:bg-red-50 transition font-medium"
                >
                  Delete
                </button>
                <button
                  type="submit"
                  disabled={state === "sending" || !replyText.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {state === "sending" ? (
                    <><Loader2 size={14} className="animate-spin" /> Sending…</>
                  ) : (
                    <><Send size={14} /> Send Reply</>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
              <CheckCheck size={16} /> Reply sent successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState({ total: 0, unread: 0, read: 0 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/messages?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);

      setMessages(json.data.messages);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
      setSummary(json.data.summary);
    } catch (err) {
      setError(err.message || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, [token, page, search, statusFilter]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  async function handleToggleRead(msg) {
    const newStatus = msg.status === "unread" ? "read" : "unread";
    const res = await fetch(`/api/admin/messages/${msg._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    const json = await res.json();
    if (res.ok && json.success) {
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, status: newStatus } : m))
      );
      setSummary((s) =>
        newStatus === "read"
          ? { ...s, unread: s.unread - 1, read: s.read + 1 }
          : { ...s, unread: s.unread + 1, read: s.read - 1 }
      );
    }
  }

  function handleDelete(id) {
    setMessages((prev) => prev.filter((m) => m._id !== id));
    setTotal((t) => t - 1);
    setSummary((s) => ({ ...s, total: s.total - 1 }));
  }

  function handleView(msg) {
    // Auto-mark as read when opened
    if (msg.status === "unread") handleToggleRead(msg);
    setSelectedMsg(msg);
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Messages</h2>
        <p className="text-sm text-gray-500 mt-0.5">Support messages from users and providers.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <SummaryCard value={summary.total} label="Total Messages" colorClass="bg-blue-50 text-blue-600" />
        <SummaryCard value={summary.unread} label="Unread" colorClass="bg-amber-50 text-amber-600" />
        <SummaryCard value={summary.read} label="Read / Resolved" colorClass="bg-green-50 text-green-600" />
      </div>

      {/* Inbox */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search size={15} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages…"
              className="bg-transparent text-sm placeholder-gray-400 outline-none w-full"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-300 hover:text-gray-500">
                <X size={13} />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none"
          >
            <option value="">All Messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 size={22} className="animate-spin mr-2" /> Loading…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 py-16 text-red-500">
            <AlertCircle size={18} /> {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <MessageSquare size={32} className="mb-2 opacity-40" />
            <p className="text-sm">No messages found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {messages.map((m) => (
              <MessageRow
                key={m._id}
                msg={m}
                onView={handleView}
                onDelete={handleDelete}
                onToggleRead={handleToggleRead}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{messages.length}</span> of{" "}
              <span className="font-semibold text-gray-700">{total}</span> messages
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition"
              >
                Prev
              </button>
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-semibold transition ${
                    n === page ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message Modal */}
      {selectedMsg && (
        <MessageModal
          msg={selectedMsg}
          token={token}
          onClose={() => setSelectedMsg(null)}
          onReplied={(id) => {
            setMessages((prev) =>
              prev.map((m) => (m._id === id ? { ...m, status: "read" } : m))
            );
          }}
          onDeleted={handleDelete}
        />
      )}
    </div>
  );
}

