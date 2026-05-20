"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, CheckCircle, XCircle, MessageCircle } from "lucide-react";
import { contactSchema, type ContactFormData } from "@/lib/validations";
import Card from "@/components/ui/Card";

type SubmitState = "idle" | "loading" | "success" | "error";

export default function Contact() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

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
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitState("success");
      reset();
      setTimeout(() => setSubmitState("idle"), 5000);
    } catch {
      setSubmitState("error");
      setTimeout(() => setSubmitState("idle"), 5000);
    }
  };

  const inputClass =
    "w-full bg-navy-950/80 border border-navy-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-glow/60 focus:shadow-glow transition-all duration-200";

  return (
    <section className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold glow-text tracking-widest uppercase">
        Contact Me
      </h2>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <div className="flex items-center gap-3 p-4 bg-navy-950/80 border border-navy-800 rounded-lg">
        <MessageCircle size={18} className="text-green-400 shrink-0" />
        <div className="text-sm">
          <p className="text-gray-400">
            Prefer a quicker reply?{" "}
            <a
              href="https://wa.me/+639380313106"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-glow hover:underline font-medium"
            >
              Message me on WhatsApp
            </a>
          </p>
        </div>
      </div>

      {submitState === "success" && (
        <div className="flex items-center gap-3 p-4 bg-green-900/30 border border-green-500/40 rounded-lg text-green-400">
          <CheckCircle size={18} />
          Message sent successfully!
        </div>
      )}
      {submitState === "error" && (
        <div className="flex items-center gap-3 p-4 bg-red-900/30 border border-red-500/40 rounded-lg text-red-400">
          <XCircle size={18} />
          Something went wrong. Please try again.
        </div>
      )}
    </section>
  );
}
