// app/page.tsx
"use client";

import React, { useState } from "react";
import AntiGravityCanvas from "@/components/AntiGravityCanvas";
import AntiGravityCard from "@/components/ProjectCard";

const featuredDevelopments = [
  {
    id: "gatwala-hub",
    title: "Gatwala Commercial Hub",
    category: "Commercial Retail & Corporate",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=1200&q=80",
    startingPrice: "PKR 12.5M",
    commission: "3.5%",
  },
  {
    id: "dragon-souk",
    title: "Dragon Souk Commercial Market",
    category: "Wholesale & Trade Hub",
    imageUrl: "https://images.unsplash.com/photo-1555636222-cae831e670b3?auto=format&fit=crop&w=1200&q=80",
    startingPrice: "PKR 8.9M",
    commission: "4.0%",
  },
  {
    id: "luminary-sky",
    title: "The Luminary Sky Residences",
    category: "Luxury High-Rise Residential",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    startingPrice: "PKR 24.0M",
    commission: "3.0%",
  },
];

export default function HomePage() {
  const [selectedFilter, setSelectedFilter] = useState("all");

  return (
    <main className="relative min-h-screen bg-[#0a0a0c] text-white selection:bg-neutral-800 overflow-hidden font-sans">
      {/* 1. Spatial 3D WebGL Anti-Gravity Background Canvas */}
      <AntiGravityCanvas />

      {/* 2. Top Minimalist Navigation Bar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0a0a0c]/60 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-bold text-black text-sm tracking-tighter">
              PP
            </div>
            <span className="font-light tracking-tight text-xl text-white">
              Prop<span className="font-normal text-neutral-400">Partner</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-mono text-neutral-400">
            <a href="#developments" className="hover:text-white transition">Developments</a>
            <a href="#financials" className="hover:text-white transition">Commissions</a>
            <a href="#ledger" className="hover:text-white transition">Ledger ERP</a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="/#login"
              className="px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider bg-white text-black font-semibold hover:bg-neutral-200 transition shadow-lg"
            >
              Sign In / Portal
            </a>
          </div>
        </div>
      </header>

      {/* 3. Hero Section with Zero-G Floating Ambience */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 md:pt-36 md:pb-28 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-widest text-neutral-400 mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Gatwala & Dragon Souk Ecosystem</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-white max-w-4xl leading-[1.1]">
          Commercial Real Estate <br />
          <span className="font-serif italic font-normal text-neutral-300">without boundaries.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-neutral-400 max-w-2xl font-light leading-relaxed">
          The next-generation private affiliate network and double-entry commercial ERP designed for high-performing property brokers and institutional investors.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="/#login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-black font-medium text-sm hover:bg-neutral-200 transition shadow-2xl"
          >
            Access Partner Portal
          </a>
          <a
            href="#developments"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-neutral-900/60 border border-white/10 text-white font-medium text-sm hover:bg-neutral-900 transition backdrop-blur-md"
          >
            Explore Developments ↓
          </a>
        </div>
      </section>

      {/* 4. Featured Developments Showcase with 3D Tilt Cards */}
      <section id="developments" className="relative max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">
              Portfolio / Prime Assets
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight mt-1">
              Featured Flagship Developments
            </h2>
          </div>
          <div className="text-xs font-mono text-neutral-500">
            Interactive 3D Cards • Magnetic Cursor Pull
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredDevelopments.map((project) => (
            <div key={project.id} className="flex flex-col">
              <AntiGravityCard
                title={project.title}
                category={project.category}
                imageUrl={project.imageUrl}
              />
              <div className="mt-3 px-2 flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>From {project.startingPrice}</span>
                <span className="text-emerald-400">Up to {project.commission} Comm.</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Minimalist Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <div>© {new Date().getFullYear()} PropPartner Network. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <a href="/#login" className="hover:text-white transition">Admin ERP</a>
            <a href="/#login" className="hover:text-white transition">Partner Desk</a>
            <a href="/#login" className="hover:text-white transition">Security & KYC</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
