"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Share2,
  Settings2,
  Sparkles,
  Pencil,
  Trash2,
  X,
  FileText,
  PanelRightOpen,
  PanelLeftOpen,
} from "lucide-react";
import { Logo } from "@/components/branding/Logo";
import { NotebookResponse } from "@/lib/api/types";
import { getVisualsForNotebook, useUpdateNotebook, useDeleteNotebook } from "@/hooks/useNotebooks";
import { toast } from "sonner";

interface WorkspaceHeaderProps {
  nb: NotebookResponse;
  onOpenSources: () => void;
  onOpenInsights: () => void;
}

export function WorkspaceHeader({ nb, onOpenSources, onOpenInsights }: WorkspaceHeaderProps) {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [renameTitle, setRenameTitle] = useState(nb.title);
  const [renameDesc, setRenameDesc] = useState(nb.description || "");

  const visuals = getVisualsForNotebook(nb.id, nb.title);

  const { mutateAsync: updateNotebook, isPending: isUpdating } = useUpdateNotebook();
  const { mutateAsync: deleteNotebook, isPending: isDeleting } = useDeleteNotebook();


  return (
    <>
      <header className="bg-glass border-b border-border px-4 py-2.5 flex items-center gap-3 sticky top-0 z-30">
        <Link href="/app" className="flex items-center gap-2 group shrink-0 max-[500px]:hidden">
          <ArrowLeft className="size-4 text-foreground/50 group-hover:text-foreground transition-colors" />
          <span className="max-sm:hidden"><Logo size={20} showName={false} /></span>
        </Link>
        <div className="h-5 w-px bg-border hidden sm:block" />
        <button
          onClick={onOpenSources}
          className="md:hidden size-8 rounded-full bg-white/60 border border-border grid place-items-center cursor-pointer"
          aria-label="Open sources"
        >
          <PanelLeftOpen className="size-3.5" />
        </button>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="min-w-0 max-sm:w-full">
            <h1 className="text-sm font-bold tracking-tight truncate max-sm:text-center">{nb.title}</h1>
          </div>
        </div>
        <div className=" ml-auto flex items-center gap-2 shrink-0">
          <div className="relative max-sm:hidden">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="size-8 rounded-full bg-white/60 border border-border grid place-items-center hover:bg-white transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings2 className="size-3.5" />
            </button>

            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md border border-border rounded-2xl shadow-float p-1.5 z-40 space-y-0.5 animate-fade-up">
                <button
                  onClick={() => {
                    setSettingsOpen(false);
                    setRenameTitle(nb.title);
                    setRenameDesc(nb.description || "");
                    setIsRenameOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-foreground/75 hover:bg-foreground/5 text-left cursor-pointer"
                >
                  <Pencil className="size-3.5 text-foreground/50" />
                  Rename notebook
                </button>
                <button
                  onClick={() => {
                    setSettingsOpen(false);
                    setIsDeleteOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-500/10 text-left cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  Delete notebook
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onOpenInsights}
            className="lg:hidden size-8 rounded-full bg-white/60 border border-border grid place-items-center cursor-pointer"
            aria-label="Open insights"
          >
            <PanelRightOpen className="size-3.5" />
          </button>
        </div>
      </header>

      {/* Rename Notebook Modal */}
      {isRenameOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm grid place-items-center animate-fade-up"
          onClick={() => setIsRenameOpen(false)}
        >
          <div
            className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-float border border-border p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsRenameOpen(false)}
              className="absolute top-4 right-4 size-8 rounded-full bg-foreground/5 grid place-items-center hover:bg-foreground/10 transition-colors"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-lg font-bold mb-4">Rename Notebook</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!renameTitle.trim()) return;
                try {
                  await updateNotebook({
                    id: nb.id,
                    payload: { title: renameTitle, description: renameDesc },
                  });
                  setIsRenameOpen(false);
                  toast.success("Notebook renamed successfully!");
                } catch (err) {
                  console.error("Failed to rename notebook", err);
                  toast.error("Failed to rename notebook. Please try again.");
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/50 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Notebook Title"
                  value={renameTitle}
                  onChange={(e) => setRenameTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-foreground/5 border-none text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/50 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Notebook Description"
                  value={renameDesc}
                  onChange={(e) => setRenameDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-foreground/5 border-none text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary/30 h-24 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Notebook Modal */}
      {isDeleteOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm grid place-items-center animate-fade-up"
          onClick={() => setIsDeleteOpen(false)}
        >
          <div
            className="w-full max-w-sm mx-4 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-float border border-border p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="absolute top-4 right-4 size-8 rounded-full bg-foreground/5 grid place-items-center hover:bg-foreground/10 transition-colors"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-lg font-bold mb-2">Delete Notebook</h3>
            <p className="text-xs text-foreground/60 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">"{nb.title}"</span>? This action is
              permanent and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteNotebook(nb.id);
                    setIsDeleteOpen(false);
                    toast.success("Notebook deleted successfully!");
                    router.push("/app");
                  } catch (err) {
                    console.error("Failed to delete notebook", err);
                    toast.error("Failed to delete notebook. Please try again.");
                  }
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
