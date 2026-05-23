// Shared contact-form constants — safe to import from both server and client

export const subjectOptions = [
  { label: "General Inquiry", value: "general" },
  { label: "Business Listing Support", value: "listing" },
  { label: "Report a Problem", value: "report" },
  { label: "Partnership / Collaboration", value: "partnership" },
  { label: "Other", value: "other" },
];

/** @type {Record<string, string>} */
export const subjectLabelMap = Object.fromEntries(
  subjectOptions.map(({ value, label }) => [value, label])
);
