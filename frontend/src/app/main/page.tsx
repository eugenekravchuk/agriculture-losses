import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ImportanceSection from "@/components/ImportanceSection";
import WhatToEnterSection from "@/components/WhatToEnterSection";

export default function Main() {
  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-start overflow-auto">
      <div className="w-full max-w-7xl bg-white min-h-screen">
        <HeroSection />
        <ImportanceSection />
        <HowItWorksSection />
        <WhatToEnterSection />
      </div>
    </div>
  );
}
