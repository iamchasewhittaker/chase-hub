export interface PaymentStep {
  id: string;
  label: string;
  shortDescription: string;
  detailedExplanation: string;
  icon: string;
}

import type { Tag } from "./tag-categories";

export type PostStatus = "draft" | "published" | "deleted";

export interface Post {
  id: string;
  content: string;
  topic: Tag;
  status: PostStatus;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
