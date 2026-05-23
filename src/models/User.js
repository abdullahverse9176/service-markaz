import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            unique: true,
            sparse: true, // sparse index skips documents where field is absent (undefined)
            trim: true,
        },

        whatsapp: {
            type: String,
            default: null,
            trim: true,
        },

        password: {
            type: String,
            select: false,
        },

        role: {
            type: String,
            enum: ["provider", "customer", "admin"],
            default: "customer",
        },

        status: {
            type: String,
            enum: ["pending", "active", "blocked"],
            default: "active",
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true, // indexes only documents where the field exists (local users omit it)
        },

        provider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },

        // ── Referral ──────────────────────────────────────────────────────────
        // Unique invite code generated on first save (see pre-save hook below)
        referralCode: {
            type: String,
            unique: true,
            sparse: true,
            uppercase: true,
            trim: true,
            default: null,
        },
        // ObjectId of the User who referred this user (null = organic signup)
        referredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // ── Subscription (managed by reward engine + admin) ───────────────────
        subscription: {
            plan: {
                type: String,
                enum: ["free", "basic", "pro", "lifetime"],
                default: "free",
            },
            expiresAt: { type: Date, default: null },
            // Where did this subscription come from?  e.g. "referral", "purchase", "admin"
            source: { type: String, default: "free" },
        },

        // ── Badges ────────────────────────────────────────────────────────────
        // e.g. ["featured", "top-referrer"]
        badges: {
            type: [String],
            default: [],
        },

        // Flag: admin approved lifetime plan (requires manual review)
        lifetimeEligible: {
            type: Boolean,
            default: false,
        },

        // ── Email Verification (OTP) ──────────────────────────────────────────
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        // SHA-256 hash of the 6-digit OTP (select: false keeps it out of queries)
        emailOtp: {
            type: String,
            default: null,
            select: false,
        },
        emailOtpExpiry: {
            type: Date,
            default: null,
        },

        // ── Password Reset OTP ────────────────────────────────────────────────
        resetOtp: {
            type: String,
            default: null,
            select: false,
        },
        resetOtpExpiry: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
// referralCode index is defined on the field itself via unique: true + sparse: true

/**
 * Auto-generate a unique 8-character alphanumeric referral code on first save.
 * Only generates when the field is null (avoids regenerating on updates).
 */
// Mongoose 9: async pre-hooks must NOT call next() — the resolved promise signals completion.
userSchema.pre("save", async function () {
    if (this.referralCode) return;
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusable chars (0,O,1,I)
    let code;
    let attempts = 0;
    do {
        code = Array.from({ length: 8 }, () =>
            chars[Math.floor(Math.random() * chars.length)]
        ).join("");
        // eslint-disable-next-line no-await-in-loop
        const exists = await mongoose.models.User.exists({ referralCode: code });
        if (!exists) break;
        attempts++;
    } while (attempts < 10);
    this.referralCode = code;
});

export default mongoose.models.User ?? mongoose.model("User", userSchema);