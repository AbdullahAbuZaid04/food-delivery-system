"use client";

import Image from "next/image";
import {
  FolderOpen,
  MoveHorizontal,
  Plus,
  Pencil,
  RefreshCw,
  Star,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import CategoryManagerModal from "./CategoryManagerModal";
import MealFormModal from "./MealFormModal";
import OwnerEmptyState from "./OwnerEmptyState";
import OwnerModal from "./OwnerModal";
import OwnerPageHeader from "./OwnerPageHeader";
import RefreshButton from "./RefreshButton";
import { OwnerListSkeleton } from "./OwnerSkeleton";
import {
  dangerButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
  Select,
} from "./OwnerFields";
import { useOwner } from "@context/OwnerContext";
import { categoryApi, mealApi } from "@lib/api";
import { DEFAULT_MEAL_IMAGE } from "@lib/api/presenters";
import { formatPrice, formatTime } from "@lib/format";

function MealStatusDot({ status }) {
  const config = {
    AVAILABLE: { dot: "bg-success", text: "text-success", label: "متاح" },
    OUT_OF_STOCK: { dot: "bg-warning", text: "text-warning", label: "نفذ" },
    HIDDEN: { dot: "bg-muted", text: "text-muted", label: "مخفي" },
  }[status] ?? { dot: "bg-muted", text: "text-muted", label: status };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12px] font-bold ${config.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}

function MealRow({ meal, busy, onEdit, onDelete, onToggleFeature, onAvailability }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-background">
          <Image
            src={meal.imageUrl || DEFAULT_MEAL_IMAGE}
            alt={meal.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-[15px] font-bold text-foreground">
              {meal.name}
            </h3>
            {meal.isFeatured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[11px] font-bold text-clay">
                <Star className="h-3 w-3" fill="currentColor" aria-hidden="true" />
                مميز
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[13px] text-muted">
            {meal.description || "بدون وصف"}
          </p>
          <p className="mt-1.5 font-display text-[15px] font-black text-primary">
            {formatPrice(meal.price, true)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
        <div className="flex items-center gap-2">
          <MealStatusDot status={meal.status} />
          <label className="sr-only" htmlFor={`availability-${meal.id}`}>
            حالة توفر {meal.name}
          </label>
          <Select
            id={`availability-${meal.id}`}
            value={meal.status}
            onChange={(event) => onAvailability(meal.id, event.target.value)}
            options={[
              { value: "AVAILABLE", label: "متاح" },
              { value: "OUT_OF_STOCK", label: "نفذ" },
              { value: "HIDDEN", label: "مخفي" },
            ]}
            className="h-10 w-28 py-1 sm:w-32"
            disabled={busy}
            aria-label={`حالة توفر ${meal.name}`}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleFeature(meal.id)}
            disabled={busy}
            aria-label={meal.isFeatured ? "شيله من المميزين" : "خليه صنف مميز"}
            aria-pressed={meal.isFeatured}
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              meal.isFeatured
                ? "bg-gold/20 text-clay"
                : "text-muted hover:bg-muted/10 hover:text-foreground"
            }`}
          >
            <Star className="h-4 w-4" fill={meal.isFeatured ? "currentColor" : "none"} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(meal)}
            disabled={busy}
            aria-label={`تعديل ${meal.name}`}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-muted transition-colors hover:bg-muted/10 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(meal)}
            disabled={busy}
            aria-label={`حذف ${meal.name}`}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-error transition-colors hover:bg-error/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-error/40"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function MenuManager() {
  const { restaurant, restaurantLoading } = useOwner();
  const [categories, setCategories] = useState([]);
  const [meals, setMeals] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [mealModal, setMealModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [categoryBusyId, setCategoryBusyId] = useState(null);
  const [categoryBusyAction, setCategoryBusyAction] = useState(null);
  const tabsRef = useRef(null);
  const [tabsOverflow, setTabsOverflow] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoryData, mealData] = await Promise.all([
        categoryApi.getMyCategories(),
        mealApi.getMyMeals(),
      ]);
      setCategories(categoryData ?? []);
      setMeals(mealData ?? []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "تعذر تحميل المنيو، حاول مرة تانية.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // The category tabs scroll horizontally on any screen where they overflow;
  // show the swipe hint whenever that's actually the case. Runs again once the
  // data loads, because the tablist isn't in the DOM during the skeleton.
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const check = () => {
      setTabsOverflow(el.scrollWidth > el.clientWidth + 4);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [loading, categories, meals]);

  const visibleMeals = useMemo(
    () =>
      activeCategoryId === "ALL"
        ? meals
        : meals.filter((meal) => meal.categoryId === activeCategoryId),
    [meals, activeCategoryId],
  );

  const categoryCounts = useMemo(() => {
    const counts = { ALL: meals.length };
    for (const category of categories) {
      counts[category.id] = meals.filter((meal) => meal.categoryId === category.id).length;
    }
    return counts;
  }, [categories, meals]);

  if (restaurantLoading) return <OwnerListSkeleton rows={3} />;

  if (!restaurant) {
    return (
      <OwnerEmptyState
        icon={<UtensilsCrossed className="h-6 w-6" aria-hidden="true" />}
        title="عمّر مطعمك الأول"
        description="لما تعمّر مطعمك، تقدر تضيف فئات وأصناف للمنيو."
      >
        <a
          href="/owner"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          روح لإعداد المطعم
        </a>
      </OwnerEmptyState>
    );
  }

  const handleSaveMeal = async (payload) => {
    const editing = mealModal?.meal;
    setBusyId(editing ? editing.id : "new");
    try {
      if (editing) {
        await mealApi.updateMeal(editing.id, payload);
        toast.success("تم حفظ تعديلات الصنف");
      } else {
        await mealApi.createMeal(payload);
        toast.success("ضفنا الصنف للمنيو");
      }
      setMealModal(null);
      await load();
    } catch (err) {
      toast.error(err.message || "تعذر حفظ الصنف.");
    } finally {
      setBusyId(null);
    }
  };

  const handleAvailability = async (mealId, status) => {
    setBusyId(mealId);
    try {
      await mealApi.updateMealAvailability(mealId, status);
      await load();
    } catch (err) {
      toast.error(err.message || "تعذر تغيير حالة الصنف.");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleFeature = async (mealId) => {
    setBusyId(mealId);
    try {
      await mealApi.toggleMealFeatured(mealId);
      await load();
    } catch (err) {
      toast.error(err.message || "تعذر تغيير حالة التمييز.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteMeal = async () => {
    setBusyId(deleteTarget.id);
    try {
      await mealApi.deleteMeal(deleteTarget.id);
      toast.success("اتشطب الصنف");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err.message || "تعذر حذف الصنف.");
    } finally {
      setBusyId(null);
    }
  };

  const handleAddCategory = async (name) => {
    setCategoryBusyId(null);
    setCategoryBusyAction("add");
    try {
      await categoryApi.createCategory({ name });
      toast.success("ضفنا الفئة");
      await load();
    } catch (err) {
      toast.error(err.message || "تعذر إضافة الفئة.");
    } finally {
      setCategoryBusyId(null);
      setCategoryBusyAction(null);
    }
  };

  const handleRenameCategory = async (id, name) => {
    setCategoryBusyId(id);
    setCategoryBusyAction("rename");
    try {
      await categoryApi.updateCategory(id, { name });
      toast.success("تم تعديل اسم الفئة");
      await load();
    } catch (err) {
      toast.error(err.message || "تعذر تعديل الفئة.");
    } finally {
      setCategoryBusyId(null);
      setCategoryBusyAction(null);
    }
  };

  const handleDeleteCategory = async (id) => {
    setCategoryBusyId(id);
    setCategoryBusyAction("delete");
    try {
      await categoryApi.deleteCategory(id);
      toast.success("اتحذفت الفئة");
      if (activeCategoryId === id) setActiveCategoryId("ALL");
      await load();
    } catch (err) {
      toast.error(err.message || "تعذر حذف الفئة.");
    } finally {
      setCategoryBusyId(null);
      setCategoryBusyAction(null);
    }
  };

  return (
    <div>
      <OwnerPageHeader
        title="المنيو"
        subtitle="أصنافك وفئاتك — زيّنها عشان الزبائن يطلبو منك أكتر"
        action={
          <div className="flex flex-wrap items-center justify-end gap-3">
            {lastUpdated ? (
              <span className="text-[12px] text-muted">
                آخر تحديث {formatTime(lastUpdated.toISOString(), true)}
              </span>
            ) : null}
            <RefreshButton loading={loading} onClick={load} label="حدّث" />
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMealModal({ meal: null })}
          className={primaryButtonClass}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          إضافة صنف
        </button>
        <button
          type="button"
          onClick={() => setCategoryManagerOpen(true)}
          className={secondaryButtonClass}
        >
          <FolderOpen className="h-4 w-4" aria-hidden="true" />
          إدارة الفئات
        </button>
      </div>

      {error ? (
        <OwnerEmptyState
          icon={<RefreshCw className="h-6 w-6" aria-hidden="true" />}
          title="صار في شي غلط"
          description={error}
        >
          <button
            type="button"
            onClick={load}
            className={primaryButtonClass}
          >
            حاول مرة تانية
          </button>
        </OwnerEmptyState>
      ) : null}

      {!error && loading && meals.length === 0 ? (
        <OwnerListSkeleton rows={3} />
      ) : null}

      {!error && !(loading && meals.length === 0) ? (
        <>
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="تصفية الأصناف حسب الفئة"
            className="scrollbar-hide mb-5 flex gap-2 overflow-x-auto pb-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategoryId === "ALL"}
              onClick={() => setActiveCategoryId("ALL")}
              className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[13.5px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                activeCategoryId === "ALL"
                  ? "bg-primary text-white"
                  : "border border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              الكل
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-black ${activeCategoryId === "ALL" ? "bg-white/20 text-white" : "bg-muted/10 text-muted"}`}>
                {categoryCounts.ALL}
              </span>
            </button>
            {categories.map((category) => {
              const active = activeCategoryId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategoryId(category.id)}
                  className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[13.5px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    active
                      ? "bg-primary text-white"
                      : "border border-border bg-surface text-muted hover:text-foreground"
                  }`}
                >
                  {category.name}
                  <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-black ${active ? "bg-white/20 text-white" : "bg-muted/10 text-muted"}`}>
                    {categoryCounts[category.id]}
                  </span>
                </button>
              );
            })}
          </div>

          {tabsOverflow ? (
            <p className="mb-4 flex items-center gap-1.5 text-[12px] leading-none text-muted">
              <MoveHorizontal
                className="h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              اسحب يمين ويسار لشوف باقي الفئات
            </p>
          ) : null}

          {visibleMeals.length === 0 ? (
            <OwnerEmptyState
              icon={<UtensilsCrossed className="h-6 w-6" aria-hidden="true" />}
              title={
                meals.length === 0
                  ? "منيّوك فاضي"
                  : "ما في أصناف بهالفئة"
              }
              description={
                meals.length === 0
                  ? "ابدأ بضيف أصناف للمنيو — والزباين رح يقدروا يطلبوها فوراً."
                  : "جرّب فئة تانية أو أضف صنف جديد هون."
              }
            >
              <button
                type="button"
                onClick={() => setMealModal({ meal: null })}
                className={primaryButtonClass}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                إضافة صنف
              </button>
            </OwnerEmptyState>
          ) : (
            <div className="space-y-3">
              {visibleMeals.map((meal) => (
                <MealRow
                  key={meal.id}
                  meal={meal}
                  busy={busyId === meal.id}
                  onEdit={(target) => setMealModal({ meal: target })}
                  onDelete={(target) => setDeleteTarget(target)}
                  onToggleFeature={handleToggleFeature}
                  onAvailability={handleAvailability}
                />
              ))}
            </div>
          )}
        </>
      ) : null}

      <MealFormModal
        open={Boolean(mealModal)}
        onClose={() => setMealModal(null)}
        onSave={handleSaveMeal}
        categories={categories}
        meal={mealModal?.meal}
        busy={busyId === mealModal?.meal?.id || busyId === "new"}
      />

      <CategoryManagerModal
        open={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
        categories={categories}
        onAdd={handleAddCategory}
        onRename={handleRenameCategory}
        onDelete={handleDeleteCategory}
        busyId={categoryBusyId}
        busyAction={categoryBusyAction}
      />

      <OwnerModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="حذف الصنف"
        subtitle={deleteTarget ? `بتحذف «${deleteTarget.name}» — ما رح يظل ظاهر للزبائن.` : undefined}
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={busyId === deleteTarget?.id}
              className={secondaryButtonClass}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleDeleteMeal}
              disabled={busyId === deleteTarget?.id}
              className={dangerButtonClass}
            >
              {busyId === deleteTarget?.id ? "بالحذف…" : "احذف"}
            </button>
          </>
        }
      >
        <p className="text-[14px] leading-relaxed text-muted">
          هالإجراء ما بيترجع — أكيد بدك تتشطب هالصنف من المنيو؟
        </p>
      </OwnerModal>
    </div>
  );
}
