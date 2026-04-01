"use client";

import {
  AnnotationProvider,
  AnnotationButton,
  AnnotationPanel,
} from "@jasperdenouden92/annotations";
import { usePathname } from "next/navigation";
import { annotations, settings, comments } from "./config";

export function Annotations({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnnotationProvider
      annotations={annotations}
      currentRoute={pathname}
      settings={settings}
      comments={comments}
    >
      {children}
      <AnnotationButton />
      <AnnotationPanel />
    </AnnotationProvider>
  );
}
