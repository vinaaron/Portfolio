import type { BackgroundData, EducationEntry, ExperienceEntry } from "@/types";

export const education: EducationEntry[] = [
  {
    id: "bristol-meng",
    institution: "University of Bristol",
    degree: "MEng Engineering Mathematics",
    specialization: "Machine Learning & Neural Networks",
    grade: "First Class Honours",
    dateRange: "2020 - 2024",
    activities: [
      "Badminton",
      "Investment & Banking Society",
      "Asian Society",
    ],
  },
  {
    id: "perse-school",
    institution: "The Perse School, Cambridge",
    degree: "IGCSE",
    dateRange: "2012 - 2019",
  },
];

export const experience: ExperienceEntry[] = [
  {
    id: "cogram-swe",
    company: "Cogram Technologies GmbH",
    role: "Product Engineer",
    type: "self-employed",
    dateRange: "Feb 2026 - Present",
    location: "Remote",
    description:
      "Product engineering for an AI platform serving enterprise AEC firms: shipped the 14-day self-serve trial (sales-led to product-led), rearchitected the mobile meeting-upload pipeline to chunked resumable S3 uploads, led the first enterprise rollouts of the on-premises connector, and lead the React Native field app redesign for on-site staff.",
    isCurrent: true,
  },
  {
    id: "linq-cto",
    company: "LINQ - Professional Networking",
    role: "Chief Technology Officer",
    type: "full-time",
    dateRange: "Sep 2025 - Jan 2026",
    description:
      "Led technical strategy for a professional networking platform that uses AI to recommend ideal connections.",
    isCurrent: false,
  },
  {
    id: "aviini-founder",
    company: "Aviini Limited",
    role: "Business Owner",
    type: "self-employed",
    dateRange: "Jul 2023 - Jan 2025",
    location: "Cambridge, UK",
    description:
      "Co-owner of an e-commerce business selling home decor and clothing across Etsy and eBay.",
    highlights: [
      "£25,000 accumulated profit",
      "25-35% profit margins",
    ],
    isCurrent: false,
  },
  {
    id: "eye-level-tutor",
    company: "Eye Level Learning",
    role: "Tutor",
    type: "part-time",
    dateRange: "Jan 2022 - Feb 2024",
    location: "Remote",
    description:
      "English and Mathematics tutor for children ages 8-12 across Europe and Asia.",
    highlights: ["Students achieved higher grades after mentoring"],
    isCurrent: false,
  },
  {
    id: "mygreendoor-ml",
    company: "MyGreenDoor",
    role: "Machine Learning Engineer",
    type: "part-time",
    dateRange: "Jan 2023 - Jun 2023",
    location: "Remote",
    description:
      "Applied data analysis and ML techniques to help achieve UK government sustainability goals for landlords and households.",
    isCurrent: false,
  },
];

export const backgroundData: BackgroundData = {
  headline: "MEng First Class · Engineer · Founder",
  subheadline: "Bristol '24 → LINQ → Cogram → ScrollBuddy",
  education,
  experience,
};
