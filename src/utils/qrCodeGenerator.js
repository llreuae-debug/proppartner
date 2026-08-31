// PropPartner Advanced QR Code & Member Referral Engine
// Standards-compliant, real scannable QR generation with Canvas, SVG, high-res PNG export, and printable flyers

import QRCode from 'qrcode';

const BASE_DOMAIN = 'https://proppartner.pro';

/**
 * Generate standard member referral URL
 * @param {string} affiliateIdOrCode 
 * @param {string|null} projectId 
 * @returns {string}
 */
export function generateReferralUrl(affiliateIdOrCode, projectId = null) {
  const code = encodeURIComponent((affiliateIdOrCode || '').trim());
  if (projectId) {
    return `${BASE_DOMAIN}/projects/${encodeURIComponent(projectId)}?ref=${code}`;
  }
  return `${BASE_DOMAIN}/?ref=${code}`;
}

/**
 * Validates that an encoded string matches the expected member referral URL
 * @param {string} encodedText 
 * @param {string} expectedUrl 
 * @returns {boolean}
 */
export function validateQrEncoding(encodedText, expectedUrl) {
  if (!encodedText || !expectedUrl) return false;
  return encodedText.trim() === expectedUrl.trim();
}

/**
 * Render a high-resolution, scannable QR Code onto an HTML Canvas element
 * with embedded central brand emblem and error correction level H.
 * @param {HTMLCanvasElement} canvasElement 
 * @param {string} textToEncode 
 * @param {Object} options 
 * @returns {Promise<boolean>}
 */
export async function renderQrToCanvas(canvasElement, textToEncode, options = {}) {
  if (!canvasElement || !textToEncode) return false;

  const size = options.size || 280;
  const margin = options.margin !== undefined ? options.margin : 2;
  const darkColor = options.darkColor || '#0B132B'; // Deep luxury navy
  const lightColor = options.lightColor || '#FFFFFF'; // Clean white quiet zone
  const includeLogo = options.includeLogo !== false;

  try {
    // 1. Generate QR Code directly on the target canvas
    await QRCode.toCanvas(canvasElement, textToEncode, {
      width: size,
      margin: margin,
      errorCorrectionLevel: 'H', // 30% recovery capability allows center logo overlay
      color: {
        dark: darkColor,
        light: lightColor
      }
    });

    // 2. Overlay center PropPartner emblem if requested
    if (includeLogo) {
      const ctx = canvasElement.getContext('2d');
      const logoSize = Math.round(size * 0.22);
      const logoX = (canvasElement.width - logoSize) / 2;
      const logoY = (canvasElement.height - logoSize) / 2;

      // Draw white background pill for the emblem with subtle shadow
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      
      const pad = 4;
      ctx.beginPath();
      ctx.roundRect(logoX - pad, logoY - pad, logoSize + pad * 2, logoSize + pad * 2, 8);
      ctx.fill();
      ctx.restore();

      // Draw emblem image
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = '/assets/proppartner-icon.png';
      
      await new Promise((resolve) => {
        logoImg.onload = () => {
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          resolve();
        };
        logoImg.onerror = () => resolve(); // Graceful fallback
      });
    }

    return true;
  } catch (err) {
    console.error('Error rendering QR to canvas:', err);
    return false;
  }
}

/**
 * Generate a standalone SVG string of the QR code
 * @param {string} textToEncode 
 * @returns {Promise<string>}
 */
export async function generateQrSvgString(textToEncode) {
  try {
    const svgString = await QRCode.toString(textToEncode, {
      type: 'svg',
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      }
    });
    return svgString;
  } catch (err) {
    console.error('Error generating QR SVG:', err);
    return '';
  }
}

/**
 * Generate and download a High-Resolution (1200x1400) Branded Marketing Card PNG
 * @param {string} textToEncode 
 * @param {string} affiliateName 
 * @param {string} affiliateId 
 * @param {string|null} projectName 
 */
