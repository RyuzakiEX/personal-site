"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { experiences } from "@/data/experience";

export default function Experience() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold glow-text tracking-widest uppercase">
        Experience
      </h2>
      {experiences.map((exp, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15, duration: 0.4 }}
        >
          <Card className="space-y-4">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-bold text-white">{exp.company}</h3>
                <p className="text-cyan-glow font-medium">{exp.role}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-gray-400 text-sm bg-navy-800/60 px-3 py-1 rounded-full">
                  {exp.period}
                </span>
                <span className="text-gray-500 text-xs">{exp.type}</span>
              </div>
            </div>
            <ul className="space-y-2">
              {exp.bullets.map((bullet, j) => (
                <li key={j} className="flex gap-3 text-gray-300 text-sm">
                  <span className="text-cyan-glow mt-0.5 shrink-0">▸</span>
                  {bullet}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-navy-800">
              {exp.stack.map((s) => (
                <Badge key={s} label={s} />
              ))}
            </div>
          </Card>
        </motion.div>
      ))}
    </section>
  );
}
