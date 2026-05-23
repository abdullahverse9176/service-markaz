import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Business from "@/models/Business";

function isValidObjectId(id) {
  return /^[a-f\d]{24}$/i.test(id);
}

/** Returns the most recent Monday at 00:00 UTC */
function getWeekStart() {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sun, 1 = Mon … 6 = Sat
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setUTCDate(now.getUTCDate() - daysSinceMonday);
  weekStart.setUTCHours(0, 0, 0, 0);
  return weekStart;
}

/** Returns the 1st of the current month at 00:00 UTC */
function getMonthStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

// POST /api/businesses/[id]/view
// Fire-and-forget. Called from client-side ViewTracker on provider profile page.
// Increments viewCount (all-time), weeklyViews, and monthlyViews with lazy resets.
// Uses a single findOneAndUpdate to avoid a separate read + write round trip.
export async function POST(request, { params }) {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  try {
    await connectDB();

    const weekStart  = getWeekStart();
    const monthStart = getMonthStart();

    // Fetch only the view-reset fields to decide what needs resetting
    const business = await Business.findById(id)
      .select("viewsWeekStart viewsMonthStart status")
      .lean();

    if (!business || business.status !== "active") {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const weekReset =
      !business.viewsWeekStart ||
      new Date(business.viewsWeekStart).getTime() < weekStart.getTime();

    const monthReset =
      !business.viewsMonthStart ||
      new Date(business.viewsMonthStart).getTime() < monthStart.getTime();

    const incOps = { viewCount: 1 };
    const setOps = {};

    if (weekReset) {
      setOps.weeklyViews     = 1;
      setOps.viewsWeekStart  = weekStart;
    } else {
      incOps.weeklyViews = 1;
    }

    if (monthReset) {
      setOps.monthlyViews    = 1;
      setOps.viewsMonthStart = monthStart;
    } else {
      incOps.monthlyViews = 1;
    }

    const updateOp = { $inc: incOps };
    if (Object.keys(setOps).length > 0) updateOp.$set = setOps;

    // updateOne is lighter than findByIdAndUpdate — we don't need the updated doc
    await Business.updateOne({ _id: id }, updateOp);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/businesses/[id]/view error:", err);
    // Silently succeed — view tracking should never break UX
    return NextResponse.json({ success: true });
  }
}