export async function downloadBrandedQrPng(textToEncode, affiliateName, affiliateId, projectName = null) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1480;
  const ctx = canvas.getContext('2d');

  // Background Gradient (Dark Luxury Theme)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1480);
  bgGrad.addColorStop(0, '#0A0F1D');
  bgGrad.addColorStop(0.5, '#060911');
  bgGrad.addColorStop(1, '#04060A');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 1480);

  // Outer Golden Border
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, 1140, 1420);

  // Header Title & Logo Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PROPPARTNER', 600, 110);

  ctx.fillStyle = '#D4AF37';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('3D REAL ESTATE AFFILIATE NETWORK', 600, 150);

  // Divider Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 185);
  ctx.lineTo(1100, 185);
  ctx.stroke();

  // Project / Scope Banner
  if (projectName) {
    ctx.fillStyle = 'rgba(0, 242, 254, 0.12)';
    ctx.beginPath();
    ctx.roundRect(150, 215, 900, 60, 12);
    ctx.fill();
    ctx.fillStyle = '#00F2FE';
    ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`EXCLUSIVE DEVELOPMENT: ${projectName.toUpperCase()}`, 600, 255);
  } else {
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.beginPath();
    ctx.roundRect(150, 215, 900, 60, 12);
    ctx.fill();
    ctx.fillStyle = '#34D399';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('OFFICIAL VERIFIED PARTNER INVITATION', 600, 255);
  }

  // QR Code White Card Container
  const qrCardX = 200;
  const qrCardY = 310;
  const qrCardW = 800;
  const qrCardH = 800;

  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.roundRect(qrCardX, qrCardY, qrCardW, qrCardH, 24);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Render QR Code inside Card
  const qrCanvas = document.createElement('canvas');
  await renderQrToCanvas(qrCanvas, textToEncode, {
    size: 720,
    margin: 1,
    includeLogo: true
  });
  ctx.drawImage(qrCanvas, qrCardX + 40, qrCardY + 40, 720, 720);

  // Affiliate Credentials
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(affiliateName || 'Authorized Partner', 600, 1180);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '24px monospace';
  ctx.fillText(`Partner ID: ${affiliateId} · 90-Day Escrow Protection`, 600, 1225);

  // Link Text Box
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.beginPath();
  ctx.roundRect(120, 1260, 960, 64, 12);
  ctx.fill();

  ctx.fillStyle = '#D4AF37';
  ctx.font = '22px monospace';
  ctx.fillText(textToEncode, 600, 1302);

  // Footer Reassurance
  ctx.fillStyle = '#64748B';
  ctx.font = '18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Scan with smartphone camera to view development & register inquiry.', 600, 1370);
  ctx.fillText('© 2026 PropPartner Network · Institutional Escrow Protected', 600, 1400);

  // Trigger Download
  const link = document.createElement('a');
  link.download = `PropPartner_QR_${affiliateId}_${projectName ? projectName.replace(/\s+/g, '_') : 'General'}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Download pure QR Code as SVG vector file
 * @param {string} textToEncode 
 * @param {string} affiliateId 
 */
export async function downloadQrSvg(textToEncode, affiliateId) {
  const svgData = await generateQrSvgString(textToEncode);
  if (!svgData) return;

  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `PropPartner_QR_${affiliateId}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Open a clean, high-resolution Printable Marketing Flyer in browser print dialog
 * @param {string} textToEncode 
 * @param {string} affiliateName 
 * @param {string} affiliateId 
 * @param {string|null} projectName 
 */
