import React from 'react';
import WhyChooseUs from '@/components/WhyChooseUs/WhyChooseUs';

export default function AboutUs() {
    return (
        <main className="min-h-screen bg-white pt-20">
            {/* Hero Section */}
            <section className="relative w-full h-[260px] sm:h-[320px] md:h-[500px] lg:h-[640px] overflow-hidden">
                <img
                    src="/assets/images/about_us.png"
                    alt="Community living environment"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70" />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
                        About Us
                    </h1>
                    <p className="max-w-3xl text-xs sm:text-sm md:text-base lg:text-lg text-gray-100 leading-relaxed">
                        At Starlight Path, we are committed to providing safe, affordable, and
                        supportive shared housing for individuals who need stability, dignity, and a place
                        to call home. Our communities are built on compassion, trust, and care.
                    </p>
                </div>
            </section>


            <div className='max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16'>
                {/* Mission & Vision */}
                <section className=" ">
                    <div className="space-y-10 sm:space-y-12">
                        <div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                                Our Mission
                            </h2>
                            <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed max-w-6xl">
                                Our mission is to create safe and affordable housing solutions that support
                                veterans, seniors, and individuals facing housing challenges. We aim to provide
                                not just shelter, but a nurturing environment where residents feel respected,
                                supported, and valued.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                                Our Vision
                            </h2>
                            <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed max-w-6xl">
                                We envision communities where everyone has access to a safe and secure home,
                                meaningful human connections, and compassionate support systems that empower
                                individuals to live with confidence, dignity, and independence. Our goal is to
                                build inclusive environments where people feel valued, supported, and truly at home.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Who We Serve */}
                <section className="mt-10 sm:mt-12 md:mt-14 lg:mt-16">

                    <div className="flex flex-col lg:flex-row gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">

                        <div className="w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src="/assets/images/about.jpeg"
                                alt="Supportive shared housing"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Text Content - 35% on large screens */}
                        <div className="">
                            <div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4">
                                    Who We Serve
                                </h3>
                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                    First, we support veterans by providing stable and affordable housing that
                                    honors their service. Our goal is to help them transition into a comfortable,
                                    safe, and secure living environment with dignity and respect.
                                </p>
                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                    Finally, we offer shared housing solutions for individuals seeking affordable
                                    living options. These shared spaces encourage community connection, reduce
                                    living costs, and help residents build meaningful relationships while feeling
                                    a true sense of belonging.
                                </p>
                            </div>
                        </div>
                    </div>

                </section>
            </div>
            <div>
                <WhyChooseUs />
            </div>
        </main>
    );
}