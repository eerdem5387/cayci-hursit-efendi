import Slider from "@/components/Slider";
import { PopularTeas, Brands, AboutTeaser, Pillars, VideoBanner } from "@/components/Sections";

export default function Home() {
  return (
    <div className="pb-12">
      <div className="animate-fade-in">
        <Slider />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <PopularTeas />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <Brands />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <AboutTeaser />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
        <Pillars />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: '1.0s' }}>
        <VideoBanner />
      </div>
    </div>
  );
}
