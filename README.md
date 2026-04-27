# Jithendra Mouli — Portfolio

Personal portfolio website built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step — just open `index.html`.

## Stack
- HTML5 (semantic)
- CSS3 (custom properties, grid, mobile-first)
- Vanilla JS (IntersectionObserver, sticky nav, mobile menu)
- Google Fonts: Inter + JetBrains Mono

## Structure
```
portfolio/
├── index.html      # Markup
├── styles.css      # Theme, layout, components, responsive
├── script.js       # Nav, mobile menu, reveal-on-scroll
├── Resume.pdf      # Downloadable resume
└── README.md
```

## Run locally
Just open `index.html` in any modern browser, or serve it:

```bash
# Python
python -m http.server 5500

# Node (npx)
npx serve .
```

Then visit `http://localhost:5500`.

## Customize
- **Colors / theme**: edit CSS variables under `:root` in `styles.css`.
- **Content**: all copy lives in `index.html` (sections: hero, about, skills, experience, projects, contact).
- **Social links**: update the `href` on the LinkedIn / GitHub anchors in the contact section.
- **Resume**: replace `Resume.pdf` in this folder.

## Deploy
Drop the folder on any static host:
- GitHub Pages
- Netlify (drag-and-drop)
- Vercel
- Cloudflare Pages
