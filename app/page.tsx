import Hero from "./components/Hero";
import Consultation from "./components/Consultation";
import ServicesOverview from "./components/ServicesOverview";
import AboutSnippet from "./components/AboutSnippet";
import Contact from "./components/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Consultation />
      <ServicesOverview />
      <AboutSnippet />
      <Contact />
    </>
  );
}
