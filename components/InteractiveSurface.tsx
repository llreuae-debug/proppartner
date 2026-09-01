"use client";

import React, { useRef, useEffect } from "react";

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
    vUv = vec2(aPosition.x * 0.5 + 0.5, 0.5 - aPosition.y * 0.5);
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec2 uImageSize;
uniform vec3 uBackground;
uniform float uHasTexture;
uniform float uFit;
uniform float uRadius;
uniform float uDepth;
uniform float uSoftness;
uniform float uShadow;
uniform float uHighlight;
uniform float uStrength;

float bumpProfile(float normalizedDistance) {
    float x = clamp(1.0 - normalizedDistance, 0.0, 1.0);
    float smoothBump = x * x * (3.0 - 2.0 * x);
    return pow(smoothBump, mix(0.7, 2.4, uSoftness));
}

vec2 fitUv(vec2 uv, out float inside) {
    float canvasAspect = uResolution.x / max(uResolution.y, 1.0);
    float imageAspect = uImageSize.x / max(uImageSize.y, 1.0);
    vec2 scale = vec2(1.0);

    if (uFit < 0.5) {
        if (canvasAspect > imageAspect) {
            scale.y = imageAspect / canvasAspect;
        } else {
            scale.x = canvasAspect / imageAspect;
        }
    } else if (uFit < 1.5) {
        if (canvasAspect > imageAspect) {
            scale.x = canvasAspect / imageAspect;
        } else {
            scale.y = imageAspect / canvasAspect;
        }
    }

    vec2 result = (uv - 0.5) * scale + 0.5;
    vec2 low = step(vec2(0.0), result);
    vec2 high = step(result, vec2(1.0));
    inside = low.x * low.y * high.x * high.y;
    return result;
}

vec3 fallbackSurface(vec2 uv) {
    float diagonal = 0.5 + 0.5 * sin((uv.x + uv.y) * 17.0);
    float broad = 0.5 + 0.5 * sin(uv.x * 5.0 - uv.y * 3.0 + 0.8);
    float texture = diagonal * 0.035 + broad * 0.055;
    return clamp(uBackground * (0.92 + texture) + vec3(texture * 0.34), 0.0, 1.0);
}

void main() {
    vec2 safeResolution = max(uResolution, vec2(1.0));
    vec2 pointerUv = uPointer / safeResolution;
    vec2 deltaPx = (vUv - pointerUv) * safeResolution;
    float distancePx = length(deltaPx);
    float normalizedDistance = distancePx / max(uRadius, 1.0);
    float height = bumpProfile(normalizedDistance) * uStrength;
    vec2 direction = deltaPx / max(distancePx, 0.0001);

    vec2 warpScale = vec2(uRadius) / safeResolution;
    vec2 warpedUv = vUv - direction * warpScale * height * uDepth * 0.105;

    float inside = 1.0;
    vec2 imageUv = fitUv(warpedUv, inside);
    vec4 sampled = texture2D(uTexture, clamp(imageUv, 0.0, 1.0));
    vec3 base = fallbackSurface(warpedUv);
    float textureMix = uHasTexture * inside * sampled.a;
    base = mix(base, sampled.rgb, textureMix);

    float x = clamp(1.0 - normalizedDistance, 0.0, 1.0);
    float slope = 6.0 * x * (1.0 - x) * uDepth * uStrength;
    vec3 normal = normalize(vec3(-direction.x * slope, direction.y * slope, 1.7));
    vec3 lightDirection = normalize(vec3(-0.55, -0.78, 1.25));
    float diffuse = dot(normal, lightDirection);
    float lightAmount = (diffuse - 0.57) * uHighlight * height;

    float ring = smoothstep(0.08, 0.58, normalizedDistance)
        * (1.0 - smoothstep(0.66, 1.28, normalizedDistance));
    float shadowDirection = 0.34 + 0.66 * max(dot(direction, vec2(0.18, 0.98)), 0.0);
    float contactShadow = ring * shadowDirection * uShadow * uStrength;

    float rimDirection = max(dot(direction, normalize(vec2(-0.55, -0.84))), 0.0);
    float rim = ring * rimDirection * uHighlight * uStrength;

    vec3 color = base;
    color *= 1.0 - contactShadow * 0.34;
    color += base * lightAmount * 0.46;
    color += vec3(rim * 0.12);

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

function parseColor(color: string): [number, number, number] {
  if (!color) return [0.039, 0.051, 0.078];
  const value = color.trim();
  if (value.startsWith("#")) {
    let hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.slice(0, 3).split("").map(c => c + c).join("");
    }
    if (hex.length >= 6) {
      return [
        parseInt(hex.slice(0, 2), 16) / 255,
        parseInt(hex.slice(2, 4), 16) / 255,
        parseInt(hex.slice(4, 6), 16) / 255
      ];
    }
  }
  return [0.039, 0.051, 0.078];
}

