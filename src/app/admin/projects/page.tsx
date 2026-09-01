// app/admin/projects/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AdminProjects() {
  const supabase = createClientComponentClient();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ title: "", category: "", description: "" });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (!error && data) setProjects(data);
    setLoading(false);
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return alert("Please select a cover image");
    setUploading(true);

    try {
      // 1. Upload Image to Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("project-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("project-photos")
        .getPublicUrl(fileName);

      // 2. Insert Record in DB
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const { error: insertError } = await supabase.from("projects").insert([
        {
          ...formData,
          slug,
          cover_image_url: publicUrl,
        },
      ]);

      if (insertError) throw insertError;

      // Reset form & reload
      setFormData({ title: "", category: "", description: "" });
      setFile(null);
      fetchProjects();
    } catch (err: any) {
      alert(err.message || "Failed to add project");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;
    await supabase.from("projects").delete().eq("id", id);
    fetchProjects();
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-light tracking-tight mb-8">Admin / Projects</h1>

        {/* Create Project Form */}
        <form onSubmit={handleCreateProject} className="bg-neutral-900/60 p-6 rounded-2xl border border-white/10 mb-12 space-y-4">
          <h2 className="text-lg font-medium">Add New Project</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white"
              required
            />
            <input
              type="text"
              placeholder="Category (e.g., Commercial, Architecture)"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white"
              required
            />
          </div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white"
            rows={3}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white file:text-black hover:file:bg-neutral-200"
            required
          />
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2 bg-white text-black font-medium text-sm rounded-lg hover:bg-neutral-200 disabled:opacity-50 transition"
          >
            {uploading ? "Publishing..." : "Publish Project"}
          </button>
        </form>

        {/* Project List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-neutral-900/30 border border-white/10 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <img src={project.cover_image_url} alt={project.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                <h3 className="font-light text-lg">{project.title}</h3>
                <p className="text-xs text-neutral-400 font-mono mt-1">{project.category}</p>
              </div>
              <button
                onClick={() => handleDelete(project.id)}
                className="mt-4 text-xs text-red-400 hover:text-red-300 transition self-start"
              >
                Delete Project
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
