import Image from "next/image";
import productImg1 from "@/assets/home/assets/product-img-1.jpg";
import productImg2 from "@/assets/home/assets/product-img-2.jpg";
import productImg3 from "@/assets/home/assets/product-img-3.jpg";

const products = [
  {
    title: "PayMyFees Flex",
    subtitle: "For Parents",
    body: "Spread tuition payments across manageable monthly plans.",
    image: productImg1,
  },
  {
    title: "PayMyFees Boost",
    subtitle: "For Teachers",
    body: "Access salary & financial support when short-term needs arise.",
    image: productImg2,
  },
  {
    title: "PayMyFees Grow",
    subtitle: "For Schools",
    body: "Improve cash flow stability with upfront tuition settlement",
    image: productImg3,
  },
];

export function HomeProductsSection() {
  return (
    <section id="products" className="bg-white px-6 pb-14 pt-[7.5rem] md:px-10 xl:px-[11.25rem]">
      <div className="mx-auto max-w-[1512px]">
        <div className="mb-[1.5625rem] text-center [font-family:Manrope]">
          <h2 className="mb-[0.625rem] text-[1.5rem] font-extrabold leading-[105%] tracking-[0] text-[#191919] md:text-[2.125rem]">
            Designed for the Education Community
          </h2>
          <p className="text-[0.9375rem] font-medium leading-[120%] tracking-[0] text-[#191919] md:text-[1.0625rem]">
            Our products support parents, teachers, and schools within one structured financing system.
          </p>
        </div>

        <div className="mt-10 grid gap-[1.625rem] sm:grid-cols-2 md:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.title}
              className="mx-auto flex w-full flex-col gap-[1.125rem] overflow-hidden rounded-[1rem] border border-[#00296B] bg-white pb-[0.9375rem] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.08)] sm:max-w-[22.875rem]"
            >
              <Image
                src={product.image}
                alt={product.title}
                className="h-[18.375rem] w-full rounded-[1rem] border border-[#DCDCDC] object-fit object-center overflow-hidden"
              />
              <div className="flex flex-col gap-[1.125rem] px-[0.5rem] [font-family:Manrope]">
                <div>
                  <h3 className="text-[1.125rem] font-semibold leading-[120%] tracking-[0] text-[#252525]">{product.title}</h3>
                  <p className="mt-1 text-[0.875rem] font-medium leading-[120%] tracking-[0] text-[#252525]">{product.subtitle}</p>
                  <p className="mt-2 text-[0.875rem] font-medium leading-[120%] tracking-[0] text-[#252525]">{product.body}</p>
                </div>
                <button className="h-[2.5rem] w-full max-w-[21.875rem] rounded-[0.5rem] bg-[#001D4C] px-[1.125rem] py-[0.6875rem] text-[0.875rem] font-semibold leading-[120%] tracking-[0] text-[#E6EAF0]">
                  Apply Now
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-[3.125rem] flex flex-wrap items-center justify-center gap-[1.125rem] [font-family:Manrope]">
          <button className="h-[2.875rem] w-[15rem] rounded-[0.5rem] border border-[#001D4C] bg-white px-[1.5rem] py-[0.6875rem] text-[0.9375rem] font-semibold leading-[120%] tracking-[0] text-[#001D4C]">
            Learn More
          </button>
          <button className="h-[2.875rem] w-[15rem] rounded-[0.5rem] bg-[#001D4C] px-[1.5rem] py-[0.6875rem] text-[0.9375rem] font-semibold leading-[120%] tracking-[0] text-[#E6EAF0]">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
}
