"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { useCallback, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code2,
  Link2, Link2Off, ImageIcon,
  Highlighter, Undo2, Redo2, RemoveFormatting,
  Minus,
} from "lucide-react";

// ── Toolbar button ─────────────────────────────────────────────────────────────
function ToolbarBtn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-1.5 rounded-md text-sm transition-all ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
      }`}
    >
      {children}
    </button>
  );
}

// ── Toolbar divider ────────────────────────────────────────────────────────────
function Divider() {
  return <span className="w-px h-5 bg-gray-200 mx-1 self-center shrink-0" />;
}

// ── Main Editor ────────────────────────────────────────────────────────────────
export default function TipTapEditor({ value = "", onChange, placeholder = "Write your blog content here..." }) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ HTMLAttributes: { class: "rounded-xl max-w-full my-4" } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline hover:text-blue-800", target: "_blank", rel: "noopener noreferrer" },
      }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none min-h-[400px] px-5 py-4 focus:outline-none text-gray-800",
      },
    },
  });

  const addLink = useCallback(() => {
    if (!linkUrl.trim()) return;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    editor?.chain().focus().setLink({ href: url }).run();
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
    setShowLinkInput(false);
  }, [editor]);

  const addImage = useCallback(() => {
    if (!imageUrl.trim()) return;
    editor?.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
    setShowImageInput(false);
  }, [editor, imageUrl]);

  const wordCount = editor
    ? editor.getText().trim().split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = editor ? editor.getText().length : 0;

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-gray-50 px-3 py-2 flex flex-wrap items-center gap-0.5">
        {/* History */}
        <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 size={15} />
        </ToolbarBtn>

        <Divider />

        {/* Headings */}
        <ToolbarBtn title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={15} />
        </ToolbarBtn>

        <Divider />

        {/* Text formatting */}
        <ToolbarBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Inline Code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code size={15} />
        </ToolbarBtn>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn title="Align Left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Align Center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Align Right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
          <AlignJustify size={15} />
        </ToolbarBtn>

        <Divider />

        {/* Lists & blocks */}
        <ToolbarBtn title="Bullet List" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Ordered List" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Code Block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={15} />
        </ToolbarBtn>

        <Divider />

        {/* Link */}
        <div className="relative">
          <ToolbarBtn
            title="Insert / Edit Link"
            active={editor.isActive("link")}
            onClick={() => {
              setShowImageInput(false);
              if (!showLinkInput) {
                // Pre-fill with existing href if selection is already a link
                const existing = editor.getAttributes("link").href ?? "";
                setLinkUrl(existing);
              }
              setShowLinkInput((v) => !v);
            }}
          >
            <Link2 size={15} />
          </ToolbarBtn>
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-80 space-y-2">
              <p className="text-xs font-semibold text-gray-500">Link URL</p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addLink()}
                  placeholder="https://example.com"
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={addLink}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 font-medium"
                >
                  Apply
                </button>
              </div>
              {editor.isActive("link") && (
                <button
                  type="button"
                  onClick={removeLink}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  <Link2Off size={12} /> Remove link
                </button>
              )}
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative">
          <ToolbarBtn
            title="Insert Image"
            onClick={() => {
              setShowLinkInput(false);
              setShowImageInput((v) => !v);
            }}
          >
            <ImageIcon size={15} />
          </ToolbarBtn>
          {showImageInput && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-3 flex gap-2 w-80">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addImage()}
                placeholder="https://image-url.com/photo.jpg"
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400"
                autoFocus
              />
              <button
                type="button"
                onClick={addImage}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 font-medium"
              >
                Add
              </button>
            </div>
          )}
        </div>

        <Divider />

        {/* Highlight */}
        <ToolbarBtn title="Highlight" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()}>
          <Highlighter size={15} />
        </ToolbarBtn>

        {/* Clear formatting */}
        <ToolbarBtn title="Clear Formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          <RemoveFormatting size={15} />
        </ToolbarBtn>
      </div>

      {/* ── Editor Area ─────────────────────────────────────────────── */}
      <div
        className="max-h-[600px] overflow-y-auto"
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>

      {/* ── Footer: word/char count ──────────────────────────────────── */}
      <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 flex items-center gap-4 text-xs text-gray-400">
        <span>{wordCount} words</span>
        <span className="w-px h-3 bg-gray-200" />
        <span>{charCount} characters</span>
        <span className="ml-auto text-gray-300">TipTap Editor</span>
      </div>

      {/* Global editor prose styles */}
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror { outline: none; }
        .ProseMirror h1 { font-size: 2em; font-weight: 700; margin: 0.75em 0 0.5em; }
        .ProseMirror h2 { font-size: 1.5em; font-weight: 700; margin: 0.75em 0 0.4em; }
        .ProseMirror h3 { font-size: 1.25em; font-weight: 600; margin: 0.6em 0 0.3em; }
        .ProseMirror p { margin: 0.5em 0; line-height: 1.7; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        .ProseMirror blockquote { border-left: 4px solid #3b82f6; padding-left: 1em; margin: 1em 0; color: #6b7280; font-style: italic; }
        .ProseMirror code { background: #f3f4f6; padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.9em; font-family: monospace; }
        .ProseMirror pre { background: #1f2937; color: #f9fafb; padding: 1em; border-radius: 8px; overflow-x: auto; margin: 1em 0; }
        .ProseMirror pre code { background: none; padding: 0; font-size: 0.875em; }
        .ProseMirror hr { border: none; border-top: 2px solid #e5e7eb; margin: 1.5em 0; }
        .ProseMirror mark { background-color: #fef08a; padding: 0.1em 0.2em; border-radius: 2px; }
        .ProseMirror a { color: #2563eb; text-decoration: underline; }
        .ProseMirror img { border-radius: 12px; max-width: 100%; height: auto; margin: 1em 0; }
      `}</style>
    </div>
  );
}
