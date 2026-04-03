"use client";

import Link from "next/link";
import { useState, useMemo, useCallback } from "react";
import type { CollectionDetail, Content, UserProgress } from "@/lib/types";
import { fetchUserProgress } from "@/lib/api";

interface Props {
  collection: CollectionDetail;
  initialProgress: UserProgress[];
}

interface Level {
  index: number;
  name: string;
  items: Content[];
}

type SessionState = "completed" | "current" | "locked";

function buildProgressMap(progress: UserProgress[]): Record<string, UserProgress> {
  const map: Record<string, UserProgress> = {};
  for (const p of progress) {
    map[p.contentId] = p;
  }
  return map;
}

function splitLevels(items: Content[]): Level[] {
  const names = ["Learn", "Practice", "Master"];
  const count = items.length;

  if (count <= 5) {
    return [{ index: 0, name: names[0], items }];
  } else if (count <= 10) {
    const mid = Math.floor(count / 2);
    return [
      { index: 0, name: names[0], items: items.slice(0, mid) },
      { index: 1, name: names[1], items: items.slice(mid) },
    ];
  } else {
    const third = Math.floor(count / 3);
    const twoThirds = third * 2;
    return [
      { index: 0, name: names[0], items: items.slice(0, third) },
      { index: 1, name: names[1], items: items.slice(third, twoThirds) },
      { index: 2, name: names[2], items: items.slice(twoThirds) },
    ];
  }
}

