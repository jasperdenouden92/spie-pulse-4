import type { Annotation, AnnotationSettings, CommentsConfig } from "@jasperdenouden92/annotations";

export const annotations: Annotation[] = [
  {
    id: "appearance-toggle",
    target: "global",
    elementId: "appearance-toggle",
    title: "Appearance",
    body: "Users can switch between dark mode and light mode here, or use system to match system settings.",
    author: "Jasper",
    date: "2026-04-02",
    type: "documentation",
  },
];

export const settings: AnnotationSettings = {
  togglePosition: "bottom-right",
  defaultVisible: false,
};

export const comments: CommentsConfig = {
  enabled: true,
  apiBase: "",
  project: "PULSE Core",
};
