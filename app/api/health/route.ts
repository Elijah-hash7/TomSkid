import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({
      ok: false,
      error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    }, { status: 500 })
  }

  try {
    const supabase = await createClient()

    // Try a simple query — will error if URL/key are wrong
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      return NextResponse.json({
        ok: false,
        url,
        key_prefix: key.slice(0, 20) + "...",
        error: error.message,
        hint: "Keys loaded but Supabase query failed. Check that the URL and key are from the same project.",
      }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      url,
      key_prefix: key.slice(0, 20) + "...",
      message: "Connected to Supabase successfully.",
    })
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      url,
      key_prefix: key?.slice(0, 20) + "...",
      error: e?.message ?? String(e),
    }, { status: 500 })
  }
}
