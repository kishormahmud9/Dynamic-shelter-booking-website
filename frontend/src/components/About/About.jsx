'use client';

export default function About() {
    return (
        <section className="w-full bg-white mt-10 lg:mt-0">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-start lg:items-center">
                    {/* Left Side - Content */}
                    <div className="space-y-8 sm:space-y-10 order-1 lg:order-1">
                        {/* Heading */}
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                            About Us
                        </h2>

                        {/* Paragraphs */}
                        <div className="space-y-6 text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl">
                            <p className="font-normal">
                                Our goal is simple: to ensure that everyone has access to a safe, affordable, and welcoming home.
                            </p>
                            <p className="font-normal">
                                Through thoughtful design, cost-effective solutions, and a focus on community and well-being, we connect residents to safe living spaces where they can thrive. By fostering shared responsibilities and mutual support, we aim to make housing not just a place to live, but a place to belong.
                            </p>
                        </div>

                      
                    </div>

                    {/* Right Side - Images */}
                    <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] order-2 lg:order-2">
                        {/* Top Image (Interior) - Overlapping from top right */}
                        <div className="absolute lg:top-24 lg:right-52 w-[100%]  lg:w-[70%] h-[70%] sm:h-[50%] z-0">
                            <div className="w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="/assets/images/about-1.jpeg"
                                    alt="Interior of modern home"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Bottom Image (Exterior) - Overlapping from bottom left */}
                        <div className="hidden lg:block absolute  lg:bottom-10 lg:left-42 w-[85%] sm:w-[80%] lg:w-[70%] h-[48%] sm:h-[50%] z-10">
                            <div className="w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="/assets/images/about-2.jpeg"
                                    alt="Exterior of house"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
