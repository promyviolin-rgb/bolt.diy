/* eslint-disable */
/* EPILUMINA — Dieta ketogenna: kalkulator ratio + tracker ketonów/glukozy.
 * 100% on-device. Baza produktów lokalna (src/lib/epilumina-keto-foods.ts).
 */
import React, { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Crown,
  Lock,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Pencil,
  Info,
  Bookmark,
} from "lucide-react";
import {
  KETO_FOODS,
  foodName,
  foodSearchIndex,
  kcalOf,
  ketoRatio,
  fatToReachRatio,
} from "@/lib/epilumina-keto-foods";
import { useExtraT } from "@/lib/epilumina-extra-i18n";
import { usePersistentState } from "@/lib/use-persistent-state";

const TEAL = "#1B6B63";
const GOLD = "#B8863B";
const BERRY = "#A6416B";

function Card({ children, style }: any) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: 14,
        boxShadow: "0 1px 3px rgba(36,49,46,0.07)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Collapsible section (accordion). */
function Accordion({ title, children, defaultOpen = false }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o: any) => !o)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "none",
          border: "none",
          padding: "13px 14px",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#24312E" }}>{title}</span>
        {open ? <ChevronUp size={16} color="#5C6E68" /> : <ChevronDown size={16} color="#5C6E68" />}
      </button>
      {open && <div style={{ padding: "0 14px 14px" }}>{children}</div>}
    </Card>
  );
}

