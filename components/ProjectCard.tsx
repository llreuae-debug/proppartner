// components/ProjectCard.tsx
"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";

interface ProjectProps {
  title: string;
  category: string;
  imageUrl: string;
}

export default function AntiGravityCard({ title, category, imageUrl }: ProjectProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);
  const floatY = useSpring(useTransform(mouseYSpring, [-0.5, 0.5], [-10, 10]));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        y: floatY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="group relative h-[480px] w-full rounded-2xl bg-neutral-900/60 p-4 border border-white/10 backdrop-blur-xl transition-shadow duration-500 hover:shadow-[0_20px_50px_rgba(255,255,255,0.05)] cursor-pointer"
    >
      <div 
        style={{ transform: "translateZ(40px)" }}
        className="relative h-3/4 w-full overflow-hidden rounded-xl"
      >
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div 
        style={{ transform: "translateZ(60px)" }} 
        className="mt-6 flex flex-col justify-between"
      >
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">
          {category}
        </span>
        <h3 className="mt-1 text-2xl font-light text-white tracking-tight">
          {title}
        </h3>
      </div>
    </motion.div>
  );
}
