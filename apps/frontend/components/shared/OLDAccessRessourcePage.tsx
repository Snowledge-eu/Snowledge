// "use client";
// import { Button } from "@repo/ui/components/button";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import React from "react";
// import { useTranslations } from "next-intl";

// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@repo/ui/components/card";
// import { Badge } from "@repo/ui/components/badge";
// import { Separator } from "@repo/ui/components/separator";
// import { useResource } from "@/hooks/useResources";
// import { ResourceAccessStatus } from "./ResourceAccessStatus";

// export default function ResourcePage() {
//   const { resourcesId } = useParams();
//   const {
//     data: resource,
//     isLoading,
//     error,
//   } = useResource(resourcesId as string);
//   const t = useTranslations("accessResource");

//   if (isLoading) return <div>{t("loading")}</div>;
//   if (error || !resource)
//     return <div>{t("error", { error: error || t("notFound") })}</div>;

//   return (
//     <ResourceAccessStatus resourcesId={resourcesId as string}>
//       {({ hasNft, loading, error }) => {
//         if (loading) return null;
//         if (error) return <div>{t("accessError", { error })}</div>;
//         if (hasNft) {
//           return (
//             <div className="max-w-3xl mx-auto py-10 space-y-8">
//               <Card className="border-green-200">
//                 <CardHeader className="flex flex-col items-center text-center">
//                   <div className="flex items-center justify-center mb-2">
//                     <svg
//                       className="w-12 h-12 text-green-500"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         fill="white"
//                       />
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M9 12l2 2l4-4"
//                       />
//                     </svg>
//                   </div>
//                   <CardTitle className="text-2xl font-bold text-green-700">
//                     {t("thanksForPurchase")}
//                   </CardTitle>
//                   <CardDescription className="text-green-800 mt-2">
//                     {t("nowAccess", { title: resource.title })}
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   <div className="rounded-md p-4 text-green-900 text-center text-lg font-medium">
//                     {t("congrats")}
//                   </div>
//                   <div className="flex flex-wrap gap-2 justify-center mb-2">
//                     {resource.tags.map((tag) => (
//                       <Badge key={tag}>{tag}</Badge>
//                     ))}
//                   </div>
//                   <Separator />
//                   <div className="flex flex-col gap-2 items-center">
//                     <span className="text-base font-medium">
//                       {t("format")}: {resource.format}
//                     </span>
//                     <span className="text-base font-medium">
//                       {t("length")}: {resource.length} {t("pages")}
//                     </span>
//                     {resource.format === "Whitepaper" && resource.pdfUrl && (
//                       <a
//                         href={resource.pdfUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         <Button size="lg" className="mt-4">
//                           {t("downloadPdf")}
//                         </Button>
//                       </a>
//                     )}
//                   </div>
//                   <Separator />
//                   <div>
//                     <h3 className="font-semibold mb-2 text-center">
//                       {t("planTitle")}
//                     </h3>
//                     <ul className="list-disc pl-5 text-sm text-muted-foreground">
//                       {resource.outlines.map((item, idx) => (
//                         <li key={idx}>
//                           <span className="font-medium text-foreground">
//                             {item.title}
//                           </span>{" "}
//                           : {item.description}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                   <div className="text-center mt-6">
//                     <span className="text-green-700 font-semibold">
//                       {t("thanksAndEnjoy")}
//                     </span>
//                     <div className="mt-4 flex justify-center">
//                       <Button asChild size="lg" variant="outline">
//                         <a href="/">{t("backHome")}</a>
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           );
//         }
//         // Non-acheteur : accès refusé
//         return (
//           <div className="max-w-2xl mx-auto py-10 space-y-8">
//             <Card className="border-yellow-200">
//               <CardHeader className="flex flex-col items-center text-center">
//                 <div className="flex items-center justify-center mb-2">
//                   <svg
//                     className="w-12 h-12 text-yellow-500"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       fill="white"
//                     />
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M12 8v4l3 2"
//                     />
//                   </svg>
//                 </div>
//                 <CardTitle className="text-2xl font-bold text-yellow-700">
//                   {t("unlockExclusive")}
//                 </CardTitle>
//                 <CardDescription className="text-yellow-800 mt-2">
//                   {t("accessAndJoin", { title: resource.title })}
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="rounded-md p-4 text-yellow-900 text-center text-lg font-medium">
//                   {t("reservedContent")}
//                 </div>
//                 <ul className="list-disc pl-8 text-base text-yellow-900 space-y-1">
//                   <li>{t("fullAccess")}</li>
//                   {resource.format === "Whitepaper" && (
//                     <li>{t("exclusivePdf")}</li>
//                   )}
//                   <li>{t("communityParticipation")}</li>
//                   <li>{t("prioritySupport")}</li>
//                 </ul>
//                 <div className="flex flex-wrap gap-2 justify-center mb-2">
//                   {resource.tags.map((tag) => (
//                     <Badge key={tag}>{tag}</Badge>
//                   ))}
//                 </div>
//                 <Separator />
//                 <div className="text-center py-4">
//                   <span className="block text-lg font-semibold mb-2 text-yellow-800">
//                     {t("noAccessYet")}
//                   </span>
//                   <span className="block text-muted-foreground mb-4">
//                     {t("toUnlock")}
//                   </span>
//                   <Button asChild size="lg" className="mt-2">
//                     <Link href={`/resources/${resourcesId}/buy`}>
//                       {t("buyNow")}
//                     </Link>
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         );
//       }}
//     </ResourceAccessStatus>
//   );
// }
