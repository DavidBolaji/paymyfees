"use client"

import { EarlyAccessForm } from "../forms/early-access-form"

export function CTASection() {
  return (
    <section className="py-20 relative px-6 bg-[linear-gradient(160deg,_white_30%,_white_0%,_rgba(0,41,107,0.2)_100%)]
         ">
      <div className="max-w-4xl z-10 overflow-hidden relative mx-auto rounded-3xl bg-[#00173B] px-4 sm:px-6 lg:px-8">
        <div className="md:block hidden
          bg-cover bg-center bg-no-repeat absolute inset-0 z-0 pointer-events-none
        "
          style={{ backgroundImage: "url('/images/grid.png')" }}
        ></div>
 <div className="md:hidden block
          bg-cover bg-center bg-no-repeat absolute inset-0 z-0 pointer-events-none
        "
          style={{ backgroundImage: "url('/images/grid-mobile.png')" }}
        ></div>

        <div className="text-center relative z-10 text-white md:pt-[5.625rem] pt-10 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Join Thousands Getting Easy Access to
            <br />
            Student Education Finance
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Be the first to experience effortless tuition payments & flexible loan plans for students, teachers and Instituitions
          </p>
        </div>

        <div
          className="max-w-2xl mx-auto z-30 pb-[3.68rem]"
        >
          <EarlyAccessForm white />

        </div>
      </div>
    </section>
  )
}