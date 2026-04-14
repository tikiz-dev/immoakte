import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('documents').select('*').eq('id', id).eq('owner_id', user.id).single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ document: data })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  // Verify ownership
  const { data: existing } = await supabaseAdmin
    .from('documents').select('owner_id').eq('id', id).single()
  if (!existing || existing.owner_id !== user.id)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  // Only allow safe user-editable fields — never owner_id, tenancy_id, etc.
  const allowed = ['name', 'content', 'status', 'finalized_at', 'signature_mode', 'signatures'] as const
  const updates: Partial<Record<typeof allowed[number], unknown>> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }
  const { error } = await supabaseAdmin
    .from('documents').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const { error } = await supabaseAdmin
    .from('documents').delete().eq('id', id).eq('owner_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
