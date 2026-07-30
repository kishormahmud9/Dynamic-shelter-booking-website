import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const eligibilityQuestions = [
  {
    question: "Do you have consistent and reliable income?",
    answer:
      "Applicants should have a steady source of income to support shared living expenses. This may include employment, benefits, or other recurring income sources.",
  },
  {
    question: "Are you 21 years of age or older?",
    answer:
      "Our program is designed for adults. In most cases, applicants must be at least 21 years old to qualify for placement in our shared housing.",
  },
  {
    question: "Are you a Veteran?",
    answer:
      "We proudly serve veterans and prioritize creating a stable, respectful environment that honors your service and supports your long-term housing needs.",
  },
  {
    question: "Are you currently living in transitional or temporary housing?",
    answer:
      "If you are in a shelter, couch-surfing, or in other unstable housing, our program may help provide a more consistent and secure living arrangement.",
  },
  {
    question:
      "Do you feel safe in your current living or relationship situation?",
    answer:
      "Your safety is our top priority. If you are experiencing unsafe or unstable conditions, we will help assess whether our program can offer a safer alternative.",
  },
  {
    question: "Are you comfortable living in a shared home environment?",
    answer:
      "Shared housing means living respectfully with others, including sharing common spaces and being considerate of household guidelines and routines.",
  },
  {
    question: "Are you able to follow shared household guidelines?",
    answer:
      "Residents are expected to follow house rules that promote cleanliness, respect, and safety for everyone in the home.",
  },
];
export default function Eligibility() {
  return (
    <main className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="relative w-full h-[260px] sm:h-[320px] md:h-[500px] lg:h-[640px] overflow-hidden">
        <img
          src="/assets/images/eligibility.png"
          alt="Community living environment"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
            Is This Program Right for You?
          </h1>
          <p className="max-w-xl text-xs sm:text-sm md:text-base lg:text-lg text-gray-100 leading-relaxed">
            Review the eligibility questions below to help determine if our
            shared housing program fits your needs.
          </p>
        </div>
      </section>

      <section className="bg-[#F5F5F5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
          <header className="mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
              Check Your Eligibility
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-xl">
              Answer a few simple questions to see if this supportive housing
              program may be a good fit for you.
            </p>
          </header>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {eligibilityQuestions.map((item, index) => (
                <AccordionItem
                  key={item.question}
                  value={`item-${index}`}
                  className="px-4 sm:px-6"
                >
                  <AccordionTrigger className="text-sm sm:text-base md:text-[15px] font-medium text-gray-900">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-gray-600">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </main>
  );
}
