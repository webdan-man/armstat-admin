"use client";

import React from "react";
import { ChevronDown, GripVertical } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { useSWRConfig } from "swr";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionTopicRow } from "@/components/groups/SectionTopicRow";
import { swrKeys } from "@/lib/swr/cache-keys";
import { withToastError } from "@/lib/withToastError";
import { reorderSections, reorderTopics } from "@/services/sectionsService";
import type { Section, Topic } from "@/types/section";
import { cn } from "@/lib/utils";

type SectionAccordionProps = {
  sections: Section[];
  /** Drag-and-drop reordering is disabled while a search filter is active. */
  reorderEnabled?: boolean;
};

function rebuildSectionTopics(all: Topic[], orderedTopLevel: Topic[]): Topic[] {
  const orderedIds = new Set(orderedTopLevel.map((t) => t._id));
  const others = all.filter((t) => !orderedIds.has(t._id));
  return [...orderedTopLevel, ...others];
}

function DragHandle({
  setActivatorNodeRef,
  attributes,
  listeners,
  disabled = false,
  className,
}: {
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label="Քաշել՝ հերթականությունը փոխելու համար"
      className={cn(
        "flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-[#9a9a9a] hover:text-[#2c2c2c] focus-visible:ring-2 focus-visible:ring-[#275199]/40 focus-visible:outline-none active:cursor-grabbing",
        disabled && "pointer-events-none opacity-30",
        className
      )}
    >
      <GripVertical className="size-4" aria-hidden />
    </button>
  );
}

function useDndSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
}

function SortableSubtopic({
  subtopic,
  siblingTopics,
  reorderEnabled,
  isLastRow,
  isLastChild,
}: {
  subtopic: Topic;
  siblingTopics: Topic[];
  reorderEnabled: boolean;
  isLastRow: boolean;
  isLastChild: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtopic._id, disabled: !reorderEnabled });

  return (
    <SectionTopicRow
      topic={subtopic}
      showHeadingPrefix={false}
      siblingTopics={siblingTopics}
      isSubtopic
      isDragging={isDragging}
      isLastRow={isLastRow}
      isLastChild={isLastChild}
      rootRef={setNodeRef}
      rootStyle={{ transform: CSS.Transform.toString(transform), transition }}
      dragHandle={
        <DragHandle
          setActivatorNodeRef={setActivatorNodeRef}
          attributes={attributes}
          listeners={listeners}
          disabled={!reorderEnabled}
        />
      }
    />
  );
}

