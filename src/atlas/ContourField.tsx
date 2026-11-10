import { useEffect, useRef, useState, type ReactNode } from "react";
import { motionReduced } from "../lib/motion";

/*
 * The Atlas page backdrop: a contour field drawn by one fragment shader on a fixed canvas.
 * Scrolling slides the terrain under the window and slowly warps it, so every sheet sits on
 * different ground. It draws only when the scroll position or size changes — never on an
 * idle loop — and falls back to the static SVG contours when WebGL is unavailable.
 */

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

const FRAG = `#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform vec2 u_res;
uniform float u_scroll;
uniform float u_morph;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.48;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res.y;
  uv.y-=u_scroll*.85;
  vec2 p=uv*1.15;
  vec2 q=vec2(fbm(p+vec2(0.,u_morph*1.4)),fbm(p+vec2(5.2,1.3)-u_morph));
  float h=fbm(p+1.25*q);
  float v=h*17.;
  float f=fract(v);
  float d=min(f,1.-f);
  float w=fwidth(v);
  float idx=1.-step(.5,mod(floor(v+.5),5.));
  float line=1.-smoothstep(0.,w*mix(1.,1.7,idx),d);
  float a=line*mix(.13,.28,idx);
  vec3 col=mix(vec3(.925,.91,.875),vec3(.6,.41,.31),idx);
  gl_FragColor=vec4(col*a,a);
}`;

function setup(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });
  if (!gl || !gl.getExtension("OES_standard_derivatives")) return null;
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = shader(gl.VERTEX_SHADER, VERT), fs = shader(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.useProgram(prog);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = { res: gl.getUniformLocation(prog, "u_res"), scroll: gl.getUniformLocation(prog, "u_scroll"), morph: gl.getUniformLocation(prog, "u_morph") };
  return {
    draw(w: number, h: number, scroll: number, morph: number) {
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u.res, w, h);
      gl.uniform1f(u.scroll, scroll);
      gl.uniform1f(u.morph, morph);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

export function ContourField({ fallback }: { fallback: ReactNode }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const field = setup(canvas);
    if (!field) {
      setFailed(true);
      return;
    }
    const still = motionReduced();
    // Phones fill far more pixels per CSS px; 1.25 keeps the 1px lines crisp at ~30% fewer fragments.
    const coarse = matchMedia("(pointer: coarse)").matches;
    let raf = 0;
    let lastY = NaN;
    const draw = () => {
      raf = 0;
      if (document.hidden) return;
      const dpr = Math.min(coarse ? 1.25 : 1.5, window.devicePixelRatio || 1);
      // The canvas is 100lvh tall, so its own height stays put while a phone's URL bar moves.
      const cssH = canvas.clientHeight || innerHeight;
      const w = Math.round(innerWidth * dpr), h = Math.round(cssH * dpr);
      const resized = canvas.width !== w || canvas.height !== h;
      if (resized) {
        canvas.width = w;
        canvas.height = h;
      }
      const y = still ? 0 : scrollY;
      if (!resized && Math.abs(y - lastY) < 0.5) return; // momentum tails: nothing visible changes
      lastY = y;
      // The warp is tied to distance scrolled (about one unit per 24 screens), not to the page
      // height, so late content arriving does not jump the whole field.
      field.draw(w, h, y / cssH, y / (cssH * 24));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const onVisible = () => {
      lastY = NaN; // the backing store may have been dropped while hidden; redraw on return
      queue();
    };
    draw();
    if (!still) addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", queue);
      removeEventListener("resize", queue);
      document.removeEventListener("visibilitychange", onVisible);
      field.dispose();
    };
  }, []);

  if (failed) return <div className="atl-backdrop" aria-hidden="true">{fallback}</div>;
  return <canvas ref={ref} className="atl-field" aria-hidden="true" />;
}
