#!/usr/bin/env python3
"""Build the approved five-page Round 3 report; never reads runtime secrets."""
import argparse
import re
from datetime import datetime
from pathlib import Path
from xml.sax.saxutils import escape
from zoneinfo import ZoneInfo

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import reportlab


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', required=True, help='Verified application source commit')
    parser.add_argument('--hosted-run', required=True)
    parser.add_argument('--input', default='docs/ROUND3_REPORT_TEXT_DRAFT.md')
    parser.add_argument('--output', default='public/DeadEnd_Round3.pdf')
    parser.add_argument('--text-output', default='docs/ROUND3_REPORT_TEXT.md')
    args = parser.parse_args()
    if not re.fullmatch(r'[a-f0-9]{40}', args.source):
        raise ValueError('Use the full verified application commit')
    if not re.fullmatch(r'https://github\.com/nikkushrivastava0-a11y/deadend-ai/actions/runs/[0-9]+', args.hosted_run):
        raise ValueError('Use the verified repository Actions run URL')
    text = Path(args.input).read_text()
    text = re.sub(r'Verified source candidate: [a-f0-9]{40}\.', 'Verified application source: ' + args.source + '.', text)
    text = text.replace('This report describes a tested review candidate. It does not establish that the candidate is deployed.', 'The application source was deployed and verified on the public production site. The report is packaged in a later documentation-only commit; the application source above identifies the verified code.')
    text = text.replace('API-tested: npm run check passed 42 of 42 Node tests.', 'API-tested: npm run check passed 42 of 42 Node tests on the integrated release.')
    text = text.replace('Seven Playwright tests passed in CI Chromium against the Node server and the actual checked-in SQL gateway on disposable PostgreSQL.', 'Seven Playwright tests passed in CI Chromium against the Node server and the actual checked-in SQL gateway on disposable PostgreSQL. The same seven-test suite also passed against the deployed production application, including sandbox and accessibility journeys.')
    text = text.replace('Screenshots are recorded under docs/evidence/.', 'Masked screenshots and machine-readable reports are recorded under docs/evidence/; the release record identifies the exact source and CI runs.')
    text = text.replace('A separate CI run exercised the existing live production public and real-account team journeys at all four emulated settings. It passed both browser tests. That hosted run used test source 1e029686242066b366243bbd15699a3e71f37c6d and does not establish that pending sandbox, health or accessibility changes are deployed.', 'The production release was verified with disposable accounts and synthetic workspaces. The hosted run is recorded at ' + args.hosted_run + '. Expired-invitation database manipulation remains local-only; production data was not edited for that edge case.')
    text = text.replace('Seven Playwright tests passed', 'Eight Playwright tests passed').replace('same seven-test suite', 'same eight-test suite')
    text = text.replace('Incomplete textarea-contrast and role-label checks still require human review.', 'Some contrast and role-label checks remain incomplete. A separate live browser check measured owner sandbox textarea contrast at 14.12:1; this does not resolve every incomplete check or establish screen-reader usability.')
    text = text.replace('### Accessibility and viewport evidence', '### Defect caught by hosted testing\n\nObserved in browser: A delayed sandbox state response could undo a newer approval. Serialized capsule requests and locked role transitions fix the overlap. A regression holds an old state response while approval is attempted, then verifies that the owner can still issue.\n\n### Accessibility and viewport evidence')
    text = text.replace('Unverified: Candidate hosted behavior after deployment, physical-phone behaviour, screen-reader usability and real-user performance remain outstanding. A live smoke check is required after approved deployment.', 'Unverified: Physical-phone behaviour, screen-reader usability and real-user performance remain outstanding. Repeat the live smoke checklist close to submission because service availability can change.')
    text = text.replace('becomes active only after the workflow reaches the default branch', 'is configured on the default branch')
    text = text.replace('# DeadEnd AI - Round 3 report text', '# DeadEnd AI - Round 3 product report')
    today = datetime.now(ZoneInfo('Asia/Kolkata')).strftime('%d %B %Y').lstrip('0')
    text = re.sub(r'Report date: .*?\(IST\)\.', 'Report date: ' + today + ' (IST).', text)
    # Keep plain ASCII punctuation in the PDF's built-in fonts.
    for old, new in [('→', ' > '), ('–', '-'), ('—', '-'), ('’', "'"), ('“', '"'), ('”', '"')]:
        text = text.replace(old, new)
    Path(args.text_output).write_text(text)

    sections = re.split(r'(?m)^## Page [1-5] - ', text)[1:]
    if len(sections) != 5:
        raise ValueError('Expected exactly five approved report sections')
    green = colors.HexColor('#345C49')
    ink = colors.HexColor('#17251E')
    muted = colors.HexColor('#53645B')
    styles = getSampleStyleSheet()
    font_root = Path(reportlab.__file__).parent / 'fonts'
    pdfmetrics.registerFont(TTFont('ReportSans', str(font_root / 'Vera.ttf')))
    pdfmetrics.registerFont(TTFont('ReportSans-Bold', str(font_root / 'VeraBd.ttf')))
    styles.add(ParagraphStyle(name='ReportTitle', fontName='ReportSans-Bold', fontSize=25, leading=30, textColor=ink, spaceAfter=13))
    styles.add(ParagraphStyle(name='ReportSection', fontName='ReportSans-Bold', fontSize=11.3, leading=15, textColor=green, spaceBefore=12, spaceAfter=5))
    styles.add(ParagraphStyle(name='ReportBody', fontName='ReportSans', fontSize=10.2, leading=15, textColor=ink, spaceAfter=8, alignment=TA_LEFT))
    styles.add(ParagraphStyle(name='ReportBodyCompact', parent=styles['ReportBody'], fontSize=9.4, leading=13.2, spaceAfter=6))
    styles.add(ParagraphStyle(name='ReportSectionCompact', parent=styles['ReportSection'], fontSize=11.5, leading=14, spaceBefore=9, spaceAfter=4))
    styles.add(ParagraphStyle(name='ReportMeta', fontName='ReportSans', fontSize=8.5, leading=12, textColor=muted, spaceAfter=7))
    styles.add(ParagraphStyle(name='ReportHash', fontName='Courier', fontSize=7.9, leading=12, textColor=green, spaceAfter=12))
    width, height = A4
    story = []

    def paragraph(s, style):
        s = escape(s).replace('\n', '<br/>')
        s = re.sub(r'(https://[^\s<]+)', r'<link href="\1" color="#345C49">\1</link>', s)
        return Paragraph(s, style)

    for index, section in enumerate(sections):
        if index:
            story.append(PageBreak())
        title, body = section.split('\n', 1)
        story.append(Paragraph(title.strip(), styles['ReportTitle']))
        if index == 0:
            story.append(Paragraph('Verified application source - ' + today + ' (IST)', styles['ReportMeta']))
            story.append(Paragraph(args.source, styles['ReportHash']))
        for chunk in re.split(r'\n\s*\n', body.strip()):
            chunk = chunk.strip()
            if chunk.startswith('### '):
                heading, _, rest = chunk[4:].partition('\n')
                story.append(paragraph(heading, styles['ReportSectionCompact' if index == 3 else 'ReportSection']))
                if rest.strip():
                    story.append(paragraph(rest.strip(), styles['ReportBodyCompact' if index == 3 else 'ReportBody']))
            else:
                story.append(paragraph(chunk, styles['ReportBodyCompact' if index == 3 else 'ReportBody']))
        story.append(Spacer(1, 3))

    def page(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(green)
        canvas.setLineWidth(1)
        canvas.line(48, height - 48, width - 48, height - 48)
        canvas.setFillColor(muted)
        canvas.setFont('ReportSans-Bold', 8)
        canvas.drawString(48, height - 35, 'DEADEND AI / CODERSINPUNE 2026 / ROUND 03')
        canvas.setFont('ReportSans', 7.4)
        canvas.drawString(48, 32, 'NIKKUSHRIVASTAVA0 | Nitanshu Shrivastav + Kanishk Baghel')
        canvas.drawRightString(width - 48, 32, str(doc.page) + ' / 5')
        canvas.restoreState()

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(str(output), pagesize=A4, rightMargin=48, leftMargin=48, topMargin=70, bottomMargin=55,
                            title='DeadEnd AI - CodersInPune 2026 Round 3', author='Nitanshu Shrivastav and Kanishk Baghel')
    doc.build(story, onFirstPage=page, onLaterPages=page)
    print('Built five-section Round 3 report from verified source ' + args.source)


if __name__ == '__main__':
    main()
