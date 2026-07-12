"use client";

import { AmbientBg } from "@/components/branding/AmbientBg";
import { Logo } from "@/components/branding/Logo";
import {
  Search,
  Plus,
  BookOpen,
  Settings,
  Clock,
  Activity,
  Command,
  X,
  Settings2,
  Trash2,
  User,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import sourcesApi from "@/lib/api/sources";
import { NotebookResponse } from "@/lib/api/types";
import {
  useNotebooksList,
  useCreateNotebook,
  useUpdateNotebook,
  useDeleteNotebook,
  getVisualsForNotebook,
} from "@/hooks/useNotebooks";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Dashboard() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();

  // Notebooks pagination and fetching
  const [page] = useState(1);
  const [size] = useState(24);
  const {
    data: notebooksData,
    isLoading: isNotebooksLoading,
    isError,
  } = useNotebooksList(page, size);
  const notebooks = notebooksData?.notebooks || [];

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeNotebook, setActiveNotebook] = useState<NotebookResponse | null>(null);

  // Forms state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Mutations
  const { mutateAsync: createNotebook, isPending: isCreating } = useCreateNotebook();
  const { mutateAsync: updateNotebook, isPending: isUpdating } = useUpdateNotebook();
  const { mutateAsync: deleteNotebook, isPending: isDeleting } = useDeleteNotebook();

  const [palette, setPalette] = useState(false);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <AmbientBg />
        <div className="z-10">
          <Logo size={48} className="animate-pulse mx-auto mb-4" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen text-foreground relative">
      <AmbientBg />

      <main className="flex-1 min-w-0 mx-auto">
        <TopBar
          onSearch={() => setPalette(true)}
          onCreateClick={() => setIsCreateOpen(true)}
          user={user}
          onLogout={logout}
        />
        <div className="px-6 md:px-10 pb-20 max-w-7xl mx-auto">
          {/* Greeting */}
          <section className="pt-30 pb-8">
            <p className="text-sm text-foreground/50 font-medium mb-2">
              Good afternoon, {user?.username || "Ada"}
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2 text-gradient">
              What are we learning today?
            </h1>
            <p className="text-foreground/60 max-w-xl">
              You have {notebooks.length} active notebook{notebooks.length === 1 ? "" : "s"}.
            </p>
          </section>


          {/* Notebooks List */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-foreground/50" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                  Notebooks
                </h2>
              </div>
            </div>

            {isNotebooksLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-[280px] rounded-3xl border border-white/60 bg-white/5 backdrop-blur-md animate-pulse"
                  />
                ))}
              </div>
            ) : isError ? (
              <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-3xl">
                <p className="text-sm font-medium text-rose-600 mb-2">
                  Failed to load notebooks. Please try again.
                </p>
              </div>
            ) : notebooks.length === 0 ? (
              <div className="text-center py-16 bg-white/30 border border-white/60 rounded-3xl p-8 max-w-md mx-auto">
                <div className="size-16 rounded-2xl bg-primary/10 grid place-items-center text-primary mx-auto mb-4 animate-bounce">
                  <BookOpen className="size-8" />
                </div>
                <h3 className="font-bold text-lg mb-2">No Notebooks Yet</h3>
                <p className="text-xs text-foreground/60 mb-6">
                  Create your first notebook to start uploading documents, generating podcasts, and
                  studying.
                </p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Create notebook
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <CreateCard onClick={() => setIsCreateOpen(true)} />
                {notebooks.map((nb) => (
                  <NotebookCard
                    key={nb.id}
                    nb={nb}
                    onRename={() => {
                      setActiveNotebook(nb);
                      setNewTitle(nb.title);
                      setNewDescription(nb.description || "");
                      setIsRenameOpen(true);
                    }}
                    onDelete={() => {
                      setActiveNotebook(nb);
                      setIsDeleteOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Create Notebook Modal */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm grid place-items-center animate-fade-up"
          onClick={() => {
            setIsCreateOpen(false);
            setNewTitle("");
            setNewDescription("");
          }}
        >
          <div
            className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-float border border-border p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setIsCreateOpen(false);
                setNewTitle("");
                setNewDescription("");
              }}
              className="absolute top-4 right-4 size-8 rounded-full bg-foreground/5 grid place-items-center hover:bg-foreground/10 transition-colors"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-lg font-bold mb-4">Create New Notebook</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newTitle.trim()) return;
                try {
                  await createNotebook({ title: newTitle, description: newDescription });
                  setIsCreateOpen(false);
                  setNewTitle("");
                  setNewDescription("");
                  toast.success("Notebook created successfully!");
                } catch (err) {
                  console.error("Failed to create notebook", err);
                  toast.error("Failed to create notebook. Please try again.");
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
                  placeholder="e.g. Machine Learning Foundations"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-foreground/5 border-none text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/50 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="What is this notebook about?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-foreground/5 border-none text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary/30 h-24 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {isCreating ? "Creating..." : "Create Notebook"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Rename Notebook Modal */}
      {isRenameOpen && activeNotebook && (
        <div
          className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm grid place-items-center animate-fade-up"
          onClick={() => {
            setIsRenameOpen(false);
            setActiveNotebook(null);
            setNewTitle("");
            setNewDescription("");
          }}
        >
          <div
            className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-float border border-border p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setIsRenameOpen(false);
                setActiveNotebook(null);
                setNewTitle("");
                setNewDescription("");
              }}
              className="absolute top-4 right-4 size-8 rounded-full bg-foreground/5 grid place-items-center hover:bg-foreground/10 transition-colors"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-lg font-bold mb-4">Rename Notebook</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newTitle.trim()) return;
                try {
                  await updateNotebook({
                    id: activeNotebook.id,
                    payload: { title: newTitle, description: newDescription },
                  });
                  setIsRenameOpen(false);
                  setActiveNotebook(null);
                  setNewTitle("");
                  setNewDescription("");
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
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-foreground/5 border-none text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/50 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Notebook Description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
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
      {isDeleteOpen && activeNotebook && (
        <div
          className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm grid place-items-center animate-fade-up"
          onClick={() => {
            setIsDeleteOpen(false);
            setActiveNotebook(null);
          }}
        >
          <div
            className="w-full max-w-sm mx-4 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-float border border-border p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setIsDeleteOpen(false);
                setActiveNotebook(null);
              }}
              className="absolute top-4 right-4 size-8 rounded-full bg-foreground/5 grid place-items-center hover:bg-foreground/10 transition-colors"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-lg font-bold mb-2">Delete Notebook</h3>
            <p className="text-xs text-foreground/60 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">"{activeNotebook.title}"</span>? This
              action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteOpen(false);
                  setActiveNotebook(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteNotebook(activeNotebook.id);
                    setIsDeleteOpen(false);
                    setActiveNotebook(null);
                    toast.success("Notebook deleted successfully!");
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

      {palette && (
        <CommandPalette
          notebooks={notebooks}
          onClose={() => setPalette(false)}
          onCreateClick={() => setIsCreateOpen(true)}
        />
      )}
    </div>
  );
}


/* -------------------------- TOP BAR -------------------------- */
function TopBar({
  onSearch,
  onCreateClick,
  user,
  onLogout,
}: {
  onSearch: () => void;
  onCreateClick: () => void;
  user: any;
  onLogout: () => void;
}) {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center gap-3 px-6 md:px-10 py-3 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 mr-4">
          <Logo />
        </Link>

        <button
          onClick={onSearch}
          className="flex-1 flex items-center gap-3 px-4 py-2 rounded-full bg-white/60 border border-border hover:bg-white transition-colors text-sm text-foreground/50 cursor-pointer"
        >
          <Search className="size-4" />
          <span className="hidden md:inline">Search across all notebooks, sources, conversations…</span>
          <span className="md:hidden">Search...</span>
          <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-foreground/5 hidden sm:block">
            ⌘K
          </kbd>
        </button>

        <Button
          onClick={onCreateClick}
          size="sm"
          className="rounded-xl hidden md:flex"
        >
          <Plus className="size-4 mr-2" />
          New
        </Button>

        {/* User Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:bg-primary/5">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent-pink text-white text-sm font-bold">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-2" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold">{user?.username || "User"}</p>
                <p className="text-xs text-foreground/50">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onLogout}
              className="text-rose-600 cursor-pointer focus:text-rose-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/* ------------------------ NOTEBOOK CARDS ------------------------ */
function NotebookCard({
  nb,
  onRename,
  onDelete,
}: {
  nb: NotebookResponse;
  onRename: () => void;
  onDelete: () => void;
}) {
  const visuals = getVisualsForNotebook(nb.id, nb.title);

  return (
    <div className="group relative rounded-3xl border border-white/60 bg-white/60 hover:bg-white hover:shadow-float hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col justify-between min-h-[300px]">
      <Link href={`/app/notebook/${nb.id}`} className="flex-1 flex flex-col">
        <div
          className={`relative aspect-[16/8] bg-gradient-to-br ${visuals.gradient} flex items-end p-5 overflow-hidden shrink-0`}
        >
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base mb-1 tracking-tight truncate pr-6">{nb.title}</h3>
            <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2 mb-4">
              {nb.description || "No description provided."}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[11px] text-foreground/50 font-medium">
                <span className="flex items-center gap-1">
                  <BookOpen className="size-3" />
                  {nb.source_count || 0}
                </span>
                <span>{new Date(nb.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Settings Menu Overlay / Hover Actions */}
      <div className="absolute top-4 left-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRename();
          }}
          className="size-7 rounded-full bg-white/80 hover:bg-white shadow-soft grid place-items-center text-foreground/60 hover:text-primary transition-colors cursor-pointer"
          title="Rename Notebook"
        >
          <Settings2 className="size-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="size-7 rounded-full bg-white/80 hover:bg-white shadow-soft grid place-items-center text-foreground/60 hover:text-rose-500 transition-colors cursor-pointer"
          title="Delete Notebook"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function CreateCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group rounded-3xl border-2 border-dashed border-border bg-white/30 hover:bg-white/50 hover:border-primary/40 transition-all min-h-[300px] flex flex-col items-center justify-center gap-3 p-5 cursor-pointer"
    >
      <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center text-primary group-hover:scale-110 transition-transform">
        <Plus className="size-5" />
      </div>
      <p className="font-bold text-sm">Create notebook</p>
      <p className="text-xs text-foreground/50 text-center max-w-[200px]">
        Start a new research space from PDFs, links, or notes
      </p>
    </button>
  );
}

/* ------------------------- COMMAND PALETTE ------------------------- */
function CommandPalette({
  notebooks,
  onClose,
  onCreateClick,
}: {
  notebooks: NotebookResponse[];
  onClose: () => void;
  onCreateClick: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotebooks = notebooks.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const groups = [
    {
      label: "Notebooks",
      items: filteredNotebooks.slice(0, 4).map((n) => ({
        id: n.id,
        title: n.title,
        hint: "Open notebook",
        icon: BookOpen,
        href: `/app/notebook/${n.id}`,
      })),
    },
    {
      label: "Actions",
      items: [
        {
          id: "a1",
          title: "Create new notebook",
          hint: "⌘N",
          icon: Plus,
          onClick: () => {
            onClose();
            onCreateClick();
          },
        },
        { id: "a2", title: "Open keyboard shortcuts", hint: "?", icon: Command },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm grid place-items-start pt-32 animate-fade-up"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl mx-4 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-float border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Search className="size-4 text-foreground/40" />
          <input
            autoFocus
            placeholder="Search notebooks, actions…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-foreground/40"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-foreground/5">ESC</kbd>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {groups.map((g) => {
            if (g.items.length === 0) return null;
            return (
              <div key={g.label} className="mb-3">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                  {g.label}
                </div>
                {g.items.map((it) => {
                  const content = (
                    <>
                      <it.icon className="size-4 text-foreground/50" />
                      <span className="flex-1 text-sm font-medium">{it.title}</span>
                      <span className="text-[10px] font-mono text-foreground/40">{it.hint}</span>
                    </>
                  );
                  if ("href" in it) {
                    return (
                      <Link
                        key={it.id}
                        href={it.href}
                        onClick={onClose}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 text-left transition-colors cursor-pointer"
                      >
                        {content}
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={it.id}
                      onClick={it.onClick}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 text-left transition-colors cursor-pointer"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
