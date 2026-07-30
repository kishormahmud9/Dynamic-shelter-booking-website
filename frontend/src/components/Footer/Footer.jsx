'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
    const companyLinks = [
        { label: 'About Us', href: '/about' },
        { label: 'Eligibility', href: '/eligibility' },
        { label: 'Apply Now', href: '/apply' },
    ];

    return (
        <footer className="w-full bg-[#1A1A1A] text-white">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
                {/* Top Section */}
                <div className="flex items-center justify-between gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-16">
                    {/* Left Side - Heading and Branding */}
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                        Let's Connect with us
                    </h2>

                    {/* Right Side - Contact Button */}
                    <div >
                        <Button
                            asChild
                            className="bg-[#FFA100] hover:bg-[#FF8C00] text-white font-medium px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-lg text-sm sm:text-base md:text-lg"
                        >
                            <Link href="/apply">Apply Now</Link>
                        </Button>
                    </div>
                </div>

                {/* Middle Section - Company and Contact Columns */}
                <div className="grid grid-cols-1  md:grid-cols-3 gap-8 sm:gap-12 md:gap-16 mb-8 sm:mb-12">
                    <div>
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-black rounded-lg p-2 sm:p-2.5 md:p-3 flex-shrink-0">
                                <img
                                    src="/assets/logo/logo.jpeg"
                                    alt="Starlight Path Logo"
                                    className="h-10 w-10 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain"
                                />
                            </div>
                            <span className="text-lg sm:text-xl md:text-2xl font-semibold text-[#FFA100]">
                                Starlight Path
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-sm mt-4 sm:mt-6 md:mt-8 sm:text-base md:text-lg text-white/90 max-w-lg leading-relaxed">
                            Providing safe, stable, and supportive shared housing for adults seeking a fresh start.
                        </p>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-4 sm:mb-6">
                            Company
                        </h3>
                        <ul className="space-y-3 sm:space-y-4">
                            {companyLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm sm:text-base md:text-lg text-white/90 hover:text-[#FFA100] transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-4 sm:mb-6">
                            Contact
                        </h3>
                        <ul className="space-y-3 sm:space-y-4">
                            <li className="text-sm sm:text-base md:text-lg text-white/90">
                                <a
                                    href="tel:25858-854545"
                                    className="hover:text-[#FFA100] transition-colors duration-200"
                                >
                                    770-946-6146
                                </a>
                            </li>
                            <li className="text-sm sm:text-base md:text-lg text-white/90">
                                <a
                                    href="mailto:info@starlightpath.com"
                                    className="hover:text-[#FFA100] transition-colors duration-200"
                                >
                                    info@starlightpath.org
                                </a>
                            </li>
                            <li className="text-sm sm:text-base md:text-lg text-white/90">
                                139 W. Ellis Rd. Griffin, GA 30223
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/20 mb-6 sm:mb-8"></div>

                {/* Bottom Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                    {/* Copyright */}
                    <p className="text-xs sm:text-sm md:text-base text-white/90 text-center sm:text-left">
                        @2025 All Right Reserved by Starlight Path
                    </p>

                    {/* Social Media Icons */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <a
                            href="https://www.facebook.com/share/181jAN6BWL/?mibextid=wwXIfr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 sm:w-12 sm:h-12 border border-[#FFA100] rounded flex items-center justify-center transition-colors duration-200 hover:text-white hover:bg-[#FFA100]"
                            aria-label="Facebook"
                        >
                            <Facebook className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFA100] hover:text-white" />
                        </a>
                        <a
                            href="https://www.instagram.com/star.light.path?igsh=OXlwaWU0ajRxemh3&utm_source=qr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 sm:w-12 sm:h-12 border border-[#FFA100] rounded flex items-center justify-center hover:bg-[#FFA100] transition-colors duration-200"
                            aria-label="Instagram"
                        >
                            <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFA100] hover:text-white" />
                        </a>
                        <a
                            href="https://x.com/starlight_path?s=21"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 sm:w-12 sm:h-12 border border-[#FFA100] rounded flex items-center justify-center hover:bg-[#FFA100] transition-colors duration-200"
                            aria-label="Twitter"
                        >
                            <Twitter className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFA100] hover:text-white" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
