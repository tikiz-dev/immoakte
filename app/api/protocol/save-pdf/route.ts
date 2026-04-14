import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'protocol-pdfs'

async function ensureBucket() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets()
  const exists = buckets?.some(b => b.name === BUCKET)
  if (!exists) {
    await supabaseAdmin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 52428800 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

    const formData = await request.formData()
    const pdfBlob = formData.get('pdf') as Blob
    const protocolId = formData.get('protocolId') as string

    if (!pdfBlob || !protocolId) {
      return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 })
    }
    if (pdfBlob.type && pdfBlob.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Ungültiger Dateityp' }, { status: 400 })
    }
    const MAX_PDF_SIZE = 50 * 1024 * 1024 // 50 MB
    if (pdfBlob.size > MAX_PDF_SIZE) {
      return NextResponse.json({ error: 'PDF zu groß (max. 50 MB)' }, { status: 413 })
    }

    // Verify ownership
    const { data: protocol } = await supabaseAdmin
      .from('protocols').select('owner_id').eq('id', protocolId).single()
    if (!protocol || protocol.owner_id !== user.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    await ensureBucket()

    const fileName = `${protocolId}.pdf`
    const arrayBuffer = await pdfBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(fileName)

    // Save URL to protocol
    await supabaseAdmin
      .from('protocols')
      .update({ pdf_url: publicUrl })
      .eq('id', protocolId)

    return NextResponse.json({ url: publicUrl })
  } catch (error: any) {
    console.error('save-pdf error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
