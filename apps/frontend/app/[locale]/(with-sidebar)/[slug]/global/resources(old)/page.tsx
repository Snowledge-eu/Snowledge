// "use client";

// import React from "react";
// import { useParams } from "next/navigation";
// import Link from "next/link";
// import { useResources } from "@/hooks/useResources";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@repo/ui/components/card";
// import { Badge } from "@repo/ui/components/badge";
// import { Button } from "@repo/ui/components/button";
// import { Separator } from "@repo/ui/components/separator";
// import { Layers, FileText, Users, BookOpen } from "lucide-react";
// import { useTranslations } from "next-intl";

// const formatColor: Record<string, string> = {
//   Masterclass: "bg-blue-100 text-blue-800",
//   Workshop: "bg-green-100 text-green-800",
//   Whitepaper: "bg-purple-100 text-purple-800",
//   Seminar: "bg-yellow-100 text-yellow-800",
// };

// export default function ResourcesListPage() {
//   const { slug } = useParams();
//   const { data: resources, isLoading, error } = useResources();
//   const t = useTranslations("resources");

//   if (isLoading) return <div className="text-center py-10">{t("loading")}</div>;
//   if (error || !resources)
//     return (
//       <div className="text-center py-10 text-red-600">{t("errorLoading")}</div>
//     );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-muted/50 to-white/80">
//       <div className="max-w-6xl mx-auto py-10 px-2 md:px-0">
//         <div className="flex flex-col items-center mb-10">
//           <div className="flex items-center gap-3 mb-2">
//             <BookOpen className="w-8 h-8 text-primary" />
//             <h1 className="text-3xl font-bold">{t("availableResources")}</h1>
//           </div>
//           <p className="text-muted-foreground text-lg text-center max-w-2xl">
//             {t("explorePremium")}
//           </p>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {resources.map((resource) => (
//             <Card
//               key={resource.id}
//               className="flex flex-col h-full hover:shadow-xl transition-shadow border-2 border-transparent hover:border-primary/40 bg-white/90"
//             >
//               <div
//                 className={`rounded-t-md px-4 py-2 font-semibold text-sm ${formatColor[resource.format] || "bg-muted/30 text-muted-foreground"}`}
//               >
//                 {t(`format.${resource.format}`)}
//               </div>
//               <CardHeader className="pb-2">
//                 <CardTitle className="flex items-center gap-2 text-lg">
//                   {resource.title}
//                 </CardTitle>
//                 <CardDescription className="line-clamp-2 min-h-[40px]">
//                   {resource.description}
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="flex-1 flex flex-col justify-between pt-0">
//                 <div className="flex flex-wrap gap-2 mb-2">
//                   {resource.tags.map((tag) => (
//                     <Badge key={tag}>{tag}</Badge>
//                   ))}
//                 </div>
//                 <Separator />
//                 <div className="flex flex-col gap-1 text-sm mt-2">
//                   <span>
//                     <b>{t("duration")} :</b> {resource.duration}
//                   </span>
//                   <span>
//                     <b>{t("date")} :</b> {resource.date}
//                   </span>
//                 </div>
//                 {/* Mini-aperçu du plan */}
//                 {resource.outlines?.[0] && (
//                   <div className="mt-2 text-xs text-muted-foreground">
//                     <span className="font-semibold">{t("preview")} :</span>{" "}
//                     {resource.outlines[0].title} —{" "}
//                     {resource.outlines[0].description}
//                   </div>
//                 )}
//                 <Separator className="my-2" />
//                 <div className="flex justify-end mt-4">
//                   <Button asChild size="lg" className="w-full">
//                     <Link href={`/${slug}/global/resources/${resource.id}`}>
//                       {t("discover")}
//                     </Link>
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
