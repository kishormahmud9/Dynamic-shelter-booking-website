"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { create } from "@/lib/api";

const STEPS = [
  { number: 1, label: "Step 1" },
  { number: 2, label: "Step 2" },
  { number: 3, label: "Step 3" },
];

const LIVING_SITUATIONS = [
  { value: "HOMELESS", label: "Homeless / Shelter / Transitional Housing" },
  { value: "HOTEL", label: "Hotel / Extended Stay" },
  { value: "WITH_FAMILY", label: "Staying with Family or Friends" },
  { value: "RENTING", label: "Renting / Own Home" },
  { value: "OTHER", label: "Other" },
];

const NEED_HOUSING_WHEN = [
  { value: "IMMEDIATELY", label: "Immediately" },
  { value: "WITHIN_30_DAYS", label: "Within 30 days" },
  { value: "ONE_TO_THREE_MONTHS", label: "1-3 months" },
  { value: "THREE_TO_SIX_MONTHS", label: "3-6 months" },
  { value: "MORE_THAN_6_MONTHS", label: "More than 6 months" },
  { value: "NOT_SURE", label: "Not sure yet" },
];


// UI options (labels match design). Values here must map to backend-accepted enum values.
const INCOME_SOURCES = [
  { value: "EMPLOYMENT", label: "Employment" },
  { value: "SOCIAL_SECURITY", label: "Social Security / SSI / SSDI" },
  { value: "VA_BENEFITS", label: "VA benefits" },
  { value: "PENSION", label: "Pension" },
  { value: "HOUSING_VOUCHER", label: "Housing Voucher" },
  { value: "OTHER", label: "Other" },
];

// Map UI keys to the exact values the API accepts.
// If your backend uses different enum strings, update these mappings.
const INCOME_SOURCE_TO_API_VALUE = {
  EMPLOYMENT: "EMPLOYMENT",
  SOCIAL_SECURITY: "SOCIAL_SECURITY",
  VA_BENEFITS: "VA_BENEFITS",
  PENSION: "PENSION",
  HOUSING_VOUCHER: "HOUSING_VOUCHER",
  OTHER: "OTHER",
};

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs sm:text-sm font-medium text-gray-600">
        {label}
      </label>
      {children}
    </div>
  );
}

function YesNo({ value, onChange, name }) {
  return (
    <div className="flex items-center gap-6">
      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
        <input
          type="radio"
          name={name}
          checked={value === true}
          onChange={() => onChange(true)}
          className="sr-only peer"
        />
        <span
          className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center transition-colors
                    after:content-[''] after:block after:h-2.5 after:w-2.5 after:rounded-full after:bg-white after:scale-0 after:transition-transform
                    peer-checked:bg-primary peer-checked:border-primary peer-checked:after:scale-100
                    peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white"
          aria-hidden="true"
        />
        <span className="text-sm sm:text-base text-gray-700">Yes</span>
      </label>
      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
        <input
          type="radio"
          name={name}
          checked={value === false}
          onChange={() => onChange(false)}
          className="sr-only peer"
        />
        <span
          className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center transition-colors
                    after:content-[''] after:block after:h-2.5 after:w-2.5 after:rounded-full after:bg-white after:scale-0 after:transition-transform
                    peer-checked:bg-primary peer-checked:border-primary peer-checked:after:scale-100
                    peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white"
          aria-hidden="true"
        />
        <span className="text-sm sm:text-base text-gray-700">No</span>
      </label>
    </div>
  );
}

