"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import SocialIcon from "@/components/ui/SocialIcon";
import { experiences } from "@/data/experience";

const TITLE = "Full Stack Developer";

const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function getExperienceDuration(): string {
  const starts = experiences.map((e) => {
    const [mon, year] = e.period.split(" – ")[0].split(" ");
    return new Date(parseInt(year), MONTH_MAP[mon]);
  });
  const earliest = new Date(Math.min(...starts.map((d) => d.getTime())));
  const now = new Date();
  const totalMonths =
    (now.getFullYear() - earliest.getFullYear()) * 12 +
    (now.getMonth() - earliest.getMonth());
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (months === 0) return `${years}+ years`;
  return `${years}+ years`;
}

function GithubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function AboutMe() {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx < TITLE.length) {
      const t = setTimeout(() => {
        setDisplayed((prev) => prev + TITLE[idx]);
        setIdx((i) => i + 1);
      }, 80);
      return () => clearTimeout(t);
    }
  }, [idx]);

  return (
    <section className="space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 py-8">
        {/* Profile picture */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="relative w-32 h-32 rounded-full border-2 border-cyan-glow/60 shadow-glow overflow-hidden">
            <Image
              src="/profile-picture.jpeg"
              alt="Jorge Adanza"
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-5xl font-bold glow-text tracking-wider"
        >
          Jorge Adanza
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-2xl text-gray-300 font-light tracking-[0.15em] h-8"
        >
          {displayed}
          <span className="animate-flicker text-cyan-glow ml-0.5">|</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="max-w-xl mx-auto text-gray-400 text-base leading-relaxed pt-2"
        >
          A full-stack developer with{" "}
          <span className="text-cyan-glow font-semibold">
            {getExperienceDuration()}
          </span>{" "}
          of experience — building fast, scalable web apps that people actually
          enjoy using, from pixel-perfect UIs to solid backend APIs.
        </motion.p>

        {/* Social + CV */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex justify-center items-center gap-4 pt-4 flex-wrap"
        >
          <SocialIcon
            href="https://linkedin.com/in/jorge-gabriel-adrian-adanza-770656193"
            label="LinkedIn"
          >
            <LinkedinIcon />
          </SocialIcon>
          <SocialIcon href="https://wa.me/+639380313106" label="WhatsApp">
            <WhatsappIcon />
          </SocialIcon>
          <SocialIcon href="https://github.com/RyuzakiEX" label="GitHub">
            <GithubIcon />
          </SocialIcon>
          <a
            href="/Jorge-Gabriel-Adrian-Adanza-CV-v3.pdf"
            download
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-glow/10 border border-cyan-glow/40 text-cyan-glow rounded-lg hover:bg-cyan-glow/20 hover:shadow-glow transition-all duration-200 text-sm font-semibold"
          >
            <Download size={16} />
            Download CV
          </a>
        </motion.div>
      </div>

      {/* Certificates — hidden for now
      <div>
        <h2 className="text-xl font-semibold text-gray-300 uppercase tracking-widest mb-6 border-l-2 border-cyan-glow pl-3">
          Certificates
        </h2>
        ...
      </div>
      */}

      {/* Tech Stack */}
      <div>
        <h2 className="text-xl font-semibold text-gray-300 uppercase tracking-widest mb-6 border-l-2 border-cyan-glow pl-3">
          Tech Stack
        </h2>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(experiences.flatMap((e) => e.stack))).map(
            (tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.04 }}
                className="px-3 py-1.5 bg-cyan-glow/10 border border-cyan-glow/30 text-cyan-glow text-sm rounded-full font-medium"
              >
                {tech}
              </motion.span>
            )
          )}
        </div>
      </div>
    </section>
  );
}
