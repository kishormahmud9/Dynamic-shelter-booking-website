'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WhatWeOffer() {
    const offerings = [
        'Safe, accessible communities',
        'Affordable monthly payments',
        'Professional staff support',
        'Social activities and events',
        'Home-cooked meals included',
    ];

    return (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 rounded-2xl overflow-hidden lg:mt-10">
            <div className="relative w-full  flex items-center rounded-2xl">
                {/* Background Image */}
                <div className="absolute inset-0 w-full h-full rounded-2xl">
                    <img
                        src="/assets/images/about-1.jpeg"
                        alt="Interior of modern home"
                        className="w-full h-full object-cover rounded-2xl"
                    />
                </div>

                {/* Dark Overlay - Left Side */}
                <div className="absolute inset-0 rounded-2xl bg-black/60 lg:bg-gradient-to-r lg:from-black/60 lg:via-black/60 lg:to-transparent"></div>

                {/* Content */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
                    <div className="max-w-2xl lg:max-w-xl">
                        {/* Heading */}
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 sm:mb-10 md:mb-12">
                            What we offered
                        </h2>

                        {/* List of Offerings */}
                        <ul className="space-y-4 sm:space-y-5 md:space-y-6 mb-8 sm:mb-10 md:mb-12">
                            {offerings.map((item, index) => (
                                <li key={index} className="flex items-start gap-3 sm:gap-4">
                                    <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-base sm:text-lg md:text-xl text-white font-medium">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {/* Apply Now Button */}
                        <Button
                            asChild
                            className="bg-[#FFA100] hover:bg-[#FF8C00] text-white font-semibold px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <Link href="/apply">Apply Now</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
