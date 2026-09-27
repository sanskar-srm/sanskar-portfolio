import {NextResponse, type NextRequest} from 'next/server';
import {profile} from '@/content/profile';
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
  if (!id) return unavailable();

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

/** Shown until a Drive link is set in /admin, so the resume buttons never lead nowhere. */
function unavailable() {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Resume — ${profile.firstName} ${profile.lastName}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#07070a;color:#ededf0;font:16px/1.6 system-ui,sans-serif;padding:24px}
main{max-width:440px}p.k{font:500 11px/1 ui-monospace,monospace;letter-spacing:.2em;text-transform:uppercase;color:#c8ff3d}
h1{font-size:34px;line-height:1.1;margin:14px 0}a{color:#07070a;background:#c8ff3d;padding:12px 22px;border-radius:999px;text-decoration:none;display:inline-block;margin:8px 8px 0 0;font-weight:600}
a.o{background:transparent;color:#ededf0;border:1px solid #ffffff26}</style></head>
<body><main><p class="k">Resume</p><h1>My resume is being updated.</h1>
<p>Check back shortly — or get in touch and I'll send it straight to you.</p>
<a href="mailto:${profile.email}?subject=Resume%20request">Email me</a><a class="o" href="/">Back to portfolio</a></main></body></html>`;
  return new NextResponse(html, {status: 200, headers: {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'}});
}
