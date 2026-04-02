"use client";

import {
  AnnotationProvider,
  AnnotationButton,
  AnnotationPanel,
} from "@jasperdenouden92/annotations";
import { useSearchParams } from "next/navigation";
import { annotations, settings, comments } from "./config";

export function Annotations({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") ?? "portfolio";
  const currentRoute = `/${currentPage}`;

  return (
    <AnnotationProvider
      annotations={annotations}
      currentRoute={currentRoute}
      settings={settings}
      comments={comments}
    >
      {children}
      <AnnotationButton />
      <AnnotationPanel />
    </AnnotationProvider>
  );
}
