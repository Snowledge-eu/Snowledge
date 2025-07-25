// "use client";
// import { Button } from "@repo/ui/components/button";
// import { useParams } from "next/navigation";
// import React from "react";
// import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
// import { useAuth } from "@/contexts/auth-context";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@repo/ui/components/card";
// import { Badge } from "@repo/ui/components/badge";
// import { Input } from "@repo/ui/components/input";
// import { Separator } from "@repo/ui/components/separator";
// import { Upload, Copy } from "lucide-react";
// import { useResource } from "@/hooks/useResources";
// import { useState, useRef } from "react";
// import AccessRessourcePage from "@/components/shared/AccessRessourcePage";
// import { useTranslations } from "next-intl";

// export default function ResourcePage() {
//   const { activeCommunity } = useCurrentCommunity();
//   const { user } = useAuth();
//   const { resourcesId } = useParams();
//   const {
//     data: resource,
//     isLoading,
//     error,
//   } = useResource(resourcesId as string);
//   // Pour l'édition
//   const [editTitle, setEditTitle] = useState("");
//   const [editFile, setEditFile] = useState<File | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   // Ajout pour copier le lien
//   const [copied, setCopied] = useState(false);
//   const resourceUrl =
//     typeof window !== "undefined"
//       ? window.location.origin +
//         `/resources/${resourcesId}/buy?community=${activeCommunity?.id}`
//       : "";
//   const handleCopy = () => {
//     navigator.clipboard.writeText(resourceUrl);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1500);
//   };
//   const t = useTranslations("resource");

//   if (isLoading) return <div>{t("loading")}</div>;
//   if (error || !resource)
//     return <div>{t("error", { error: error || t("notFound") })}</div>;

//   // Créateur : édition
//   if (user?.id === activeCommunity?.user?.id) {
//     return (
//       <div className="max-w-6xl mx-auto py-10 px-2 md:px-0">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           {/* Colonne gauche : résumé visuel, stats, contributeurs, aperçu PDF */}
//           <div className="space-y-6">
//             {/* Résumé visuel */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   {resource.title}
//                   <Badge variant="secondary" className="ml-2">
//                     {resource.format}
//                   </Badge>
//                 </CardTitle>
//                 <CardDescription>{resource.description}</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-2">
//                 <div className="flex flex-wrap gap-2 mb-2">
//                   {resource.tags.map((tag) => (
//                     <Badge key={tag}>{tag}</Badge>
//                   ))}
//                 </div>
//                 <Separator />
//                 <div className="flex flex-col gap-1 text-sm">
//                   <span>
//                     <b>{t("length")} :</b> {resource.length}
//                   </span>
//                   <span>
//                     <b>{t("date")} :</b> {resource.date}
//                   </span>
//                 </div>
//                 <Separator />
//                 <div>
//                   <h3 className="font-semibold mb-1">{t("plan")}</h3>
//                   <ul className="list-disc pl-5 text-sm text-muted-foreground">
//                     {resource.outlines.map((item, idx) => (
//                       <li key={idx}>
//                         <span className="font-medium text-foreground">
//                           {item.title}
//                         </span>{" "}
//                         : {item.description}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </CardContent>
//             </Card>
//             {/* Stats mockées */}
//             <Card className="bg-muted/30">
//               <CardHeader>
//                 <CardTitle>{t("stats")}</CardTitle>
//               </CardHeader>
//               <CardContent className="flex gap-6 text-sm">
//                 <div>
//                   <span className="font-bold text-lg">12</span>
//                   <div className="text-muted-foreground">{t("buyers")}</div>
//                 </div>
//                 <div>
//                   <span className="font-bold text-lg">87</span>
//                   <div className="text-muted-foreground">{t("views")}</div>
//                 </div>
//                 <div>
//                   <span className="font-bold text-lg">2024-06-01</span>
//                   <div className="text-muted-foreground">{t("createdAt")}</div>
//                 </div>
//               </CardContent>
//             </Card>
//             {/* Contributeurs */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>{t("contributors")}</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2">
//                 {resource.contributors.map((contrib) => (
//                   <div
//                     key={contrib.id}
//                     className="flex items-center gap-3 p-2 rounded-md bg-muted/20"
//                   >
//                     <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-primary">
//                       {contrib.initials}
//                     </div>
//                     <div className="flex-1">
//                       <div className="font-medium">{contrib.title}</div>
//                       <div className="text-xs text-muted-foreground">
//                         {contrib.description}
//                       </div>
//                     </div>
//                     <Badge variant="outline">{contrib.sharePct}%</Badge>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           </div>
//           {/* Colonne droite : édition + partage lien */}
//           <div className="space-y-6">
//             {/* Bloc de partage du lien */}
//             <Card className="border border-primary/40 bg-primary/5">
//               <CardHeader>
//                 <CardTitle>{t("shareLink")}</CardTitle>
//                 <CardDescription>{t("copyLinkDesc")}</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex gap-2 items-center">
//                   <Input
//                     value={resourceUrl}
//                     readOnly
//                     className="font-mono text-xs"
//                   />
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     onClick={handleCopy}
//                     title={t("copyLink")}
//                   >
//                     <Copy className="w-4 h-4" />
//                   </Button>
//                   {copied && (
//                     <span className="text-green-600 text-xs ml-2">
//                       {t("copied")}
//                     </span>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//             {/* Bloc édition */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>{t("editResource")}</CardTitle>
//                 <CardDescription>{t("editResourceDesc")}</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     {t("title")}
//                   </label>
//                   <Input
//                     value={editTitle || resource.title}
//                     onChange={(e) => setEditTitle(e.target.value)}
//                     placeholder={t("resourceTitlePlaceholder")}
//                     className="max-w-md"
//                   />
//                 </div>
//                 {resource.format === "Whitepaper" && (
//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       {t("pdfFile")}
//                     </label>
//                     <div className="flex items-center gap-4">
//                       <Button
//                         variant="outline"
//                         onClick={() => fileInputRef.current?.click()}
//                         className="flex items-center gap-2"
//                       >
//                         <Upload className="w-4 h-4" />
//                         {editFile ? editFile.name : t("dropPdf")}
//                       </Button>
//                       <input
//                         ref={fileInputRef}
//                         type="file"
//                         accept="application/pdf"
//                         className="hidden"
//                         onChange={(e) =>
//                           setEditFile(e.target.files?.[0] || null)
//                         }
//                       />
//                       {resource.pdfUrl && !editFile && (
//                         <a
//                           href={resource.pdfUrl}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-blue-600 underline text-sm"
//                         >
//                           {t("seeCurrentPdf")}
//                         </a>
//                       )}
//                     </div>
//                   </div>
//                 )}
//                 <Button className="mt-4">{t("save")}</Button>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return <AccessRessourcePage />;
// }
