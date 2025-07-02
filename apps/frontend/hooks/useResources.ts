import { useQuery } from "@tanstack/react-query";

export type Resource = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  format: string;
  duration: string;
  date: string;
  outlines: { title: string; description: string }[];
  price: number;
  creatorSharePct: number;
  contributorSharePct: number;
  creator: {
    id: string;
    userId: string;
    initials: string;
    title: string;
    description: string;
  };
  contributors: {
    id: string;
    userId: string;
    initials: string;
    title: string;
    description: string;
    sharePct: number;
    cut: number;
    expertises: string[];
  }[];
  attendees: {
    id: string;
    initials: string;
    name: string;
  }[];
  pdfUrl?: string;
};

const MOCK_RESOURCES: Resource[] = [
  {
    id: "384726159",
    title: "Masterclass: Learn AI in 10 Days",
    description:
      "A practical masterclass to become operational in AI tools, designed for beginners and advanced users alike.",
    tags: ["Masterclass", "AI", "Beginner"],
    format: "Masterclass",
    duration: "60min",
    date: "2025-07-10",
    creator: {
      id: "16",
      userId: "4	",
      initials: "CN",
      title: "CEO",
      description: "Specialist in AI and data analysis.",
    },
    outlines: [
      {
        title: "Introduction to AI",
        description: "Quick overview of AI concepts and history.",
      },
      {
        title: "Machine Learning Basics",
        description: "Learn the key ML algorithms and how to use them.",
      },
      {
        title: "Practical Projects",
        description: "Apply your knowledge on real datasets.",
      },
    ],
    price: 50,
    creatorSharePct: 70,
    contributorSharePct: 30,
    contributors: [
      {
        id: "User 1",
        userId: "16",
        initials: "CN",
        title: "CEO",
        description: "Specialist in AI and data analysis.",
        sharePct: 10,
        cut: 10,
        expertises: ["Expertise 1", "Expertise 2"],
      },
      {
        id: "User 2",
        userId: "17",
        initials: "SB",
        title: "CTO",
        description: "Senior dev and ML engineer.",
        sharePct: 20,
        cut: 20,
        expertises: ["Expertise 2", "Expertise 3"],
      },
    ],
    attendees: [
      { id: "u1", initials: "AB", name: "Alice Brown" },
      { id: "u2", initials: "JD", name: "John Doe" },
      { id: "u3", initials: "MP", name: "Marie Paul" },
      { id: "u4", initials: "LB", name: "Leo Berger" },
      { id: "u5", initials: "SC", name: "Sophie Chen" },
      { id: "u6", initials: "KR", name: "Karl Ruiz" },
      { id: "u7", initials: "NH", name: "Nora Hall" },
      { id: "u8", initials: "VM", name: "Victor M." },
      { id: "u9", initials: "EK", name: "Elena K." },
    ],
    pdfUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "927415836",
    title: "Workshop: Data Science Bootcamp",
    description: "An intensive workshop to master data science fundamentals.",
    tags: ["Workshop", "Data Science", "Intermediate"],
    format: "Workshop",
    duration: "90min",
    date: "2025-08-15",
    creator: {
      id: "16",
      userId: "4",
      initials: "CN",
      title: "CEO",
      description: "Specialist in AI and data analysis.",
    },
    outlines: [
      {
        title: "Data Cleaning",
        description:
          "Best practices and common pitfalls for cleaning data before analysis.",
      },
      {
        title: "Exploratory Analysis",
        description:
          "How to explore, summarize and visualize data effectively.",
      },
      {
        title: "Model Deployment",
        description:
          "Deploying and monitoring models in production environments.",
      },
    ],
    price: 65,
    creatorSharePct: 60,
    contributorSharePct: 40,
    contributors: [
      {
        id: "User 3",
        userId: "16",
        initials: "ML",
        title: "Lead Data Scientist",
        description: "Expert in data pipelines.",
        sharePct: 25,
        cut: 37.5,
        expertises: ["Pipelines", "Deployment"],
      },
    ],
    attendees: [
      { id: "u10", initials: "JS", name: "Julia Smith" },
      { id: "u11", initials: "RB", name: "Robert Brown" },
    ],
    pdfUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "561903247",
    title: "Whitepaper: L'IA Générative en 2025",
    description:
      "Un whitepaper détaillé sur les avancées, usages et enjeux de l'IA générative en 2025.",
    tags: ["Whitepaper", "IA", "Tendances"],
    format: "Whitepaper",
    duration: "30 pages",
    date: "2025-09-01",
    creator: {
      id: "16",
      userId: "4",
      initials: "CN",
      title: "CEO",
      description: "Specialist in AI and data analysis.",
    },
    outlines: [
      {
        title: "Introduction",
        description: "Contexte et objectifs du whitepaper.",
      },
      {
        title: "Cas d'usage innovants",
        description:
          "Exemples concrets d'applications de l'IA générative dans différents secteurs.",
      },
      {
        title: "Défis et perspectives",
        description:
          "Analyse des enjeux éthiques, techniques et économiques à venir.",
      },
    ],
    price: 35,
    creatorSharePct: 80,
    contributorSharePct: 20,
    contributors: [
      {
        id: "User 4",
        userId: "16",
        initials: "EP",
        title: "Chercheur IA",
        description: "Spécialiste des modèles génératifs.",
        sharePct: 20,
        cut: 16,
        expertises: ["Recherche", "Générative"],
      },
    ],
    attendees: [
      { id: "u12", initials: "MG", name: "Marc G." },
      { id: "u13", initials: "LS", name: "Laura S." },
    ],
    pdfUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
];

export function useResource(resourceId: string) {
  return useQuery<Resource>({
    queryKey: ["resource", resourceId],
    queryFn: async () => {
      // Simule un fetch asynchrone
      await new Promise((res) => setTimeout(res, 100));
      const resource = MOCK_RESOURCES.find((r) => r.id === resourceId);
      if (!resource) throw new Error("Resource not found");
      return resource;
    },
  });
}

export function useResources() {
  return useQuery<Resource[]>({
    queryKey: ["resources"],
    queryFn: async () => {
      return MOCK_RESOURCES;
    },
  });
}
