import * as faceapi from 'face-api.js';
import { BloomEffect, ChromaticAberrationEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './GridScan.css';

const vert = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const frag = `
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec2 uSkew;
uniform float uTilt;
uniform float uYaw;
uniform float uLineThickness;
uniform vec3 uLinesColor;
uniform vec3 uScanColor;
uniform float uGridScale;
uniform float uLineStyle;
uniform float uLineJitter;
uniform float uScanOpacity;
uniform float uScanDirection;
uniform float uNoise;
uniform float uBloomOpacity;
uniform float uScanGlow;
uniform float uScanSoftness;
uniform float uPhaseTaper;
uniform float uScanDuration;
uniform float uScanDelay;
varying vec2 vUv;
uniform float uScanStarts[8];
uniform float uScanCount;
const int MAX_SCANS = 8;

float smoother01(float a, float b, float x){
  float t = clamp((x - a) / max(1e-5, (b - a)), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  vec3 ro = vec3(0.0);
  vec3 rd = normalize(vec3(p, 2.0));
  float cR = cos(uTilt), sR = sin(uTilt);
  rd.xy = mat2(cR,-sR,sR,cR)*rd.xy;
  float cY = cos(uYaw), sY = sin(uYaw);
  rd.xz = mat2(cY,-sY,sY,cY)*rd.xz;
  vec2 skew = clamp(uSkew,vec2(-0.7),vec2(0.7));
  rd.xy += skew*rd.z;
  vec3 color = vec3(0.0);
  float minT = 1e20;
  float gridScale = max(1e-5, uGridScale);
  float fadeStrength = 2.0;
  vec2 gridUV = vec2(0.0);
  float hitIsY = 1.0;
  for(int i=0;i<4;i++){
    float isY = float(i<2);
    float pos = mix(-0.2,0.2,float(i))*isY + mix(-0.5,0.5,float(i-2))*(1.0-isY);
    float num = pos-(isY*ro.y+(1.0-isY)*ro.x);
    float den = isY*rd.y+(1.0-isY)*rd.x;
    float t = num/den;
    vec3 h = ro+rd*t;
    float depthBoost = smoothstep(0.0,3.0,h.z);
    h.xy += skew*0.15*depthBoost;
    bool use = t>0.0 && t<minT;
    gridUV = use ? mix(h.zy,h.xz,isY)/gridScale : gridUV;
    minT = use ? t : minT;
    hitIsY = use ? isY : hitIsY;
  }
  vec3 hit = ro+rd*minT;
  float dist = length(hit-ro);
  float jitterAmt = clamp(uLineJitter,0.0,1.0);
  if(jitterAmt>0.0){
    vec2 j = vec2(sin(gridUV.y*2.7+iTime*1.8),cos(gridUV.x*2.3-iTime*1.6))*(0.15*jitterAmt);
    gridUV += j;
  }
  float fx=fract(gridUV.x); float fy=fract(gridUV.y);
  float ax=min(fx,1.0-fx); float ay=min(fy,1.0-fy);
  float wx=fwidth(gridUV.x); float wy=fwidth(gridUV.y);
  float halfPx=max(0.0,uLineThickness)*0.5;
  float tx=halfPx*wx; float ty=halfPx*wy;
  float lineX=1.0-smoothstep(tx,tx+wx,ax);
  float lineY=1.0-smoothstep(ty,ty+wy,ay);
  if(uLineStyle>0.5){
    float vy=fract(gridUV.y*4.0); float vx=fract(gridUV.x*4.0);
    if(uLineStyle<1.5){ lineX*=step(vy,0.5); lineY*=step(vx,0.5); }
    else{
      float cy=abs(fract(gridUV.y*6.0)-0.5); float cx=abs(fract(gridUV.x*6.0)-0.5);
      lineX*=1.0-smoothstep(0.18,0.18+fwidth(gridUV.y*6.0),cy);
      lineY*=1.0-smoothstep(0.18,0.18+fwidth(gridUV.x*6.0),cx);
    }
  }
  float primaryMask=max(lineX,lineY);
  vec2 gridUV2=(hitIsY>0.5?hit.xz:hit.zy)/gridScale;
  if(jitterAmt>0.0){
    vec2 j2=vec2(cos(gridUV2.y*2.1-iTime*1.4),sin(gridUV2.x*2.5+iTime*1.7))*(0.15*jitterAmt);
    gridUV2+=j2;
  }
  float fx2=fract(gridUV2.x); float fy2=fract(gridUV2.y);
  float ax2=min(fx2,1.0-fx2); float ay2=min(fy2,1.0-fy2);
  float wx2=fwidth(gridUV2.x); float wy2=fwidth(gridUV2.y);
  float tx2=halfPx*wx2; float ty2=halfPx*wy2;
  float lineX2=1.0-smoothstep(tx2,tx2+wx2,ax2);
  float lineY2=1.0-smoothstep(ty2,ty2+wy2,ay2);
  if(uLineStyle>0.5){
    float vy2=fract(gridUV2.y*4.0); float vx2=fract(gridUV2.x*4.0);
    if(uLineStyle<1.5){ lineX2*=step(vy2,0.5); lineY2*=step(vx2,0.5); }
    else{
      float cy2=abs(fract(gridUV2.y*6.0)-0.5); float cx2=abs(fract(gridUV2.x*6.0)-0.5);
      lineX2*=1.0-smoothstep(0.18,0.18+fwidth(gridUV2.y*6.0),cy2);
      lineY2*=1.0-smoothstep(0.18,0.18+fwidth(gridUV2.x*6.0),cx2);
    }
  }
  float altMask=max(lineX2,lineY2);
  float edgeDistX=min(abs(hit.x-(-0.5)),abs(hit.x-0.5));
  float edgeDistY=min(abs(hit.y-(-0.2)),abs(hit.y-0.2));
  float edgeDist=mix(edgeDistY,edgeDistX,hitIsY);
  altMask*=1.0-smoothstep(gridScale*0.5,gridScale*2.0,edgeDist);
  float lineMask=max(primaryMask,altMask);
  float fade=exp(-dist*fadeStrength);
  float dur=max(0.05,uScanDuration); float del=max(0.0,uScanDelay);
  float scanZMax=2.0;
  float sigma=max(0.001,0.18*max(0.1,uScanGlow)*uScanSoftness);
  float sigmaA=sigma*2.0;
  float combinedPulse=0.0; float combinedAura=0.0;
  float cycle=dur+del; float tCycle=mod(iTime,cycle);
  float scanPhase=clamp((tCycle-del)/dur,0.0,1.0);
  float phase=scanPhase;
  if(uScanDirection>0.5&&uScanDirection<1.5) phase=1.0-phase;
  else if(uScanDirection>1.5){ float t2=mod(max(0.0,iTime-del),2.0*dur); phase=(t2<dur)?(t2/dur):(1.0-(t2-dur)/dur); }
  float scanZ=phase*scanZMax;
  float dz=abs(hit.z-scanZ);
  float lineBand=exp(-0.5*(dz*dz)/(sigma*sigma));
  float taper=clamp(uPhaseTaper,0.0,0.49);
  float phaseWindow=smoother01(0.0,taper,phase)*(1.0-smoother01(1.0-taper,1.0,phase));
  combinedPulse+=lineBand*phaseWindow*clamp(uScanOpacity,0.0,1.0);
  combinedAura+=(exp(-0.5*(dz*dz)/(sigmaA*sigmaA))*0.25)*phaseWindow*clamp(uScanOpacity,0.0,1.0);
  for(int i=0;i<MAX_SCANS;i++){
    if(float(i)>=uScanCount) break;
    float tA=iTime-uScanStarts[i];
    float phI=clamp(tA/dur,0.0,1.0);
    if(uScanDirection>0.5&&uScanDirection<1.5) phI=1.0-phI;
    else if(uScanDirection>1.5) phI=(phI<0.5)?(phI*2.0):(1.0-(phI-0.5)*2.0);
    float szI=phI*scanZMax; float dzI=abs(hit.z-szI);
    float lbI=exp(-0.5*(dzI*dzI)/(sigma*sigma));
    float pwI=smoother01(0.0,taper,phI)*(1.0-smoother01(1.0-taper,1.0,phI));
    combinedPulse+=lbI*pwI*clamp(uScanOpacity,0.0,1.0);
    combinedAura+=(exp(-0.5*(dzI*dzI)/(sigmaA*sigmaA))*0.25)*pwI*clamp(uScanOpacity,0.0,1.0);
  }
  color=uLinesColor*lineMask*fade+uScanColor*combinedPulse+uScanColor*combinedAura;
  float n=fract(sin(dot(gl_FragCoord.xy+vec2(iTime*123.4),vec2(12.9898,78.233)))*43758.5453123);
  color+=(n-0.5)*uNoise;
  color=clamp(color,0.0,1.0);
  float alpha=clamp(max(lineMask,combinedPulse),0.0,1.0);
  float halo=max(1.0-smoothstep(tx*2.0,tx*2.0+wx*2.0,ax),1.0-smoothstep(ty*2.0,ty*2.0+wy*2.0,ay))*fade;
  alpha=max(alpha,halo*clamp(uBloomOpacity,0.0,1.0));
  fragColor=vec4(color,alpha);
}
void main(){ vec4 c; mainImage(c,vUv*iResolution.xy); gl_FragColor=c; }
`;

export interface GridScanProps {
  enableWebcam?: boolean;
  showPreview?: boolean;
  modelsPath?: string;
  sensitivity?: number;
  lineThickness?: number;
  linesColor?: string;
  scanColor?: string;
  scanOpacity?: number;
  gridScale?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  lineJitter?: number;
  scanDirection?: 'forward' | 'backward' | 'pingpong';
  enablePost?: boolean;
  bloomIntensity?: number;
  bloomThreshold?: number;
  bloomSmoothing?: number;
  chromaticAberration?: number;
  noiseIntensity?: number;
  scanGlow?: number;
  scanSoftness?: number;
  scanPhaseTaper?: number;
  scanDuration?: number;
  scanDelay?: number;
  enableGyro?: boolean;
  scanOnClick?: boolean;
  snapBackDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const GridScan = ({
  enableWebcam = false,
  showPreview = false,
  modelsPath = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights',
  sensitivity = 0.55,
  lineThickness = 1,
  linesColor = '#2F293A',
  scanColor = '#FF9FFC',
  scanOpacity = 0.4,
  gridScale = 0.1,
  lineStyle = 'solid',
  lineJitter = 0.1,
  scanDirection = 'pingpong',
  enablePost = true,
  bloomIntensity = 0,
  bloomThreshold = 0,
  bloomSmoothing = 0,
  chromaticAberration = 0.002,
  noiseIntensity = 0.01,
  scanGlow = 0.5,
  scanSoftness = 2,
  scanPhaseTaper = 0.9,
  scanDuration = 2.0,
  scanDelay = 2.0,
  enableGyro = false,
  scanOnClick = false,
  snapBackDelay = 250,
  className,
  style,
}: GridScanProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomRef = useRef<BloomEffect | null>(null);
  const chromaRef = useRef<ChromaticAberrationEffect | null>(null);
  const rafRef = useRef<number>(0);
  const [modelsReady, setModelsReady] = useState(false);
  const [uiFaceActive, setUiFaceActive] = useState(false);
  const lookTarget = useRef(new THREE.Vector2(0, 0));
  const tiltTarget = useRef(0);
  const yawTarget = useRef(0);
  const lookCurrent = useRef(new THREE.Vector2(0, 0));
  const lookVel = useRef(new THREE.Vector2(0, 0));
  const tiltCurrent = useRef(0);
  const tiltVel = useRef(0);
  const yawCurrent = useRef(0);
  const yawVel = useRef(0);
  const MAX_SCANS = 8;
  const scanStartsRef = useRef<number[]>([]);
  const bufX = useRef<number[]>([]);
  const bufY = useRef<number[]>([]);
  const bufT = useRef<number[]>([]);
  const bufYaw = useRef<number[]>([]);

  const s = THREE.MathUtils.clamp(sensitivity, 0, 1);
  const skewScale = THREE.MathUtils.lerp(0.06, 0.2, s);
  const tiltScale = THREE.MathUtils.lerp(0.12, 0.3, s);
  const yawScale = THREE.MathUtils.lerp(0.1, 0.28, s);
  const depthResponse = THREE.MathUtils.lerp(0.25, 0.45, s);
  const smoothTime = THREE.MathUtils.lerp(0.45, 0.12, s);
  const maxSpeed = Infinity;
  const yBoost = THREE.MathUtils.lerp(1.2, 1.6, s);

  const pushScan = (t: number) => {
    const arr = scanStartsRef.current.slice();
    if (arr.length >= MAX_SCANS) arr.shift();
    arr.push(t);
    scanStartsRef.current = arr;
    if (materialRef.current) {
      const u = materialRef.current.uniforms;
      const buf = new Array(MAX_SCANS).fill(0);
      for (let i = 0; i < arr.length && i < MAX_SCANS; i++) buf[i] = arr[i];
      u.uScanStarts.value = buf;
      u.uScanCount.value = arr.length;
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let leaveTimer: ReturnType<typeof setTimeout> | null = null;
    const onMove = (e: MouseEvent) => {
      if (uiFaceActive) return;
      if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
      const rect = el.getBoundingClientRect();
      lookTarget.current.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -(((e.clientY - rect.top) / rect.height) * 2 - 1));
    };
    const onClick = async () => {
      const nowSec = performance.now() / 1000;
      if (scanOnClick) pushScan(nowSec);
      if (enableGyro && (window as any).DeviceOrientationEvent?.requestPermission) {
        try { await (DeviceOrientationEvent as any).requestPermission(); } catch { /**/ }
      }
    };
    const onLeave = () => {
      if (uiFaceActive) return;
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => { lookTarget.current.set(0, 0); tiltTarget.current = 0; yawTarget.current = 0; }, Math.max(0, snapBackDelay || 0));
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseenter', () => { if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; } });
    if (scanOnClick) el.addEventListener('click', onClick);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      if (scanOnClick) el.removeEventListener('click', onClick);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, [uiFaceActive, snapBackDelay, scanOnClick, enableGyro]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    const uniforms: Record<string, THREE.IUniform> = {
      iResolution: { value: new THREE.Vector3(container.clientWidth, container.clientHeight, renderer.getPixelRatio()) },
      iTime: { value: 0 }, uSkew: { value: new THREE.Vector2(0, 0) }, uTilt: { value: 0 }, uYaw: { value: 0 },
      uLineThickness: { value: lineThickness }, uLinesColor: { value: srgbColor(linesColor) },
      uScanColor: { value: srgbColor(scanColor) }, uGridScale: { value: gridScale },
      uLineStyle: { value: lineStyle === 'dashed' ? 1 : lineStyle === 'dotted' ? 2 : 0 },
      uLineJitter: { value: Math.max(0, Math.min(1, lineJitter || 0)) }, uScanOpacity: { value: scanOpacity },
      uNoise: { value: noiseIntensity }, uBloomOpacity: { value: bloomIntensity }, uScanGlow: { value: scanGlow },
      uScanSoftness: { value: scanSoftness }, uPhaseTaper: { value: scanPhaseTaper },
      uScanDuration: { value: scanDuration }, uScanDelay: { value: scanDelay },
      uScanDirection: { value: scanDirection === 'backward' ? 1 : scanDirection === 'pingpong' ? 2 : 0 },
      uScanStarts: { value: new Array(MAX_SCANS).fill(0) }, uScanCount: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, depthTest: false });
    materialRef.current = material;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);
    if (enablePost) {
      const composer = new EffectComposer(renderer);
      composerRef.current = composer;
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new BloomEffect({ intensity: 1.0, luminanceThreshold: bloomThreshold, luminanceSmoothing: bloomSmoothing });
      bloom.blendMode.opacity.value = Math.max(0, bloomIntensity);
      bloomRef.current = bloom;
      const chroma = new ChromaticAberrationEffect({ offset: new THREE.Vector2(chromaticAberration, chromaticAberration), radialModulation: true, modulationOffset: 0.0 });
      chromaRef.current = chroma;
      const ep = new EffectPass(camera, bloom, chroma);
      ep.renderToScreen = true;
      composer.addPass(ep);
    }
    const onResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      material.uniforms.iResolution.value.set(container.clientWidth, container.clientHeight, renderer.getPixelRatio());
      if (composerRef.current) composerRef.current.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;
      lookCurrent.current.copy(smoothDampVec2(lookCurrent.current, lookTarget.current, lookVel.current, smoothTime, maxSpeed, dt));
      const tiltSm = smoothDampFloat(tiltCurrent.current, tiltTarget.current, { v: tiltVel.current }, smoothTime, maxSpeed, dt);
      tiltCurrent.current = tiltSm.value; tiltVel.current = tiltSm.v;
      const yawSm = smoothDampFloat(yawCurrent.current, yawTarget.current, { v: yawVel.current }, smoothTime, maxSpeed, dt);
      yawCurrent.current = yawSm.value; yawVel.current = yawSm.v;
      material.uniforms.uSkew.value.set(lookCurrent.current.x * skewScale, -lookCurrent.current.y * yBoost * skewScale);
      material.uniforms.uTilt.value = tiltCurrent.current * tiltScale;
      material.uniforms.uYaw.value = THREE.MathUtils.clamp(yawCurrent.current * yawScale, -0.6, 0.6);
      material.uniforms.iTime.value = now / 1000;
      renderer.clear(true, true, true);
      if (composerRef.current) composerRef.current.render(dt); else renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      material.dispose(); quad.geometry.dispose();
      if (composerRef.current) { composerRef.current.dispose(); composerRef.current = null; }
      renderer.dispose(); renderer.forceContextLoss();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [sensitivity, lineThickness, linesColor, scanColor, scanOpacity, gridScale, lineStyle, lineJitter, scanDirection, enablePost, noiseIntensity, bloomIntensity, scanGlow, scanSoftness, scanPhaseTaper, scanDuration, scanDelay, bloomThreshold, bloomSmoothing, chromaticAberration, smoothTime, maxSpeed, skewScale, yBoost, tiltScale, yawScale]);

  useEffect(() => {
    const m = materialRef.current;
    if (!m) return;
    const u = m.uniforms;
    u.uLineThickness.value = lineThickness; u.uLinesColor.value.copy(srgbColor(linesColor));
    u.uScanColor.value.copy(srgbColor(scanColor)); u.uGridScale.value = gridScale;
    u.uLineStyle.value = lineStyle === 'dashed' ? 1 : lineStyle === 'dotted' ? 2 : 0;
    u.uLineJitter.value = Math.max(0, Math.min(1, lineJitter || 0));
    u.uBloomOpacity.value = Math.max(0, bloomIntensity); u.uNoise.value = Math.max(0, noiseIntensity);
    u.uScanGlow.value = scanGlow; u.uScanOpacity.value = Math.max(0, Math.min(1, scanOpacity));
    u.uScanDirection.value = scanDirection === 'backward' ? 1 : scanDirection === 'pingpong' ? 2 : 0;
    u.uScanSoftness.value = scanSoftness; u.uPhaseTaper.value = scanPhaseTaper;
    u.uScanDuration.value = Math.max(0.05, scanDuration); u.uScanDelay.value = Math.max(0.0, scanDelay);
    if (bloomRef.current) { bloomRef.current.blendMode.opacity.value = Math.max(0, bloomIntensity); bloomRef.current.luminanceMaterial.threshold = bloomThreshold; bloomRef.current.luminanceMaterial.smoothing = bloomSmoothing; }
    if (chromaRef.current) chromaRef.current.offset.set(chromaticAberration, chromaticAberration);
  }, [lineThickness, linesColor, scanColor, gridScale, lineStyle, lineJitter, bloomIntensity, bloomThreshold, bloomSmoothing, chromaticAberration, noiseIntensity, scanGlow, scanOpacity, scanDirection, scanSoftness, scanPhaseTaper, scanDuration, scanDelay]);

  useEffect(() => {
    if (!enableGyro) return;
    const handler = (e: DeviceOrientationEvent) => {
      if (uiFaceActive) return;
      const gamma = e.gamma ?? 0; const beta = e.beta ?? 0;
      lookTarget.current.set(THREE.MathUtils.clamp(gamma / 45, -1, 1), THREE.MathUtils.clamp(-beta / 30, -1, 1));
      tiltTarget.current = THREE.MathUtils.degToRad(gamma) * 0.4;
    };
    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, [enableGyro, uiFaceActive]);

  useEffect(() => {
    if (!enableWebcam) return;
    let canceled = false;
    (async () => {
      try {
        await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath), faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelsPath)]);
        if (!canceled) setModelsReady(true);
      } catch { if (!canceled) setModelsReady(false); }
    })();
    return () => { canceled = true; };
  }, [modelsPath, enableWebcam]);

  useEffect(() => {
    if (!enableWebcam || !modelsReady) return;
    let stop = false; let lastDetect = 0;
    const video = videoRef.current;
    if (!video) return;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        video.srcObject = stream; await video.play();
      } catch { return; }
      const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
      const detect = async (ts: number) => {
        if (stop) return;
        if (ts - lastDetect >= 33) {
          lastDetect = ts;
          try {
            const res = await faceapi.detectSingleFace(video, opts).withFaceLandmarks(true);
            if (res?.detection) {
              const box = res.detection.box; const vw = video.videoWidth || 1; const vh = video.videoHeight || 1;
              medianPush(bufX.current, ((box.x + box.width * 0.5) / vw) * 2 - 1, 5);
              medianPush(bufY.current, ((box.y + box.height * 0.5) / vh) * 2 - 1, 5);
              const faceSize = Math.min(1, Math.hypot(box.width / vw, box.height / vh));
              lookTarget.current.copy(new THREE.Vector2(Math.tanh(median(bufX.current)), Math.tanh(median(bufY.current))).multiplyScalar(1 + depthResponse * (faceSize - 0.25)));
              const lc = centroid(res.landmarks.getLeftEye()); const rc = centroid(res.landmarks.getRightEye());
              medianPush(bufT.current, Math.atan2(rc.y - lc.y, rc.x - lc.x), 5);
              tiltTarget.current = median(bufT.current);
              const nose = res.landmarks.getNose(); const tip = nose[nose.length - 1];
              const jaw = res.landmarks.getJawOutline();
              const eyeDist = Math.hypot(rc.x - lc.x, rc.y - lc.y) + 1e-6;
              medianPush(bufYaw.current, Math.tanh(THREE.MathUtils.clamp((dist2(tip, jaw[13] || jaw[14]) - dist2(tip, jaw[3] || jaw[2])) / (eyeDist * 1.6), -1, 1)), 5);
              yawTarget.current = median(bufYaw.current);
              setUiFaceActive(true);
            } else setUiFaceActive(false);
          } catch { setUiFaceActive(false); }
        }
        if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) (video as any).requestVideoFrameCallback(() => detect(performance.now()));
        else requestAnimationFrame(detect);
      };
      requestAnimationFrame(detect);
    })();
    return () => {
      stop = true;
      if (video) { const s = video.srcObject as MediaStream; if (s) s.getTracks().forEach(t => t.stop()); video.pause(); video.srcObject = null; }
    };
  }, [enableWebcam, modelsReady, depthResponse]);

  return (
    <div ref={containerRef} className={`gridscan${className ? ` ${className}` : ''}`} style={style}>
      {showPreview && (
        <div className="gridscan__preview">
          <video ref={videoRef} muted playsInline autoPlay className="gridscan__video" />
          <div className="gridscan__badge">
            {enableWebcam ? (modelsReady ? (uiFaceActive ? 'Face: tracking' : 'Face: searching') : 'Loading models') : 'Webcam disabled'}
          </div>
        </div>
      )}
    </div>
  );
};

