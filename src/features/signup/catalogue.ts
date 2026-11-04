import { api } from "@/lib/api/client";

/** Learner catalogue (category tree, ADR-0005). Public: no session is needed to read it. */

export interface Category {
  id: string;
  code: string;
  name: string;
  isLeaf: boolean;
}

export interface Option {
  id: string;
  name: string;
}

export interface LeafDetail extends Category {
  requiresBoard: boolean;
  requiresLevel: boolean;
  boards: Option[];
  levels: Option[];
  subjects: Option[];
}

export interface TeachingLanguage extends Option {
  code: string;
}

export interface LearningDraft {
  /** The chosen categories from the root down to the bookable leaf */
  trail: Category[];
  board: Option | null;
  level: Option | null;
  subjects: Option[];
  teachingLanguageId: string;
  /** One active curriculum per chosen subject, resolved when the step is submitted */
  curriculumIds: string[];
}

const query = (params: Record<string, string | undefined>): string => {
  const pairs = Object.entries(params).flatMap(([key, value]) =>
    value ? [`${key}=${encodeURIComponent(value)}`] : [],
  );
  return pairs.length ? `?${pairs.join("&")}` : "";
};

export const fetchCategories = (parentId?: string) =>
  api<Category[]>(
    `/catalogue/category-tree/children${query({ parentId })}`,
  ).then((response) => response.data);

export const fetchLeaf = (
  id: string,
  choice: { boardId?: string; levelId?: string },
) =>
  api<LeafDetail>(
    `/catalogue/category-tree/leaves/${encodeURIComponent(id)}${query(choice)}`,
  ).then((response) => response.data);

export const resolveOffering = (
  leafId: string,
  choice: { subjectId: string; boardId?: string; levelId?: string },
) =>
  api<{ curriculumId: string }>(
    `/catalogue/category-tree/leaves/${encodeURIComponent(leafId)}/offering${query(choice)}`,
  ).then((response) => response.data.curriculumId);

export const fetchTeachingLanguages = () =>
  api<TeachingLanguage[]>("/catalogue/teaching-languages?limit=100").then(
    (response) => response.data,
  );

/** Whether the choices made so far are enough to leave the step. */
export function isLearningComplete(input: {
  leaf: Pick<LeafDetail, "requiresBoard" | "requiresLevel"> | null;
  board: Option | null;
  level: Option | null;
  subjects: Option[];
  teachingLanguageId: string | null;
}): boolean {
  const { leaf } = input;
  return Boolean(
    leaf &&
    (!leaf.requiresBoard || input.board) &&
    (!leaf.requiresLevel || input.level) &&
    input.subjects.length > 0 &&
    input.teachingLanguageId,
  );
}

/** "Class 10 · CBSE", or the category name when the leaf has neither. */
export function profileSummary(draft: LearningDraft): string {
  const parts = [draft.level?.name, draft.board?.name].filter(Boolean);
  return parts.length ? parts.join(" · ") : (draft.trail.at(-1)?.name ?? "");
}
