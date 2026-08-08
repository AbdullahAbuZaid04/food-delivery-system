"use client";

import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import OwnerModal from "./OwnerModal";
import {
  TextInput,
  primaryButtonClass,
  secondaryButtonClass,
} from "./OwnerFields";

// CategoryManagerModal — add / rename / delete menu categories. Category names
// must be unique-ish per restaurant; the server enforces the final rules.
export default function CategoryManagerModal({
  open,
  onClose,
  categories,
  onAdd,
  onRename,
  onDelete,
  busyId,
  busyAction,
}) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNewName("");
    setEditingId(null);
    setError(null);
  }, [open]);

  const handleAdd = () => {
    if (!newName.trim()) {
      setError("اكتب اسم الفئة.");
      return;
    }
    setError(null);
    onAdd(newName.trim());
    setNewName("");
  };

  const handleRename = () => {
    if (!editingName.trim()) {
      setError("اسم الفئة مش فارغ.");
      return;
    }
    setError(null);
    onRename(editingId, editingName.trim());
    setEditingId(null);
  };

  return (
    <OwnerModal
      open={open}
      onClose={onClose}
      title="إدارة الفئات"
      subtitle="قسّم منيوّك لفئات عشان يسهل على الزبون يلاقي طلبه"
      footer={
        <button type="button" onClick={onClose} className={secondaryButtonClass}>
          تم
        </button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TextInput
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAdd();
              }
            }}
            placeholder="اسم الفئة الجديدة…"
            aria-label="اسم الفئة الجديدة"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={busyAction === "add"}
            className={`${primaryButtonClass} h-11 shrink-0 px-4`}
            aria-label="إضافة فئة"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {error ? (
          <p role="alert" className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-[13.5px] font-semibold text-error">
            {error}
          </p>
        ) : null}

        {categories.length === 0 ? (
          <p className="py-6 text-center text-[14px] text-muted">
            ما في فئات — أضف أول فئة لمطعمك
          </p>
        ) : (
          <ul className="space-y-2">
            {categories.map((category) => {
              const isEditing = editingId === category.id;
              const busy = busyId === category.id;
              return (
                <li
                  key={category.id}
                  className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5"
                >
                  {isEditing ? (
                    <>
                      <TextInput
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleRename();
                          }
                          if (event.key === "Escape") setEditingId(null);
                        }}
                        aria-label={`تعديل اسم ${category.name}`}
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleRename}
                        disabled={busyAction === "rename" && busy}
                        className={`${primaryButtonClass} h-10 shrink-0 px-3`}
                      >
                        {busy ? "…" : "حفظ"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        disabled={busy}
                        aria-label="إلغاء التعديل"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-muted/10 hover:text-foreground"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 truncate text-[14px] font-bold text-foreground">
                        {category.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(category.id);
                          setEditingName(category.name);
                        }}
                        disabled={busy}
                        aria-label={`تعديل ${category.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-muted/10 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(category.id)}
                        disabled={busy}
                        aria-label={`حذف ${category.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-error transition-colors hover:bg-error/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-error/40"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-[12.5px] text-muted">
          الفئة اللي فيها أصناف ما رح تتشطب — شيل أصنافها أولاً. في {categories.length} فئة.
        </p>
      </div>
    </OwnerModal>
  );
}
