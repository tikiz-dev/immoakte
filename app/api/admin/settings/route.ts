import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabaseAdmin
    .from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return user
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('app_settings').select('key, value')
    if (error) throw error
    const settings: Record<string, string> = {}
    data.forEach((row: { key: string; value: string }) => { settings[row.key] = row.value })
    return NextResponse.json({ settings })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { key, value } = await request.json()
    const { error } = await supabaseAdmin
      .from('app_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
