import Slider from "@/components/Slider";
import ScrollAnimation from "@/components/ScrollAnimation";
import { PopularTeas, Brands, AboutTeaser, Pillars, VideoBanner } from "@/components/Sections";

export default function Home() {
  return (
    <div className="pb-12">
      <div className="animate-fade-in">
        <Slider />
      </div>
      <ScrollAnimation delay={200}>
        <PopularTeas />
      </ScrollAnimation>
      <ScrollAnimation delay={400}>
        <Brands />
      </ScrollAnimation>
      <ScrollAnimation delay={600}>
        <AboutTeaser />
      </ScrollAnimation>
      <ScrollAnimation delay={800}>
        <Pillars />
      </ScrollAnimation>
      <ScrollAnimation delay={1000}>
        <VideoBanner />
      </ScrollAnimation>
    </div>
  );
}
