import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
} from "@repo/ui";
import { SocialIcon } from "react-social-icons";
import { TimeframeBadge } from "./timeframe-badge";

// ============
// Types communs
// ============
export interface AnalysisListBaseProps {
  history: any[];
  onSelect: (result: any) => void;
  analysisType: "summary" | "trend";
  title?: string;
}

// ============
// Function: AnalysisListBase
// ------------
// DESCRIPTION: Composant de base réutilisable pour les listes d'analyses (summary et trends)
// PARAMS: AnalysisListBaseProps
// RETURNS: JSX.Element
// ============
export function AnalysisListBase({
  history,
  onSelect,
  analysisType,
  title,
}: AnalysisListBaseProps) {
  const getTitle = () => {
    if (title) return title;
    return analysisType === "summary"
      ? "Past Summary Analyses"
      : "Past Analyses";
  };

  return (
    <>
      <div className="font-semibold text-base mb-4">{getTitle()}</div>
      <Table className="w-full text-xs">
        <TableHeader>
          <TableRow>
            <TableHead className="px-2 text-left w-[160px]">
              Timeframe
            </TableHead>
            <TableHead className="px-2 text-center w-[56px]">
              Platform
            </TableHead>
            <TableHead className="px-2 text-center w-[90px]">Date</TableHead>
            <TableHead className="px-2 w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history?.map((item, idx) => (
            <TableRow key={item?.id || idx}>
              <TableCell className="px-2 text-left max-w-[160px] whitespace-nowrap">
                <TimeframeBadge timeframe={item?.timeframe} />
              </TableCell>
              <TableCell className="px-2 text-center">
                <span
                  title={item?.platform}
                  aria-label={item?.platform}
                  tabIndex={0}
                  className="flex justify-center items-center"
                >
                  <SocialIcon
                    network={item?.platform.toLowerCase()}
                    style={{ height: 24, width: 24 }}
                  />
                </span>
              </TableCell>
              <TableCell className="px-2 text-center max-w-[90px] whitespace-nowrap">
                {item?.date}
              </TableCell>
              <TableCell className="px-2 text-center">
                <Button
                  size="sm"
                  variant="outline"
                  className="px-1 py-0 h-6 min-w-0"
                  onClick={() => onSelect(item)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