interface InteractiveSurfaceProps {
  image?: string;
  background?: string;
  fit?: "cover" | "contain" | "stretch";
  depth?: number;
  radius?: number;
  softness?: number;
  shadow?: number;
  highlight?: number;
  interaction?: boolean;
  touch?: boolean;
  follow?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function InteractiveSurface({
  image = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85",
  background = "#080B11",
  fit = "cover",
  depth = 0.95,
  radius = 280,
  softness = 0.42,
  shadow = 0.85,
  highlight = 0.9,
  interaction = true,
  touch = true,
  follow = 0.82,
  className = "",
  style = {}
}: InteractiveSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance"
    });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const vShader = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fShader = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vShader || !fShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const locations = {
      resolution: gl.getUniformLocation(program, "uResolution"),
      pointer: gl.getUniformLocation(program, "uPointer"),
      imageSize: gl.getUniformLocation(program, "uImageSize"),
      background: gl.getUniformLocation(program, "uBackground"),
      hasTexture: gl.getUniformLocation(program, "uHasTexture"),
      fit: gl.getUniformLocation(program, "uFit"),
      radius: gl.getUniformLocation(program, "uRadius"),
      depth: gl.getUniformLocation(program, "uDepth"),
      softness: gl.getUniformLocation(program, "uSoftness"),
      shadow: gl.getUniformLocation(program, "uShadow"),
      highlight: gl.getUniformLocation(program, "uHighlight"),
      strength: gl.getUniformLocation(program, "uStrength"),
      texture: gl.getUniformLocation(program, "uTexture")
    };

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([10, 14, 23, 255])
    );
    gl.uniform1i(locations.texture, 0);

    let imageWidth = 1;
    let imageHeight = 1;
    let hasTexture = 0;
    let disposed = false;
    let frame = 0;
    let isVisible = true;
    let width = 1;
    let height = 1;
    let lastTime = performance.now();

    const pointer = {
      x: 0.5,
      y: 0.5,
      targetX: 0.5,
      targetY: 0.5,
      strength: 0,
      targetStrength: 0
    };

    const fitVal = fit === "cover" ? 0 : fit === "contain" ? 1 : 2;
    const bgRgb = parseColor(background);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const dw = Math.max(1, Math.round(width * dpr));
      const dh = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== dw || canvas.height !== dh) {
        canvas.width = dw;
        canvas.height = dh;
        gl.viewport(0, 0, dw, dh);
      }
    };

    const draw = () => {
      gl.useProgram(program);
      gl.uniform2f(locations.resolution, width, height);
      gl.uniform2f(locations.pointer, pointer.x * width, pointer.y * height);
      gl.uniform2f(locations.imageSize, imageWidth, imageHeight);
      gl.uniform3f(locations.background, bgRgb[0], bgRgb[1], bgRgb[2]);
      gl.uniform1f(locations.hasTexture, hasTexture);
      gl.uniform1f(locations.fit, fitVal);
      gl.uniform1f(locations.radius, Math.min(radius, Math.max(width, height)));
      gl.uniform1f(locations.depth, depth);
      gl.uniform1f(locations.softness, softness);
      gl.uniform1f(locations.shadow, shadow);
      gl.uniform1f(locations.highlight, highlight);
      gl.uniform1f(locations.strength, pointer.strength);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const animate = (time: number) => {
      if (disposed || !isVisible) return;
      const delta = Math.min((time - lastTime) / 16.667, 4);
      lastTime = time;
      const retention = Math.min(Math.max(follow, 0), 0.98);
      const amount = 1 - Math.pow(retention, delta);
      pointer.x += (pointer.targetX - pointer.x) * amount;
      pointer.y += (pointer.targetY - pointer.y) * amount;
      pointer.strength += (pointer.targetStrength - pointer.strength) * amount;
      resize();
      draw();
      frame = requestAnimationFrame(animate);
    };

    const setPointer = (clientX: number, clientY: number) => {
      if (!interaction) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.targetX = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      pointer.targetY = Math.min(Math.max((clientY - rect.top) / rect.height, 0), 1);
      pointer.targetStrength = 1;
    };

    canvas.addEventListener("pointermove", e => setPointer(e.clientX, e.clientY));
    canvas.addEventListener("pointerdown", e => setPointer(e.clientX, e.clientY));
    canvas.addEventListener("pointerleave", () => {
      pointer.targetStrength = 0;
    });

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (disposed) return;
      imageWidth = img.naturalWidth || 1;
      imageHeight = img.naturalHeight || 1;
      hasTexture = 1;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      draw();
    };
    img.src = image;

    resize();
    draw();
    frame = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      img.onload = null;
      gl.deleteTexture(texture);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    };
  }, [image, background, fit, depth, radius, softness, shadow, highlight, interaction, touch, follow]);

  return (
    <div
      className={`interactive-surface-wrap ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        background,
        ...style
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          touchAction: touch && interaction ? "none" : "auto"
        }}
      />
    </div>
  );
}
