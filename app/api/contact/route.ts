// Contact route intentionally removed until auth-enabled messaging is implemented.
// Return a deterministic response so the frontend can handle the disabled state.
import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    {
      error: "Contact form is disabled until secure auth-backed messaging ships.",
    },
    { status: 501 },
  )
}
