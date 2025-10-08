import "dotenv/config.js";
import express from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import cors from "cors";
import helmet from "helmet";
import { neonPool } from "./dbConnector.js";
import authRoutes from "./authRoutes.js";

const app = express();
const PgStore = connectPg(session);

app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

app.use(session({
  store: new PgStore({
    pool: neonPool,
    tableName: "active_sessions",
    createTableIfMissing: true
  }),
  name: "uow_session",
  secret: process.env.SESSION_SECRET || "temporary_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,              
    maxAge: 1000 * 60 * 60      
  }
}));

function checkSession(req, res, next) {
  if (req.session?.client) return next();
  res.status(401).json({ ok: false, error: "Login required" });
}

app.use("/auth", authRoutes);

app.get("/account", checkSession, (req, res) => {
  res.json({ ok: true, user: req.session.client });
});


app.use((_req, res) => res.status(404).json({ ok: false, error: "Unable to be locate" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running : http://localhost:${PORT}`));