export async function printQrFlyer(textToEncode, affiliateName, affiliateId, projectName = null) {
  const qrDataUrl = await QRCode.toDataURL(textToEncode, {
    width: 600,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: '#0F172A', light: '#FFFFFF' }
  });

  const printWin = window.open('', '_blank');
  if (!printWin) return;

  printWin.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>PropPartner — Official Partner Invitation & QR Flyer</title>
      <style>
        @page { size: A4 portrait; margin: 12mm 15mm 15mm 15mm; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0F172A;
          background: #FFFFFF;
          margin: 0;
          padding: 10px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .card {
          width: 100%;
          max-width: 620px;
          border: 2px solid #D4AF37;
          border-radius: 20px;
          padding: 32px 30px;
          box-sizing: border-box;
          background: #FFFFFF;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
        }
        .flyer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #E2E8F0;
          padding-bottom: 16px;
          margin-bottom: 20px;
          text-align: left;
        }
        .logo-img { height: 48px; object-fit: contain; }
        .header-meta-tag {
          text-align: right;
          font-size: 9.5px;
          color: #64748B;
        }
        .header-meta-tag strong { color: #0F172A; }
        .network-tag { font-size: 11px; font-weight: 800; color: #D4AF37; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .headline { font-size: 22px; font-weight: 900; color: #0F172A; margin: 0 0 8px 0; line-height: 1.25; }
        .subtext { font-size: 12.5px; color: #475569; margin: 0 0 20px 0; line-height: 1.5; }
        .qr-frame {
          background: #F8FAFC;
          border: 2px solid #E2E8F0;
          border-radius: 16px;
          padding: 14px;
          display: inline-block;
          margin-bottom: 18px;
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.04);
        }
        .qr-img { width: 220px; height: 220px; display: block; }
        .partner-box {
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 12px 18px;
          margin-bottom: 16px;
        }
        .partner-name { font-size: 16px; font-weight: 800; color: #1E293B; margin: 0 0 2px 0; }
        .partner-id { font-family: monospace; font-size: 12px; color: #475569; margin: 0; }
        .url-box { font-family: monospace; font-size: 11.5px; color: #1E3A8A; word-break: break-all; margin-bottom: 16px; font-weight: 600; background: #EFF6FF; padding: 6px 12px; border-radius: 6px; border: 1px solid #BFDBFE; display: inline-block; }
        .instructions { font-size: 11px; color: #64748B; line-height: 1.5; border-top: 1px solid #E2E8F0; padding-top: 14px; margin-bottom: 20px; }
        
        /* Corporate Footer with Address */
        .flyer-footer {
          border-top: 2px solid #D4AF37;
          padding-top: 14px;
          font-size: 9px;
          color: #64748B;
          text-align: left;
          line-height: 1.5;
        }
        .flyer-footer-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 12px;
        }
        .flyer-footer-grid strong {
          color: #0F172A;
          display: block;
          margin-bottom: 2px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <!-- Top Branded Header -->
        <div class="flyer-header">
          <div>
            <img src="/assets/proppartner-logo.png" alt="PropPartner" class="logo-img" onerror="this.src='/assets/proppartner-icon.svg';">
          </div>
          <div class="header-meta-tag">
            <div><strong>PROPPARTNER NETWORK</strong></div>
            <div>Verified Partner Invitation</div>
            <div>Ref: <code>${affiliateId}</code></div>
          </div>
        </div>

        <div class="network-tag">3D Real Estate Affiliate Partner Network</div>
        
        <h1 class="headline">${projectName ? `Exclusive Access: ${projectName}` : 'VIP Real Estate Investment Access'}</h1>
        <p class="subtext">Scan the verified QR code below using your mobile camera to explore premier luxury developments with priority buyer allocation and 90-day escrow attribution.</p>

        <div class="qr-frame">
          <img src="${qrDataUrl}" alt="Partner Referral QR" class="qr-img">
        </div>

        <div class="partner-box">
          <div class="partner-name">${affiliateName || 'PropPartner Verified Affiliate'}</div>
          <div class="partner-id">Partner ID: <code>${affiliateId}</code> · Regulated Developer Escrow</div>
        </div>

        <div>
          <div class="url-box">${textToEncode}</div>
        </div>

        <div class="instructions">
          Point your smartphone camera at the QR code above to automatically open and lock your direct introduction.<br>
          All buyer transactions are secured through regulated developer escrow accounts and certified milestones.
        </div>

        <!-- Corporate Address Footer -->
        <footer class="flyer-footer">
          <div class="flyer-footer-grid">
            <div>
              <strong>PropPartner Global Real Estate Network Ltd.</strong>
              Level 24, Boulevard Financial Tower, Financial Center Road<br>
              Downtown Financial District, Dubai, UAE / Main Boulevard, Karachi
            </div>
            <div style="text-align: right;">
              <strong>Direct Verification & Concierge Desk</strong>
              Email: support@proppartner.pro • Web: https://proppartner.pro<br>
              Direct: +971 4 200 8899 / +92 21 3581 0000
            </div>
          </div>
        </footer>
      </div>

      <script>
        window.onload = () => window.print();
      </script>
    </body>
    </html>
  `);
  printWin.document.close();
}

