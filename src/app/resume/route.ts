import {NextResponse, type NextRequest} from 'next/server';
import {driveFileId} from '@/lib/settings';
import {getSettings} from '@/lib/settings-store';

const FILENAME = 'Sanskar-Bhadani-Resume.pdf';

/**
 * /resume            → the PDF inline (view in browser)
 * /resume?download=1 → the PDF as a download
 *
 * The PDF is fetched from the Google Drive link set in the admin panel, so the
 * site always serves the latest version without redeploying.
 */
export async function GET(req: NextRequest) {
  const {resumeUrl} = await getSettings();
  const id = resumeUrl ? driveFileId(resumeUrl) : null;
  if (!id) return NextResponse.redirect(new URL('/#contact', req.url));

  const download = req.nextUrl.searchParams.has('download');
  const viewUrl = `https://drive.google.com/file/d/${id}/view`;

  try {
    const res = await fetch(`https://drive.google.com/uc?export=download&id=${id}`, {
      next: {revalidate: 600, tags: ['resume']},
      redirect: 'follow',
    });
    const buf = new Uint8Array(await res.arrayBuffer());
    // Drive answers with an HTML page when the file isn't shared publicly.
    const isPdf = buf.length > 4 && String.fromCharCode(...buf.slice(0, 4)) === '%PDF';
    if (!res.ok || !isPdf) return NextResponse.redirect(viewUrl);

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${FILENAME}"`,
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400',
      },
    });
  } catch {
    return NextResponse.redirect(viewUrl);
  }
}
