import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const icons = [
  ["php", "PHP", "777BB4"],
  ["css", "CSS", "663399"],
  ["javascript", "JavaScript", "F7DF1E"],
  ["bootstrap", "Bootstrap", "7952B3"],
  ["sass", "Sass", "CC6699"],
  ["mysql", "MySQL", "4479A1"],
  ["github", "GitHub", "FFFFFF"],
  ["laravel", "Laravel", "FF2D20"],
  ["react", "React", "61DAFB"],
  ["typescript", "TypeScript", "3178C6"],
  ["git", "Git", "F05032"],
  ["docker", "Docker", "2496ED"],
  ["postgresql", "PostgreSQL", "4169E1"],
  ["linux", "Linux", "FCC624"],
  ["ubuntu", "Ubuntu", "E95420"],
  ["python", "Python", "3776AB"],
  ["cplusplus", "C++", "00599C"],
];

const itemWidth = 68;
const trackWidth = icons.length * itemWidth;
const offlineDir = process.argv[2];

async function loadIcon(slug, color) {
  if (offlineDir) {
    return readFile(path.join(offlineDir, `${slug}.svg`), "utf8");
  }

  const response = await fetch(`https://cdn.simpleicons.org/${slug}/${color}`);
  if (!response.ok) {
    throw new Error(`Could not download ${slug}: ${response.status}`);
  }
  return response.text();
}

const loadedIcons = await Promise.all(
  icons.map(async ([slug, title, color]) => {
    const source = await loadIcon(slug, color);
    const pathData = source.match(/<path d="([^"]+)"/s)?.[1];
    if (!pathData) {
      throw new Error(`No SVG path found for ${slug}`);
    }
    return { title, color: `#${color}`, pathData };
  }),
);

function iconSet(offset) {
  return loadedIcons
    .map(({ title, color, pathData }, index) => {
      const x = offset + index * itemWidth;
      return `
        <g transform="translate(${x} 0)">
          <title>${title}</title>
          <rect x="10" y="8" width="48" height="48" rx="12" fill="#161b22" stroke="#30363d"/>
          <g transform="translate(18 16) scale(1.333333)" fill="${color}">
            <path d="${pathData}"/>
          </g>
        </g>`;
    })
    .join("");
}

const output = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 64" role="img" aria-labelledby="title desc">
  <title id="title">Technologies I use</title>
  <desc id="desc">A continuously scrolling row of programming languages, frameworks, and tools.</desc>
  <defs>
    <linearGradient id="edge-gradient">
      <stop offset="0" stop-color="black"/>
      <stop offset="0.06" stop-color="white"/>
      <stop offset="0.94" stop-color="white"/>
      <stop offset="1" stop-color="black"/>
    </linearGradient>
    <mask id="edge-fade">
      <rect width="900" height="64" fill="url(#edge-gradient)"/>
    </mask>
  </defs>
  <style>
    .track { animation: scroll ${trackWidth / 44}s linear infinite; }
    svg:hover .track { animation-play-state: paused; }
    @keyframes scroll { to { transform: translateX(-${trackWidth}px); } }
    @media (prefers-reduced-motion: reduce) { .track { animation: none; } }
  </style>
  <g mask="url(#edge-fade)">
    <g class="track">${iconSet(0)}${iconSet(trackWidth)}
    </g>
  </g>
</svg>
`;

await mkdir("assets", { recursive: true });
await writeFile(path.join("assets", "tech-marquee.svg"), output, "utf8");
console.log(`Generated assets/tech-marquee.svg (${icons.length} icons, ${trackWidth}px loop).`);
