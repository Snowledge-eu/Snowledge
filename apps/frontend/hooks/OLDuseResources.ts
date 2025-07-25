import { useQuery } from "@tanstack/react-query";
// import { useEffect, useState } from "react";

// export type Resource = {
//   id: string;
//   title: string;
//   description: string;
//   tags: string[];
//   format: string;
//   duration?: string;
//   date?: string;
//   length?: string;
//   outlines: { title: string; summary: string; description: string }[];
//   price: number;
//   creatorSharePct: number;
//   contributorSharePct: number;
//   creator: {
//     id: string;
//     userId: string;
//     initials: string;
//     title: string;
//     description: string;
//   };
//   contributors: {
//     id: string;
//     userId: string;
//     initials: string;
//     title: string;
//     description: string;
//     sharePct: number;
//     // cut: number;
//     expertises: string[];
//     mission: {
//       missionDescription: string;
//       duration?: string;
//       length?: string;
//       chapters?: string;
//     };
//     synthesis?: string;
//     revenueIncreaseRequest?: {
//       currentShare: number;
//       requestedShare: number;
//       currentCut: number;
//       projectedCut: number;
//       justification: string;
//     };
//   }[];
//   attendees: {
//     id: string;
//     initials: string;
//     name: string;
//   }[];
//   pdfUrl?: string;
//   trend: {
//     title: string;
//     description: string;
//   };
//   links: { name: string; url: string }[];
// };

