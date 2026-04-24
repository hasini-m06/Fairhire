// ── PDF Audit Report Export ───────────────────────────────
//
//  Generates a formatted PDF report using jsPDF.
//  This makes FairHire feel like a real product —
//  something a company would actually pay for.

let _lastResult = null;
let _lastFilename = 'dataset';

function setExportData(result, filename) {
  _lastResult = result;
  _lastFilename = filename.replace('.csv', '');
}

function exportPDF() {
  if (!_lastResult) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const W = 210; // page width mm
  const margin = 20;
  const contentW = W - margin * 2;
  let y = 0;

  // ── Helpers ────────────────────────────────────────────
  function hex(h) {
    const r = parseInt(h.slice(1,3),16);
    const g = parseInt(h.slice(3,5),16);
    const b = parseInt(h.slice(5,7),16);
    return [r, g, b];
  }

  function addPage() {
    doc.addPage();
    y = margin;
  }

  function checkPage(needed = 20) {
    if (y + needed > 280) addPage();
  }

  function text(str, x, fontSize, color, style = 'normal') {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);
    doc.text(str, x, y);
  }

  function multilineText(str, x, fontSize, color, maxWidth) {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(str, maxWidth);
    doc.text(lines, x, y);
    return lines.length;
  }

  // ── Cover / Header ─────────────────────────────────────
  // Dark header bar
  doc.setFillColor(6, 9, 15);
  doc.rect(0, 0, W, 55, 'F');

  // Accent stripe
  doc.setFillColor(79, 255, 176);
  doc.rect(0, 0, 4, 55, 'F');

  y = 18;
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 255, 176);
  doc.text('FairHire', margin, y);

  y = 28;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(136, 150, 176);
  doc.text('AI Hiring Bias Audit Report', margin, y);

  y = 38;
  doc.setFontSize(8);
  doc.setTextColor(77, 94, 120);
  const now = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(`Dataset: ${_lastFilename}   ·   Generated: ${now}   ·   Powered by Gemini 1.5 Pro`, margin, y);

  y = 48;
  doc.setFontSize(8);
  doc.setTextColor(77, 94, 120);
  doc.text('Built for Google Solution Challenge 2026  ·  BMSIT&M', margin, y);

  // ── Risk level banner ──────────────────────────────────
  y = 65;
  const riskColors = {
    HIGH:   [255, 77, 106],
    MEDIUM: [255, 184, 48],
    LOW:    [79, 255, 176]
  };
  const riskColor = riskColors[_lastResult.risk_level] || [136, 150, 176];

  doc.setFillColor(...riskColor.map(c => Math.min(255, c * 0.08 + 240)));
  doc.setDrawColor(...riskColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentW, 22, 3, 3, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('FAIRNESS RISK LEVEL', margin + 6, y + 7);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...riskColor);
  doc.text(_lastResult.risk_level, margin + 6, y + 16);

  // Summary text
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const summaryLines = doc.splitTextToSize(_lastResult.risk_summary, contentW - 55);
  doc.text(summaryLines, margin + 55, y + 9);

  y += 32;

  // ── Bias Findings ──────────────────────────────────────
  checkPage(15);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 9, 15);
  doc.text('Bias Findings', margin, y);
  y += 6;

  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentW, y);
  y += 8;

  _lastResult.findings.forEach((f, i) => {
    checkPage(28);

    // Finding number + risk chip
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 255, 176);
    doc.text(`${String(i + 1).padStart(2, '0')}`, margin, y);

    const chipColor = riskColors[f.risk] || [136, 150, 176];
    doc.setFillColor(...chipColor.map(c => Math.min(255, c * 0.15 + 230)));
    doc.setDrawColor(...chipColor);
    doc.setLineWidth(0.3);
    const chipX = margin + 8;
    doc.roundedRect(chipX, y - 4, 22, 6, 1, 1, 'FD');
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...chipColor);
    doc.text(`${f.risk} RISK`, chipX + 2, y);

    // Title
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 9, 15);
    doc.text(f.title, margin + 34, y);
    y += 6;

    // Detail
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 70, 90);
    const detailLines = doc.splitTextToSize(f.detail, contentW - 10);
    doc.text(detailLines, margin + 8, y);
    y += detailLines.length * 4.5 + 6;
  });

  // ── Recommendations ────────────────────────────────────
  checkPage(15);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 9, 15);
  doc.text('Recommendations', margin, y);
  y += 6;

  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentW, y);
  y += 8;

  _lastResult.recommendations.forEach((r, i) => {
    checkPage(30);

    // Blue left border
    doc.setFillColor(77, 159, 255);
    doc.rect(margin, y - 3, 2, 3, 'F');

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 9, 15);
    doc.text(r.title, margin + 6, y);
    y += 5.5;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 70, 90);
    const bodyLines = doc.splitTextToSize(r.body, contentW - 10);
    doc.text(bodyLines, margin + 6, y);
    y += bodyLines.length * 4.5 + 3;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(77, 159, 255);
    const actionLines = doc.splitTextToSize(`→ ${r.action}`, contentW - 10);
    doc.text(actionLines, margin + 6, y);
    y += actionLines.length * 4.5 + 8;
  });

  // ── Full analysis ──────────────────────────────────────
  checkPage(20);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 9, 15);
  doc.text('Detailed Technical Analysis', margin, y);
  y += 6;

  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentW, y);
  y += 7;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 70, 90);
  const analysisLines = doc.splitTextToSize(_lastResult.raw_analysis, contentW);
  analysisLines.forEach(line => {
    checkPage(6);
    doc.text(line, margin, y);
    y += 4.8;
  });

  // ── Footer on every page ───────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 180);
    doc.text(`FairHire Audit Report  ·  Page ${p} of ${totalPages}  ·  Confidential`, margin, 290);
    doc.text('fairhire.web.app', W - margin, 290, { align: 'right' });
  }

  // ── Save ───────────────────────────────────────────────
  doc.save(`fairhire-audit-${_lastFilename}-${Date.now()}.pdf`);
}
