// 3D simplex noise — Ashima Arts / Stefan Gustavson (MIT).
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const displace = /* glsl */ `
uniform float uTime;
uniform float uDistort;
uniform float uFreq;
uniform float uSpeed;

float field(vec3 p){
  vec3 q = p * uFreq;
  float t = uTime * uSpeed;
  float n = snoise(q + vec3(0.0, t, t * 0.5));
  float n2 = snoise(q * 2.1 + n * 0.6 - t * 0.8);
  return (n * 0.75 + n2 * 0.25) * uDistort;
}
vec3 displaced(vec3 p){ return p + normalize(p) * field(p); }
vec3 orthogonal(vec3 v){
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
}
`;

export const blobVertex = /* glsl */ `
${noise}
${displace}
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vField;

void main(){
  vec3 p = position;
  vec3 t = orthogonal(normal);
  vec3 b = normalize(cross(normal, t));
  float e = 0.012;
  vec3 p0 = displaced(p);
  vec3 p1 = displaced(normalize(p + t * e));
  vec3 p2 = displaced(normalize(p + b * e));
  vec3 n = normalize(cross(p1 - p0, p2 - p0));

  vField = field(p);
  vec4 mv = modelViewMatrix * vec4(p0, 1.0);
  vViewPos = mv.xyz;
  vNormal = normalize(normalMatrix * n);
  gl_Position = projectionMatrix * mv;
}
`;

const lensUniforms = /* glsl */ `
uniform vec2 uLens;
uniform float uLensR;
`;

export const blobFragment = /* glsl */ `
${lensUniforms}
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uTime;
uniform float uIntensity;
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vField;

void main(){
  float d = distance(gl_FragCoord.xy, uLens);
  if (uLensR > 0.5 && d < uLensR) discard;

  vec3 n = normalize(vNormal);
  vec3 v = normalize(-vViewPos);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.4);

  vec3 l1 = normalize(vec3(0.6, 0.8, 0.6));
  vec3 l2 = normalize(vec3(-0.8, -0.4, 0.3));
  float d1 = max(dot(n, l1), 0.0);
  float d2 = max(dot(n, l2), 0.0);
  float spec = pow(max(dot(reflect(-l1, n), v), 0.0), 48.0);

  vec3 base = mix(uColorA, uColorB, smoothstep(-0.35, 0.35, vField * 2.2 + n.y * 0.45));
  vec3 irid = 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + fres * 1.1 + vField * 1.6 + uTime * 0.04));

  vec3 col = base * (0.14 + 0.78 * d1);
  col += uColorC * d2 * 0.45;
  col += irid * fres * 0.85;
  col += spec * 0.9;
  col *= uIntensity;

  // Lit rim around the lens opening
  if (uLensR > 0.5) {
    float ring = smoothstep(uLensR + 5.0, uLensR, d) * smoothstep(uLensR - 1.0, uLensR + 1.0, d);
    col = mix(col, uColorC * 2.2, ring);
  }

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** Wireframe + core: only visible inside the lens — the "x-ray" of the blob. */
export const xrayFragment = /* glsl */ `
${lensUniforms}
uniform vec3 uColor;
uniform float uOpacity;

void main(){
  float d = distance(gl_FragCoord.xy, uLens);
  if (uLensR < 0.5 || d > uLensR) discard;
  float edge = smoothstep(uLensR, uLensR * 0.55, d);
  gl_FragColor = vec4(uColor * (0.7 + 0.6 * edge), uOpacity * (0.35 + 0.65 * edge));
  #include <colorspace_fragment>
}
`;

export const plainVertex = /* glsl */ `
void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

export const particleVertex = /* glsl */ `
attribute float aScale;
uniform float uTime;
uniform float uTravel;
uniform float uPixelRatio;
uniform float uSize;
varying float vAlpha;
varying float vMix;

void main(){
  vMix = step(0.88, fract(aScale * 17.31));
  vec3 p = position;
  p.z = mod(p.z + uTravel + 40.0, 46.0) - 40.0;
  p.y += sin(uTime * 0.25 + position.x * 2.0) * 0.12;
  p.x += cos(uTime * 0.2 + position.y * 2.0) * 0.12;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / -mv.z);
  // fade in from the fog and out as they pass the camera
  vAlpha = smoothstep(-40.0, -26.0, p.z) * (1.0 - smoothstep(2.0, 5.5, p.z));
}
`;

export const particleFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uColor2;
varying float vAlpha;
varying float vMix;

void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d);
  vec3 col = mix(uColor, uColor2, vMix);
  gl_FragColor = vec4(col, a * a * vAlpha * 0.75);
  #include <colorspace_fragment>
}
`;
