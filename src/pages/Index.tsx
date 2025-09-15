import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import VideoGrid from "@/components/VideoGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen"> {/* Removido bg-background redundante */}
      <Header />
      <main>
        <HeroSection />
        <VideoGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;