import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { User } from "@shared/schema";

// @ts-ignore
import SqliteStore from "better-sqlite3-session-store";
import { pool } from "./db";

export function getSession() {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
    const SqliteSessionStore = SqliteStore(session);
    const sessionStore = new SqliteSessionStore({
        client: pool,
        expired: {
            clear: true,
            intervalMs: 900000 // ms = 15min
        }
    });
    return session({
        secret: process.env.SESSION_SECRET || "dev_secret_key",
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: sessionTtl,
        },
    });
}

export async function hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

export function setupAuth(app: Express) {
    const sessionSettings = getSession();
    app.set("trust proxy", 1);
    app.use(sessionSettings);
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
            try {
                const user = await storage.getUserByEmail(email);
                if (!user) {
                    return done(null, false, { message: "البريد الإلكتروني غير صحيح" });
                }

                // If user has no password (e.g. created via old auth), fail
                if (!user.password) {
                    return done(null, false, { message: "يرجى إعادة تعيين كلمة المرور" });
                }

                const isMatch = await comparePassword(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: "كلمة المرور غير صحيحة" });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        })
    );

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    app.post("/api/login", (req, res, next) => {
        passport.authenticate("local", (err: any, user: User, info: any) => {
            if (err) return next(err);
            if (!user) return res.status(401).json({ message: info?.message || "Authentication failed" });

            req.logIn(user, (err) => {
                if (err) return next(err);
                return res.json(user);
            });
        })(req, res, next);
    });

    app.post("/api/register", async (req, res) => {
        try {
            const { email, password, first_name, last_name } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "البريد الإلكتروني وكلمة المرور مطلوبان" });
            }

            const existingUser = await storage.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: "هذا البريد الإلكتروني مسجل مسبقاً" });
            }

            const hashedPassword = await hashPassword(password);

            const newUser = await storage.createUser({
                email,
                password: hashedPassword,
                first_name,
                last_name,
                is_active: true,
            } as any);

            // Create default subscription
            const defaultPlan = await storage.getDefaultPlan();
            if (defaultPlan) {
                const now = new Date();
                const fourteenDaysLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
                await storage.createSubscription({
                    user_id: newUser.id,
                    plan_id: defaultPlan.id,
                    status: 'trialing',
                    current_period_start: now,
                    current_period_end: fourteenDaysLater,
                    cancel_at_period_end: false,
                });
            }

            req.login(newUser, (err) => {
                if (err) throw err;
                return res.status(201).json(newUser);
            });
        } catch (error: any) {
            console.error("Registration error:", error);
            res.status(500).json({ message: "حدث خطأ أثناء التسجيل" });
        }
    });

    app.post("/api/logout", (req, res) => {
        req.logout((err) => {
            if (err) return res.status(500).json({ message: "Logout failed" });
            res.json({ message: "Logged out successfully" });
        });
    });

    app.get('/api/auth/user', (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        res.json(req.user);
    });
}

export function isAuthenticated(req: any, res: any, next: any) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
}
