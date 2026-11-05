"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { AuthError } from "@/components/auth/auth-controls";
import { Button } from "@/components/shadcn/button";
import { ApiError } from "@/lib/api/contracts";
import {
  fetchCategories,
  fetchLeaf,
  isGroupComplete,
  resolveOffering,
  type Category,
  type LeafDetail,
  type LearningGroup,
  type Option,
} from "../catalogue";
import {
  CategoryTile,
  ClassGrid,
  PathBar,
  PillGroup,
  Stage,
  SubjectTile,
  TileSkeleton,
} from "./learning-parts";

const ROOT = "root";

/**
 * Builds one group of the learning list: categories down to a bookable leaf, then the leaf's board and class
 * where it asks for them, then the subjects it offers for that board and class. "Add to my list" resolves the
 * curriculum of every subject and hands the finished group up, so a problem shows against the group that
 * caused it. Nothing about a board, class or subject is written here, so a change in the catalogue changes it.
 */
export function GroupBuilder({
  initial,
  onAdd,
  onCancel,
  onStatus,
}: {
  /** A group being edited, or null for a new one */
  initial: LearningGroup | null;
  onAdd: (group: LearningGroup) => void;
  onCancel?: () => void;
  /** Whether something is chosen that has not been added yet, and whether an add is in flight */
  onStatus: (status: { started: boolean; adding: boolean }) => void;
}) {
  const [children, setChildren] = useState<Record<string, Category[]>>({});
  const [trail, setTrail] = useState<Category[]>(initial?.trail ?? []);
  const [leaf, setLeaf] = useState<LeafDetail | null>(null);
  const [board, setBoard] = useState<Option | null>(initial?.board ?? null);
  const [level, setLevel] = useState<Option | null>(initial?.level ?? null);
  const [subjects, setSubjects] = useState<Option[]>(initial?.subjects ?? []);
  const [failed, setFailed] = useState<string | null>(null);
  const [loadingLeaf, setLoadingLeaf] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [adding, setAdding] = useState(false);

  const last = trail.at(-1);
  const leafId = last?.isLeaf ? last.id : null;
  // The lists needed to draw the journey: the roots, then the children of each chosen category on the way down
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
    setLoadingLeaf(true);
    fetchLeaf(leafId, { boardId: board?.id, levelId: level?.id })
      .then((detail) => {
        if (!current) return;
        setLoadingLeaf(false);
        setLeaf(detail);
        // A narrower list may no longer offer a subject that was ticked
        setSubjects((chosen) =>
          chosen.filter((s) => detail.subjects.some((o) => o.id === s.id)),
        );
      })
      .catch((error: unknown) => {
        if (!current) return;
        setLoadingLeaf(false);
        setFailed(describe(error));
      });
    return () => {
      current = false;
    };
  }, [leafId, board?.id, level?.id, attempt]);

  const started = trail.length > 0;
  useEffect(() => onStatus({ started, adding }), [started, adding, onStatus]);
  // Closing the builder (added, cancelled) leaves nothing pending
  useEffect(
    () => () => onStatus({ started: false, adding: false }),
    [onStatus],
  );

  function reset(from: Category[]): void {
    setTrail(from);
    setBoard(null);
    setLevel(null);
    setSubjects([]);
    setLeaf(null);
  }

  function pickCategory(depth: number, id: string): void {
    const category = children[parentKeys[depth] ?? ROOT]?.find(
      (c) => c.id === id,
    );
    if (!category || trail[depth]?.id === id) return;
    reset([...trail.slice(0, depth), category]);
  }

  const ready =
    !leaf || ((!leaf.requiresBoard || board) && (!leaf.requiresLevel || level));
  const complete = isGroupComplete({ leaf, board, level, subjects });

  async function add(): Promise<void> {
    if (!leaf || !complete) return;
    setAdding(true);
    setFailed(null);
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
      onAdd({ trail, board, level, subjects, curriculumIds });
    } catch (error) {
      setFailed(describe(error));
    } finally {
      setAdding(false);
    }
  }

  const toggle = (subject: Option) =>
    setSubjects((chosen) =>
      chosen.some((s) => s.id === subject.id)
        ? chosen.filter((s) => s.id !== subject.id)
        : [...chosen, subject],
    );

  // While a leaf's details load, its parent's list stays on screen with the leaf marked
  const depth = last?.isLeaf ? trail.length - 1 : trail.length;
  const choosing = leaf ? null : parentKeys[depth];
  const options = choosing ? children[choosing] : undefined;

  // Bring a newly revealed question into view, so nothing happens off screen
  const bottom = useRef<HTMLDivElement>(null);
  const revealed = [leaf?.id, board?.id, level?.id, subjects.length > 0].join();
  useEffect(() => {
    if (trail.length || leaf)
      bottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [revealed, trail.length, leaf]);

  // Row numbers follow what is asked: the category path is row 1, then board and class where the leaf asks
  let n = trail.length ? 1 : 0;
  const boardAsked = Boolean(leaf?.requiresBoard);
  const levelAsked = Boolean(
    leaf?.requiresLevel && (!leaf.requiresBoard || board),
  );
  const subjectsAsked = Boolean(leaf && ready && !loadingLeaf);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold">
        {initial ? "Edit this choice" : "Add to your list"}
      </h2>

      {failed && (
        <div className="flex flex-col items-start gap-3">
          <AuthError>{failed}</AuthError>
          <Button
            variant="outline"
            onClick={() => {
              setFailed(null);
              setAttempt((count) => count + 1);
            }}
          >
            Try again
          </Button>
        </div>
      )}

      {/* Only rows are direct children here, so the last one can drop its line */}
      <div className="flex flex-col [&>section:last-child_[data-rail]]:hidden [&>section:last-child>div:last-child]:pb-0">
        <PathBar
          segments={trail.map((c) => ({ id: c.id, label: c.name }))}
          onRewind={(index) => reset(trail.slice(0, index))}
        />

        {!leaf && !last?.isLeaf && !failed && (
          <Stage
            id="category"
            key={choosing}
            n={++n}
            title={
              depth === 0
                ? "What are you looking for?"
                : `Narrow it down: ${last?.name ?? ""}`
            }
            hint={depth === 0 ? "Pick one to start" : "Pick the closest match"}
          >
            {options ? (
              <div
                className={
                  depth === 0
                    ? "grid gap-3 sm:grid-cols-2"
                    : "grid grid-cols-1 gap-2.5 sm:grid-cols-2"
                }
              >
                {options.map((category) => (
                  <CategoryTile
                    key={category.id}
                    code={category.code}
                    name={category.name}
                    leaf={category.isLeaf}
                    large={depth === 0}
                    selected={trail[depth]?.id === category.id}
                    onSelect={() => pickCategory(depth, category.id)}
                  />
                ))}
              </div>
            ) : (
              <TileSkeleton count={depth === 0 ? 2 : 4} large={depth === 0} />
            )}
          </Stage>
        )}

        {/* A leaf was just picked and its details are on the way */}
        {last?.isLeaf && !leaf && !failed && (
          <Stage id="loading" n={2} title="Loading your options…">
            <TileSkeleton count={4} />
          </Stage>
        )}

        {leaf && boardAsked && (
          <Stage
            id="board"
            n={++n}
            done={Boolean(board)}
            title="Which board do you follow?"
          >
            <PillGroup
              label="Board"
              items={leaf.boards}
              selectedId={board?.id ?? null}
              onSelect={(id) =>
                setBoard(leaf.boards.find((b) => b.id === id) ?? null)
              }
            />
          </Stage>
        )}

        {leaf && levelAsked && (
          <Stage
            id="level"
            n={++n}
            done={Boolean(level)}
            title="Which class are you in?"
          >
            <ClassGrid
              items={leaf.levels}
              selectedId={level?.id ?? null}
              onSelect={(id) =>
                setLevel(leaf.levels.find((l) => l.id === id) ?? null)
              }
            />
          </Stage>
        )}

        {leaf && ready && (
          <Stage
            id="subjects"
            n={++n}
            done={subjects.length > 0}
            title="What do you want to learn?"
            hint="Pick one or more"
            aside={
              subjectsAsked &&
              leaf.subjects.length > 1 && (
                <button
                  type="button"
                  className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
                  onClick={() =>
                    setSubjects(
                      subjects.length === leaf.subjects.length
                        ? []
                        : leaf.subjects,
                    )
                  }
                >
                  {subjects.length === leaf.subjects.length
                    ? "Clear all"
                    : "Select all"}
                </button>
              )
            }
          >
            {loadingLeaf ? (
              <TileSkeleton count={6} />
            ) : leaf.subjects.length === 0 ? (
              <p className="text-sm text-text-secondary">
                No subjects are offered for this choice yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {leaf.subjects.map((subject) => (
                  <SubjectTile
                    key={subject.id}
                    name={subject.name}
                    selected={subjects.some((s) => s.id === subject.id)}
                    onToggle={() => toggle(subject)}
                  />
                ))}
              </div>
            )}
          </Stage>
        )}
      </div>
      <div ref={bottom} />

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="button"
          disabled={!complete || adding}
          onClick={() => void add()}
        >
          <Plus aria-hidden className="size-4" />
          {adding ? "Adding…" : initial ? "Save changes" : "Add to my list"}
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
