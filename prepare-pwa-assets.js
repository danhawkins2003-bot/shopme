import fs from "fs";
import path from "path";

function main() {
  const publicDir = path.join(process.cwd(), "public");

  try {
    console.log("[PWA Assets] Preparing PWA Assets...");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const logoPath = path.join(process.cwd(), "src", "assets", "images", "logo_asime_monogram_1781086746857.png");
    if (fs.existsSync(logoPath)) {
      fs.copyFileSync(logoPath, path.join(publicDir, "icon-192.png"));
      fs.copyFileSync(logoPath, path.join(publicDir, "icon-512.png"));
      fs.copyFileSync(logoPath, path.join(publicDir, "icon.png"));
      fs.copyFileSync(logoPath, path.join(publicDir, "logo.png"));
      console.log("[PWA Assets] Copied PWA logo images to /public");
    } else {
      console.warn("[PWA Assets] Warning: Asime logo not found at " + logoPath);
    }

    const logoSvg = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#FFFFFF"/>
      <path d="M 43,15 L 57,15 L 81,81 L 66,81 L 50,38 L 34,81 L 19,81 Z" fill="#0D5E2F" />
      <g>
        <path d="M 27,73 C 40,49 57,39 77,46 C 60,59 44,74 27,73 Z" fill="white" stroke="white" strokeWidth="4" strokeLinejoin="round" />
        <path d="M 27,73 C 41,63 59,51 77,46 C 60,57 44,72 27,73 Z" fill="#D97706" />
        <path d="M 27,73 C 40,51 57,41 77,46 C 59,51 41,63 27,73 Z" fill="#FAA61A" />
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
