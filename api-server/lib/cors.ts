export const corsHeaders = {
  "Access-Control-Allow-Origin":
    process.env.CORS_ALLOWED_ORIGIN || "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}