function RadioList({ name, value, onChange, options }) {
  return (
    <div className="space-y-2.5">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <input
            type="radio"
            name={name}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="sr-only peer"
          />
          <span
            className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center transition-colors
                        after:content-[''] after:block after:h-2.5 after:w-2.5 after:rounded-full after:bg-white after:scale-0 after:transition-transform
                        peer-checked:bg-primary peer-checked:border-primary peer-checked:after:scale-100
                        peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white"
            aria-hidden="true"
          />
          <span className="text-sm text-gray-700">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function CheckboxList({ values, onToggle, options }) {
  return (
    <div className="space-y-2.5">
      {options.map((opt) => {
        const checked = values.includes(opt.value);
        return (
          <label
            key={opt.value}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(opt.value)}
              className="sr-only peer"
            />
            <span
              className="h-5 w-5 rounded-[6px] border border-gray-300 bg-white transition-colors flex items-center justify-center
                            peer-checked:bg-primary peer-checked:border-primary
                            peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                className={[
                  "h-4 w-4 text-white transition-opacity",
                  checked ? "opacity-100" : "opacity-0",
                ].join(" ")}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

const inputBase =
  "border-gray-300 focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px]";
const selectBase =
  "w-full h-11 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
const textareaBase =
  "w-full min-h-[120px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

function Stepper({ step }) {
  return (
    <div className="flex items-center justify-center gap-6 sm:gap-10">
      {STEPS.map((s, idx) => {
        const active = step === s.number;
        const done = step > s.number;
        return (
          <div key={s.number} className="flex items-center gap-3">
            <div
              className={[
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold",
                done || active
                  ? "bg-primary text-white"
                  : "bg-orange-100 text-primary",
              ].join(" ")}
            >
              {s.number}
            </div>
            <div className="hidden sm:block">
              <p
                className={[
                  "text-sm font-medium",
                  active ? "text-gray-900" : "text-gray-500",
                ].join(" ")}
              >
                {s.label}
              </p>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="hidden sm:block w-10 h-px bg-gray-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PreScreenWizard({ mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read the "step" from the URL once per change. Using the raw searchParams
  // object as a dependency can cause identity-churn. We pull the specific value
  // and derive "initialStep" from it.
  const stepParam = searchParams.get("step");
  const initialStep = useMemo(() => {
    const s = Number(stepParam || "1");
    return s >= 1 && s <= 3 ? s : 1;
  }, [stepParam]);

  const [step, setStep] = useState(initialStep);
  const [submitting, setSubmitting] = useState(false);

  const [data, setData] = useState({
    // referral (REFER only)
    referral_full_name: "",
    referral_email: "",
    referral_phone: "",

    // personal
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",

    // housing
    living_situation: "",
    need_housing_when: "",
    lived_in_shared_before: null,

    // eligibility
    us_veteran: null,
    transitioning: null,

    // income
    income_sources: [],
    income_consistent: null,
    can_provide_income_docs: null,

    // household
    comfortable_shared: null,
    asked_to_leave_before: null,

    // support
    has_case_manager: null,
    case_manager_name: "",
    case_manager_contact: "",

    // background/legal
    willing_to_undergo_background_check: null,
    upcoming_court_dates: null,

    // additional + consent
    additional_info: "",
    consent: false,
    signature_name: "",
    signature_date: "",
  });



  const isRefer = mode === "refer";

  // Move the wizard and reflect the change in the URL only if it differs.
  // Also remove the ?step param for step 1 to keep the URL stable.
  const goStep = (next) => {
    setStep(next);
    const current = searchParams.get("step") || "1";
    if (String(next) === current) return; // avoid unnecessary router updates

    const params = new URLSearchParams(searchParams.toString());
    if (next === 1) {
      params.delete("step");
    } else {
      params.set("step", String(next));
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const toggleIncome = (value) => {
    setData((prev) => {
      const exists = prev.income_sources.includes(value);
      return {
        ...prev,
        income_sources: exists
          ? prev.income_sources.filter((x) => x !== value)
          : [...prev.income_sources, value],
      };
    });
  };

  const validateStep = () => {
    // minimal, user-friendly validation
    if (step === 1) {
      if (isRefer) {
        if (
          !data.referral_full_name ||
          !data.referral_email ||
          !data.referral_phone
        ) {
          toast.error("Please fill referral full name, email and mobile.");
          return false;
        }
      }

      if (
        !data.full_name ||
        !data.email ||
        !data.phone ||
        !data.date_of_birth
      ) {
        toast.error("Please fill all personal information fields.");
        return false;
      }
      if (!data.living_situation || !data.need_housing_when) {
        toast.error("Please complete the current housing situation section.");
        return false;
      }
      if (data.lived_in_shared_before === null) {
        toast.error("Please answer: Have you lived in shared housing before?");
        return false;
      }
      if (data.us_veteran === null || data.transitioning === null) {
        toast.error("Please complete the program eligibility section.");
        return false;
      }
    }

    if (step === 2) {
      if (
        data.income_consistent === null ||
        data.can_provide_income_docs === null
      ) {
        toast.error("Please complete income & financial information.");
        return false;
      }
      if (
        data.comfortable_shared === null ||
        data.asked_to_leave_before === null
      ) {
        toast.error("Please complete shared housing & household guidelines.");
        return false;
      }
      if (data.has_case_manager === null) {
        toast.error("Please answer the case manager question.");
        return false;
      }
      if (
        data.has_case_manager === true &&
        (!data.case_manager_name || !data.case_manager_contact)
      ) {
        toast.error(
          "Please provide case manager name and contact information.",
        );
        return false;
      }
    }

    if (step === 3) {
      if (
        data.willing_to_undergo_background_check === null ||
        data.upcoming_court_dates === null
      ) {
        toast.error("Please complete the shared household guidelines section.");
        return false;
      }
      if (!data.signature_name) {
        toast.error("Please provide signature name and date.");
        return false;
      }
      if (!data.consent) {
        toast.error("Please accept acknowledgment & consent.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    goStep(Math.min(3, step + 1));
  };

  const handleBack = () => {
    goStep(Math.max(1, step - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      setSubmitting(true);

      // Build payload EXACTLY in the API format requested
      const payload = {
        application_type: isRefer ? "REFER" : "APPLY",
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        date_of_birth: data.date_of_birth,
        living_situation: data.living_situation,
        need_housing_when: data.need_housing_when,
        lived_in_shared_before: data.lived_in_shared_before,
        us_veteran: data.us_veteran,
        transitioning: data.transitioning,
        income_sources: (data.income_sources || [])
          .map((v) => INCOME_SOURCE_TO_API_VALUE[v] || v)
          .filter(Boolean),
        income_consistent: data.income_consistent,
        can_provide_income_docs: data.can_provide_income_docs,
        comfortable_shared: data.comfortable_shared,
        asked_to_leave_before: data.asked_to_leave_before,
        has_case_manager: data.has_case_manager,
        willing_to_undergo_background_check:
          data.willing_to_undergo_background_check,
        upcoming_court_dates: data.upcoming_court_dates,
        additional_info: data.additional_info,
        consent: data.consent,
        signature_name: data.signature_name,
        signature_date: data.signature_date,
      };

      // Only include these fields when the user has a case manager
      if (data.has_case_manager) {
        payload.case_manager_name = data.case_manager_name;
        payload.case_manager_contact = data.case_manager_contact;
      }

      // Only include referral info when REFER flow
      if (isRefer) {
        payload.referral_full_name = data.referral_full_name;
        payload.referral_email = data.referral_email;
        payload.referral_phone = data.referral_phone;
      }

      await create("/api/application/new/", payload);
      toast.success("Pre-screen form submitted successfully!");
      router.push("/programs");
    } catch (e) {
      toast.error(e?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen pt-32 pb-16 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Pre-Screen Form
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed max-w-3xl">
            Please complete this pre-screen form to help us understand your
            housing needs. Submitting this form does not guarantee placement,
            but helps us determine eligibility for our shared housing program.
          </p>

          <div className="mt-6 sm:mt-8">
            <Stepper step={step} />
          </div>

          {/* Step content */}
          <div className="mt-8 sm:mt-10 space-y-6">
            {step === 1 && (
              <>
                {/* Step 1 layout (match design) */}
                <div className="space-y-8">
                  {/* Referral: ONLY this extra block on step 1 */}
                  {isRefer && (
                    <div>
                      <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                        Referral Information
                      </h2>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name">
                          <Input
                            value={data.referral_full_name}
                            onChange={(e) =>
                              setData((p) => ({
                                ...p,
                                referral_full_name: e.target.value,
                              }))
                            }
                            placeholder="e.g., smith"
                            className={inputBase}
                          />
                        </Field>
                        <Field label="Mobile">
                          <Input
                            value={data.referral_phone}
                            onChange={(e) =>
                              setData((p) => ({
                                ...p,
                                referral_phone: e.target.value,
                              }))
                            }
                            placeholder="01*********"
                            className={inputBase}
                          />
                        </Field>
                        <div className="sm:col-span-2">
                          <Field label="Email Address">
                            <Input
                              value={data.referral_email}
                              onChange={(e) =>
                                setData((p) => ({
                                  ...p,
                                  referral_email: e.target.value,
                                }))
                              }
                              placeholder="smith@gmail.com"
                              className={inputBase}
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="h-px bg-gray-100" />

                  {/* Personal Information */}
                  <div>
                    <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                      Personal Information
                    </h2>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Full Name">
                        <Input
                          value={data.full_name}
                          onChange={(e) =>
                            setData((p) => ({
                              ...p,
                              full_name: e.target.value,
                            }))
                          }
                          placeholder="Full name"
                          className={inputBase}
                        />
                      </Field>
                      <Field label="Mobile">
                        <Input
                          value={data.phone}
                          onChange={(e) =>
                            setData((p) => ({ ...p, phone: e.target.value }))
                          }
                          placeholder="Mobile"
                          className={inputBase}
                        />
                      </Field>
                      <Field label="Email Address">
                        <Input
                          type="email"
                          value={data.email}
                          onChange={(e) =>
                            setData((p) => ({ ...p, email: e.target.value }))
                          }
                          placeholder="Email"
                          className={inputBase}
                        />
                      </Field>
                      <Field label="Date of Birth">
                        <Input
                          type="date"
                          value={data.date_of_birth}
                          onChange={(e) =>
                            setData((p) => ({
                              ...p,
                              date_of_birth: e.target.value,
                            }))
                          }
                          className={inputBase}
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="h-px bg-gray-100" />

                  {/* Current Housing Situation */}
                  <div>
                    <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                      Current Housing Situation
                    </h2>
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                      {/* Left: living situation radio list */}
                      <div>
                        <Field label="Current living situation">
                          <RadioList
                            name="living_situation"
                            value={data.living_situation}
                            onChange={(v) =>
                              setData((p) => ({ ...p, living_situation: v }))
                            }
                            options={LIVING_SITUATIONS}
                          />
                        </Field>
                      </div>

                      {/* Right: need housing + lived before */}
                      <div className="space-y-5">
                        <Field label="How soon do you need housing?">
                          <select
                            className={selectBase}
                            value={data.need_housing_when}
                            onChange={(e) =>
                              setData((p) => ({
                                ...p,
                                need_housing_when: e.target.value,
                              }))
                            }
                          >
                            <option value="">Select</option>
                            {NEED_HOUSING_WHEN.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </Field>

                        <Field label="Have you lived in shared housing before?">
                          <YesNo
                            name="lived_in_shared_before"
                            value={data.lived_in_shared_before}
                            onChange={(v) =>
                              setData((p) => ({
                                ...p,
                                lived_in_shared_before: v,
                              }))
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gray-100" />

                  {/* Program Eligibility */}
                  <div>
                    <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                      Program Eligibility
                    </h2>
                    <div className="mt-4  text-base space-y-4">
                      <Field label="Are you a U.S. Veteran?">
                        <YesNo
                          name="us_veteran"
                          value={data.us_veteran}
                          onChange={(v) =>
                            setData((p) => ({ ...p, us_veteran: v }))
                          }
                        />
                      </Field>
                      <Field label="Are you currently transitioning from another program (incarceration, rehab, housing program)?">
                        <YesNo
                          name="transitioning"
                          value={data.transitioning}
                          onChange={(v) =>
                            setData((p) => ({ ...p, transitioning: v }))
                          }
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-8">
                {/* Income & Financial Information */}
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                    Income & Financial Information
                  </h2>
                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
                    <div>
                      <Field label="Source(s) of income">
                        <CheckboxList
                          values={data.income_sources}
                          onToggle={toggleIncome}
                          options={INCOME_SOURCES}
                        />
                      </Field>
                    </div>

                    <div className="space-y-5">
                      <Field label="Is this income consistent and recurring monthly?">
                        <YesNo
                          name="income_consistent"
                          value={data.income_consistent}
                          onChange={(v) =>
                            setData((p) => ({ ...p, income_consistent: v }))
                          }
                        />
                      </Field>

                      <Field label="Are you able to provide documentation of income?">
                        <YesNo
                          name="can_provide_income_docs"
                          value={data.can_provide_income_docs}
                          onChange={(v) =>
                            setData((p) => ({
                              ...p,
                              can_provide_income_docs: v,
                            }))
                          }
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Shared Housing & Household Guidelines */}
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                    Shared Housing & Household Guidelines
                  </h2>
                  <div className="mt-4 space-y-5">
                    <Field label="Are you comfortable living in a shared home environment?">
                      <YesNo
                        name="comfortable_shared"
                        value={data.comfortable_shared}
                        onChange={(v) =>
                          setData((p) => ({ ...p, comfortable_shared: v }))
                        }
                      />
                    </Field>

                    <Field label="Have you ever been asked to leave a housing program or had a lease terminated?">
                      <YesNo
                        name="asked_to_leave_before"
                        value={data.asked_to_leave_before}
                        onChange={(v) =>
                          setData((p) => ({ ...p, asked_to_leave_before: v }))
                        }
                      />
                    </Field>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Support & Services */}
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                    Support & Services
                  </h2>
                  <div className="mt-4 space-y-5">
                    <Field label="Do you currently have a case manager, social worker, or VA coordinator?">
                      <YesNo
                        name="has_case_manager"
                        value={data.has_case_manager}
                        onChange={(v) =>
                          setData((p) => ({ ...p, has_case_manager: v }))
                        }
                      />
                    </Field>

                    {data.has_case_manager === true && (
                      <div className="space-y-3">
                        <p className="text-xs font-medium text-gray-600">
                          If yes, provide name and contact information
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field label="Full Name">
                            <Input
                              value={data.case_manager_name}
                              onChange={(e) =>
                                setData((p) => ({
                                  ...p,
                                  case_manager_name: e.target.value,
                                }))
                              }
                              placeholder="Enter name"
                              className={inputBase}
                            />
                          </Field>
                          <Field label="Contact Information">
                            <Input
                              value={data.case_manager_contact}
                              onChange={(e) =>
                                setData((p) => ({
                                  ...p,
                                  case_manager_contact: e.target.value,
                                }))
                              }
                              placeholder="Enter contact information"
                              className={inputBase}
                            />
                          </Field>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                {/* Shared Housing & Household Guidelines */}
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                    Shared Housing & Household Guidelines
                  </h2>
                  <div className="mt-4 space-y-5">
                    <Field label="Are you willing to undergo a background check if required?">
                      <YesNo
                        name="willing_to_undergo_background_check"
                        value={data.willing_to_undergo_background_check}
                        onChange={(v) =>
                          setData((p) => ({
                            ...p,
                            willing_to_undergo_background_check: v,
                          }))
                        }
                      />
                    </Field>
                    <Field label="Do you have any upcoming court dates or legal obligations that may affect your stay?">
                      <YesNo
                        name="upcoming_court_dates"
                        value={data.upcoming_court_dates}
                        onChange={(v) =>
                          setData((p) => ({ ...p, upcoming_court_dates: v }))
                        }
                      />
                    </Field>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Additional Information */}
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                    Additional Information
                  </h2>
                  <div className="mt-4">
                    <Field label="Please share anything else you would like us to know">
                      <Input
                        value={data.additional_info}
                        onChange={(e) =>
                          setData((p) => ({
                            ...p,
                            additional_info: e.target.value,
                          }))
                        }
                        placeholder="e.g., smith"
                        className={`${inputBase} h-12`}
                      />
                    </Field>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Acknowledgment & Consent */}
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                    Acknowledgment & Consent
                  </h2>

                  <div className="mt-4 space-y-5">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={data.consent}
                        onChange={(e) =>
                          setData((p) => ({ ...p, consent: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <span
                        className="mt-0.5 h-5 w-5 rounded-[6px] border border-gray-300 bg-white transition-colors flex items-center justify-center
                                                peer-checked:bg-primary peer-checked:border-primary
                                                peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className={[
                            "h-4 w-4 text-white transition-opacity",
                            data.consent ? "opacity-100" : "opacity-0",
                          ].join(" ")}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        I certify that the information provided is true and
                        accurate to the best of my knowledge. I understand that
                        providing false information may disqualify me from the
                        program.
                      </span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Applicant Signature">
                        <Input
                          value={data.signature_name}
                          onChange={(e) =>
                            setData((p) => ({
                              ...p,
                              signature_name: e.target.value,
                            }))
                          }
                          placeholder="Full Name"
                          className={inputBase}
                        />
                      </Field>
                      <Field label="Date">
                        <Input
                          type="date"
                          value={data.signature_date}
                          onChange={(e) =>
                            setData((p) => ({
                              ...p,
                              signature_date: e.target.value,
                            }))
                          }
                          className={inputBase}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full sm:w-[300px] border-primary text-primary cursor-pointer hover:bg-orange-50"
              disabled={step === 1 || submitting}
            >
              Back
            </Button>

            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="w-full sm:w-[300px] bg-gradient-to-r from-[#FFA100] to-[#FFD700] cursor-pointer hover:opacity-95 text-white"
                disabled={submitting}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="w-full sm:w-[300px] bg-gradient-to-r cursor-pointer from-[#FFA100] to-[#FFD700] hover:opacity-95 text-white"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Pre-Screen Form"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
