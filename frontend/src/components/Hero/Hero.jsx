"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[400px] sm:min-h-[600px] md:min-h-[700px] lg:min-h-[940px] flex items-center justify-center  mt-20">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/assets/images/Hero.jpeg)",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full py-12 sm:py-16 md:py-20">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
          Safe & Affordable Shared Housing For Those In Need
        </h1>

        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
          Providing safe, affordable shared housing that supports veterans and
          seniors, the homeless, and individuals in need by offering stability,
          dignity, and a sense of community.
        </p>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 px-2">
          <Button
            asChild
            className="bg-[#FFA100] hover:bg-[#FF8C00] text-white font-semibold px-6 sm:px-8 py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg rounded-lg w-full sm:w-auto min-w-[140px] sm:min-w-[160px] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Link href="/apply">Apply Now</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="bg-transparent border-2 border-[#FFA100] text-white hover:bg-[#FFA100]/10 font-semibold px-6 sm:px-8 py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg rounded-lg w-full sm:w-auto min-w-[140px] sm:min-w-[160px] transition-all duration-200"
          >
            <Link href="/refer">Refer Someone</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
