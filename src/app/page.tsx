import Slider from "@/components/Slider";
import { PopularTeas, Brands, AboutTeaser, Pillars, VideoBanner } from "@/components/Sections";

export default function Home() {
  return (
    <div className="pb-12">
      <Slider />
      <PopularTeas />
      <Brands />
      <AboutTeaser />
      <Pillars />
      <VideoBanner />
    </div>
  );
}
