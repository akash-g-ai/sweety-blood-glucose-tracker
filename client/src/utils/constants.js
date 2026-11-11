export const API_PATHS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  READINGS: "/readings",
  REPORTS_SUMMARY: "/reports/summary",
  REPORTS_TREND: "/reports/trend",
};

export const SLOTS = [
  { value: "morning_fasting", label: "Morning Fasting" },
  { value: "after_breakfast", label: "After Breakfast" },
  { value: "after_lunch", label: "After Lunch" },
  { value: "after_dinner", label: "After Dinner" },
];

export const SLOT_LABELS = {
  morning_fasting: "Morning Fasting",
  after_breakfast: "After Breakfast",
  after_lunch: "After Lunch",
  after_dinner: "After Dinner",
};

export const VALUE_MIN = 40;
export const VALUE_MAX = 600;

const KOLKATA_TZ = "Asia/Kolkata";

export function todayInKolkata() {
  return new Date().toLocaleDateString("en-CA", { timeZone: KOLKATA_TZ });
}