export default function CollectionCourseView({ collection, initialProgress }: Props) {
  const [progressMap, setProgressMap] = useState(() => buildProgressMap(initialProgress));
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([0]));

  const levels = useMemo(() => splitLevels(collection.items), [collection.items]);

  const firstIncompleteId = useMemo(() => {
    return collection.items.find((item) => progressMap[item.id]?.status !== "completed")?.id ?? null;
  }, [collection.items, progressMap]);

  const completedCount = useMemo(() => {
    return collection.items.filter((item) => progressMap[item.id]?.status === "completed").length;
  }, [collection.items, progressMap]);

  const nextSession = useMemo(() => {
    if (!firstIncompleteId) return null;
    return collection.items.find((item) => item.id === firstIncompleteId) ?? null;
  }, [collection.items, firstIncompleteId]);

  const getSessionState = useCallback(
    (item: Content): SessionState => {
      if (progressMap[item.id]?.status === "completed") return "completed";
      if (item.id === firstIncompleteId) return "current";
      return "locked";
    },
    [progressMap, firstIncompleteId]
  );

  const isLevelLocked = useCallback(
    (levelIndex: number): boolean => {
      if (levelIndex === 0) return false;
      const prevLevel = levels[levelIndex - 1];
      return prevLevel.items.some((item) => progressMap[item.id]?.status !== "completed");
    },
    [levels, progressMap]
  );

  const toggleLevel = (index: number) => {
    if (isLevelLocked(index)) return;
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const refreshProgress = async () => {
    try {
      const progress = await fetchUserProgress();
      setProgressMap(buildProgressMap(progress));
    } catch {
      // silently fail
    }
  };

  const getGlobalOffset = (levelIndex: number): number => {
    let offset = 0;
    for (const l of levels) {
      if (l.index === levelIndex) break;
      offset += l.items.length;
    }
    return offset;
  };

  const [g1, g2] = collection.gradientColors;

  return (
    <div className="max-w-2xl mx-auto pb-28 relative">
      {/* Back link */}
      <div className="px-4 pt-6 pb-2">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-navy/60 hover:text-navy text-sm font-medium"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </Link>
      </div>

      {/* Hero Header */}
      <div
        className="relative overflow-hidden rounded-b-3xl px-6 py-10 text-white text-center"
        style={{
          background: `linear-gradient(135deg, ${g1}, ${g2})`,
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full opacity-[0.08]"
          style={{ width: 260, height: 260, top: -40, right: -60, background: "white" }}
        />
        <div
          className="absolute rounded-full opacity-[0.06]"
          style={{ width: 180, height: 180, bottom: -30, left: -50, background: "white" }}
        />
        <div
          className="absolute rounded-full opacity-[0.04]"
          style={{ width: 120, height: 120, bottom: 20, right: 40, background: "white" }}
        />

        <div className="relative z-10">
          <p className="text-[11px] font-bold tracking-[0.15em] text-white/70 uppercase">Course</p>
          {collection.estimatedDailyMinutes > 0 && (
            <p className="text-xs text-white/60 mt-1">{collection.estimatedDailyMinutes} min/day</p>
          )}
          <h1 className="text-2xl md:text-3xl font-bold mt-3">{collection.title}</h1>
          {collection.description && (
            <p className="text-sm text-white/80 mt-2 max-w-md mx-auto line-clamp-3">
              {collection.description}
            </p>
          )}
          {collection.items.length > 0 && (
            <div className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              {completedCount}/{collection.items.length} sessions completed
            </div>
          )}
        </div>
      </div>

      {/* Level Sections */}
      <div className="px-4 mt-4 space-y-3">
        {levels.map((level) => {
          const locked = isLevelLocked(level.index);
          const isExpanded = expandedLevels.has(level.index) && !locked;
          const completedInLevel = level.items.filter(
            (item) => progressMap[item.id]?.status === "completed"
          ).length;
          const globalOffset = getGlobalOffset(level.index);

          return (
            <div key={level.index} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {/* Level Header */}
              <button
                onClick={() => toggleLevel(level.index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div>
                  <p
                    className="text-[11px] font-bold tracking-[0.08em] uppercase"
                    style={{ color: locked ? "#78756f" : g1 }}
                  >
                    Level {level.index + 1}
                  </p>
                  <p
                    className="text-base font-bold"
                    style={{ color: locked ? "#78756f" : "#282828" }}
                  >
                    {level.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-navy/50">
                    {completedInLevel}/{level.items.length}
                  </span>
                  {locked ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-navy/40">
                      <path
                        fillRule="evenodd"
                        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`w-4 h-4 text-navy/40 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>

              {/* Session Circles Grid */}
              {isExpanded && (
                <div className="px-4 pb-5">
                  <div className="grid grid-cols-5 gap-y-4 gap-x-2 justify-items-center">
                    {level.items.map((item, idx) => {
                      const state = getSessionState(item);
                      const number = globalOffset + idx + 1;

                      return (
                        <SessionCircle
                          key={item.id}
                          item={item}
                          state={state}
                          number={number}
                          gradient={[g1, g2]}
                          onReturn={refreshProgress}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Next Session Button */}
      {nextSession && (
        <div className="fixed bottom-20 md:bottom-6 left-0 right-0 px-5 z-50 max-w-2xl mx-auto">
          <div
            className="pointer-events-none absolute inset-x-0 -top-10 h-10"
            style={{
              background: "linear-gradient(to bottom, transparent, rgb(245 241 235))",
            }}
          />
          <Link
            href={`/content/${nextSession.id}`}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg hover:shadow-xl transition-shadow"
            style={{
              background: `linear-gradient(135deg, ${g1}, ${g2})`,
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            Next session
          </Link>
        </div>
      )}
    </div>
  );
}

// Session Circle Component
function SessionCircle({
  item,
  state,
  number,
  gradient,
  onReturn,
}: {
  item: Content;
  state: SessionState;
  number: number;
  gradient: [string, string];
  onReturn: () => void;
}) {
  const isInteractive = state !== "locked";

  const circle = (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105"
        style={
          state === "completed"
            ? { background: "#34c759" }
            : state === "current"
              ? {
                  background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
                  boxShadow: `0 3px 10px ${gradient[0]}66`,
                }
              : { background: "#e5e5e5" }
        }
      >
        {state === "completed" && (
          <svg viewBox="0 0 20 20" fill="white" className="w-5 h-5">
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {state === "current" && (
          <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4 ml-0.5">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        )}
        {state === "locked" && (
          <svg viewBox="0 0 20 20" fill="#aaa" className="w-3.5 h-3.5">
            <path
              fillRule="evenodd"
              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <span className={`text-[11px] font-medium ${state === "locked" ? "text-gray-400" : "text-navy/50"}`}>
        {number}
      </span>
    </div>
  );

  if (!isInteractive) return circle;

  return (
    <Link href={`/content/${item.id}`} onClick={() => setTimeout(onReturn, 1000)}>
      {circle}
    </Link>
  );
}
