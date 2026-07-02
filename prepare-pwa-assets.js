import fs from "fs";
import path from "path";

function main() {
  const publicDir = path.join(process.cwd(), "public");

  try {
    console.log("[PWA Assets] Preparing PWA Assets...");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const logoPath = path.join(process.cwd(), "src", "assets", "images", "logo_asime_monogram_refined_1781087265797.png");
    if (fs.existsSync(logoPath)) {
      fs.copyFileSync(logoPath, path.join(publicDir, "icon-192.png"));
      fs.copyFileSync(logoPath, path.join(publicDir, "icon-512.png"));
      console.log("[PWA Assets] Copied PWA logo images to /public");
    } else {
      console.warn("[PWA Assets] Warning: Asime logo not found at " + logoPath);
    }

    const logoSvg = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="asime-green-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B4D26" />
          <stop offset="40%" stopColor="#0D5E2F" />
          <stop offset="100%" stopColor="#031F0E" />
        </linearGradient>
        <linearGradient id="asime-gold-top" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FAA61A" />
          <stop offset="100%" stopColor="#FDBA74" />
        </linearGradient>
        <linearGradient id="asime-gold-bottom" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#FAB319" />
        </linearGradient>
        <filter id="asime-leaf-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0.5" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.22" />
        </filter>
      </defs>
      <path d="M 43,15 L 57,15 L 81,81 L 66,81 L 50,38 L 34,81 L 19,81 Z" fill="url(#asime-green-grad)" />
      <g filter="url(#asime-leaf-shadow)">
        <path d="M 27,73 C 40,49 57,39 77,46 C 60,59 44,74 27,73 Z" fill="white" stroke="white" strokeWidth="4" strokeLinejoin="round" />
        <path d="M 27,73 C 41,63 59,51 77,46 C 60,57 44,72 27,73 Z" fill="url(#asime-gold-bottom)" />
        <path d="M 27,73 C 40,51 57,41 77,46 C 59,51 41,63 27,73 Z" fill="url(#asime-gold-top)" />
        <path d="M 27,73 C 41,63 59,51 77,46" stroke="white" strokeWidth="0.85" strokeLinecap="round" />
      </g>
    </svg>`;

    fs.writeFileSync(path.join(publicDir, "icon.svg"), logoSvg);
    fs.writeFileSync(path.join(publicDir, "favicon.svg"), logoSvg);
    console.log("[PWA Assets] SVG icons written to /public");
  } catch (err) {
    console.error("[PWA Assets] Error preparing assets:", err.message);
  }
}

main();
