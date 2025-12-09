"use client"

import Image from "next/image"

export function FeaturesSection() {
  return (
    <section className="relative md:py-[2rem]">
      <div className="
          bg-cover bg-center bg-no-repeat absolute inset-0 z-20 opacity-10 pointer-events-none
        "
        style={{ backgroundImage: "url('/images/shapes.png')" }}
      ></div>
      <div className="
        absolute inset-0 bg-[linear-gradient(160deg,_white_0%,_white_0%,_rgba(0,41,107,1)_100%)]
          z-10
        "
      ></div>


      {/* Main Content */}
      <div className="relative z-30 flex flex-col items-center gap-[48px] md:py-[11rem] py-14 md:px-[190px] px-6 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="w-full">
          <h2 className="text-[#292929] md:text-[2.81rem] text-[2.41rem] font-extrabold leading-[1.2em] text-center mb-4 w-full">
            Why Thousands Trust PayMyFees
          </h2>
          <p className="text-[#292929] md:text-[1.56rem] text-[1.16rem] font-medium leading-[1.2em] text-center">
            Seamless payments and funding built for education
          </p>
        </div>

        {/* Features Grid */}
        <div className="flex gap-[45px]">
          {/* First Row */}
          <div className="flex lg:flex-row flex-col gap-[19px] ">
            {/* Secure & Transparent Card */}
            <div className="lg:w-[390px] h-[641px] bg-[#E6EAF0] rounded-[12px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)] relative">
              {/* Decorative Element */}
              <div className="px-6 pt-6 pb-[1.06rem]">
                <div className="relative  w-full h-[201px] bg-[#B0BDD1] rounded-[12px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)]">
                 
                  <Image
                    src="/images/chain-lock-clip.png"
                    alt="Security icon"
                    fill
                    className=""
                  />
                 
                </div>
              </div>

              {/* Content */}
              <div className="px-[1.06rem] flex flex-col gap-[15px]">
                <h3 className="text-[#292929] text-[33px] font-bold leading-[1.2em]">
                  Secure & Transparent
                </h3>
                <p className="text-[#292929] text-[17px] font-bold leading-[1.2em]">
                  Secure, transparent & effortless cash flow.
                </p>
                <p className="text-[#525252] text-[15px] font-normal leading-[1.2em]">
                  Experience financial freedom built on trust and clarity. Our platform ensures secure and transparent transactions. Every payment, transfer, and update is traceable, protected, and crystal clear so you always know where your money goes and how it&apos;s working for you.
                </p>
              </div>

              {/* Icon */}
              <div className="relative md:mt-8 h-auto flex justify-center">
                <div className="bg-[#B0BDD1] absolute mt-6 w-16 h-16 rounded-full" />
                <Image
                  src="/images/lock-and-key-cartoon.png"
                  alt="Security icon"
                  width={83}
                  height={77}

                  className="z-10 mt-2"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-[19px] lg:w-[788px]">
              {/* No More School Fee Wahala Card */}
              <div className="bg-[#E6EAF0] rounded-[25px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)] md:h-[19.93rem] h-[22.81rem] relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute right-[-50px] top-[-20px] w-[563px] h-[563px] md:block hidden">
                  <Image
                    src="/images/cartoon_no_more.png"
                    alt="Student celebrating"
                    width={563}
                    height={563}
                    className="object-cover"
                  />
                </div>

                <div className="absolute right-0 -bottom-1 w-60 h-full md:hidden block">
                  <Image
                    src="/images/no-more.png"
                    alt="Student celebrating"
                   fill
                    className="object-contain"
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 pt-[2.75rem] md:pl-[4.75rem] pl-6 flex flex-col gap-[20px] w-full">
                  <div className="md:max-w-[27.05rem]
                  max-w-[18.05rem] space-y-5">
                    <h3 className="text-[#292929] text-[30px] font-bold leading-[1.2em]">
                      No More School Fee
                      <br />
                      Wahala!
                    </h3>
                    <p className="text-[#292929] text-[17px] font-bold leading-[1.2em]">
                      Get instant funding for your tuition, No more worries
                    </p>
                    <p className="text-[#525252] text-[15px] font-normal leading-[1.2em]">
                      With PayMyFees you don&apos;t have to worry too much about how you will meet up with tuition payment for your studies. We make it easy, no stress no hazel
                    </p>

                    <button className="flex items-center gap-[8px] px-[42px] py-[15px] bg-[#00296B] rounded-[16px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] text-white text-[14px] font-bold leading-[1.366em] w-fit mt-4 hover:opacity-90 transition-opacity">
                      Learn More
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M8.5 12H15.5M15.5 12L12.5 9M15.5 12L12.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Decorative Dollar Icon */}
                <div className="absolute -left-[84px] bottom-0 w-[195px] h-[190px]">
                  <Image
                    src="/images/dollar_layer.png"
                    alt=""
                    fill
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Bottom Row - Two Cards */}
              <div className="flex md:flex-row flex-col gap-[1rem] md:px-0">
                {/* Fast Loan Approvals */}
                <div className="md:w-[386px] md:h-[303px] bg-[#E6EAF0] rounded-[12px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)] p-[20px] relative overflow-hidden">
                  <div className="flex flex-col gap-[15px] mt-[42px]">
                    <h3 className="text-[#292929] text-[33px] font-bold leading-[1.2em]">
                      Fast Loan Approvals
                    </h3>
                    <p className="text-[#292929] text-[17px] font-bold leading-[1.2em]">
                      Verified loans in minutes, Super fast.
                    </p>
                    <p className="text-[#525252] text-[15px] font-normal leading-[1.2em]">
                      Accessing the funds you need for education has never been faster. With PayMyFees, students and schools can apply for verified loans, get instant eligibility checks, and receive approvals within minutes.
                    </p>
                  </div>

                  {/* Icon */}
                  <div className="absolute top-0 -right-8 overflow-hidden w-[146px] h-[142px] rotate-180">
                    <Image
                      src="/images/dollar_layer.png"
                      alt="Fast approval icon"
                     fill
                     priority
                    // className="absolute top-0 right-0"
                    />
                  </div>
                </div>

                {/* Flexible Repayment */}
                <div className="md:w-[386px] md:h-[303px] bg-[#E6EAF0] overflow-hidden rounded-[12px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)] p-[1rem] relative">
                  <div className="flex flex-col gap-[15px] md:pb-0 pb-10 mt-[45px]">
                    <h3 className="text-[#292929] text-[33px] font-bold leading-[1.2em]">
                      Flexible Repayment
                    </h3>
                    <p className="text-[#292929] text-[17px] font-bold leading-[1.2em]">
                      Choose plans that match your income or term.
                    </p>
                    <p className="text-[#525252] text-[15px] font-normal leading-[1.2em] relative z-20">
                      Enjoy flexible payment options designed around your lifestyle. With PayMyFees, you can select plans that fit your income level, study duration, or repayment comfort.
                    </p>
                  </div>

                  {/* Image */}
                  <div className="absolute -bottom-8 left-[2.31rem] w-[169px] h-[105px]">
                    <Image
                      src="/images/trending.png"
                      alt="Flexible payment icon"
                      width={169}
                      height={105}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
