import { PDFDocument } from "pdf-lib";

export type DocumentField = {
  name: string;
  type: "text" | "checkbox" | "select";
  label: string;
};

export type VisaDocument = {
  id: string;
  countryCode: string;
  country: string;
  countrySlug: string;
  region: string;
  title: string;
  description: string;
  tags: string[];
  templatePath: string;
  samplePath: string;
  filename: string;
  pages: number;
  fields: DocumentField[];
};

export type DocumentCountry = {
  code: string;
  name: string;
  slug: string;
  region: string;
  documentCount: number;
  documents: string[];
};

export type DocumentCatalog = {
  product: string;
  source: string;
  countries: DocumentCountry[];
  documents: VisaDocument[];
};

export type FillProfile = {
  workerName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  employerName: string;
  occupation: string;
  salary: string;
  contractStart: string;
  email: string;
  phone: string;
  address: string;
  sourceCountry: string;
};

const aliases: Record<keyof FillProfile, string[]> = {
  workerName: [
    "worker_name",
    "worker_full_name",
    "full_name",
    "employee_name",
    "applicant_name",
    "employee",
  ],
  passportNumber: [
    "passport",
    "iqama_or_passport",
    "passport_no",
    "passport_number",
    "iqama_no",
    "id_no",
  ],
  nationality: ["nationality", "source_country", "country_of_origin"],
  dateOfBirth: ["date_of_birth", "birth_date", "dob"],
  employerName: [
    "employer_name",
    "employer_name_en",
    "company_name",
    "turkish_company_name",
    "agency_name",
  ],
  occupation: ["occupation", "job_title", "job_role", "position"],
  salary: ["salary", "basic_salary", "total_salary", "salary_try", "monthly_salary", "basic_wage"],
  contractStart: ["contract_start", "start_date", "employment_start", "work_start"],
  email: ["employer_email", "email", "worker_email"],
  phone: ["employer_phone", "telephone", "phone", "mobile"],
  address: ["address", "company_address", "home_address", "registered_address"],
  sourceCountry: ["source_country", "origin_country", "sending_country"],
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function valueForField(fieldName: string, profile: FillProfile) {
  const normalized = normalize(fieldName);
  const key = (Object.keys(aliases) as (keyof FillProfile)[]).find((candidate) =>
    aliases[candidate].some((alias) => normalized === alias || normalized.includes(alias)),
  );
  return key ? profile[key] : "";
}

export async function fillPdfTemplate(document: VisaDocument, profile: FillProfile) {
  const response = await fetch(document.templatePath);
  if (!response.ok) throw new Error(`Could not load ${document.filename}`);
  const bytes = await response.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();
  let filledCount = 0;

  for (const field of document.fields) {
    try {
      if (field.type === "checkbox") continue;
      const value = valueForField(field.name, profile);
      if (!value) continue;
      form.getTextField(field.name).setText(value.slice(0, 180));
      filledCount += 1;
    } catch {
      // A field can be a widget with a type that differs from the catalog metadata.
    }
  }

  form.updateFieldAppearances();
  const filledBytes = await pdf.save();
  return { bytes: filledBytes, filledCount };
}

export function blankFillProfile(): FillProfile {
  return {
    workerName: "",
    passportNumber: "",
    nationality: "Bangladeshi",
    dateOfBirth: "",
    employerName: "",
    occupation: "",
    salary: "",
    contractStart: "",
    email: "",
    phone: "",
    address: "",
    sourceCountry: "Bangladesh",
  };
}
