import Navbar from '@/components/Navbar/Navbar';
import Hero from '@/components/Hero/Hero';
import About from '@/components/About/About';
import WhatWeOffer from '@/components/WhatWeOffer/WhatWeoffer';
import WhyChooseUs from '@/components/WhyChooseUs/WhyChooseUs';

export default function Home() {
  return (
    <div className="min-h-screen">
      
      <Hero />
      <About />
      <WhatWeOffer />
      <WhyChooseUs />
    </div>
  );
}
