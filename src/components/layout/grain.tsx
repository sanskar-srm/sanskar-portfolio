/** Film grain over everything — an SVG turbulence tile, jittered in steps. */
export default function Grain() {
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden opacity-[0.07] mix-blend-overlay">
      <div
        className="absolute -inset-[50%] animate-grain"
        style={{backgroundImage: `url("data:image/svg+xml,${svg}")`}}
      />
    </div>
  );
}
