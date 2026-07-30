"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Programs", href: "/programs" },
    { label: "About Us", href: "/about" },
    { label: "Eligibility", href: "/eligibility" },
    { label: "Our Partners", href: "/partners" },
  ];

  const isLinkActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-black w-full fixed top-0 left-0 right-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-black rounded-lg p-2">
              <img
                src="/assets/logo/logo.jpeg"
                alt="Star Light Logo"
                className="h-10 w-14 sm:h-16 sm:w-20 object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-lg font-medium transition-colors hover:opacity-80 ${active ? "text-[#FFA100]" : "text-white"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Contact Button */}
          <div className="hidden md:block flex-shrink-0">
            <Button
              asChild
              className="bg-[#FFA100] hover:bg-[#FF8C00] text-white font-medium px-6 py-2 rounded-lg"
            >
              <Link href="/apply">Apply Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <Button
              asChild
              className="bg-[#FFA100] hover:bg-[#FF8C00] text-white font-medium px-4 py-2 rounded-lg text-sm"
            >
              <Link href="/contact">Contact</Link>
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="text-white p-2" aria-label="Toggle menu">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="bg-black border-gray-800 w-64 sm:w-72"
              >
                <div className="flex flex-col items-center gap-6 mt-8">
                  {navLinks.map((link) => {
                    const active = isLinkActive(link.href);
                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-lg font-medium transition-colors hover:opacity-80 ${active ? "text-[#FFA100]" : "text-white"}`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
