import type { Annotation, AnnotationSettings, CommentsConfig } from "@jasperdenouden92/annotations";

export const annotations: Annotation[] = [];

export const settings: AnnotationSettings = {
  togglePosition: "bottom-right",
  defaultVisible: false,
};

export const comments: CommentsConfig = {
  enabled: true,
  apiBase: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  project: "PULSE Core",
};
