"use client";
import { useId, useLayoutEffect, useRef, useState } from "react";
import type { Career } from "@/lib/types";
import { careerPeriod, recordLabel, type RecordType } from "@/lib/record-types";

const sectionOrder: RecordType[] = ["EDUCATION", "CAREER", "PROJECT", "AWARD", "SONG"];
type ListProps = {
  items: Career[];
  onEdit?: (item: Career) => void;
  onDelete?: (item: Career) => Promise<boolean>;
  onReorder?: (items: Career[]) => Promise<void>;
  editingId?: number | null;
  disabled?: boolean;
};

export default function CareerList(props: ListProps) {
  const { items, onReorder, disabled = false } = props;
  function reorderSection(type: RecordType, next: Career[]) {
    let index = 0;
    // Keep every owned record in the order request, including other sections.
    return onReorder!(items.map(item => item.recordType === type ? next[index++] : item));
  }
  const sections = sectionOrder.map(type => ({
    type,
    items: items.filter(item => item.recordType === type),
  })).filter(section => section.items.length > 0);

  return (
    <div className="career-list" aria-busy={disabled}>
      <div className="career-list-tools">
        <span>{items.length}개의 이력</span>
        {onReorder && <span>⠿ 같은 카테고리 안에서 손잡이를 드래그해 정렬하세요.</span>}
      </div>
      {sections.length ? sections.map(section => (
        <CareerSection
          key={section.type}
          {...props}
          type={section.type}
          items={section.items}
          onReorder={onReorder ? next => reorderSection(section.type, next) : undefined}
        />
      )) : <p className="empty">아직 등록된 이력이 없습니다.</p>}
    </div>
  );
}

type Drag = {
  id: number;
  pointerId: number;
  items: Career[];
  centers: number[];
  next: Career[];
  startY: number;
  originTop: number;
  desiredTop: number;
  maximumTop: number;
};

