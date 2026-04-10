import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
    })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { priceId, mode, protocolId } = await request.json()

    const successUrl = protocolId
      ? `${request.nextUrl.origin}/protocol/${protocolId}?finalized=true`
      : `${request.nextUrl.origin}/dashboard?payment=success`

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode || 'subscription',
      success_url: successUrl,
      cancel_url: `${request.nextUrl.origin}/protocol/${protocolId || ''}`,
      metadata: {
        userId: user.id,
        ...(protocolId ? { protocolId } : {}),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