// const MOCK_RESOURCES_BASE: Resource[] = [
//   {
//     id: "384726159",
//     title: "Masterclass: Learn AI in 10 Days",
//     description:
//       "A practical masterclass to become operational in AI tools, designed for beginners and advanced users alike.",
//     tags: ["Masterclass", "AI", "Beginner"],
//     format: "Masterclass",
//     duration: "60min",
//     date: "2025-07-10",
//     creator: {
//       id: "16",
//       userId: "",
//       initials: "CN",
//       title: "CEO",
//       description: "Specialist in AI and data analysis.",
//     },
//     outlines: [
//       {
//         title: "Introduction to AI",
//         summary:
//           "A quick overview of AI concepts and their historical context.",
//         description:
//           "This section introduces the fundamental concepts of Artificial Intelligence, tracing its evolution from early symbolic systems to modern deep learning. It covers the key milestones, the main paradigms (symbolic, statistical, connectionist), and explains why AI is now at the heart of digital transformation across industries. The reader will gain a solid understanding of what AI is, its main branches, and why it matters today.",
//       },
//       {
//         title: "Machine Learning Basics",
//         summary: "Key ML algorithms and their practical applications.",
//         description:
//           "This chapter delves into the core principles of machine learning, including supervised, unsupervised, and reinforcement learning. It explains the most widely used algorithms such as linear regression, decision trees, neural networks, and clustering techniques. The section also discusses the importance of data quality, feature engineering, and model evaluation, providing practical examples and use cases to illustrate each concept.",
//       },
//       {
//         title: "Practical Projects",
//         summary: "Hands-on projects to apply AI knowledge on real datasets.",
//         description:
//           "Learners will engage in a series of practical projects designed to reinforce their understanding of AI and machine learning. These projects include building a simple image classifier, developing a recommendation system, and analyzing real-world datasets. Each project is accompanied by step-by-step instructions, code snippets, and best practices for deploying models in production environments.",
//       },
//     ],
//     price: 50,
//     creatorSharePct: 70,
//     contributorSharePct: 30,
//     contributors: [
//       {
//         id: "User 1",
//         userId: "100",
//         initials: "CN",
//         title: "CEO",
//         description: "Specialist in AI and data analysis.",
//         sharePct: 10,
//         expertises: ["Expertise 1", "Expertise 2"],
//         mission: {
//           missionDescription:
//             "You need to produce a full Masterclass on the selected topic, including research and documentation.",
//           duration: "60min",
//           length: "10-20",
//           chapters: "8-12",
//         },
//       },
//       {
//         id: "User 2",
//         userId: "101",
//         initials: "SB",
//         title: "CTO",
//         description: "Senior dev and ML engineer.",
//         sharePct: 20,
//         expertises: ["Expertise 2", "Expertise 3"],
//         mission: {
//           missionDescription:
//             "You need to produce a full Masterclass on the selected topic, including research and documentation.",
//           duration: "60min",
//           length: "10-20",
//           chapters: "8-12",
//         },
//       },
//     ],
//     attendees: [
//       { id: "u1", initials: "AB", name: "Alice Brown" },
//       { id: "u2", initials: "JD", name: "John Doe" },
//       { id: "u3", initials: "MP", name: "Marie Paul" },
//       { id: "u4", initials: "LB", name: "Leo Berger" },
//       { id: "u5", initials: "SC", name: "Sophie Chen" },
//       { id: "u6", initials: "KR", name: "Karl Ruiz" },
//       { id: "u7", initials: "NH", name: "Nora Hall" },
//       { id: "u8", initials: "VM", name: "Victor M." },
//       { id: "u9", initials: "EK", name: "Elena K." },
//     ],
//     pdfUrl:
//       "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
//     trend: {
//       title: "The Rise of AI for All",
//       description:
//         "This trend highlights the rapid democratization of artificial intelligence, making advanced tools accessible to a broader audience. It explores how AI is transforming both education and business, enabling individuals and organizations to leverage machine learning and automation without deep technical expertise. The trend also discusses the challenges of adoption, the need for upskilling, and the societal implications of widespread AI usage.",
//     },
//     links: [
//       { name: "Official Documentation", url: "https://www.example.com/docs" },
//       { name: "Related Article", url: "https://www.example.com/article" },
//       { name: "Community Forum", url: "https://www.example.com/forum" },
//     ],
//   },
//   {
//     id: "927415836",
//     title: "Workshop: Data Science Bootcamp",
//     description: "An intensive workshop to master data science fundamentals.",
//     tags: ["Workshop", "Data Science", "Intermediate"],
//     format: "Workshop",
//     duration: "90min",
//     date: "2025-08-15",
//     creator: {
//       id: "16",
//       userId: "",
//       initials: "CN",
//       title: "CEO",
//       description: "Specialist in AI and data analysis.",
//     },
//     outlines: [
//       {
//         title: "Data Cleaning",
//         summary: "Best practices for preparing data before analysis.",
//         description:
//           "This section covers the essential steps in cleaning and preprocessing data, which is a critical phase in any data science project. Topics include handling missing values, detecting and correcting outliers, normalizing and standardizing data, and encoding categorical variables. The reader will learn practical techniques and tools to ensure data quality and reliability, illustrated with real-world examples from various industries.",
//       },
//       {
//         title: "Exploratory Analysis",
//         summary: "Techniques to explore, summarize, and visualize data.",
//         description:
//           "This chapter introduces the main methods for exploring and understanding datasets, including descriptive statistics, correlation analysis, and data visualization. It demonstrates how to use tools like pandas, matplotlib, and seaborn to uncover patterns, trends, and anomalies in data. The section emphasizes the importance of exploratory data analysis (EDA) as a foundation for building robust predictive models.",
//       },
//       {
//         title: "Model Deployment",
//         summary: "How to deploy and monitor models in production.",
//         description:
//           "This part explains the end-to-end process of deploying machine learning models into production environments. It covers topics such as model serialization, API development, containerization with Docker, and continuous integration/continuous deployment (CI/CD) pipelines. The reader will also learn about monitoring model performance, detecting data drift, and maintaining models over time to ensure long-term value.",
//       },
//     ],
//     price: 65,
//     creatorSharePct: 60,
//     contributorSharePct: 40,
//     contributors: [
//       {
//         id: "User 3",
//         userId: "100",
//         initials: "ML",
//         title: "Lead Data Scientist",
//         description: "Expert in data pipelines.",
//         sharePct: 25,
//         expertises: ["Pipelines", "Deployment"],
//         mission: {
//           missionDescription:
//             "You need to produce a full Workshop on the selected topic, including research and documentation.",
//           duration: "90min",
//           length: "10-20",
//           chapters: "8-12",
//         },
//       },
//     ],
//     attendees: [
//       { id: "u10", initials: "JS", name: "Julia Smith" },
//       { id: "u11", initials: "RB", name: "Robert Brown" },
//     ],
//     pdfUrl:
//       "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
//     trend: {
//       title: "Data Science as a Core Skill",
//       description:
//         "This trend examines the growing importance of data science as a foundational skill in the modern workforce. It covers the increasing demand for data literacy, the integration of data-driven decision-making in business processes, and the proliferation of bootcamps and workshops aimed at upskilling professionals. The trend also addresses the evolving landscape of data tools and the challenges of keeping pace with technological advancements.",
//     },
//     links: [
//       { name: "Workshop Materials", url: "https://www.example.com/materials" },
//       { name: "Data Science Blog", url: "https://www.example.com/blog" },
//       { name: "Project Repository", url: "https://www.example.com/repo" },
//     ],
//   },
//   {
//     id: "561903247",
//     title: "Whitepaper: Generative AI in 2025",
//     description:
//       "A detailed whitepaper on the advances, uses, and challenges of generative AI in 2025.",
//     tags: ["Whitepaper", "IA", "Tendances"],
//     format: "Whitepaper",
//     date: "2025-09-01",
//     creator: {
//       id: "16",
//       userId: "",
//       initials: "CN",
//       title: "CEO",
//       description: "Specialist in AI and data analysis.",
//     },
//     outlines: [
//       {
//         title: "Introduction",
//         summary: "Context and objectives of the whitepaper.",
//         description:
//           "This opening section sets the stage for the whitepaper by outlining the rapid evolution of generative AI technologies in recent years. It discusses the motivations behind this research, the key questions addressed, and the intended audience. The introduction also provides a roadmap of the document, highlighting the main themes and the significance of generative AI in shaping the future of work, creativity, and society.",
//       },
//       {
//         title: "Innovative Use Cases",
//         summary:
//           "Concrete examples of generative AI applications across sectors.",
//         description:
//           "This chapter presents a comprehensive review of the most innovative and impactful use cases of generative AI in 2025. It covers applications in healthcare (such as drug discovery and personalized medicine), finance (fraud detection, algorithmic trading), creative industries (art, music, content generation), and education (personalized learning, automated assessment). Each use case is analyzed in terms of its technical approach, business value, and societal implications, with real-world case studies and expert insights.",
//       },
//       {
//         title: "Challenges and Perspectives",
//         summary:
//           "Analysis of ethical, technical, and economic challenges ahead.",
//         description:
//           "This section explores the major challenges facing the adoption and scaling of generative AI, including ethical concerns (bias, transparency, accountability), technical hurdles (scalability, robustness, data privacy), and economic impacts (job transformation, new business models). It also discusses future perspectives, such as the evolution of regulations, the emergence of new standards, and the potential for generative AI to drive innovation across industries. The chapter concludes with recommendations for stakeholders to navigate this rapidly changing landscape.",
//       },
//     ],
//     length: "10-20",
//     price: 15,
//     creatorSharePct: 50,
//     contributorSharePct: 50,
//     contributors: [
//       {
//         id: "User 1",
//         userId: "100",
//         initials: "EP",
//         title: "AI Researcher",
//         description: "Specialist in generative models.",
//         sharePct: 15,
//         expertises: ["ai"],
//         mission: {
//           missionDescription:
//             "Write the introduction, the synthesis of technological advances, and the conclusion of the whitepaper, ensuring scientific consistency and overall vision.",
//           length: "10-20",
//         },
//         synthesis: `Done! Introduction, tech synthesis, and conclusion written with solid scientific references. I also added extra research on future AI trends, integrated new scientific citations, wrote 3 additional pages summarizing market impacts, and refined the narrative for better clarity and stronger impact. I’d like more share for the extra effort`,
//         revenueIncreaseRequest: {
//           currentShare: 10,
//           requestedShare: 15,
//           currentCut: 10.0,
//           projectedCut: 15.0,
//           justification:
//             "I worked 20 extra hours and added two new chapters to the course content.",
//         },
//       },
//       {
//         id: "User 2",
//         userId: "101",
//         initials: "JD",
//         title: "Data Scientist",
//         description: "Expert in applied AI and data analysis.",
//         sharePct: 15,
//         expertises: ["finance"],
//         mission: {
//           missionDescription:
//             "Analyze innovative use cases of generative AI in industry and healthcare, and write the corresponding chapters.",
//           length: "10-20",
//         },
//         synthesis: `Chapters complete. I analyzed key AI use cases in healthcare and industry, with examples, trends, and insights on market adoption and transformative impact.`,
//       },
//       {
//         id: "User 3",
//         userId: "102",
//         initials: "AM",
//         title: "Software Engineer",
//         description: "Fullstack developer specialized in AI and cloud.",
//         sharePct: 20,
//         expertises: ["communication"],
//         mission: {
//           missionDescription:
//             "Document the technical challenges, scalability, security, and governance of generative models, and write the technical chapters.",
//           length: "10-20",
//         },
//         synthesis: `Technical sections delivered, covering scalability, security, model governance, and emerging risks of generative models. Included diagrams and practical examples.`,
//       },
//     ],
//     attendees: [
//       { id: "u12", initials: "MG", name: "Marc G." },
//       { id: "u13", initials: "LS", name: "Laura S." },
//     ],
//     pdfUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/assets/Livre-blanc-IA-generative-2025.pdf`,
//     trend: {
//       title: "Generative AI Revolution",
//       description:
//         "This trend delves into the transformative impact of generative AI technologies in 2025. It explores how models like GPT, DALL-E, and others are revolutionizing content creation, product design, and problem-solving across sectors. The trend discusses the opportunities for innovation, the ethical and regulatory challenges, and the new business models emerging from generative AI. It also highlights the need for interdisciplinary collaboration to harness the full potential of these technologies.",
//     },
//     links: [
//       {
//         name: "Generative AI Whitepaper (Fujitsu)",
//         url: "https://sp.ts.fujitsu.com/dmsp/Publications/public/wp-generative-ai-en.pdf",
//       },
//       {
//         name: "Generative AI's Class of 2025 (Medium)",
//         url: "https://medium.com/genai-nexus/generative-ais-class-of-2025-962fa45d3acb",
//       },
//       {
//         name: "Demystifying AI Agents: The Final Generation of Intelligence (arXiv)",
//         url: "https://arxiv.org/abs/2505.09932",
//       },
//     ],
//   },
// ];

