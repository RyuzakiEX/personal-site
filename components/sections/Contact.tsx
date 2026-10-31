"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, CheckCircle, XCircle, MessageCircle } from "lucide-react";
import { contactSchema, type ContactFormData } from "@/lib/validations";
import Card from "@/components/ui/Card";
import { react, setListening } from "@/components/three/sceneState";
import { flipIn } from "@/lib/motion";

type SubmitState = "idle" | "loading" | "success" | "error";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export default function Contact() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState(GENERIC_ERROR);
  // Spam checks: the API drops forms that fill the hidden field or arrive too
  // soon after this token was issued.
  const honeypotRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<string>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitState("loading");
    let error = GENERIC_ERROR;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          hp_check: honeypotRef.current?.value,
          token: tokenRef.current,
        }),
      });
      if (!res.ok) {
        // Show the API's reason, such as the rate limit, when it gives one.
        const body = await res.json().catch(() => null);
        if (typeof body?.error === "string") error = body.error;
        throw new Error(error);
      }
      setSubmitState("success");
      react("sent");
      reset();
      setTimeout(() => setSubmitState("idle"), 5000);
    } catch {
      setErrorMessage(error);
      setSubmitState("error");
      react("failed");
      setTimeout(() => setSubmitState("idle"), 5000);
    }
  };

  useEffect(() => () => setListening(false), []);

  useEffect(() => {
    fetch("/api/contact", { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => {
        tokenRef.current = body.token;
      })
      // Without a token the API asks the visitor to refresh, so nothing to do.
      .catch(() => {});
  }, []);

  const inputClass =
    "w-full bg-navy-950/80 border border-navy-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-glow/60 focus:shadow-glow transition-all duration-200";

  return (
    <section className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold glow-text tracking-widest uppercase">
        Contact Me
      </h2>
      <motion.div variants={flipIn} initial="hidden" animate="visible" custom={0.25}>
        <Card>
          <form
            onSubmit={handleSubmit(onSubmit, () => react("invalid"))}
            onFocus={() => setListening(true)}
            onBlur={() => setListening(false)}
            className="space-y-4"
          >
            {/* Honeypot: bots fill every input they find in the markup. It's
                display:none and has a name autofill doesn't recognize, so
                browsers and password managers leave it empty. */}
            <div hidden>
              <input
                ref={honeypotRef}
                type="text"
                name="hp_check"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  {...register("name")}
                  placeholder="Name"
                  className={inputClass}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  {...register("email")}
                  placeholder="Email"
                  type="email"
                  className={inputClass}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <input
                {...register("subject")}
                placeholder="Subject"
                className={inputClass}
              />
              {errors.subject && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.subject.message}
                </p>
              )}
            </div>
            <div>
              <textarea
                {...register("message")}
                placeholder="Your message..."
                rows={5}
                className={`${inputClass} resize-none`}
              />
              {errors.message && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitState === "loading"}
              className="flex items-center gap-2 px-6 py-3 w-full justify-center bg-cyan-glow/10 border border-cyan-glow/50 text-cyan-glow rounded-lg hover:bg-cyan-glow/20 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed font-semibold tracking-widest uppercase text-sm transition-all duration-200"
            >
              <Send size={16} />
              {submitState === "loading" ? "Sending..." : "Send Message"}
            </button>
          </form>
        </Card>
      </motion.div>

      <motion.div
        variants={flipIn}
        initial="hidden"
        animate="visible"
        custom={0.4}
        className="flex items-center gap-3 p-4 bg-navy-950/80 border border-navy-800 rounded-lg"
      >
        <MessageCircle size={18} className="text-green-400 shrink-0" />
        <div className="text-sm">
          <p className="text-gray-400">
            Prefer a quicker reply?{" "}
            <a
              href="https://wa.me/+639380313106"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => react("chat")}
              className="text-cyan-glow hover:underline font-medium"
            >
              Message me on WhatsApp
            </a>
          </p>
        </div>
      </motion.div>

      {submitState === "success" && (
        <div className="flex items-center gap-3 p-4 bg-green-900/30 border border-green-500/40 rounded-lg text-green-400">
          <CheckCircle size={18} />
          Message sent successfully!
        </div>
      )}
      {submitState === "error" && (
        <div className="flex items-center gap-3 p-4 bg-red-900/30 border border-red-500/40 rounded-lg text-red-400">
          <XCircle size={18} />
          {errorMessage}
        </div>
      )}
    </section>
  );
}
