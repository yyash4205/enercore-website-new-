"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { journey } from "@/lib/site-data";

export function MilestonesSlider() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const prev = useCallback(() => {
    if (active === 0) return;
    setDirection(-1);
    setActive((i) => i - 1);
  }, [active]);

  const next = useCallback(() => {
    if (active === journey.length - 1) return;
    setDirection(1);
    setActive((i) => i + 1);
  }, [active]);

  const goTo = useCallback((i: number) => {
    setDirection(i > active ? 1 : -1);
    setActive(i);
  }, [active]);

  /* Keyboard nav */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const milestone = journey[active];

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 60 }),
    center: { opacity: 1, x: 0 },
    exit:  (dir: number) => ({ opacity: 0, x: dir * -60 }),
  };

  const imageVariants = {
    enter: (dir: number) => ({ opacity: 0, scale: 0.88, x: dir * 40 }),
    center: { opacity: 1, scale: 1, x: 0 },
    exit:  (dir: number) => ({ opacity: 0, scale: 0.88, x: dir * -40 }),
  };

  return (
    <section className="relative overflow-hidden bg-[#1b291f] py-24">
      {/* Subtle dot-grid texture */}
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
      {/* Green glow orb */}
      <div className="pointer-events-none absolute -right-32 top-0 h-[600px] w-[600px] rounded-full bg-[#90c955]/6 blur-[140px]" />

      <div className="relative mx-auto w-full max-w-7xl px-6 md:px-10">

        {/* Section label + heading */}
        <div className="mb-16 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ffe55d]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#ffe55d]/70">Our Milestones</p>
            </div>
            <h2
              className="font-heading text-4xl font-semibold text-white md:text-5xl"
              style={{ letterSpacing: "-0.03em" }}
            >
              Pioneering Journey
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-[#8f9c93]">
            From our first installation to industry-scale open access projects — every milestone tells our story.
          </p>
        </div>

        {/* Slide */}
        <div className="grid min-h-[380px] items-center gap-12 md:grid-cols-2">

          {/* Left — text */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={active}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Status badge */}
              <span
                className={`mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                  milestone.isUpcoming
                    ? "bg-[#ffe55d]/12 text-[#ffe55d]"
                    : "bg-[#90c955]/12 text-[#90c955]"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${milestone.isUpcoming ? "bg-[#ffe55d]" : "bg-[#90c955]"}`} />
                {milestone.isUpcoming ? "Upcoming" : "Completed"}
              </span>

              {/* Giant year watermark */}
              <p
                className="font-heading text-[5rem] font-bold leading-none md:text-[7rem]"
                style={{
                  letterSpacing: "-0.05em",
                  color: milestone.isUpcoming ? "rgba(255,229,93,0.10)" : "rgba(144,201,85,0.10)",
                }}
              >
                {milestone.date}
              </p>

              {/* Title */}
              <h3
                className="-mt-3 font-heading text-2xl font-semibold text-white md:text-3xl"
                style={{ letterSpacing: "-0.03em" }}
              >
                {milestone.label}
              </h3>

              {/* Description */}
              <p className="mt-4 max-w-md text-base leading-relaxed text-[#8f9c93]">
                {milestone.description}
              </p>

              {/* Progress bar */}
              <div className="mt-8 h-px w-full max-w-sm bg-white/8">
                <motion.div
                  className="h-full bg-[#ffe55d]/60 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((active + 1) / journey.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <p className="mt-2 text-xs text-white/25">
                {active + 1} of {journey.length}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Right — circular image */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={active}
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center md:justify-end"
            >
              <div className="relative">
                {/* Outer glow ring */}
                <div
                  className={`absolute -inset-4 rounded-full blur-2xl opacity-20 ${
                    milestone.isUpcoming ? "bg-[#ffe55d]" : "bg-[#90c955]"
                  }`}
                />
                {/* Ring border */}
                <div
                  className={`absolute -inset-1 rounded-full border-2 ${
                    milestone.isUpcoming ? "border-[#ffe55d]/25" : "border-[#90c955]/25"
                  }`}
                />
                {/* Circle image */}
                <div className="relative h-64 w-64 overflow-hidden rounded-full md:h-80 md:w-80">
                  {milestone.image ? (
                    <Image
                      src={milestone.image}
                      alt={milestone.label}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 256px, 320px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#274b30]">
                      <span
                        className="font-heading text-7xl font-bold"
                        style={{ color: "rgba(255,229,93,0.15)", letterSpacing: "-0.05em" }}
                      >
                        {active + 1}
                      </span>
                    </div>
                  )}
                  {/* Inner vignette */}
                  <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
                </div>

                {/* Floating dot accents */}
                <div
                  className={`absolute -right-3 top-8 h-4 w-4 rounded-full ${
                    milestone.isUpcoming ? "bg-[#ffe55d]/60" : "bg-[#90c955]/60"
                  }`}
                />
                <div className="absolute -bottom-2 left-10 h-2.5 w-2.5 rounded-full bg-white/20" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation — dots + arrows */}
        <div className="mt-14 flex items-center justify-between">
          {/* Dot timeline */}
          <div className="flex items-center gap-1.5">
            {journey.map((m, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={m.label}
                className={`rounded-full transition-all duration-300 ${
                  i === active
                    ? "h-3 w-8 bg-[#ffe55d]"
                    : i < active
                    ? "h-2.5 w-2.5 bg-[#90c955]/50 hover:bg-[#90c955]/80"
                    : "h-2.5 w-2.5 bg-white/15 hover:bg-white/30"
                }`}
              />
            ))}
          </div>

          {/* Arrow buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              disabled={active === 0}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white/60 transition-all hover:border-white/30 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Previous milestone"
            >
              ←
            </button>
            <button
              onClick={next}
              disabled={active === journey.length - 1}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffe55d] text-[#1b291f] transition-all hover:bg-[#ffe55d]/85 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next milestone"
            >
              →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
