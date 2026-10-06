import app from "../server.js";

export default async function handler(req: any, res: any) {
  try {
    if (req.url && !req.url.startsWith("/api") && !req.url.startsWith("/auth")) {
      req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
    }
    return app(req, res);
  } catch (err: any) {
    console.error("[Vercel API Handler Error]:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(
        JSON.stringify({
          success: false,
          error: err?.message || "Erreur interne du serveur API."
        })
      );
    }
  }
}


