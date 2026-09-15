import GuideNavigation from "@/components/navigation/GuideNavigation";
import HeroScene from "@/components/narrative/HeroScene";
import ProblemScene from "@/components/narrative/ProblemScene";
import SummonScene from "@/components/narrative/SummonScene";
import WorkshopScene from "@/components/narrative/WorkshopScene";
import CapabilitiesScene from "@/components/narrative/CapabilitiesScene";
import WorkScene from "@/components/narrative/WorkScene";
import StudioScene from "@/components/narrative/StudioScene";
import ProductsScene from "@/components/narrative/ProductsScene";
import NightWorkshopScene from "@/components/narrative/NightWorkshopScene";
import PhilosophyScene from "@/components/narrative/PhilosophyScene";
import FinalScene from "@/components/narrative/FinalScene";

export default function Home() {
  return (
    <>
      <GuideNavigation />
      <main>
        <HeroScene />
        <ProblemScene />
        <SummonScene />
        <WorkshopScene />
        <CapabilitiesScene />
        <StudioScene />
        <ProductsScene />
        <NightWorkshopScene />
        <WorkScene />
        <PhilosophyScene />
        <FinalScene />
      </main>
    </>
  );
}
