"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { HomeGradientWrapper } from "./home-gradient-wrapper";

type Tutorial = {
  step: string;
  title: string;
  description: string;
  youtubeId: string;
};

const tutorials: Tutorial[] = [
  {
    step: "01",
    title: "Sign Up",
    description: "Create your PayMyFees account in minutes.",
    youtubeId: "4FvzAYXmv_Y",
  },
  {
    step: "02",
    title: "Verify Account",
    description: "Complete verification to unlock your account.",
    youtubeId: "M6pMBW7s7ao",
  },
  {
    step: "03",
    title: "Request Loan",
    description: "Apply for tuition financing in a few simple steps.",
    youtubeId: "HaicCKXMAyw",
  },
  {
    step: "04",
    title: "Multiple Loans",
    description: "See how to manage financing for more than one child.",
    youtubeId: "uvZmI-98Zbg",
  },
  {
    step: "05",
    title: "Approval & Disbursement",
    description: "Track your approval and get funds disbursed to your school.",
    youtubeId: "bVNB737HJ1c",
  },
];

function TutorialCard({ tutorial, onPlay }: { tutorial: Tutorial; onPlay: () => void }) {
  return (
    <button
      onClick={onPlay}
      className="group flex flex-col overflow-hidden rounded-[1rem] border border-[#E5E7EB] bg-white text-left shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)] transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#0A1330]">
        <Image
          src={`https://i.ytimg.com/vi/${tutorial.youtubeId}/hqdefault.jpg`}
          alt={tutorial.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
        <span
          className="absolute left-3 top-3 rounded-[0.375rem] bg-white/90 px-2 py-1 text-[0.6875rem] font-bold tracking-[0.04em] text-[#001D4C]"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          STEP {tutorial.step}
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.35)] transition-transform duration-200 group-hover:scale-110">
            <Play size={18} strokeWidth={2.5} fill="#001D4C" className="ml-0.5 text-[#001D4C]" />
          </span>
        </span>
      </div>
      <div className="flex flex-col gap-1 px-5 py-4 [font-family:Manrope]">
        <h3 className="text-[1rem] font-semibold leading-[120%] text-[#191919] md:text-[1.0625rem]">
          {tutorial.title}
        </h3>
        <p className="text-[0.8125rem] font-medium leading-[130%] text-[#7C7C7C] md:text-[0.875rem]">
          {tutorial.description}
        </p>
      </div>
    </button>
  );
}

export function HomeTutorialsSection() {
  const [activeVideo, setActiveVideo] = useState<Tutorial | null>(null);

  return (
    <HomeGradientWrapper>
      <section id="tutorials" className="px-6 py-14 md:px-10 md:py-20 xl:px-[11.25rem]">
        <div className="mx-auto max-w-[1512px]">
          <div className="mx-auto max-w-[43.75rem] text-center [font-family:Manrope]">
            <h2 className="text-[1.5rem] font-extrabold leading-[105%] tracking-[0] text-white md:text-[2.125rem]">
              See PayMyFees in Action
            </h2>
            <p className="mx-auto mt-4 max-w-[42rem] text-[0.9375rem] font-medium leading-[1.4] tracking-[0] text-[#B8C8E0] md:text-[1.0625rem]">
              Short walkthroughs on signing up, verifying your account, and getting your tuition financed; step by step.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-[75rem] gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tutorials.map((tutorial) => (
              <TutorialCard key={tutorial.youtubeId} tutorial={tutorial} onPlay={() => setActiveVideo(tutorial)} />
            ))}
          </div>
        </div>
      </section>

      {activeVideo ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-[54rem]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideo(null)}
              aria-label="Close video"
              className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X size={18} />
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-[0.75rem] border border-white/10 bg-black shadow-[0px_20px_60px_0px_rgba(0,0,0,0.5)]">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      ) : null}
    </HomeGradientWrapper>
  );
}
