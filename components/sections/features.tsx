"use client"

import Image from "next/image"

export function FeaturesSection() {
  return (
    <section className="relative md:py-[2rem]">
      <div className="z-20 absolute inset-0 bg-cover bg-no-repeat bg-center opacity-10 pointer-events-none"
        style={{ backgroundImage: "url('/images/shapes.png')" }}
      ></div>
      <div className="z-10 absolute inset-0 bg-[linear-gradient(160deg,_white_0%,_white_0%,_rgba(0,41,107,1)_100%)]"
      ></div>


      {/* Main Content */}
      <div id="works" className="z-30 relative flex flex-col items-center gap-[48px] mx-auto px-6 md:px-[190px] py-14 md:py-[11rem] max-w-7xl">
        {/* Section Header */}
        <div className="w-full">
          <h2 className="mb-4 w-full font-extrabold text-[#292929] text-[2.11rem] md:text-[2.81rem] text-center leading-[1.2em]">
            Why Thousands Trust PayMyFees
          </h2>
          <p className="font-medium text-[#292929] text-[1.16rem] md:text-[1.56rem] text-center leading-[1.2em]">
            Seamless payments and funding built for education
          </p>
        </div>

        {/* Features Grid */}
        <div className="flex gap-[45px]">
          {/* First Row */}
          <div className="flex lg:flex-row flex-col gap-[19px]">
            {/* Secure & Transparent Card */}
            <div className="relative bg-[#E6EAF0] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)] rounded-[12px] lg:w-[390px] h-[641px]">
              {/* Decorative Element */}
              <div className="px-6 pt-6 pb-[1.06rem]">
                <div className="relative bg-[#B0BDD1] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] rounded-[12px] w-full h-[201px]">
                 
                  <Image
                    src="/images/chain-lock-clip.png"
                    alt="Security icon"
                    fill
                    className=""
                  />
                 
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-[15px] px-[1.06rem]">
                <h3 className="font-bold text-[#292929] text-[33px] leading-[1.2em]">
                  Secure & Transparent
                </h3>
                <p className="font-bold text-[#292929] text-[17px] leading-[1.2em]">
                  Secure, transparent & effortless cash flow.
                </p>
                <p className="font-normal text-[#525252] text-[15px] leading-[1.2em]">
                  All loans and repayments on PayMyFees are securely processed, fully traceable, and clearly communicated with no hidden charges.
                </p>
              </div>

              {/* Icon */}
              <div className="relative flex justify-center md:mt-8 h-auto">
                <div className="absolute bg-[#B0BDD1] mt-6 rounded-full w-16 h-16" />
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
              <div className="relative bg-[#E6EAF0] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)] rounded-[25px] h-[22.81rem] md:h-[19.93rem] overflow-hidden">
                {/* Background Image */}
                <div className="hidden md:block top-[-20px] right-[-50px] absolute w-[563px] h-[563px]">
                  <Image
                    src="/images/cartoon_no_more.png"
                    alt="Student celebrating"
                    width={563}
                    height={563}
                    className="object-cover"
                  />
                </div>

                {/* <div className="md:hidden block right-0 -bottom-1 absolute w-60 h-full">
                  <Image
                    src="/images/no-more.png"
                    alt="Student celebrating"
                   fill
                    className="object-contain"
                  />
                </div> */}

                {/* Content */}
                <div className="z-10 relative flex flex-col gap-[20px] pt-[2.75rem] pl-6 md:pl-[4.75rem] w-full">
                  <div className="space-y-5 max-w-[18.05rem] md:max-w-[27.05rem]">
                    <h3 className="font-bold text-[#292929] text-[30px] leading-[1.2em]">
                      No More School Fee
                      <br />
                      Wahala!
                    </h3>
                    <p className="font-bold text-[#292929] text-[17px] leading-[1.2em]">
                      Get instant funding for your tuition, No more worries
                    </p>
                    <p className="font-normal text-[#525252] text-[15px] leading-[1.2em]">
                      With PayMyFees you don&apos;t have to worry too much about how you will meet up with tuition payment for your studies. We make it easy, no stress, no hassle
                    </p>

                    <button className="flex items-center gap-[8px] bg-[#00296B] hover:opacity-90 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] mt-4 px-[42px] py-[15px] rounded-[16px] w-fit font-bold text-[14px] text-white leading-[1.366em] transition-opacity">
                      Learn More
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M8.5 12H15.5M15.5 12L12.5 9M15.5 12L12.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Decorative Dollar Icon */}
                <div className="bottom-0 -left-[84px] absolute w-[195px] h-[190px]">
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
                <div className="relative bg-[#E6EAF0] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)] p-[20px] rounded-[12px] md:w-[386px] md:h-[303px] overflow-hidden">
                  <div className="flex flex-col gap-[15px] mt-[42px]">
                    <h3 className="font-bold text-[#292929] text-[33px] leading-[1.2em]">
                      Fast Loan Approvals
                    </h3>
                    <p className="font-bold text-[#292929] text-[17px] leading-[1.2em]">
                      Verify loans  quickly, Super fast.
                    </p>
                    <p className="font-normal text-[#525252] text-[15px] leading-[1.2em]">
                      Accessing the funds you need for education has never been faster. With PayMyFees, students and schools can apply for verified loans, get instant eligibility checks, and receive quick approvals.
                    </p>
                  </div>

                  {/* Icon */}
                  <div className="top-0 -right-8 absolute w-[146px] h-[142px] overflow-hidden rotate-180">
                    <Image
                      src="/images/dollar_layer.png"
                      alt="Fast approval icon"
                     fill
                     priority
                    // className="top-0 right-0 absolute"
                    />
                  </div>
                </div>

                {/* Flexible Repayment */}
                <div className="relative bg-[#E6EAF0] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)] p-[1rem] rounded-[12px] md:w-[386px] md:h-[303px] overflow-hidden">
                  <div className="flex flex-col gap-[15px] mt-[45px] pb-10 md:pb-0">
                    <h3 className="font-bold text-[#292929] text-[33px] leading-[1.2em]">
                      Flexible Repayment
                    </h3>
                    <p className="font-bold text-[#292929] text-[17px] leading-[1.2em]">
                      Choose plans that match your income or term.
                    </p>
                    <p className="z-20 relative font-normal text-[#525252] text-[15px] leading-[1.2em]">
                      Enjoy flexible payment options designed around your lifestyle. With PayMyFees, you can select plans that fit your income level, study duration, or repayment comfort.
                    </p>
                  </div>

                  {/* Image */}
                  <div className="-bottom-8 left-[2.31rem] absolute w-[169px] h-[105px]">
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
