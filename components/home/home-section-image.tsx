import Image, { type StaticImageData } from "next/image";
import { cn } from "@/lib/utils";

type HomeSectionImageProps = {
  image: StaticImageData;
  alt: string;
  priority?: boolean;
  className?: string;
  sectionClassName?: string;
};

export function HomeSectionImage({
  image,
  alt,
  priority = false,
  className,
  sectionClassName,
}: HomeSectionImageProps) {
  return (
    <section className={cn("relative w-full", sectionClassName)}>
      <Image
        src={image}
        alt={alt}
        priority={priority}
        className={cn("block h-auto w-full", className)}
        sizes="(max-width: 1512px) 100vw, 1512px"
      />
    </section>
  );
}
