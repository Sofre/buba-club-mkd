import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { corsHeaders } from "@/lib/cors"

export const runtime = "nodejs"

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : ""

const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ")

export async function POST(request: Request) {
  let payload: Record<string, unknown>

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400, headers: corsHeaders },
    )
  }

  const name = oneLine(clean(payload.name, 100))
  const surname = oneLine(clean(payload.surname, 100))
  const email = clean(payload.email, 200)
  const description = clean(payload.description, 5000)

  if (
    !name ||
    !surname ||
    !description ||
    !/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(email)
  ) {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400, headers: corsHeaders },
    )
  }

  const token = clean(payload.captchaToken, 2048)
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not configured")
    return NextResponse.json(
      { error: "Captcha not configured" },
      { status: 500, headers: corsHeaders },
    )
  }

  if (!token) {
    return NextResponse.json(
      { error: "Captcha required" },
      { status: 400, headers: corsHeaders },
    )
  }

  try {
    const verification = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret,
          response: token,
          ...(request.headers.get("x-forwarded-for")
            ? { remoteip: request.headers.get("x-forwarded-for")!.split(",")[0].trim() }
            : {}),
        }),
      },
    )
    const result = (await verification.json()) as { success?: boolean }

    if (!result.success) {
      return NextResponse.json(
        { error: "Captcha failed" },
        { status: 403, headers: corsHeaders },
      )
    }
  } catch (error) {
    console.error("Captcha verification error:", error)
    return NextResponse.json(
      { error: "Captcha verification unavailable" },
      { status: 502, headers: corsHeaders },
    )
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO } =
    process.env

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("SMTP is not configured")
    return NextResponse.json(
      { error: "Mail service not configured" },
      { status: 500, headers: corsHeaders },
    )
  }

  try {
    const port = Number(SMTP_PORT) || 465
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER.trim(), pass: SMTP_PASS.replace(/\s+/g, "") },
    })

    await transporter.sendMail({
      from: SMTP_USER.trim(),
      to: CONTACT_TO || SMTP_USER.trim(),
      replyTo: { name: `${name} ${surname}`, address: email },
      subject: `Membership request from ${name} ${surname}`,
      text: [
        `Name: ${name}`,
        `Surname: ${surname}`,
        `Email: ${email}`,
        "",
        `Description: ${description}`,
      ].join("\n"),
    })

    return NextResponse.json({ ok: true }, { headers: corsHeaders })
  } catch (error) {
    console.error("Failed to send mail:", error)
    return NextResponse.json(
      { error: "Failed to send mail" },
      { status: 500, headers: corsHeaders },
    )
  }
}
