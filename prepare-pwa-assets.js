import fs from "fs";
import path from "path";

function main() {
  const publicDir = path.join(process.cwd(), "public");

  try {
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Official Miabé Asi Icon SVG
    const iconSvg = `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" rx="24" fill="#FFFFFF"/>
      <g transform="translate(10, 8)">
        <path d="M 33 46 C 33 22, 67 22, 67 46" stroke="#C88A24" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <path d="M 38 46 C 38 27, 62 27, 62 46" stroke="#C88A24" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M 61 42 C 61 27, 49 25, 49 25 C 49 25, 53 38, 61 42 Z" fill="#135B28"/>
        <path d="M 60 41 C 60 22, 75 16, 75 16 C 75 16, 76 34, 60 41 Z" fill="#135B28"/>
        <rect x="23" y="44" width="54" height="6.5" rx="3.25" fill="#FFFFFF" stroke="#C88A24" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M 26 50.5 C 27 68, 35 78, 50 78 C 65 78, 73 68, 74 50.5 Z" fill="#FFFFFF" stroke="#C88A24" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M 28 59 C 35 63, 65 63, 72 59" stroke="#C88A24" stroke-width="2.8" stroke-linecap="round" fill="none"/>
        <path d="M 32 68 C 38 72, 62 72, 68 68" stroke="#C88A24" stroke-width="2.8" stroke-linecap="round" fill="none"/>
        <line x1="39" y1="52" x2="39" y2="58" stroke="#C88A24" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="61" y1="52" x2="61" y2="58" stroke="#C88A24" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="50" y1="60" x2="50" y2="67" stroke="#C88A24" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="36" y1="61" x2="36" y2="67" stroke="#C88A24" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="64" y1="61" x2="64" y2="67" stroke="#C88A24" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="50" y1="69" x2="50" y2="76" stroke="#C88A24" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 37 78 C 43 82, 57 82, 63 78" stroke="#C88A24" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      </g>
    </svg>`;

    const iconSvgPath = path.join(publicDir, "icon.svg");
    const faviconSvgPath = path.join(publicDir, "favicon.svg");
    const logoSvgPath = path.join(publicDir, "logo.svg");

    if (!fs.existsSync(iconSvgPath)) fs.writeFileSync(iconSvgPath, iconSvg);
    if (!fs.existsSync(faviconSvgPath)) fs.writeFileSync(faviconSvgPath, iconSvg);
    if (!fs.existsSync(logoSvgPath)) fs.writeFileSync(logoSvgPath, iconSvg);

    console.log("[PWA Assets] Assets verified successfully.");
  } catch (err) {
    console.warn("[PWA Assets] Warning during asset verification:", err.message);
  }
}

main();