function CareerSection({ items, type, onEdit, onDelete, onReorder, editingId, disabled = false }: ListProps & { type: RecordType }) {
  const sectionId = useId();
  const list = useRef<HTMLUListElement>(null);
  const rows = useRef(new Map<number, HTMLLIElement>());
  const positions = useRef(new Map<number, number>());
  const animations = useRef(new Map<number, Animation>());
  const drag = useRef<Drag | null>(null);
  const [preview, setPreview] = useState<Career[] | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const visible = preview || items;
  // CSS order previews movement without detaching the captured pointer handle.
  const rendered = draggingId !== null ? items : visible;

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nextPositions = new Map<number, number>();
    for (const [id, row] of rows.current) {
      const top = row.offsetTop;
      nextPositions.set(id, top);
      const active = drag.current;
      if (active?.id === id) {
        animations.current.get(id)?.cancel();
        row.style.transform = `translateY(${active.desiredTop - top}px)`;
        continue;
      }
      row.style.transform = "";
      const previous = positions.current.get(id);
      if (!reducedMotion && previous !== undefined && previous !== top) {
        // Start from the currently visible position, even during a previous animation.
        const running = animations.current.get(id);
        const translation = running ? new DOMMatrixReadOnly(getComputedStyle(row).transform).m42 : 0;
        running?.cancel();
        const animation = row.animate([
          { transform: `translateY(${previous - top + translation}px)` },
          { transform: "translateY(0)" },
        ], { duration: 240, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
        animations.current.set(id, animation);
        animation.onfinish = () => animations.current.delete(id);
      }
    }
    positions.current = nextPositions;
  });

  useLayoutEffect(() => () => {
    for (const animation of animations.current.values()) animation.cancel();
    animations.current.clear();
  }, []);

  function begin(event: React.PointerEvent<HTMLButtonElement>, item: Career) {
    if (disabled || !onReorder || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    const row = rows.current.get(item.id)!;
    drag.current = {
      id: item.id,
      pointerId: event.pointerId,
      items,
      next: items,
      centers: items.map(item => {
        const node = rows.current.get(item.id)!;
        return node.offsetTop + node.offsetHeight / 2;
      }),
      startY: event.clientY + window.scrollY,
      originTop: row.offsetTop,
      desiredTop: row.offsetTop,
      maximumTop: list.current!.offsetHeight - row.offsetHeight,
    };
    setConfirmId(null);
    setDraggingId(item.id);
  }

  function move(event: React.PointerEvent<HTMLButtonElement>) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    event.preventDefault();
    if (event.clientY < 70) window.scrollBy(0, -18);
    else if (event.clientY > window.innerHeight - 70) window.scrollBy(0, 18);
    const delta = event.clientY + window.scrollY - active.startY;
    active.desiredTop = Math.max(0, Math.min(active.maximumTop, active.originTop + delta));
    const row = rows.current.get(active.id)!;
    row.style.transform = `translateY(${active.desiredTop - row.offsetTop}px)`;
    const center = active.desiredTop + row.offsetHeight / 2;
    const index = active.items.filter((item, index) => item.id !== active.id && active.centers[index] < center).length;
    const next = active.items.filter(item => item.id !== active.id);
    next.splice(index, 0, active.items.find(item => item.id === active.id)!);
    if (next.some((item, index) => item.id !== active.next[index].id)) {
      active.next = next;
      setPreview(next);
    }
  }

  function end(event: React.PointerEvent<HTMLButtonElement>, cancelled = false) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    finish(active, cancelled);
  }

  function finish(active: Drag, cancelled: boolean) {
    // Include the lifted card's visual position in its settling animation.
    positions.current.set(active.id, active.desiredTop);
    drag.current = null;
    setPreview(null);
    setDraggingId(null);
    if (!cancelled && active.next.some((item, index) => item.id !== items[index]?.id)) {
      void onReorder?.(active.next);
    }
  }

  async function keyboard(event: React.KeyboardEvent<HTMLButtonElement>, item: Career) {
    if (event.key === "Escape" && drag.current) {
      finish(drag.current, true);
      return;
    }
    if (disabled || drag.current || !onReorder || !["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const from = items.findIndex(row => row.id === item.id);
    const to = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : from + (event.key === "ArrowUp" ? -1 : 1);
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    next.splice(from, 1);
    next.splice(to, 0, item);
    setConfirmId(null);
    await onReorder(next);
    requestAnimationFrame(() => rows.current.get(item.id)?.querySelector<HTMLButtonElement>(".career-drag-handle")?.focus());
  }

  return (
    <section className="career-partition" aria-labelledby={`${sectionId}-title`}>
      <div className="career-partition-heading">
        <h3 id={`${sectionId}-title`}>{recordLabel(type)}</h3>
        <span>{items.length}개의 이력</span>
      </div>
      {onReorder && <p className="visually-hidden" id={`${sectionId}-help`}>같은 카테고리 안에서 손잡이를 드래그하거나 위아래 방향키로 이동하세요. Home과 End 키는 맨 앞과 맨 뒤로 이동합니다. Escape 키는 드래그를 취소합니다.</p>}
      <ul ref={list} className={`career-rows is-partitioned ${onReorder ? "is-sortable" : ""}`}>
        {rendered.map(item => (
          <li
            key={item.id}
            ref={node => { if (node) rows.current.set(item.id, node); else rows.current.delete(item.id); }}
            style={preview ? { order: preview.findIndex(row => row.id === item.id) } : undefined}
            className={`career-row ${editingId === item.id ? "is-editing" : ""} ${draggingId === item.id ? "is-dragging" : ""}`}
          >
            {onReorder && <button
              type="button"
              className="career-drag-handle"
              aria-label={`${item.title} 순서 이동, ${visible.findIndex(row => row.id === item.id) + 1}번째`}
              aria-describedby={`${sectionId}-help`}
              disabled={disabled || items.length < 2}
              onPointerDown={event => begin(event, item)}
              onPointerMove={move}
              onPointerUp={event => end(event)}
              onPointerCancel={event => end(event, true)}
              onLostPointerCapture={event => end(event, true)}
              onKeyDown={event => { void keyboard(event, item); }}
            >⠿</button>}
            <div className="career-row-body">
              <h4>{item.title}</h4>
              {item.location && <p className="career-location">{item.location}</p>}
              {item.description && <p className="career-description">{item.description}</p>}
            </div>
            <span className="career-date">{careerPeriod(item.startDate, item.endDate, item.dateMode)}</span>
            {(onEdit || onDelete) && <div className="career-row-actions">
              {onEdit && <button type="button" className="career-edit-button" disabled={disabled || draggingId !== null} onClick={() => onEdit(item)} aria-label={`${item.title} 수정`}>{editingId === item.id ? "수정 중" : "수정"}</button>}
              {onDelete && <button type="button" className="career-edit-button delete-link" disabled={disabled || draggingId !== null} onClick={() => setConfirmId(confirmId === item.id ? null : item.id)} aria-label={`${item.title} 삭제`}>삭제</button>}
            </div>}
            {confirmId === item.id && onDelete && <div className="delete-confirm career-row-confirm">
              <p>‘{item.title}’ 이력을 삭제하시겠습니까?</p>
              <button type="button" disabled={disabled} onClick={async () => { if (await onDelete(item)) setConfirmId(null); }}>삭제 확인</button>
              <button type="button" disabled={disabled} onClick={() => setConfirmId(null)}>취소</button>
            </div>}
          </li>
        ))}
      </ul>
    </section>
  );
}
