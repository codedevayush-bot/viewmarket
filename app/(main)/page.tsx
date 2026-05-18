import Hero from '../components/Hero';
import LogoSection from '../components/LogoSection';
import FeaturesSection from '../components/FeaturesSection';
import ProductOpsSection from '../components/ProductOpsSection';
import ChangelogSection from '../components/ChangelogSection';
import Footer from '../components/Footer';
import ComplianceBanner from '../components/ComplianceBanner';

export default function Home() {
  return (
    <>
      <Hero />
      <LogoSection />
      <FeaturesSection />
      <ProductOpsSection />
      <ChangelogSection />
      <Footer />
      <ComplianceBanner />
    </>
  );
}
