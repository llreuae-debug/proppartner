// app/admin/projects/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export interface Project {
  id: string;
  title: string;
  slug: string;
  client: string | null;
  category: string;
  description: string | null;
  cover_image_url: string;
  gallery_urls: string[];
  completion_date: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminProjects() {
  const supabase = createClientComponentClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    client: "",
    description: "",
    completion_date: "",
    featured: false,
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setProjects(data as Project[]);
    } catch (err: any) {
      console.error("Error fetching projects:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return alert("Please select a cover image");
    setUploading(true);

    try {
      // 1. Upload Cover Image to Supabase Storage Bucket
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("project-photos")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("project-photos")
        .getPublicUrl(fileName);

      // 2. Insert Record in PostgreSQL DB
      const slug = formData.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const { error: insertError } = await supabase.from("projects").insert([
        {
          title: formData.title,
          slug,
          category: formData.category,
          client: formData.client || null,
          description: formData.description || null,
          completion_date: formData.completion_date || null,
          featured: formData.featured,
          cover_image_url: publicUrl,
          gallery_urls: [publicUrl],
        },
      ]);

      if (insertError) throw insertError;

      // Reset form & reload
      setFormData({
        title: "",
        category: "",
        client: "",
        description: "",
        completion_date: "",
        featured: false,
      });
      setFile(null);
      await fetchProjects();
    } catch (err: any) {
      alert(err.message || "Failed to add project");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete project");
    }
  }

  async function handleToggleFeatured(project: Project) {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ featured: !project.featured })
        .eq("id", project.id);

      if (error) throw error;
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, featured: !p.featured } : p))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update featured status");
    }
  }

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.client && p.client.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-neutral-800">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          <div>
            <div className="text-xs uppercase tracking-widest text-neutral-400 font-mono mb-1">
              PropPartner / Control Center
            </div>
            <h1 className="text-3xl font-light tracking-tight text-white">Commercial Projects ERP</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300">
              {projects.length} Total Projects
            </span>
          </div>
        </div>

        {/* Create Project Form */}
        <form
          onSubmit={handleCreateProject}
          className="bg-neutral-900/60 p-6 md:p-8 rounded-2xl border border-white/10 backdrop-blur-xl mb-12 space-y-5 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-light tracking-tight text-white">Publish New Property / Project</h2>
            <span className="text-xs text-neutral-400 font-mono">* Required fields</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono mb-2">
                Project Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Gatwala Commercial Hub"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-white/40 transition placeholder:text-neutral-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono mb-2">
                Category *
              </label>
              <input
                type="text"
                placeholder="e.g. Commercial Retail, High-Rise"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-white/40 transition placeholder:text-neutral-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono mb-2">
                Client / Developer
              </label>
              <input
                type="text"
                placeholder="e.g. Gatwala Mega Developers"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-white/40 transition placeholder:text-neutral-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono mb-2">
                Completion Target Date
              </label>
              <input
                type="date"
                value={formData.completion_date}
                onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-white/40 transition"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="featured-check"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-black/60 text-white accent-white cursor-pointer"
              />
              <label htmlFor="featured-check" className="text-sm text-neutral-300 cursor-pointer select-none">
                Featured Flagship Project (Highlight on Hero & Portals)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono mb-2">
              Project Narrative & Description
            </label>
            <textarea
              placeholder="Provide key architectural specs, floor plate sizes, commercial retail allocations..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-white/40 transition placeholder:text-neutral-600"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono mb-2">
              Cover Image Asset *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-white file:text-black file:font-medium hover:file:bg-neutral-200 cursor-pointer"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="px-7 py-3 bg-white text-black font-medium text-sm rounded-xl hover:bg-neutral-200 disabled:opacity-50 transition shadow-lg flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Uploading & Publishing...</span>
                </>
              ) : (
                "Publish Project"
              )}
            </button>
          </div>
        </form>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by title, category, or developer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 bg-neutral-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/40 placeholder:text-neutral-600"
          />
          <div className="text-xs text-neutral-500 font-mono">
            Showing {filteredProjects.length} of {projects.length} properties
          </div>
        </div>

        {/* Project List */}
        {loading ? (
          <div className="py-20 text-center text-neutral-500 text-sm font-mono animate-pulse">
            Loading real estate database records...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-white/5 bg-neutral-950/40 text-neutral-500 text-sm font-mono">
            No projects found matching your search query.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-neutral-900/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between hover:border-white/20 transition-all duration-300"
              >
                <div>
                  <div className="relative w-full h-48 overflow-hidden rounded-xl mb-4 bg-neutral-950">
                    <img
                      src={project.cover_image_url}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {project.featured && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider bg-white text-black font-semibold shadow-md">
                        Featured
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-mono">
                    {project.category}
                  </span>
                  <h3 className="font-light text-xl text-white mt-1 leading-snug">{project.title}</h3>
                  {project.client && (
                    <p className="text-xs text-neutral-400 mt-1">Client: {project.client}</p>
                  )}
                  {project.description && (
                    <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="pt-5 mt-4 border-t border-white/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(project)}
                    className="text-xs font-mono text-neutral-400 hover:text-white transition"
                  >
                    {project.featured ? "★ Unfeature" : "☆ Feature"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(project.id, project.title)}
                    className="text-xs font-mono text-red-400 hover:text-red-300 transition"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
