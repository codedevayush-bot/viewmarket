import Hero from '../components/Hero';
import LogoSection from '../components/LogoSection';
import FeaturesSection from '../components/FeaturesSection';
import ProductOpsSection from '../components/ProductOpsSection';
import ChangelogSection from '../components/ChangelogSection';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Hero />
      <LogoSection />
      <FeaturesSection />
      <ProductOpsSection />
      <ChangelogSection />
      <Footer />
    </>
  );
}