function num(v: string) {
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
function r1(n: number) {
  return Math.round(n * 10) / 10;
}

/* ---------- Ratio calculator ---------- */
function RatioCalculator({ tc, lang, profileId = "default" }: any) {
  const tx = useExtraT(lang);
  const [target, setTarget] = useState(3);
  const [infoOpen, setInfoOpen] = useState(false);
  // Persisted so the active meal survives switching to other tabs.
  const [items, setItems] = usePersistentState<any>(`epilumina.${profileId}.ketoMeal`, []);
  const [query, setQuery] = useState<any>("");
  const [grams, setGrams] = useState("50");
  const [pending, setPending] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [editKey, setEditKey] = useState<any>(null);
  const [editGrams, setEditGrams] = useState<any>("");
  const [editFoodId, setEditFoodId] = useState<any>(null);
  const [editFoodName, setEditFoodName] = useState<any>("");
  const [customFoods, setCustomFoods] = usePersistentState<any>(
    `epilumina.${profileId}.customFoods`,
    [],
  );
  const [cName, setCName] = useState<any>("");
  const [cF, setCF] = useState<any>("");
  const [cP, setCP] = useState<any>("");
  const [cC, setCC] = useState<any>("");
  const allFoods = useMemo(() => [...customFoods, ...KETO_FOODS], [customFoods]);
  // "My meals": saved sets of ingredients that can be re-added in one tap.
  const [savedMeals, setSavedMeals] = usePersistentState<any>(
    `epilumina.${profileId}.savedMeals`,
    [],
  );
  const [mealName, setMealName] = useState<any>("");
  const [savingMeal, setSavingMeal] = useState(false);
  const [mealSavedMsg, setMealSavedMsg] = useState(false);
  // Show product names in the CURRENT language (not the one used when added).
  const nameOf = (it: any) => {
    const f = allFoods.find((x) => x.id === (it as any).id);
    return f ? foodName(f, lang) : (it as any).name;
  };
  const saveMeal = () => {
    const name = mealName.trim().slice(0, 40);
    if (!name || items.length === 0) return;
    const meal = {
      id: "meal" + Date.now(),
      name,
      items: items.map(({ id, name: n, g, f, p, c }: any) => ({ id, name: n, g, f, p, c })),
    };
    setSavedMeals((prev: any) => [meal, ...prev].slice(0, 100));
    setMealName("");
    setSavingMeal(false);
    setMealSavedMsg(true);
    setTimeout(() => setMealSavedMsg(false), 2500);
  };
  const addMeal = (meal: any) => {
    const stamp = Date.now();
    setItems((prev: any) => [
      ...prev,
      ...(meal as any).items.map((it: any, i: string) => ({
        ...it,
        key: it.id + "_" + stamp + "_" + i,
      })),
    ]);
  };
  const mealTotals = (meal: any) =>
    (meal as any).items.reduce(
      (a: any, it: any) => ({
        f: a.f + (it.f * it.g) / 100,
        p: a.p + (it.p * it.g) / 100,
        c: a.c + (it.c * it.g) / 100,
      }),
      { f: 0, p: 0, c: 0 },
    );

  // Dynamic search only — nothing is listed until the user types.
  // Matches product names in every supported language, so the search works
  // no matter which UI language is active.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allFoods
      .filter((f) => foodName(f, lang).toLowerCase().includes(q) || foodSearchIndex(f).includes(q))
      .slice(0, 10);
  }, [query, lang, allFoods]);

  const totals = useMemo(() => {
    return items.reduce(
      (a: any, it: any) => {
        a.f += (it.f * it.g) / 100;
        a.p += (it.p * it.g) / 100;
        a.c += (it.c * it.g) / 100;
        return a;
      },
      { f: 0, p: 0, c: 0 },
    );
  }, [items]);

  const ratio = ketoRatio(totals.f, totals.p, totals.c);
  const kcal = kcalOf(totals.f, totals.p, totals.c);
  const needFat = fatToReachRatio(totals.f, totals.p, totals.c, target);
  const progressPct = Math.max(
    0,
    Math.min(100, Number.isFinite(ratio) ? (ratio / target) * 100 : 100),
  );

  const add = (food: any, gramsValue: string) => {
    const g = Math.max(1, Math.min(2000, Math.round(num(gramsValue) || 50)));
    setItems((prev: any) => [
      ...prev,
      {
        key: (food as any).id + "_" + Date.now(),
        id: (food as any).id,
        name: foodName(food, lang),
        g,
        f: (food as any).f,
        p: (food as any).p,
        c: (food as any).c,
      },
    ]);
    setQuery("");
    setSelected(null);
    setPending(null);
    setGrams("50");
  };

  const saveEdit = (key: any) => {
    const g = Math.max(1, Math.min(2000, Math.round(num(editGrams) || 1)));
    setItems((prev: any) => prev.map((x: any) => (x.key === key ? { ...x, g } : x)));
    setEditKey(null);
    setEditGrams("");
  };

  const saveFoodName = (id: any) => {
    const name = editFoodName.trim().slice(0, 40);
    if (name)
      setCustomFoods((prev: any) =>
        prev.map((f: any) => (f.id === id ? { ...f, pl: name, en: name } : f)),
      );
    setEditFoodId(null);
    setEditFoodName("");
  };

  const addCustom = () => {
    const name = cName.trim().slice(0, 40);
    if (!name) return;
    const cap = (v: string) => Math.max(0, Math.min(100, num(v)));
    const food = {
      id: "cf" + Date.now(),
      pl: name,
      en: name,
      f: cap(cF),
      p: cap(cP),
      c: cap(cC),
      cat: "custom",
    };
    setCustomFoods((prev: any) => [food, ...prev].slice(0, 300));
    setCName("");
    setCF("");
    setCP("");
    setCC("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#24312E" }}>
            {tc("keto.ratioLabel")}
          </p>
          <button
            onClick={() => setInfoOpen((o) => !o)}
            aria-label={tx("keto.ratioInfo")}
            title={tx("keto.ratioInfo")}
            style={{
              background: "#EFF3F1",
              border: "none",
              borderRadius: 999,
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <Info size={13} color={TEAL} />
          </button>
        </div>
        {infoOpen && (
          <p
            style={{
              margin: "0 0 10px",
              background: "#EFF3F1",
              borderRadius: 12,
              padding: "9px 11px",
              fontSize: 11.5,
              color: "#3A4A45",
              lineHeight: 1.5,
            }}
          >
            ℹ️ {tx("keto.ratioInfo")}
          </p>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          {[2, 3, 4].map((r) => (
            <button
              key={r}
              onClick={() => setTarget(r)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 12,
                border: target === r ? `1.5px solid ${TEAL}` : "1px solid #E1E7E4",
                background: target === r ? "#DCEEEA" : "#fff",
                color: target === r ? TEAL : "#5C6E68",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {r}:1
            </button>
          ))}
        </div>
      </Card>

      <Accordion title={tx("keto.sectionMeal")} defaultOpen>
        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#24312E" }}>
          {tc("keto.addFood")}
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center", position: "relative" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid #E1E7E4",
              borderRadius: 12,
              padding: "8px 10px",
            }}
          >
            <Search size={14} color="#8B9C96" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value.slice(0, 40));
                setPending(null);
              }}
              placeholder={tc("keto.searchPlaceholder")}
              style={{
                border: "none",
                outline: "none",
                fontSize: 13,
                width: "100%",
                background: "transparent",
                color: "#24312E",
              }}
            />
          </div>
          {query.trim() !== "" && !pending && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: 6,
                background: "#fff",
                border: "1px solid #E1E7E4",
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(36,49,46,0.12)",
                maxHeight: 240,
                overflowY: "auto",
                zIndex: 30,
              }}
            >
              {results.length === 0 ? (
                <p style={{ margin: 0, padding: "10px 12px", fontSize: 12, color: "#8B9C96" }}>
                  {tc("keto.empty")}
                </p>
              ) : (
                results.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setPending(f);
                      setGrams("50");
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid #F1F5F3",
                      padding: "9px 12px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#24312E" }}>
                      {foodName(f, lang)}
                    </span>
                    <span style={{ fontSize: 10.5, color: "#8B9C96" }}>
                      F {f.f} · P {f.p} · C {f.c}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Grammage prompt — asked before the product lands in the meal list. */}
        {pending && (
          <div style={{ marginTop: 10, background: "#EFF3F1", borderRadius: 14, padding: 12 }}>
            <p style={{ margin: "0 0 8px", fontSize: 12.5, fontWeight: 700, color: "#24312E" }}>
              {foodName(pending, lang)}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                value={grams}
                onChange={(e) => setGrams(e.target.value.slice(0, 5))}
                inputMode="numeric"
                autoFocus
                aria-label={tc("keto.grams")}
                style={{
                  width: 76,
                  minHeight: 40,
                  border: "1px solid #E1E7E4",
                  borderRadius: 12,
                  padding: "9px 8px",
                  fontSize: 13,
                  textAlign: "center",
                  outline: "none",
                  color: "#24312E",
                  background: "#fff",
                }}
              />
              <span style={{ fontSize: 12, color: "#8B9C96" }}>g</span>
              <button
                onClick={() => add(pending, grams)}
                style={{
                  flex: 1,
                  background: TEAL,
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 0",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {tc("keto.addFood")}
              </button>
              <button
                onClick={() => {
                  setPending(null);
                }}
                style={{
                  background: "#fff",
                  color: "#5C6E68",
                  border: "1px solid #DCE5E1",
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {tc("common.cancel")}
              </button>
            </div>
          </div>
        )}

        <p style={{ margin: "14px 0 8px", fontSize: 12, fontWeight: 700, color: "#24312E" }}>
          {tc("keto.meal")}
        </p>
        {items.length === 0 && (
          <p style={{ margin: 0, fontSize: 12, color: "#8B9C96" }}>{tc("keto.empty")}</p>
        )}
        {items.map((it: any) => (
          <div
            key={it.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              padding: "7px 0",
              borderBottom: "1px solid #EFF3F1",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: "#24312E" }}>
                {nameOf(it)}
              </p>
              {editKey === it.key ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <input
                    value={editGrams}
                    onChange={(e) => setEditGrams(e.target.value.slice(0, 5))}
                    inputMode="numeric"
                    aria-label={tc("keto.grams")}
                    style={{
                      width: 66,
                      border: "1px solid #E1E7E4",
                      borderRadius: 10,
                      padding: "6px 8px",
                      fontSize: 12.5,
                      textAlign: "center",
                      outline: "none",
                      color: "#24312E",
                    }}
                  />
                  <span style={{ fontSize: 11.5, color: "#8B9C96" }}>g</span>
                  <button
                    onClick={() => saveEdit(it.key)}
                    style={{
                      background: TEAL,
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      padding: "6px 12px",
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {tc("common.save")}
                  </button>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 10.5, color: "#8B9C96" }}>
                  {it.g} g ·{" "}
                  {Math.round(
                    kcalOf((it.f * it.g) / 100, (it.p * it.g) / 100, (it.c * it.g) / 100),
                  )}{" "}
                  kcal
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setEditKey(it.key);
                setEditGrams(String(it.g));
              }}
              aria-label={tc("common.save")}
              style={{
                background: "#EFF3F1",
                border: "none",
                cursor: "pointer",
                color: TEAL,
                padding: 6,
                borderRadius: 8,
              }}
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => setItems((prev: any) => prev.filter((x: any) => x.key !== it.key))}
              aria-label={tc("keto.remove")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: BERRY,
                padding: 4,
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {items.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setItems([])}
              style={{
                background: "none",
                border: "1px solid #E1E7E4",
                borderRadius: 10,
                padding: "6px 12px",
                fontSize: 11.5,
                color: "#5C6E68",
                cursor: "pointer",
              }}
            >
              {tc("keto.clear")}
            </button>
            {!savingMeal && (
              <button
                onClick={() => setSavingMeal(true)}
                style={{
                  background: "#DCEEEA",
                  border: "none",
                  borderRadius: 10,
                  padding: "6px 12px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: TEAL,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Bookmark size={12} /> {tx("keto.saveMeal")}
              </button>
            )}
          </div>
        )}
        {savingMeal && items.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <input
              autoFocus
              value={mealName}
              onChange={(e) => setMealName(e.target.value.slice(0, 40))}
              placeholder={tx("keto.mealName")}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveMeal();
              }}
              style={{
                flex: 1,
                minWidth: 0,
                border: "1px solid #E1E7E4",
                borderRadius: 10,
                padding: "7px 10px",
                fontSize: 12.5,
                color: "#24312E",
                outline: "none",
              }}
            />
            <button
              onClick={saveMeal}
              disabled={!mealName.trim()}
              style={{
                background: TEAL,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "7px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                opacity: mealName.trim() ? 1 : 0.5,
              }}
            >
              {tc("common.save")}
            </button>
            <button
              onClick={() => {
                setSavingMeal(false);
                setMealName("");
              }}
              style={{
                background: "#fff",
                color: "#5C6E68",
                border: "1px solid #DCE5E1",
                borderRadius: 10,
                padding: "7px 10px",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {tc("common.cancel")}
            </button>
          </div>
        )}
        {mealSavedMsg && (
          <p style={{ margin: "8px 0 0", fontSize: 11.5, color: TEAL, fontWeight: 600 }}>
            ✓ {tx("keto.mealSaved")}
          </p>
        )}
      </Accordion>

      <Accordion title={`${tx("keto.myMeals")} (${savedMeals.length})`}>
        {savedMeals.length === 0 ? (
          <p style={{ margin: 0, fontSize: 12, color: "#8B9C96", lineHeight: 1.5 }}>
            {tx("keto.myMealsEmpty")}
          </p>
        ) : (
          savedMeals.map((m: any) => {
            const tt = mealTotals(m);
            const rr = ketoRatio(tt.f, tt.p, tt.c);
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 0",
                  borderBottom: "1px solid #EFF3F1",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: "#24312E" }}>
                    {m.name}
                  </p>
                  <p
                    style={{ margin: "1px 0 0", fontSize: 10.5, color: "#8B9C96", lineHeight: 1.4 }}
                  >
                    {m.items.map((it: any) => `${nameOf(it)} ${it.g} g`).join(" · ")}
                  </p>
                  <p style={{ margin: "1px 0 0", fontSize: 10.5, color: TEAL, fontWeight: 600 }}>
                    {Math.round(kcalOf(tt.f, tt.p, tt.c))} kcal ·{" "}
                    {Number.isFinite(rr) ? r1(rr) : "∞"}:1
                  </p>
                </div>
                <button
                  onClick={() => addMeal(m)}
                  style={{
                    background: TEAL,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "7px 10px",
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Plus size={12} /> {tx("keto.addMeal")}
                </button>
                <button
                  onClick={() =>
                    setSavedMeals((prev: any) => prev.filter((x: any) => x.id !== m.id))
                  }
                  aria-label={tc("keto.remove")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: BERRY,
                    padding: 4,
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </Accordion>

      <Accordion title={tx("keto.sectionCustom")}>
        <p style={{ margin: "0 0 8px", fontSize: 11.5, color: "#5C6E68" }}>
          {tx("keto.customTitle")} — g / 100 g
        </p>
        <input
          value={cName}
          onChange={(e) => setCName(e.target.value.slice(0, 40))}
          placeholder={tx("keto.customName")}
          style={{
            width: "100%",
            border: "1px solid #E1E7E4",
            borderRadius: 12,
            padding: "9px 10px",
            fontSize: 12.5,
            color: "#24312E",
            outline: "none",
            marginBottom: 8,
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          {[
            [cF, setCF, tc("keto.fat")],
            [cP, setCP, tc("keto.protein")],
            [cC, setCC, tc("keto.carbs")],
          ].map(([v, set, label], i) => (
            <input
              key={i}
              value={v}
              onChange={(e) => set(e.target.value.slice(0, 5))}
              inputMode="decimal"
              placeholder={label}
              style={{
                flex: 1,
                minWidth: 0,
                border: "1px solid #E1E7E4",
                borderRadius: 12,
                padding: "9px 8px",
                fontSize: 12.5,
                color: "#24312E",
                outline: "none",
              }}
            />
          ))}
        </div>
        <button
          onClick={addCustom}
          disabled={!cName.trim()}
          style={{
            marginTop: 10,
            width: "100%",
            background: TEAL,
            color: "#fff",
            border: "none",
            borderRadius: 13,
            padding: "10px 0",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
            opacity: cName.trim() ? 1 : 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Plus size={14} /> {tx("keto.customAdd")}
        </button>
        {customFoods.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {customFoods.map((f: any) => (
              <div
                key={f.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 6,
                  padding: "6px 0",
                  borderBottom: "1px solid #EFF3F1",
                }}
              >
                {editFoodId === f.id ? (
                  <input
                    autoFocus
                    value={editFoodName}
                    onChange={(e) => setEditFoodName(e.target.value.slice(0, 40))}
                    onBlur={() => saveFoodName(f.id)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      border: "1px solid #E1E7E4",
                      borderRadius: 10,
                      padding: "5px 8px",
                      fontSize: 12.5,
                      color: "#24312E",
                      outline: "none",
                    }}
                  />
                ) : (
                  <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "#24312E" }}>
                    {foodName(f, lang)}
                  </span>
                )}
                <span style={{ fontSize: 10.5, color: "#8B9C96" }}>
                  F {f.f} · P {f.p} · C {f.c}
                </span>
                <button
                  onClick={() => {
                    setEditFoodId(f.id);
                    setEditFoodName(f.pl);
                  }}
                  aria-label={tc("common.save")}
                  style={{
                    background: "#EFF3F1",
                    border: "none",
                    cursor: "pointer",
                    color: TEAL,
                    padding: 5,
                    borderRadius: 8,
                  }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() =>
                    setCustomFoods((prev: any) => prev.filter((x: any) => x.id !== f.id))
                  }
                  aria-label={tc("keto.remove")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: BERRY,
                    padding: 4,
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Accordion>

      <Card style={{ background: "linear-gradient(140deg,#1B6B63,#175048)", color: "#fff" }}>
        <p style={{ margin: 0, fontSize: 11, opacity: 0.8, fontWeight: 600 }}>
          {tc("keto.ratioNow")}
        </p>
        <p
          style={{
            margin: "2px 0 10px",
            fontFamily: "'Fraunces', serif",
            fontSize: 34,
            fontWeight: 600,
          }}
        >
          {Number.isFinite(ratio) ? r1(ratio) : "∞"}
          <span style={{ fontSize: 18 }}>:1</span>
        </p>
        <p style={{ margin: "0 0 5px", fontSize: 10.5, opacity: 0.85 }}>
          {tx("keto.progress", { target })}
        </p>
        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: "rgba(255,255,255,0.2)",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              borderRadius: 999,
              background: progressPct >= 100 ? "#9FE7C7" : "#F0C987",
              transition: "width .25s",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            ["kcal", Math.round(kcal)],
            [tc("keto.fat"), r1(totals.f) + " g"],
            [tc("keto.protein"), r1(totals.p) + " g"],
            [tc("keto.carbs"), r1(totals.c) + " g"],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: "8px 6px",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, fontSize: 10, opacity: 0.8 }}>{k}</p>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700 }}>{v}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#FFF8EC" }}>
        <Sparkles size={16} color={GOLD} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 12, color: "#5C4A2C", lineHeight: 1.5 }}>
          {items.length === 0
            ? tc("keto.tipStart")
            : needFat > 0
              ? tc("keto.tipAddFat", { g: needFat, target })
              : tc("keto.tipOk", { target })}
        </p>
      </Card>
      <p style={{ margin: "0 6px 4px", fontSize: 10.5, color: "#8B9C96", lineHeight: 1.5 }}>
        {tc("keto.disclaimer")}
      </p>
    </div>
  );
}

/* ---------- Ketones / glucose tracker ---------- */
function Sparkline({ data, color, label, unit }: any) {
  const vals = data.filter((d: any) => Number.isFinite(d.v));
  if (vals.length === 0) return null;
  const W = 300,
    H = 70,
    pad = 6;
  const max = Math.max(...vals.map((d: any) => d.v)) || 1;
  const min = Math.min(...vals.map((d: any) => d.v), 0);
  const span = max - min || 1;
  const pts = vals
    .map((d: any, i: number) => {
      const x = pad + (i * (W - pad * 2)) / Math.max(1, vals.length - 1);
      const y = H - pad - ((d.v - min) / span) * (H - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <div style={{ marginTop: 6 }}>
      <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#5C6E68" }}>
        {label} <span style={{ color: "#8B9C96", fontWeight: 500 }}>({unit})</span>
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: 70 }}
        role="img"
        aria-label={label}
      >
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {vals.map((d: any, i: any) => {
          const x = pad + (i * (W - pad * 2)) / Math.max(1, vals.length - 1);
          const y = H - pad - ((d.v - min) / span) * (H - pad * 2);
          return <circle key={i} cx={x} cy={y} r="2.4" fill={color} />;
        })}
      </svg>
    </div>
  );
}

function BioTracker({ tc, readings, onAdd, onDelete }: any) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [ket, setKet] = useState<any>("");
  const [glu, setGlu] = useState<any>("");

  const last30 = useMemo(() => {
    const from = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
    return readings
      .filter((r: any) => r.date >= from)
      .slice()
      .sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [readings]);

  const save = () => {
    const k = num(ket),
      g = num(glu);
    if (!k && !g) return;
    onAdd({ id: "k" + Date.now(), date, ketones: k || null, glucose: g || null });
    setKet("");
    setGlu("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#24312E" }}>
          {tc("keto.addReading")}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            style={{
              flex: "1 1 120px",
              border: "1px solid #E1E7E4",
              borderRadius: 12,
              padding: "9px 10px",
              fontSize: 12.5,
              color: "#24312E",
              outline: "none",
            }}
          />
          <input
            value={ket}
            onChange={(e) => setKet(e.target.value.slice(0, 5))}
            inputMode="decimal"
            placeholder={tc("keto.ketones")}
            style={{
              flex: "1 1 90px",
              border: "1px solid #E1E7E4",
              borderRadius: 12,
              padding: "9px 10px",
              fontSize: 12.5,
              color: "#24312E",
              outline: "none",
            }}
          />
          <input
            value={glu}
            onChange={(e) => setGlu(e.target.value.slice(0, 5))}
            inputMode="decimal"
            placeholder={tc("keto.glucose")}
            style={{
              flex: "1 1 90px",
              border: "1px solid #E1E7E4",
              borderRadius: 12,
              padding: "9px 10px",
              fontSize: 12.5,
              color: "#24312E",
              outline: "none",
            }}
          />
        </div>
        <button
          onClick={save}
          style={{
            marginTop: 10,
            width: "100%",
            background: TEAL,
            color: "#fff",
            border: "none",
            borderRadius: 13,
            padding: "11px 0",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Plus size={15} /> {tc("keto.save")}
        </button>
        <p style={{ margin: "8px 0 0", fontSize: 10.5, color: "#8B9C96" }}>{tc("keto.units")}</p>
      </Card>

      <Card>
        <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "#24312E" }}>
          {tc("keto.chart30")}
        </p>
        {last30.length === 0 ? (
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#8B9C96" }}>
            {tc("keto.noReadings")}
          </p>
        ) : (
          <>
            <Sparkline
              data={last30.map((r: any) => ({ v: r.ketones }))}
              color={TEAL}
              label={tc("keto.ketones")}
              unit="mmol/L"
            />
            <Sparkline
              data={last30.map((r: any) => ({ v: r.glucose }))}
              color={BERRY}
              label={tc("keto.glucose")}
              unit="mg/dL"
            />
          </>
        )}
      </Card>

      <Card>
        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "#24312E" }}>
          {tc("keto.history")}
        </p>
        {readings.length === 0 && (
          <p style={{ margin: 0, fontSize: 12, color: "#8B9C96" }}>{tc("keto.noReadings")}</p>
        )}
        {readings
          .slice()
          .sort((a: any, b: any) => b.date.localeCompare(a.date))
          .slice(0, 30)
          .map((r: any) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 0",
                borderBottom: "1px solid #EFF3F1",
              }}
            >
              <span style={{ fontSize: 12.5, color: "#24312E", fontWeight: 600 }}>{r.date}</span>
              <span style={{ fontSize: 11.5, color: "#5C6E68" }}>
                {r.ketones ? `${tc("keto.ketones")}: ${r.ketones} ` : ""}
                {r.glucose ? `· ${tc("keto.glucose")}: ${r.glucose}` : ""}
              </span>
              <button
                onClick={() => onDelete(r.id)}
                aria-label={tc("keto.remove")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: BERRY,
                  padding: 4,
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
      </Card>
    </div>
  );
}

/* ---------- Screen ---------- */
export default function KetoScreen({
  tc,
  lang,
  profileId,
  isPremium,
  onOpenPremium,
  readings,
  onAddReading,
  onDeleteReading,
}: any) {
  const [tab, setTab] = useState("calc");

  if (!isPremium) {
    return (
      <div style={{ padding: "10px 16px 24px" }}>
        <h1
          style={{
            margin: "0 0 4px",
            fontFamily: "'Fraunces', serif",
            fontSize: 23,
            fontWeight: 600,
            color: "#24312E",
          }}
        >
          {tc("keto.title")}
        </h1>
        <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "#5C6E68" }}>
          {tc("keto.subtitle")}
        </p>
        <Card style={{ textAlign: "center", padding: 22 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 15,
              background: "#F3E8D3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
            }}
          >
            <Lock size={20} color={GOLD} />
          </div>
          <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#24312E" }}>
            {tc("keto.lockedTitle")}
          </p>
          <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#5C6E68", lineHeight: 1.55 }}>
            {tc("keto.lockedBody")}
          </p>
          <button
            onClick={onOpenPremium}
            style={{
              background: GOLD,
              color: "#fff",
              border: "none",
              borderRadius: 13,
              padding: "11px 20px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <Crown size={15} /> {tc("keto.unlock")}
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "10px 16px 24px" }}>
      <h1
        style={{
          margin: "0 0 4px",
          fontFamily: "'Fraunces', serif",
          fontSize: 23,
          fontWeight: 600,
          color: "#24312E",
        }}
      >
        {tc("keto.title")}
      </h1>
      <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "#5C6E68" }}>{tc("keto.subtitle")}</p>
      <div
        style={{
          display: "flex",
          gap: 6,
          background: "#E4EBE8",
          borderRadius: 14,
          padding: 4,
          marginBottom: 14,
        }}
      >
        {[
          ["calc", tc("keto.tabCalc")],
          ["track", tc("keto.tabTrack")],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              flex: 1,
              border: "none",
              borderRadius: 11,
              padding: "9px 0",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              background: tab === k ? "#fff" : "transparent",
              color: tab === k ? TEAL : "#5C6E68",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "calc" ? (
        <RatioCalculator key={profileId} tc={tc} lang={lang} profileId={profileId} />
      ) : (
        <BioTracker tc={tc} readings={readings} onAdd={onAddReading} onDelete={onDeleteReading} />
      )}
    </div>
  );
}
