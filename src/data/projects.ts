import type { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "linq",
    title: "LINQ",
    tagline: "AI-Powered Professional Networking",
    description:
      "Built end-to-end: React Native + FastAPI + PostgreSQL on AWS (CloudFront, ALB, ECS Fargate, RDS). Implemented vector similarity matching with Gemini embeddings and LLM re-ranking.",
    technologies: ["React Native", "FastAPI", "AWS", "PostgreSQL", "AI/ML"],
    links: {
      live: "https://www.joinlinqapp.com",
      app: "https://www.joinlinqapp.com/app",
    },
    featured: true,
  },
  {
    id: "scrollbuddy",
    title: "ScrollBuddy",
    tagline: "Break Free from the Feed",
    description:
      "Anti-doomscrolling app where a friend guards your screen time. Live on the App Store, rebuilt and relaunched Sep 2026: 3,000+ downloads, 696 buddy connections. Blocker edits need your buddy's approval; streaks break on circumvention. 2M+ organic views.",
    technologies: ["React Native", "App Store"],
    links: {
      live: "https://www.scrollbuddy.app",
      app: "https://apps.apple.com/app/apple-store/id6749676786?pt=127783967&ct=portfolio&mt=8",
      tiktok: [
        "https://www.tiktok.com/@doomscrollrs",
        "https://www.tiktok.com/@theonewhoneverquit",
      ],
    },
    featured: true,
  },
  {
    id: "sign-language-detection",
    title: "Sign Language Detection",
    tagline: "Decentralized ML Training",
    description:
      "CNN trained on ASL with decentralized storage (Akave/Filecoin) and compute (Lilypad). Users upload training data to improve the model.",
    technologies: ["Python", "CNN", "Web3", "Filecoin", "Lilypad"],
    links: {
      demo: "https://youtu.be/_Gkln8kPmD0",
      proof: "https://www.encodeclub.com/programmes/ai-blueprints-with-filecoin",
    },
    award: "$2.5K Hackathon Winner",
    featured: true,
  },
  {
    id: "thoughts2actions",
    title: "thoughts2actions",
    tagline: "Turn Thoughts into Action",
    description:
      "Voice/video thought capture with AI processing. Transforms fleeting ideas into organized, searchable knowledge.",
    technologies: ["Next.js", "AI", "Mobile"],
    links: {
      live: "https://www.thoughts2action.com",
      demo: "https://youtu.be/0Wewk1EFAUY",
    },
    featured: false,
  },
];

export const projectsSummary = {
  headline: "4 Projects · $2.5K Winner",
  subheadline: "LINQ · ScrollBuddy · Sign Language · T2A",
};
