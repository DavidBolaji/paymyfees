import { HomeGradientWrapper } from "./home-gradient-wrapper";

type Story = {
  quote: string;
  name: string;
  role: string;
  avatarBg: string;
};

const row1: Story[] = [
  {
    quote: "PayMyFees has significantly reduced my financial pressure and given me the flexibility to manage other priorities. It's a service I trust and confidently recommend to others.",
    name: "Cyril E",
    role: "Parent, Ogun State",
    avatarBg: "#4A6FA5",
  },
  {
    quote: "Partnering with PayMyFees has been great. The platform is super supportive, I love the flexible payment plans, it eased my financial burden and also made me pay my ward's fee on time. Paymyfees is a win win for me.",
    name: "Kehinde A",
    role: "Parent",
    avatarBg: "#3A7A5A",
  },
  {
    quote: "I ran into PAYMYFEES at a time when I needed it most. The process is easy and seamless. Disbursement is done directly into the school's account to avoid stories that touch.",
    name: "Titi",
    role: "Teacher",
    avatarBg: "#7A5A3A",
  },
  {
    quote: "Paymyfees was introduced to me by my colleague, it really saved me from trauma and stress as a single mom. What I really enjoyed about paymyfees is the percentage and ease. Kudos to paymyfees, forward ever backwards never 🙏",
    name: "Rukky S.",
    role: "Parent",
    avatarBg: "#8B3A3A",
  },
];

const row2: Story[] = [
  {
    quote: "Working with PayMyFees has improved our fee collection and supported our parents financially. It's been a valuable partnership.",
    name: "School Director",
    role: "School Leadership",
    avatarBg: "#5A5A7A",
  },
  {
    quote: "As a parent of four, paying school fees has always been a heavy responsibility. PayMyFees stepped in and made it possible for all my children to stay in school without interruption. That peace of mind means everything to me.",
    name: "Grateful Parent",
    role: "Parent",
    avatarBg: "#C4A882",
  },
  {
    quote: "Overall, our experience with PayMyFees has been smooth and rewarding, and we appreciate the value it brings to both our school and our parent community.",
    name: "W.M. Adesanya (Mrs)",
    role: "Head of School, Glorious Redeemer's School",
    avatarBg: "#6A4A7A",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StoryCard({ story }: { story: Story }) {
  return (
    <div className="inline-flex w-[80vw] sm:w-[45vw] lg:w-[calc(25vw-1.125rem)] shrink-0 flex-col justify-between gap-4 rounded-[1rem] border border-[#E5E7EB] bg-white p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)]">
      <p
        className="text-[0.875rem] leading-[1.4] tracking-[0] text-[#191919]"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        {story.quote}
      </p>
      <div className="flex items-center gap-3">
        <div
          className="flex h-[3rem] w-[3rem] shrink-0 items-center justify-center rounded-[0.5rem] text-[0.875rem] font-bold text-white"
          style={{ backgroundColor: story.avatarBg }}
        >
          {getInitials(story.name)}
        </div>
        <div>
          <p
            className="text-[0.9375rem] font-semibold leading-[1.2] tracking-[0] text-[#191919]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {story.name}
          </p>
          <p
            className="mt-[0.125rem] text-[0.8125rem] font-medium leading-[1.2] tracking-[0] text-[#7C7C7C]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {story.role}
          </p>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ stories, direction }: { stories: Story[]; direction: "left" | "right" }) {
  // On mobile cards are 80vw (need 2/story), tablet 45vw (need 3/story), desktop 25vw (need 4/story).
  // Use the largest requirement (desktop) so it's seamless at all sizes.
  const halfCopies = Math.ceil(4 / stories.length);
  const totalCopies = Math.max(halfCopies * 2, 4);
  const repeated = Array.from({ length: totalCopies }, () => stories).flat();
  return (
    <div className="marquee-track w-full overflow-hidden">
      <div
        className={`flex gap-[1.125rem] ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}
        style={{ width: "max-content" }}
      >
        {repeated.map((story, i) => (
          <StoryCard key={`${story.name}-${i}`} story={story} />
        ))}
      </div>
    </div>
  );
}

export function HomeRealStoriesSection() {
  return (
    <HomeGradientWrapper>
      <section id="about" className="overflow-hidden pt-[5.25rem] pb-[8.375rem]">
        <div
          className="mb-[2.5rem] px-6 text-center md:px-10 xl:px-[11.25rem]"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          <h2 className="text-[2.6875rem] font-extrabold leading-[105%] tracking-[0] text-white md:text-[2.125rem]">
            Real Stories. Real Impact.
          </h2>
          <p className="mx-auto mt-[0.75rem] max-w-[680px] text-[0.9375rem] font-medium leading-[1.55] tracking-[0] text-[#B8C8E0] md:text-[1.0625rem]">
            Across Nigeria, families, teachers, and schools are using PayMyFees to remove financial
            pressure from education and keep learning uninterrupted.
          </p>
        </div>

        <div className="flex flex-col gap-[2.125rem]">
          <MarqueeRow stories={row1} direction="left" />
          <MarqueeRow stories={row2} direction="right" />
        </div>
      </section>
    </HomeGradientWrapper>
  );
}
