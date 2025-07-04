import { useQuery } from "@tanstack/react-query";

export type Resource = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  format: string;
  duration?: string;
  date?: string;
  length?: string;
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
    // cut: number;
    expertises: string[];
    mission: {
      missionDescription: string;
      duration?: string;
      length?: string;
      chapters?: string;
    };
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
        expertises: ["Expertise 1", "Expertise 2"],
        mission: {
          missionDescription:
            "You need to produce a full Masterclass on the selected topic, including research and documentation.",
          duration: "60min",
          length: "10-20",
          chapters: "8-12",
        },
      },
      {
        id: "User 2",
        userId: "17",
        initials: "SB",
        title: "CTO",
        description: "Senior dev and ML engineer.",
        sharePct: 20,
        expertises: ["Expertise 2", "Expertise 3"],
        mission: {
          missionDescription:
            "You need to produce a full Masterclass on the selected topic, including research and documentation.",
          duration: "60min",
          length: "10-20",
          chapters: "8-12",
        },
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
        expertises: ["Pipelines", "Deployment"],
        mission: {
          missionDescription:
            "You need to produce a full Workshop on the selected topic, including research and documentation.",
          duration: "90min",
          length: "10-20",
          chapters: "8-12",
        },
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
    length: "10-20",
    price: 15,
    creatorSharePct: 50,
    contributorSharePct: 50,
    contributors: [
      {
        id: "User 4",
        userId: "100",
        initials: "EP",
        title: "Chercheur IA",
        description: "Spécialiste des modèles génératifs.",
        sharePct: 15,
        expertises: ["Recherche", "Générative"],
        mission: {
          missionDescription:
            "Rédiger l'introduction, la synthèse des avancées technologiques et la conclusion du whitepaper, en assurant la cohérence scientifique et la vision globale.",
          length: "10-20",
        },
      },
      {
        id: "101",
        userId: "101",
        initials: "JD",
        title: "Data Scientist",
        description: "Expert en IA appliquée et analyse de données.",
        sharePct: 15,
        expertises: ["Data Science", "Machine Learning"],
        mission: {
          missionDescription:
            "Analyser les cas d'usage innovants de l'IA générative dans l'industrie et la santé, et rédiger les chapitres correspondants.",
          length: "10-20",
        },
      },
      {
        id: "102",
        userId: "102",
        initials: "AM",
        title: "Ingénieur Logiciel",
        description: "Développeur fullstack spécialisé IA et cloud.",
        sharePct: 20,
        expertises: ["Développement", "Cloud", "DevOps"],
        mission: {
          missionDescription:
            "Documenter les défis techniques, la scalabilité, la sécurité et la gouvernance des modèles génératifs, et rédiger les chapitres techniques.",
          length: "10-20",
        },
      },
    ],
    attendees: [
      { id: "u12", initials: "MG", name: "Marc G." },
      { id: "u13", initials: "LS", name: "Laura S." },
    ],
    pdfUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/assets/Livre-blanc-IA-generative-2025.pdf`,
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

export function useHasResourceNft(resourceId: string) {
  return useQuery({
    queryKey: ["has-resource-nft", resourceId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/resources/${resourceId}/has-nft`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!resourceId,
  });
}
