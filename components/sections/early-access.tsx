"use client";

import Image from "next/image";
import GetEarlyAccessBadge from "@/assets/images/get_early_access_badge.png";
import LinkedStar from "@/assets/images/linked_star.png";
import { EarlyAccessForm } from "@/components/forms/early-access-form";

export function EarlyAccessSection() {
  return (
    <section className="relative w-full lg:px-0">
      {/* Badge */}
      <div className="relative pt-[4.3125rem] mb-[2.25rem] flex justify-center items-center w-full">
        <Image
          src={GetEarlyAccessBadge}
          alt="Smart education badge"
          width={279}
          height={41}
          priority
        />
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto lg:px-0 px-6">
        <EarlyAccessForm />
      </div>

      {/* Headings */}
      <div className="mb-[0.9375rem] mx-auto text-center">
        <h4 className="font-extrabold lg:text-[2.8125rem] text-[1.8125rem] lg:max-w-none max-w-96 px-6 mx-auto">
          Building <span className="text-[#002561]">Financial</span> Access for Every Learner.
        </h4>

        <p className="text-[#292929] font-medium mx-auto lg:text-[1.5625rem] text-[1.1625rem] mb-[1.9375rem] lg:max-w-none max-w-96">
          PayMyFees makes tuition payments faster, safer, and more accessible.
        </p>
      </div>

      {/* Background Section */}
      <div className="relative lg:py-[6.125rem] py-6 flex lg:h-[28.68rem] overflow-hidden">
        {/* Background Image */}
        <div
          className="bg-cover bg-center bg-no-repeat absolute inset-0 z-20 opacity-10 pointer-events-none"
          style={{ backgroundImage: "url('/images/early_access.png')" }}
        ></div>

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 lg:py-[6.125rem] flex bg-[linear-gradient(160deg,_white_0%,_white_0%,_rgba(176,189,209,1)_100%)] z-10"
        ></div>

        {/* Content */}
        <div className="lg:flex z-30 items-center gap-6 max-w-7xl mx-auto">
          {/* Text */}
          <p className="font-medium lg:pl-[1.75rem] lg:text-[1.8875rem] text-[1.4875rem] flex-1 tracking-tight leading-tight lg:text-left text-center px-6">
            We believe education should never stop because of finances. Our platform helps 
            <span className="text-[#002561]"> students pay tuition in full </span> or in flexible plans, 
            <span className="text-[#002561]"> enables schools to access verified funding </span> 
            that keeps operations steady while also providing funding to teachers.
          </p>

          {/* Image */}
          <div className="flex-1 relative h-full flex justify-center lg:block mt-6 lg:mt-0">
            <Image
              src={LinkedStar}
              alt="Linked Star"
              width={643}
              height={372}
              className="lg:-translate-y-20 -translate-y-28 lg:scale-100 scale-90 object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
