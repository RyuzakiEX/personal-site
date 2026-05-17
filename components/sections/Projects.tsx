"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { projects } from "@/data/projects";

export default function Projects() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold glow-text tracking-widest uppercase">
        Projects
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, i) => (
          <motion.a
            key={i}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.35 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card p-6 block group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-glow transition-colors">
                {project.title}
              </h3>
              <ExternalLink
                size={16}
                className="text-gray-500 group-hover:text-cyan-glow transition-colors shrink-0 mt-1"
              />
            </div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <Badge key={s} label={s} />
              ))}
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
