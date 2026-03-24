import { HomeGradientWrapper } from "./home-gradient-wrapper";

type Story = {
  quote: string;
  name: string;
  role: string;
  avatarBg: string;
};

const row1: Story[] = [
  { quote: "I can now pay school fees monthly without stress.", name: "Adaeze Bello", role: "Parent", avatarBg: "#C4A882" },
  { quote: "Fee payments are more consistent now.", name: "Tunde Adeyemi", role: "School Admin", avatarBg: "#4A6FA5" },
  { quote: "My kids no longer miss school over fees.", name: "Chioma Okafor", role: "Parent", avatarBg: "#8B3A3A" },
  { quote: "We reduced payment delays quickly.", name: "Samuel Olatunji", role: "School Owner", avatarBg: "#5A5A7A" },
  { quote: "PayMyFees made budgeting for school seamless.", name: "Ngozi Eze", role: "Parent", avatarBg: "#3A7A5A" },
  { quote: "The flexible repayment plan saved me this term.", name: "Kunle Adeyinka", role: "Teacher", avatarBg: "#7A5A3A" },
];

const row2: Story[] = [
  { quote: "Tracking payments is now simple.", name: "Emeka Obi", role: "Finance Officer", avatarBg: "#3A5A7A" },
  { quote: "No more pressure to raise lump sums.", name: "Chioma Okafor", role: "Parent", avatarBg: "#8B3A3A" },
  { quote: "Our cash flow improved significantly.", name: "David Johnson", role: "School Director", avatarBg: "#4A7A4A" },
  { quote: "I can plan my finances better every term.", name: "Bola Akinwale", role: "Parent", avatarBg: "#7A4A6A" },
  { quote: "We cleared our backlog of unpaid fees.", name: "Fatima Aliyu", role: "School Admin", avatarBg: "#6A4A7A" },
  { quote: "Staff salary advances kept our school afloat.", name: "Olumide Bankole", role: "Teacher", avatarBg: "#7A6A3A" },
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
    <div className="inline-flex w-[21rem] shrink-0 flex-col justify-between gap-4 rounded-[1rem] border border-[#E5E7EB] bg-white p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)]">
      <p
        className="text-[1rem] font-bold leading-[1.4] tracking-[0] text-[#191919]"
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
  const doubled = [...stories, ...stories];
  return (
    <div className="marquee-track w-full overflow-hidden">
      <div
        className={`flex gap-[1.125rem] ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}
        style={{ width: "max-content" }}
      >
        {doubled.map((story, i) => (
          <StoryCard key={`${story.name}-${i}`} story={story} />
        ))}
      </div>
    </div>
  );
}

export function HomeRealStoriesSection() {
  return (
    <HomeGradientWrapper>
      <section id="about" className="overflow-hidden py-[4.375rem]">
        <div
          className="mb-[2.5rem] px-6 text-center md:px-10 xl:px-[11.25rem]"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          <h2 className="text-[1.5rem] font-extrabold leading-[105%] tracking-[0] text-white md:text-[2.125rem]">
            Real Stories. Real Impact.
          </h2>
          <p className="mx-auto mt-[0.75rem] max-w-[680px] text-[0.9375rem] font-medium leading-[1.55] tracking-[0] text-[#B8C8E0] md:text-[1.0625rem]">
            Across Nigeria, families, teachers, and schools are using PayMyFees to remove financial
            pressure from education and keep learning uninterrupted.
          </p>
        </div>

        <div className="flex flex-col gap-[1.125rem]">
          <MarqueeRow stories={row1} direction="left" />
          <MarqueeRow stories={row2} direction="right" />
        </div>
      </section>
    </HomeGradientWrapper>
  );
}
