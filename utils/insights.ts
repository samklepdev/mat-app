// Insights engine — turns raw check-in history into human observations.
// Pure functions, no I/O. Conservative by design: an insight only surfaces
// when there is enough data to say it honestly (min sample sizes below).

interface CheckInRow {
  date: string;
  mood: number;
  sleep: number;
  cravings: number; // stored as "comfort" semantically: 5 = settled
  took_medication: number;
}

export interface Insight {
  id: string;
  text: string;
}

const MIN_DAYS_FOR_TRENDS = 7;
const MIN_DAYS_FOR_CORRELATION = 14;

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function generateInsights(rows: CheckInRow[]): Insight[] {
  const insights: Insight[] = [];
  if (rows.length < MIN_DAYS_FOR_TRENDS) return insights;

  // ── Trend: compare last 7 days vs previous 7 ──────────────────────────────
  if (rows.length >= 14) {
    const recent = rows.slice(-7);
    const prior = rows.slice(-14, -7);

    const metrics: { key: keyof CheckInRow; label: string }[] = [
      { key: "sleep", label: "sleep" },
      { key: "mood", label: "mood" },
      { key: "cravings", label: "comfort" },
    ];

    for (const { key, label } of metrics) {
      const recentAvg = avg(recent.map((r) => r[key] as number));
      const priorAvg = avg(prior.map((r) => r[key] as number));
      const delta = recentAvg - priorAvg;

      if (delta >= 0.5) {
        insights.push({
          id: `trend-${label}-up`,
          text: `Your ${label} has been climbing — up noticeably over the past week.`,
        });
      } else if (delta <= -0.7) {
        insights.push({
          id: `trend-${label}-down`,
          text: `Your ${label} has dipped this week compared to last. Worth noticing, not worth judging.`,
        });
      }
    }
  }

  // ── Correlation: comfort on good-sleep days vs poor-sleep days ────────────
  if (rows.length >= MIN_DAYS_FOR_CORRELATION) {
    const goodSleep = rows.filter((r) => r.sleep >= 4);
    const poorSleep = rows.filter((r) => r.sleep <= 2);

    if (goodSleep.length >= 5 && poorSleep.length >= 5) {
      const comfortGood = avg(goodSleep.map((r) => r.cravings));
      const comfortPoor = avg(poorSleep.map((r) => r.cravings));

      if (comfortGood - comfortPoor >= 0.8) {
        insights.push({
          id: "corr-sleep-comfort",
          text: `Your comfort scores run highest on days you sleep well. Sleep might be your strongest lever.`,
        });
      }
    }
  }

  // ── Day-of-week pattern ────────────────────────────────────────────────────
  if (rows.length >= 21) {
    const byWeekday: number[][] = [[], [], [], [], [], [], []];
    for (const r of rows) {
      const [y, m, d] = r.date.split("-").map(Number);
      const weekday = new Date(y, m - 1, d).getDay();
      byWeekday[weekday].push(r.mood);
    }

    const weekdayNames = [
      "Sundays",
      "Mondays",
      "Tuesdays",
      "Wednesdays",
      "Thursdays",
      "Fridays",
      "Saturdays",
    ];
    let bestDay = -1;
    let bestAvg = -Infinity;

    byWeekday.forEach((moods, i) => {
      if (moods.length >= 3) {
        const a = avg(moods);
        if (a > bestAvg) {
          bestAvg = a;
          bestDay = i;
        }
      }
    });

    if (bestDay !== -1) {
      insights.push({
        id: "pattern-best-day",
        text: `${weekdayNames[bestDay]} tend to be your steadiest days.`,
      });
    }
  }

  // ── Consistency observation ─────────────────────────────────────────────────
  const last30 = rows.slice(-30);
  if (last30.length >= 25) {
    insights.push({
      id: "consistency-30",
      text: `You've checked in ${last30.length} of the last 30 days. That kind of consistency is the treatment working.`,
    });
  }

  return insights.slice(0, 3); // max 3 at a time — quiet, not a feed
}
