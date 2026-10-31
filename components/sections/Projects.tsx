"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { react, setHoveredProject } from "@/components/three/sceneState";
import { projects, type ProjectEntry } from "@/data/projects";

// Project name on the left, description and stack on the right. Below md the
// columns stack so the row never needs to scroll sideways.
const ROW_GRID = "md:grid md:grid-cols-[11rem_minmax(0,1fr)] md:gap-6";

function ProjectRow({ project, index }: { project: ProjectEntry; index: number }) {
  return (
    <a
      href={project.comingSoon ? undefined : project.url}
      target={project.comingSoon ? undefined : "_blank"}
      rel={project.comingSoon ? undefined : "noopener noreferrer"}
      onClick={() => react(project.comingSoon ? "projectSoon" : "projectOpened")}
      onMouseEnter={() => setHoveredProject(index)}
      onMouseLeave={() => setHoveredProject(-1)}
      className={`${ROW_GRID} block px-6 py-5 border-t border-navy-800 first:border-t-0 transition-colors hover:bg-cyan-glow/5 group ${project.comingSoon ? "cursor-default" : "cursor-pointer"}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2 md:mb-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-white group-hover:text-cyan-glow transition-colors">
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
      <div className="space-y-3">
        <p className="text-gray-400 text-sm leading-relaxed">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <Badge key={s} label={s} />
          ))}
        </div>
      </div>
    </a>
  );
}

export default function Projects() {
  useEffect(() => () => setHoveredProject(-1), []);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold glow-text tracking-widest uppercase">
        Projects
      </h2>
      {/* The section's cube turn already brings it in, so the table only
          needs a short fade, not a delayed flip. */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="glass-card overflow-hidden"
      >
        <div
          className={`${ROW_GRID} hidden px-6 py-3 border-b border-navy-800 bg-navy-800/40 text-xs font-semibold tracking-widest uppercase text-cyan-glow/80`}
        >
          <span>Project</span>
          <span>Details</span>
        </div>
        {projects.map((project, i) => (
          <ProjectRow key={i} project={project} index={i} />
        ))}
      </motion.div>
    </section>
  );
}
