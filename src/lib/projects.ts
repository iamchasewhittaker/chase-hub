export interface Project {
  title: string;
  description: string;
  techStack: string[];
  liveUrl: string;
  learned: string;
}

export const projects: Project[] = [
  {
    title: "GMAT Mastery",
    description:
      "AI-powered GMAT practice app that generates questions on the fly and walks you through solutions with Socratic explanations.",
    techStack: ["Next.js", "TypeScript", "Claude API", "Framer Motion"],
    liveUrl: "https://gmat-mastery-web.vercel.app",
    learned:
      "Built a real-time AI tool-use pipeline where Claude generates structured MCQ data, not just text. Learned how to make AI output reliable and parseable.",
  },
  {
    title: "ClarityOS Money",
    description:
      "Financial accountability layer on top of YNAB. Calculates your real Safe-to-Spend number and surfaces what matters today.",
    techStack: ["Next.js", "TypeScript", "Supabase", "YNAB API"],
    liveUrl: "https://clarityos-money.vercel.app",
    learned:
      "Shipping a product that touches real financial data taught me how much trust and reliability matter. Every edge case is someone's actual money.",
  },
  {
    title: "YardOS",
    description:
      "Lawn decision engine that tells you what to do today based on your yard's actual needs. No guessing, no calendar. Just the next right task.",
    techStack: ["Next.js", "React 19", "Tailwind v4", "localStorage"],
    liveUrl: "https://yardos-six.vercel.app",
    learned:
      "Designed a decision engine from scratch. The hardest part wasn't the algorithm. It was making the output feel obvious and trustworthy to the user.",
  },
];
