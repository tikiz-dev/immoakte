import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { protocolId } = await request.json()
    if (!protocolId) {
      return NextResponse.json({ error: 'protocolId fehlt' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Prüfen ob Nutzer Pro-Abo hat
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('subscription_status')
      .eq('id', user.id)
      .single()

    const hasPro = userData?.subscription_status === 'active'

    if (!hasPro) {
      // Anzahl bereits abgeschlossener Protokolle zählen
      const { count } = await supabaseAdmin
        .from('protocols')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .not('finalized_at', 'is', null)

      if ((count ?? 0) >= 1) {
        return NextResponse.json({ error: 'payment_required' }, { status: 402 })
      }
    }

    // Protokoll sperren
    const { error } = await supabaseAdmin
      .from('protocols')
      .update({
        finalized_at: new Date().toISOString(),
        status: 'final',
      })
      .eq('id', protocolId)
      .eq('owner_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Finalize error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