//TODO: à supprimer après la démo
// export function useResource(resourceId: string) {
//   const [resource, setResource] = useState<Resource | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let isMounted = true;
//     async function fetchResource() {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/last-user-id`,
//           { credentials: "include" }
//         );
//         const data = await res.json();
//         const userId = data.userId ? String(data.userId) : "4";
//         // Reconstruire le mock à la volée
//         const found = MOCK_RESOURCES_BASE.find((r) => r.id === resourceId);
//         if (!found) throw new Error("Resource not found");
//         const resourceWithUserId = {
//           ...found,
//           creator: {
//             ...found.creator,
//             userId,
//           },
//         };
//         if (isMounted) setResource(resourceWithUserId);
//       } catch (e: any) {
//         if (isMounted) setError(e.message || "Unknown error");
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     }
//     fetchResource();
//     return () => {
//       isMounted = false;
//     };
//   }, [resourceId]);

//   return { data: resource, isLoading: loading, error };
// }

//TODO: à supprimer après la démo
// export function useResources() {
//   const [resources, setResources] = useState<Resource[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let isMounted = true;
//     async function fetchResources() {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/last-user-id`,
//           { credentials: "include" }
//         );
//         const data = await res.json();
//         const userId = data.userId ? String(data.userId) : "4";
//         // Reconstruire le mock à la volée
//         const resourcesWithUserId = MOCK_RESOURCES_BASE.map((r) => ({
//           ...r,
//           creator: {
//             ...r.creator,
//             userId,
//           },
//         }));
//         if (isMounted) setResources(resourcesWithUserId);
//       } catch (e: any) {
//         if (isMounted) setError(e.message || "Unknown error");
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     }
//     fetchResources();
//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   return { data: resources, isLoading: loading, error };
// }

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