function SortableTopic({
  topic,
  siblingTopics,
  reorderEnabled,
  isLastTopic,
  onSubtopicReorder,
}: {
  topic: Topic;
  siblingTopics: Topic[];
  reorderEnabled: boolean;
  isLastTopic: boolean;
  onSubtopicReorder: (parentTopicId: string, subtopics: Topic[], event: DragEndEvent) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic._id, disabled: !reorderEnabled });
  const sensors = useDndSensors();
  const subtopics = topic.subtopics ?? [];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "relative z-10 bg-white")}
    >
      <SectionTopicRow
        topic={topic}
        showHeadingPrefix={false}
        siblingTopics={siblingTopics}
        isDragging={isDragging}
        isLastRow={isLastTopic && subtopics.length === 0}
        dragHandle={
          <DragHandle
            setActivatorNodeRef={setActivatorNodeRef}
            attributes={attributes}
            listeners={listeners}
            disabled={!reorderEnabled}
          />
        }
      />
      {subtopics.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={(event) => onSubtopicReorder(topic._id, subtopics, event)}
        >
          <SortableContext
            items={subtopics.map((s) => s._id)}
            strategy={verticalListSortingStrategy}
          >
            {subtopics.map((subtopic, index) => (
              <SortableSubtopic
                key={subtopic._id}
                subtopic={subtopic}
                siblingTopics={siblingTopics}
                reorderEnabled={reorderEnabled}
                isLastChild={index === subtopics.length - 1}
                isLastRow={isLastTopic && index === subtopics.length - 1}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableSection({
  section,
  reorderEnabled,
  onTopicReorder,
  onSubtopicReorder,
}: {
  section: Section;
  reorderEnabled: boolean;
  onTopicReorder: (sectionId: string, topLevelTopics: Topic[], event: DragEndEvent) => void;
  onSubtopicReorder: (parentTopicId: string, subtopics: Topic[], event: DragEndEvent) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section._id, disabled: !reorderEnabled });
  const sensors = useDndSensors();

  const sectionHeadingTopic = {
    ...section,
    title: section.name,
    body: section.description,
    topics: [],
    sectionId: section._id,
  };
  const topLevelTopics = section.topics.filter((topic) => !topic.parentTopicId);

  return (
    <AccordionItem
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      value={section._id}
      className={cn(
        "overflow-hidden rounded-[10px] border-0 bg-white shadow-[0px_6px_7px_0px_rgba(0,0,0,0.05)]",
        isDragging && "relative z-20 shadow-[0px_10px_20px_0px_rgba(0,0,0,0.12)]"
      )}
    >
      <div className="relative has-[[data-state=open]]:border-b has-[[data-state=open]]:border-[#e6e7eb]">
        <AccordionTrigger
          className={cn(
            "min-h-16 w-full items-center gap-2.5 rounded-none border-0 py-0 pr-4 pl-[44px] hover:no-underline",
            "[&>svg]:-rotate-90 [&[data-state=open]>svg]:rotate-0"
          )}
        >
          <ChevronDown
            className="size-5 shrink-0 text-[#2c2c2c] transition-transform duration-200"
            aria-hidden
          />
          <span className="flex-1 text-left text-[14px] leading-[14px] font-medium text-[#2c2c2c]">
            {section.name.hy}
          </span>
        </AccordionTrigger>
        {/* Overlaid on the trigger (not nested) — keeps the full header clickable and the HTML valid. */}
        <DragHandle
          setActivatorNodeRef={setActivatorNodeRef}
          attributes={attributes}
          listeners={listeners}
          disabled={!reorderEnabled}
          className="absolute top-1/2 left-2 size-7 -translate-y-1/2"
        />
      </div>
      <AccordionContent className="pb-0">
        <SectionTopicRow
          key={`${section._id}-heading`}
          topic={sectionHeadingTopic}
          showHeadingPrefix
          siblingTopics={section.topics}
          isLastRow={topLevelTopics.length === 0}
        />
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={(event) => onTopicReorder(section._id, topLevelTopics, event)}
        >
          <SortableContext
            items={topLevelTopics.map((t) => t._id)}
            strategy={verticalListSortingStrategy}
          >
            {topLevelTopics.map((topic, index) => (
              <SortableTopic
                key={topic._id}
                topic={topic}
                siblingTopics={section.topics}
                reorderEnabled={reorderEnabled}
                isLastTopic={index === topLevelTopics.length - 1}
                onSubtopicReorder={onSubtopicReorder}
              />
            ))}
          </SortableContext>
        </DndContext>
      </AccordionContent>
    </AccordionItem>
  );
}

export function SectionAccordion({ sections, reorderEnabled = true }: SectionAccordionProps) {
  const { mutate } = useSWRConfig();
  const sensors = useDndSensors();

  if (sections.length === 0) {
    return null;
  }

  const persistOrder = async (optimisticSections: Section[], apiCall: () => Promise<void>) => {
    await mutate(swrKeys.sections, optimisticSections, { revalidate: false });
    await withToastError(apiCall, { title: "Հերթականությունը թարմացվել է" });
    await mutate(swrKeys.sections);
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s._id === active.id);
    const newIndex = sections.findIndex((s) => s._id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(sections, oldIndex, newIndex);
    void persistOrder(next, () => reorderSections(next.map((s) => s._id)));
  };

  const handleTopicReorder = (sectionId: string, topLevelTopics: Topic[], event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = topLevelTopics.findIndex((t) => t._id === active.id);
    const newIndex = topLevelTopics.findIndex((t) => t._id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const nextTopics = arrayMove(topLevelTopics, oldIndex, newIndex);
    const nextSections = sections.map((s) =>
      s._id === sectionId ? { ...s, topics: rebuildSectionTopics(s.topics, nextTopics) } : s
    );
    void persistOrder(nextSections, () => reorderTopics(nextTopics.map((t) => t._id)));
  };

  const handleSubtopicReorder = (
    parentTopicId: string,
    subtopics: Topic[],
    event: DragEndEvent
  ) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = subtopics.findIndex((t) => t._id === active.id);
    const newIndex = subtopics.findIndex((t) => t._id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const nextSubtopics = arrayMove(subtopics, oldIndex, newIndex);
    const nextSections = sections.map((s) => ({
      ...s,
      topics: s.topics.map((t) =>
        t._id === parentTopicId ? { ...t, subtopics: nextSubtopics } : t
      ),
    }));
    void persistOrder(nextSections, () => reorderTopics(nextSubtopics.map((t) => t._id)));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleSectionDragEnd}
    >
      <SortableContext items={sections.map((s) => s._id)} strategy={verticalListSortingStrategy}>
        <Accordion type="multiple" defaultValue={[]} className="flex w-full flex-col gap-3">
          {sections.map((section) => (
            <SortableSection
              key={section._id}
              section={section}
              reorderEnabled={reorderEnabled}
              onTopicReorder={handleTopicReorder}
              onSubtopicReorder={handleSubtopicReorder}
            />
          ))}
        </Accordion>
      </SortableContext>
    </DndContext>
  );
}
