import { api } from "@/lib/api/client";
import type { EducationDraft } from "./api";

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

/** One thing the student wants to learn: a leaf with its board and class where it asks for them, and subjects. */
export interface LearningGroup {
  /** The chosen categories from the root down to the bookable leaf */
  trail: Category[];
  board: Option | null;
  level: Option | null;
  subjects: Option[];
  /** The active curriculum of each subject, same order as `subjects`, resolved when the group is added */
  curriculumIds: string[];
}

/** Everything the student wants to learn. Groups from any branch can be mixed (Class 9 Physics, JEE, Guitar). */
export interface LearningDraft {
  groups: LearningGroup[];
  /** The optional education card on the same step */
  education?: EducationDraft;
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

/** Whether a group being built has everything its leaf asks for. */
export function isGroupComplete(input: {
  leaf: Pick<LeafDetail, "requiresBoard" | "requiresLevel"> | null;
  board: Option | null;
  level: Option | null;
  subjects: Option[];
}): boolean {
  const { leaf } = input;
  return Boolean(
    leaf &&
    (!leaf.requiresBoard || input.board) &&
    (!leaf.requiresLevel || input.level) &&
    input.subjects.length > 0,
  );
}

const keyOf = (group: LearningGroup) =>
  [group.trail.at(-1)?.id, group.board?.id, group.level?.id].join("|");

/** Adds a group; the same leaf, board and class again joins the existing group instead of repeating it. */
export function addGroup(
  groups: LearningGroup[],
  group: LearningGroup,
): LearningGroup[] {
  const at = groups.findIndex((g) => keyOf(g) === keyOf(group));
  const existing = groups[at];
  if (!existing) return [...groups, group];
  const merged = [...existing.subjects];
  const ids = [...existing.curriculumIds];
  group.subjects.forEach((subject, i) => {
    if (merged.some((s) => s.id === subject.id)) return;
    merged.push(subject);
    ids.push(group.curriculumIds[i]!);
  });
  return groups.map((g, i) =>
    i === at ? { ...g, subjects: merged, curriculumIds: ids } : g,
  );
}

/** "K-12 · Class 9 · CBSE", or just "Guitar" when the leaf has neither. */
export const groupTitle = (group: LearningGroup): string =>
  [group.trail.at(-1)?.name, group.level?.name, group.board?.name]
    .filter(Boolean)
    .join(" · ");

/** "Academic › School": where the leaf sits, shown small above the title. */
export const groupPath = (group: LearningGroup): string =>
  group.trail
    .slice(0, -1)
    .map((c) => c.name)
    .join(" › ");

/** Every chosen curriculum once, in the order the groups were added. */
export const allCurriculumIds = (draft: LearningDraft): string[] => [
  ...new Set(draft.groups.flatMap((g) => g.curriculumIds)),
];
