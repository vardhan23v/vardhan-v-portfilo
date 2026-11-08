import { getConfig } from "./config.js";
import { AppError } from "./errors.js";
import { safeEqual } from "./hash.js";

/** Admin routes accept `Authorization: Bearer <ADMIN_TOKEN>` or Vercel Cron's `Bearer <CRON_SECRET>`. */
export function requireAdmin(req: Request): "admin" | "cron" {
  const cfg = getConfig();
  if (!cfg.ADMIN_TOKEN && !cfg.CRON_SECRET) throw new AppError(503, "admin_disabled", "Administration is not configured.");
  const m = /^Bearer\s+(.+)$/i.exec(req.headers.get("authorization") ?? "");
  const token = m?.[1]?.trim() ?? "";
  if (token && cfg.ADMIN_TOKEN && safeEqual(token, cfg.ADMIN_TOKEN)) return "admin";
  if (token && cfg.CRON_SECRET && safeEqual(token, cfg.CRON_SECRET)) return "cron";
  throw new AppError(401, "unauthorized", "Unauthorized.");
}
