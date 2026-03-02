import { useState } from 'react';
import { Navbar } from './components/landing/Navbar';
import { HeroSection } from './components/landing/HeroSection';
import { MVVSection } from './components/landing/MVVSection';
import { BuiltForEveryoneSection } from './components/landing/BuiltForEveryoneSection';
import { HowItWorksSection } from './components/landing/HowItWorksSection';
import { PricingSection } from './components/landing/PricingSection';
import { FAQSection } from './components/landing/FAQSection';
import { CTASection } from './components/landing/CTASection';
import { Footer } from './components/landing/Footer';
import { RevealOnScroll } from './components/landing/RevealOnScroll';


export default function App() {
  const [selectedAudience, setSelectedAudience] = useState<'teachers' | 'students'>('teachers');
  const [expandedFAQs, setExpandedFAQs] = useState<Set<number>>(new Set());

  const handleToggleFAQ = (index: number) => {
    const newExpanded = new Set(expandedFAQs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFAQs(newExpanded);
  };

  const handleAudienceToggle = (audience: 'teachers' | 'students') => {
    setSelectedAudience(audience);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      <Navbar />

      <main className="mx-auto w-full">
        <RevealOnScroll>
          <HeroSection />
        </RevealOnScroll>
        <RevealOnScroll delay={0.05}>
          <MVVSection />
        </RevealOnScroll>
        <RevealOnScroll delay={0.05}>
          <BuiltForEveryoneSection selectedAudience={selectedAudience} onToggle={handleAudienceToggle} />
        </RevealOnScroll>
        <RevealOnScroll delay={0.05}>
          <HowItWorksSection />
        </RevealOnScroll>
        <RevealOnScroll delay={0.05}>
          <PricingSection />
        </RevealOnScroll>
        <RevealOnScroll delay={0.05}>
          <FAQSection expandedItems={expandedFAQs} onToggle={handleToggleFAQ} />
        </RevealOnScroll>
      </main>

      <RevealOnScroll>
        <CTASection />
      </RevealOnScroll>
      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>
    </div>
  );
}
