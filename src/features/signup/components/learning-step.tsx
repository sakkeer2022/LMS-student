"use client";
import { useEffect, useMemo, useState } from "react";
import { AuthError, AuthHead } from "@/components/auth/auth-controls";
import {
  ColumnPicker,
  type PickerColumn,
} from "@/components/forms/ColumnPicker";
import { Button } from "@/components/shadcn/button";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Label } from "@/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { ApiError } from "@/lib/api/contracts";
import {
  fetchCategories,
  fetchLeaf,
  fetchTeachingLanguages,
  isLearningComplete,
  resolveOffering,
  type Category,
  type LeafDetail,
  type LearningDraft,
  type Option,
  type TeachingLanguage,
} from "../catalogue";

const ROOT = "root";

/**
 * Onboarding step 2. The choices come from the category tree: categories down to a bookable leaf, then the
 * leaf's boards and classes where it asks for them, then the subjects it offers for that board and class.
 * Nothing about a board, class or subject is written here, so a change in the catalogue changes this step.
 */
export function LearningStep({
  value,
  onBack,
  onSubmit,
}: {
  value: LearningDraft | null;
  onBack: () => void;
  onSubmit: (draft: LearningDraft) => void;
}) {
  const [children, setChildren] = useState<Record<string, Category[]>>({});
  const [trail, setTrail] = useState<Category[]>(value?.trail ?? []);
  const [leaf, setLeaf] = useState<LeafDetail | null>(null);
  const [board, setBoard] = useState<Option | null>(value?.board ?? null);
  const [level, setLevel] = useState<Option | null>(value?.level ?? null);
  const [subjects, setSubjects] = useState<Option[]>(value?.subjects ?? []);
  const [languages, setLanguages] = useState<TeachingLanguage[] | null>(null);
  const [languageId, setLanguageId] = useState(value?.teachingLanguageId ?? "");
  const [failed, setFailed] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const last = trail.at(-1);
  const leafId = last?.isLeaf ? last.id : null;
  // The lists needed to draw the columns: the roots, then the children of each chosen category on the way down
  const parentKeys = useMemo(
    () => [ROOT, ...trail.filter((c) => !c.isLeaf).map((c) => c.id)],
    [trail],
  );

  useEffect(() => {
    let current = true;
    for (const key of parentKeys) {
      if (children[key]) continue;
      fetchCategories(key === ROOT ? undefined : key)
        .then(
          (list) => current && setChildren((all) => ({ ...all, [key]: list })),
        )
        .catch((error: unknown) => current && setFailed(describe(error)));
    }
    return () => {
      current = false;
    };
  }, [parentKeys, children, attempt]);

  useEffect(() => {
    if (!leafId) {
      setLeaf(null);
      return;
    }
    let current = true;
    fetchLeaf(leafId, { boardId: board?.id, levelId: level?.id })
      .then((detail) => {
        if (!current) return;
        setLeaf(detail);
        // A narrower list may no longer offer a subject that was ticked
        setSubjects((chosen) =>
          chosen.filter((s) => detail.subjects.some((o) => o.id === s.id)),
        );
      })
      .catch((error: unknown) => current && setFailed(describe(error)));
    return () => {
      current = false;
    };
  }, [leafId, board?.id, level?.id, attempt]);

  useEffect(() => {
    let current = true;
    fetchTeachingLanguages()
      .then((list) => {
        if (!current) return;
        setLanguages(list);
        // With one language there is nothing to choose
        if (list.length === 1 && list[0]) setLanguageId(list[0].id);
      })
      .catch((error: unknown) => current && setFailed(describe(error)));
    return () => {
      current = false;
    };
  }, [attempt]);

  function pickCategory(depth: number, id: string): void {
    const category = children[parentKeys[depth] ?? ROOT]?.find(
      (c) => c.id === id,
    );
    if (!category || trail[depth]?.id === id) return;
    setTrail([...trail.slice(0, depth), category]);
    setBoard(null);
    setLevel(null);
    setSubjects([]);
    setLeaf(null);
  }

  const columns: PickerColumn[] = parentKeys.map((key, depth) => ({
    key,
    label: depth === 0 ? "Category" : (trail[depth - 1]?.name ?? "Category"),
    items: (children[key] ?? []).map((c) => ({ id: c.id, label: c.name })),
    selectedId: trail[depth]?.id ?? null,
    opensNext: true,
    loading: !children[key],
    onSelect: (id) => pickCategory(depth, id),
  }));
  if (leaf?.requiresBoard) {
    columns.push({
      key: "board",
      label: "Board",
      items: leaf.boards.map((b) => ({ id: b.id, label: b.name })),
      selectedId: board?.id ?? null,
      opensNext: Boolean(leaf.requiresLevel),
      onSelect: (id) => setBoard(leaf.boards.find((b) => b.id === id) ?? null),
    });
  }
  if (leaf?.requiresLevel) {
    columns.push({
      key: "level",
      label: "Class",
      items: leaf.levels.map((l) => ({ id: l.id, label: l.name })),
      selectedId: level?.id ?? null,
      onSelect: (id) => setLevel(leaf.levels.find((l) => l.id === id) ?? null),
    });
  }

  const ready =
    !leaf || ((!leaf.requiresBoard || board) && (!leaf.requiresLevel || level));
  const complete = isLearningComplete({
    leaf,
    board,
    level,
    subjects,
    teachingLanguageId: languageId,
  });

  async function submit(): Promise<void> {
    if (!leaf || !complete) return;
    setSaving(true);
    setSubmitError(null);
    try {
      const curriculumIds = await Promise.all(
        subjects.map((subject) =>
          resolveOffering(leaf.id, {
            subjectId: subject.id,
            boardId: board?.id,
            levelId: level?.id,
          }),
        ),
      );
      onSubmit({
        trail,
        board,
        level,
        subjects,
        teachingLanguageId: languageId,
        curriculumIds,
      });
    } catch (error) {
      setSubmitError(describe(error));
    } finally {
      setSaving(false);
    }
  }

  const toggle = (subject: Option) => (checked: boolean | "indeterminate") =>
    setSubjects((chosen) =>
      checked === true
        ? [...chosen.filter((s) => s.id !== subject.id), subject]
        : chosen.filter((s) => s.id !== subject.id),
    );

  return (
    <div className="flex w-full flex-col gap-6">
      <AuthHead
        title="Tell us about your education"
        lead="Choose your category, board and class to receive tailored learning resources and tutor suggestions."
        size="form"
      />

      {failed && (
        <div className="flex flex-col items-start gap-3">
          <AuthError>{failed}</AuthError>
          <Button
            variant="outline"
            onClick={() => {
              setFailed(null);
              setAttempt((n) => n + 1);
            }}
          >
            Try again
          </Button>
        </div>
      )}

      <section className="flex flex-col gap-4" aria-label="Education level">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">
            Select your current education level
          </h2>
          <p className="text-sm text-text-secondary" aria-live="polite">
            {trail.length
              ? [...trail.map((c) => c.name), board?.name, level?.name]
                  .filter(Boolean)
                  .join(" › ")
              : "Choose from each list in turn."}
          </p>
        </div>
        <ColumnPicker columns={columns} />
      </section>

      {leaf && ready && (
        <section className="flex flex-col gap-4" aria-label="Subjects">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold">
              Which subjects would you like to learn?
            </h2>
            <p className="text-xs text-muted-foreground">
              Select at least one subject to get tutor recommendations
            </p>
          </div>
          {leaf.subjects.length === 0 ? (
            <p className="text-sm text-text-secondary">
              No subjects are offered for this choice yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {leaf.subjects.map((subject) => (
                <div key={subject.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`subject-${subject.id}`}
                    checked={subjects.some((s) => s.id === subject.id)}
                    onCheckedChange={toggle(subject)}
                    className="size-5 border-[1.5px] border-border-strong"
                  />
                  <Label
                    htmlFor={`subject-${subject.id}`}
                    className="text-sm font-normal"
                  >
                    {subject.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {languages && languages.length > 1 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="teachingLanguage" className="text-sm font-semibold">
            Teaching language
          </Label>
          <Select value={languageId} onValueChange={setLanguageId}>
            <SelectTrigger id="teachingLanguage" className="w-full sm:w-72">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.id} value={language.id}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {submitError && <AuthError>{submitError}</AuthError>}

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          disabled={!complete || saving}
          onClick={() => void submit()}
        >
          Continue to guardian contact
        </Button>
      </div>
    </div>
  );
}

function describe(error: unknown): string {
  if (error instanceof ApiError && error.status === 404)
    return "The learning options are not available yet. Please try again later.";
  return "We could not load the learning options. Check your connection and try again.";
}
