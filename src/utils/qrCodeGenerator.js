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
    <html>
    <head>
      <title>PropPartner — Official Partner Invitation & QR Flyer</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0F172A;
          background: #FFFFFF;
          margin: 0;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .card {
          width: 100%;
          max-width: 580px;
          border: 2px solid #E2E8F0;
          border-radius: 20px;
          padding: 36px 30px;
          box-sizing: border-box;
        }
        .logo-img { height: 60px; object-fit: contain; margin-bottom: 8px; }
        .network-tag { font-size: 13px; font-weight: 700; color: #D4AF37; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
        .headline { font-size: 24px; font-weight: 900; color: #0F172A; margin: 0 0 10px 0; line-height: 1.25; }
        .subtext { font-size: 14px; color: #64748B; margin: 0 0 24px 0; line-height: 1.5; }
        .qr-frame {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 16px;
          display: inline-block;
          margin-bottom: 24px;
        }
        .qr-img { width: 260px; height: 260px; display: block; }
        .partner-box {
          background: #F1F5F9;
          border-radius: 12px;
          padding: 14px 20px;
          margin-bottom: 20px;
        }
        .partner-name { font-size: 18px; font-weight: 800; color: #1E293B; margin: 0 0 4px 0; }
        .partner-id { font-family: monospace; font-size: 14px; color: #475569; margin: 0; }
        .url-box { font-family: monospace; font-size: 13px; color: #1E3A8A; word-break: break-all; margin-bottom: 20px; font-weight: 600; }
        .instructions { font-size: 12px; color: #94A3B8; line-height: 1.5; border-top: 1px solid #E2E8F0; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <img src="/assets/proppartner-logo.png" alt="PropPartner" class="logo-img">
        <div class="network-tag">3D Real Estate Affiliate Partner Network</div>
        
        <h1 class="headline">${projectName ? `Exclusive Access: ${projectName}` : 'VIP Real Estate Investment Access'}</h1>
        <p class="subtext">Scan the verified QR code below using your mobile camera to explore high-yield luxury developments with priority buyer allocation.</p>

        <div class="qr-frame">
          <img src="${qrDataUrl}" alt="Partner Referral QR" class="qr-img">
        </div>

        <div class="partner-box">
          <div class="partner-name">${affiliateName || 'PropPartner Verified Affiliate'}</div>
          <div class="partner-id">Partner ID: ${affiliateId} · 90-Day Escrow Protection</div>
        </div>

        <div class="url-box">${textToEncode}</div>

        <div class="instructions">
          Point your smartphone camera at the QR code above to automatically open and lock your direct introduction.<br>
          © 2026 PropPartner Network. All transactions processed via regulated developer escrow.
        </div>
      </div>

      <script>
        window.onload = () => window.print();
      </script>
    </body>
    </html>
  `);
  printWin.document.close();
}
