"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AmbientBg } from "@/components/branding/AmbientBg";
import { Logo } from "@/components/branding/Logo";
import { ArrowRight, Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login, error, clearError, isLoading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Clear any stale errors on load
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      // Default fallback password as specified in schema since OAuth/SSO isn't fully detailed yet
      await login(email, password || "password123");
      toast.success("Welcome back!");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-foreground selection:bg-primary/20 relative flex flex-col items-center justify-center p-6 overflow-hidden">
      <AmbientBg />

      {/* Decorative top-right / bottom-left elements */}
      <div className="absolute top-1/4 -right-12 size-48 bg-accent-pink/10 blur-3xl rounded-full" />
      <div className="absolute bottom-1/4 -left-12 size-48 bg-accent-blue/10 blur-3xl rounded-full" />

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Logo size={32} />
          </Link>
          <p className="text-sm text-foreground/50 mt-2 font-medium tracking-tight">
            Sign in to access your study library
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-float rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-2xl flex items-start gap-3 text-sm">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2 pl-1"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                  <Mail className="size-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={submitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-border focus:border-primary/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-foreground/30"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 pl-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-foreground/50"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                  <Lock className="size-4.5" />
                </div>
                <input
                  id="password"
                  type="password"
                  disabled={submitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-border focus:border-primary/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-foreground/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !email}
              className="w-full bg-foreground text-background py-3.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-black/5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/40 text-center">
            <p className="text-xs text-foreground/50">
              Don't have an account?{" "}
              <Link href="/register" className="font-bold text-foreground hover:underline">
                Create one for free
              </Link>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-foreground/40 hover:text-foreground/60 transition-colors"
          >
            ← Back to landing page
          </Link>
        </div>
      </div>
    </div>
  );
}
