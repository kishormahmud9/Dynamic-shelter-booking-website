"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { get } from "@/lib/api";

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const baseUrl = useMemo(() => {
    const url = (process.env.NEXT_PUBLIC_API_URL || "").trim();
    return url.endsWith("/") ? url.slice(0, -1) : url;
  }, []);

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://"))
      return image;
    if (!baseUrl) return image;
    return image.startsWith("/") ? `${baseUrl}${image}` : `${baseUrl}/${image}`;
  };

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await get("/api/program/public/programs/");
        const list = Array.isArray(data) ? data : data?.results || [];

        setPrograms(list);
      } catch (e) {
        setError(e?.message || "Failed to load programs");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <main className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="relative w-full h-[260px] sm:h-[320px] md:h-[500px] lg:h-[640px] overflow-hidden">
        <img
          src="/assets/images/eligibility.png"
          alt="Programs hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
            Our Programs
          </h1>
          <p className="max-w-2xl text-xs sm:text-sm md:text-base lg:text-lg text-gray-100 leading-relaxed">
            Our programs provide safe, affordable housing with compassionate
            support, fostering independence, dignity, and community for
            individuals seeking stability, comfort, and a place to truly belong.
          </p>
        </div>
      </section>

      {/* Programs List */}
      <section className="py-10 sm:py-12 md:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Our Programs
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Special comfort housing program for you
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="w-8 h-8 animate-spin text-[#FFA100]" />
              <span className="ml-2 text-gray-600">Loading programs...</span>
            </div>
          )}

          {!loading && error && (
            <div className="py-10 text-center text-red-600">{error}</div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-full h-44 sm:h-48 md:h-52 overflow-hidden">
                    <img
                      src={
                        getImageUrl(program.feature_image) ||
                        "/assets/images/about-1.jpeg"
                      }
                      alt={program.name || "Program"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      {program.name || "Program"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed line-clamp-3">
                      {program.short_description || "—"}
                    </p>

                    <Link
                      href={`/programs/${program.id}`}
                      className="inline-flex mt-4 bg-[#FFA100] hover:bg-[#FF8C00] text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-md transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
