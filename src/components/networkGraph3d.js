// Interactive 3D/Canvas Referral Network Visualization

import { networkNodes } from '../data/affiliateData.js';

export function initNetworkGraph(containerElement, tooltipElement) {
  if (!containerElement) return null;

  const canvas = document.createElement('canvas');
  containerElement.innerHTML = '';
  containerElement.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = containerElement.clientWidth || 800;
    height = containerElement.clientHeight || 500;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  // Position nodes radially around the center "YOU"
  const nodes = networkNodes.map((item, idx) => {
    if (item.type === 'hub') {
      return {
        ...item,
        x: width / 2,
        y: height / 2,
        targetX: width / 2,
        targetY: height / 2,
        currentRadius: item.size
      };
    }
    const angle = ((idx - 1) / (networkNodes.length - 1)) * Math.PI * 2 - Math.PI / 2;
    const distance = Math.min(width, height) * 0.34;
    return {
      ...item,
      baseAngle: angle,
      distance: distance,
      x: width / 2 + Math.cos(angle) * distance,
      y: height / 2 + Math.sin(angle) * distance,
      currentRadius: item.size,
      angleOffset: 0
    };
  });

  // Energy pulses traveling along links
  const pulses = [];
  function createPulse(targetIdx) {
    pulses.push({
      targetIdx,
      progress: 0,
      speed: 0.012 + Math.random() * 0.01
    });
  }

  let hoveredNode = null;
  let mouse = { x: -1000, y: -1000 };

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    let found = null;
    nodes.forEach(node => {
      const dx = mouse.x - node.x;
      const dy = mouse.y - node.y;
      if (Math.hypot(dx, dy) < node.size + 12) {
        found = node;
      }
    });

    hoveredNode = found;
    if (tooltipElement) {
      if (hoveredNode) {
        tooltipElement.style.opacity = '1';
        tooltipElement.style.transform = `translate(${mouse.x + 15}px, ${mouse.y - 30}px)`;
        tooltipElement.innerHTML = `
          <div class="network-tooltip-header">
            <span class="network-tooltip-tag" style="background:${hoveredNode.color}22; color:${hoveredNode.color}; border-color:${hoveredNode.color}55">
              ${hoveredNode.type === 'hub' ? 'Center Anchor' : 'Referral Source'}
            </span>
            <strong>${hoveredNode.label}</strong>
          </div>
          <p class="network-tooltip-sub">${hoveredNode.subtitle}</p>
          <div class="network-tooltip-potential">
            <span>Potential Yield:</span>
            <strong style="color: #D4AF37">${hoveredNode.potential}</strong>
          </div>
        `;
      } else {
        tooltipElement.style.opacity = '0';
      }
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hoveredNode = null;
    mouse.x = -1000;
    mouse.y = -1000;
    if (tooltipElement) tooltipElement.style.opacity = '0';
  });

  let animationFrame;
  let time = 0;

  function animate() {
    animationFrame = requestAnimationFrame(animate);
    time += 0.02;

    ctx.clearRect(0, 0, width, height);

    const centerNode = nodes[0];
    centerNode.x = width / 2 + Math.sin(time * 0.8) * 6;
    centerNode.y = height / 2 + Math.cos(time * 0.6) * 6;

    // Periodically spawn pulse
    if (Math.random() < 0.04) {
      const target = Math.floor(Math.random() * (nodes.length - 1)) + 1;
      createPulse(target);
    }

    // Update & Draw Connections
    for (let i = 1; i < nodes.length; i++) {
      const node = nodes[i];
      // Subtle float motion
      const currentAngle = node.baseAngle + Math.sin(time + i) * 0.08;
      const currentDist = node.distance + Math.cos(time * 1.2 + i) * 10;
      node.x = centerNode.x + Math.cos(currentAngle) * currentDist;
      node.y = centerNode.y + Math.sin(currentAngle) * currentDist;

      const isConnectedToHovered = hoveredNode && (hoveredNode.id === node.id || hoveredNode.id === 'center');

      // Draw connection line with glow
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerNode.x, centerNode.y);
      ctx.lineTo(node.x, node.y);

      if (isConnectedToHovered) {
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 15;
      } else {
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.18)';
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.restore();
    }

    // Draw Pulses
    for (let p = pulses.length - 1; p >= 0; p--) {
      const pulse = pulses[p];
      pulse.progress += pulse.speed;
      const targetNode = nodes[pulse.targetIdx];
      if (!targetNode) continue;

      const px = centerNode.x + (targetNode.x - centerNode.x) * pulse.progress;
      const py = centerNode.y + (targetNode.y - centerNode.y) * pulse.progress;

      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00f2fe';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();

      if (pulse.progress >= 1) {
        pulses.splice(p, 1);
      }
    }

    // Draw Nodes
    nodes.forEach((node) => {
      const isHovered = hoveredNode && hoveredNode.id === node.id;
      const targetSize = isHovered ? node.size * 1.25 : node.size;
      node.currentRadius += (targetSize - node.currentRadius) * 0.15;

      ctx.save();

      // Outer glow ring
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.currentRadius + 6, 0, Math.PI * 2);
      ctx.fillStyle = `${node.color}15`;
      ctx.fill();

      // Core circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = node.type === 'hub' ? '#D4AF37' : '#0F172A';
      ctx.strokeStyle = node.color;
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.shadowColor = node.color;
      ctx.shadowBlur = isHovered ? 25 : 10;
      ctx.fill();
      ctx.stroke();

      // Text label inside / below
      ctx.shadowBlur = 0;
      if (node.type === 'hub') {
        ctx.fillStyle = '#080B11';
        ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('YOU', node.x, node.y);
      } else {
        ctx.fillStyle = '#F8FAFC';
        ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + node.currentRadius + 16);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '400 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(node.potential, node.x, node.y + node.currentRadius + 30);
      }

      ctx.restore();
    });
  }

  animate();

  return {
    destroy: () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    }
  };
}
