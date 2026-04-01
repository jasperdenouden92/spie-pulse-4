import type { Annotation, AnnotationSettings, CommentsConfig } from "@jasperdenouden92/annotations";

export const annotations: Annotation[] = [];

export const settings: AnnotationSettings = {
  togglePosition: "bottom-right",
  defaultVisible: false,
};

export const comments: CommentsConfig = {
  enabled: true,
  apiBase: "",
  project: "PULSE Core",
};