export default GridScan;

function srgbColor(hex: string): THREE.Color { return new THREE.Color(hex).convertSRGBToLinear(); }

function smoothDampVec2(current: THREE.Vector2, target: THREE.Vector2, vel: THREE.Vector2, st: number, ms: number, dt: number): THREE.Vector2 {
  st = Math.max(0.0001, st); const omega = 2 / st; const x = omega * dt;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = current.clone().sub(target); const orig = target.clone();
  const mc = ms * st; if (change.length() > mc) change.setLength(mc);
  const at = current.clone().sub(change);
  const temp = vel.clone().addScaledVector(change, omega).multiplyScalar(dt);
  vel.sub(temp.clone().multiplyScalar(omega)).multiplyScalar(exp);
  const out = at.clone().add(change.add(temp).multiplyScalar(exp));
  if (orig.clone().sub(current).dot(out.clone().sub(orig)) > 0) { out.copy(orig); vel.set(0, 0); }
  return out;
}

function smoothDampFloat(current: number, target: number, velRef: { v: number }, st: number, ms: number, dt: number): { value: number; v: number } {
  st = Math.max(0.0001, st); const omega = 2 / st; const x = omega * dt;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  let change = current - target; const orig = target;
  change = Math.sign(change) * Math.min(Math.abs(change), ms * st);
  const at = current - change; const temp = (velRef.v + omega * change) * dt;
  velRef.v = (velRef.v - omega * temp) * exp;
  let out = at + (change + temp) * exp;
  if ((orig - current) * (out - orig) > 0) { out = orig; velRef.v = 0; }
  return { value: out, v: velRef.v };
}

function medianPush(buf: number[], v: number, max: number) { buf.push(v); if (buf.length > max) buf.shift(); }
function median(buf: number[]): number {
  if (!buf.length) return 0;
  const a = [...buf].sort((x, y) => x - y); const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) * 0.5;
}
function centroid(pts: { x: number; y: number }[]): { x: number; y: number } {
  let x = 0, y = 0; const n = pts.length || 1; for (const p of pts) { x += p.x; y += p.y; } return { x: x / n, y: y / n };
}
function dist2(a: { x: number; y: number }, b: { x: number; y: number }) { return Math.hypot(a.x - b.x, a.y - b.y); }

