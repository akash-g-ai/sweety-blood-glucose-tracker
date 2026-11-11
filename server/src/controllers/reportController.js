import {
  getDailyAggregate,
  getDailyReadings,
  getRangeAggregate,
  getTrendData,
} from "../services/reportService.js";

const KOLKATA_TZ = "Asia/Kolkata";

function todayInKolkata() {
  return new Date().toLocaleDateString("en-CA", { timeZone: KOLKATA_TZ });
}

function getMonthDateRange(dateStr) {
  const [y, m] = dateStr.split("-").map(Number);
  return { start: y + "-" + String(m).padStart(2, "0") + "-01", end: dateStr };
}

function getPreviousMonthRange(dateStr) {
  const [y, m] = dateStr.split("-").map(Number);
  let prevY = y;
  let prevM = m - 1;
  if (prevM < 1) { prevM = 12; prevY = y - 1; }
  const start = prevY + "-" + String(prevM).padStart(2, "0") + "-01";
  const lastDay = new Date(Date.UTC(y, m - 1, 0));
  const end = lastDay.getUTCFullYear() + "-" +
    String(lastDay.getUTCMonth() + 1).padStart(2, "0") + "-" +
    String(lastDay.getUTCDate()).padStart(2, "0");
  return { start, end };
}

export async function getSummary(req, res, next) {
  try {
    const userId = req.user.id;
    const today = todayInKolkata();

    const dailyAgg = await getDailyAggregate(userId, today);
    const dailyReadings = await getDailyReadings(userId, today);

    const mtdRange = getMonthDateRange(today);
    const mtdAgg = await getRangeAggregate(userId, mtdRange.start, mtdRange.end);

    const prevRange = getPreviousMonthRange(today);
    const prevAgg = await getRangeAggregate(userId, prevRange.start, prevRange.end);

    res.status(200).json({
      daily: {
        date: today,
        count: dailyAgg.count,
        average: dailyAgg.average,
        highest: dailyAgg.highest,
        lowest: dailyAgg.lowest,
        readings: dailyReadings,
      },
      month_to_date: {
        start_date: mtdRange.start,
        end_date: mtdRange.end,
        count: mtdAgg.count,
        average: mtdAgg.average,
        highest: mtdAgg.highest,
        lowest: mtdAgg.lowest,
      },
      previous_month: {
        start_date: prevRange.start,
        end_date: prevRange.end,
        count: prevAgg.count,
        average: prevAgg.average,
        highest: prevAgg.highest,
        lowest: prevAgg.lowest,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTrend(req, res, next) {
  try {
    const userId = req.user.id;
    const today = todayInKolkata();
    const mtdRange = getMonthDateRange(today);

    const data = await getTrendData(userId, mtdRange.start, mtdRange.end);

    res.status(200).json({
      period: {
        start_date: mtdRange.start,
        end_date: mtdRange.end,
      },
      data,
    });
  } catch (err) {
    next(err);
  }
}