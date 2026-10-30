"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { setHoveredProject } from "@/components/three/sceneState";
import { projects, type ProjectEntry } from "@/data/projects";
import { useTilt } from "@/hooks/useTilt";

function ProjectCard({ project, index }: { project: ProjectEntry; index: number }) {
  const { rotateX, rotateY, glare, onMouseMove, onMouseLeave } = useTilt();

  return (
    <motion.a
      href={project.comingSoon ? undefined : project.url}
      target={project.comingSoon ? undefined : "_blank"}
      rel={project.comingSoon ? undefined : "noopener noreferrer"}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.35 }}
      whileHover={{ scale: 1.03 }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onMouseEnter={() => setHoveredProject(index)}
      onMouseMove={onMouseMove}
      onMouseLeave={() => {
        onMouseLeave();
        setHoveredProject(-1);
      }}
      className={`glass-card transition-[border-color,box-shadow] relative p-6 block group ${project.comingSoon ? "cursor-default" : "cursor-pointer"}`}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: glare }}
      />
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-glow transition-colors">
            {project.title}
          </h3>
          {project.comingSoon && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-cyan-500/40 text-cyan-400/70">
              soon
            </span>
          )}
        </div>
        {!project.comingSoon && (
          <ExternalLink
            size={16}
            className="text-gray-500 group-hover:text-cyan-glow transition-colors shrink-0 mt-1"
          />
        )}
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
  );
}

export default function Projects() {
  useEffect(() => () => setHoveredProject(-1), []);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold glow-text tracking-widest uppercase">
        Projects
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
        {projects.map((project, i) => (
          <ProjectCard key={i} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
