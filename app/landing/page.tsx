import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import Product from "@/components/marketing/Product";
import Steps from "@/components/marketing/Steps";
import ComingSoon from "@/components/marketing/ComingSoon";
import Pricing from "@/components/marketing/Pricing";
import FAQ from "@/components/marketing/FAQ";
import Footer from "@/components/marketing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#1e1e35' }}>
      <Navbar />
      <main>
        <Hero />
        <Product />
        <Steps />
        <ComingSoon />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
