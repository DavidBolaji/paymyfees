import Image from "next/image";
import SmartEducationBadge from "@/assets/images/smart_education_badge.png";
// import leftWaveMetric from "@/assets/images/left-wave-metric.png";
// import rightWaveMetric from "@/assets/images/right-wave-metric.png";

const metricItems = [
  { label: "Schools Engaged", value: "1,000+" },
  { label: "Teachers Supported", value: "1,500+" },
  { label: "Students Catered For", value: "5,000+" },
  { label: "Tuition Financing Facilitated", value: "₦500M+" },
];

export function HomeMetricsSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#F4F4F4] py-[3rem] md:py-[4.5rem]">
      <div className="relative z-10 mx-auto flex w-full max-w-[1512px] flex-col items-center px-6 [font-family:Manrope] md:px-10">
        <div>
          <Image src={SmartEducationBadge} alt="Smart Education Finance" width={279} height={41} priority />
        </div>

        <h2 className="mt-[18px] text-center text-[1.75rem] font-extrabold leading-[110%] tracking-[0] text-[#191919] md:text-[2.125rem]">
          Education Financing at Scale
        </h2>

        <p className="mt-[7px] text-center text-[1.0625rem] font-medium leading-[120%] tracking-[0] text-[#7C7C7C]">
          Measured impact across schools, teachers, and families.
        </p>

        <div className="mt-[1.5rem] grid w-full max-w-[61.8125rem] grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {metricItems.map((metric) => (
            <article key={metric.label} className="flex flex-col items-center gap-[0.5rem] text-center">
              <h3 className="text-[2rem] font-bold leading-[110%] tracking-[0] text-[#191919] md:text-[2.125rem]">{metric.value}</h3>
              <p className="text-[0.9375rem] font-medium leading-[120%] tracking-[0] text-[#7C7C7C] md:text-[1.0625rem]">{metric.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
