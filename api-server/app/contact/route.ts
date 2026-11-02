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
