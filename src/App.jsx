import React, { useState, useEffect } from 'react';

// ============================================
// CONFIGURATION - Edit these values easily
// ============================================
const CONFIG = {
  name: "Shlomo Schwartz",
  resumeUrl: "https://docs.google.com/document/d/e/2PACX-1vQyw2Dhy7UbomUrODYJo8tnZeFYbr4_lXxBEkJ38kLlEZVnYPflNGw8x0e7g0Tf1YOwBH-Ubfn18fY9/pub?embedded=true",
  substackUrl: "https://shlomoschwartz.substack.com",
  substackRss: "https://shlomoschwartz.substack.com/feed",
  email: "shlomoschwartz01@gmail.com",
  linkedin: "https://www.linkedin.com/in/shlomo-schwartz-951ab7187/",
  github: "https://github.com/solomonschwartz",
};

// ============================================
// HOBBY GALLERY CONFIGURATION
// ============================================
// To add photos:
// 1. Place images in /public/images/[hobby-name]/ folder
// 2. Add entries below with the path and caption
// Example: { url: "/images/cocktails/negroni.jpg", caption: "Friday night Negroni" }
const HOBBY_DATA = {
  // Current Hobbies
  cocktails: {
    name: "Cocktails",
    tagline: "I don't have a problem, I swear",
    pageTagline: "I only drink on weekends",
    description: "Favorite drinks currently are Moscow Mule, Mai Tai and Strawberry Daiquiri.",
    color: "#722f37",
    isCurrent: true,
    // Add photos here:
    photos: [
      // { url: "/images/cocktails/example.jpg", caption: "Caption here" },
    ],
    recipes: [
      {
        name: "Flower and Fire Mule",
        ingredients: [
          "1.5 oz Dark Jamaican Rum",
          "1.5 oz Añejo Tequila",
          "0.5 oz Elderflower Liqueur",
          "0.75 oz Lime Juice",
          "4-5 oz Ginger Beer",
          "2 dashes Angostura Bitters",
        ],
        instructions: "Shake all ingredients except ginger beer and bitters. Strain onto large ice cubes, pour ginger beer over the top until it reaches top of the glass, about 4-5 oz. Add 2 dashes Angostura bitters on top. Optional garnish with mint sprig or brûléed lime.",
      },
    ],
  },
  cooking: {
    name: "Cooking",
    tagline: "You may refer to me as chef",
    pageTagline: "A man who can cook",
    description: "I mostly make chicken and rice bowls but if you're down to pay for a steak, I will happily cook that too.",
    color: "#8b7355",
    isCurrent: true,
    // Add photos here:
    photos: [
      // { url: "/images/cooking/example.jpg", caption: "Caption here" },
    ],
  },
  radios: {
    name: "Radios",
    tagline: "Exploring why these things work without electricity",
    pageTagline: "I am a nerd :)",
    description: "I started off wondering why radios work and ended up building a couple for fun. I still don't have the answer so email me if you know.",
    color: "#1a2e44",
    isCurrent: true,
    // Add photos here:
    photos: [
      // { url: "/images/radios/example.jpg", caption: "Caption here" },
    ],
  },
  // Former Hobbies
  golf: {
    name: "Golf",
    tagline: "I was never any good at this",
    pageTagline: "I was never any good at this 🤷",
    description: "I once started a golf trip -1 so that's something I guess.",
    color: "#2d5a3d",
    isCurrent: false,
    // Add photos here:
    photos: [
      // { url: "/images/golf/example.jpg", caption: "Caption here" },
    ],
  },
  running: {
    name: "Running",
    tagline: "COVID ruined everything",
    pageTagline: "I am now old and have bad knees",
    description: "I trained for a marathon once and got screwed by COVID. Longest run to date: 19 miles on March 4, 2020. Mile PR: 5:31 — cannot remember the date as it was pre-Strava and pre-Map My Run.",
    color: "#4a5568",
    isCurrent: false,
    // Add photos here:
    photos: [
      // { url: "/images/running/example.jpg", caption: "Caption here" },
    ],
  },
  dryaging: {
    name: "Dry-Aging Meat",
    tagline: "I am a weird guy",
    pageTagline: "I am a weird guy",
    description: "I hope to do this again once I have the fridge space. Highest ROI hobby I ever had 10/10.",
    color: "#8b4513",
    isCurrent: false,
    // Add photos here:
    photos: [
      // { url: "/images/dryaging/example.jpg", caption: "Caption here" },
    ],
  },
};

// ============================================
// COLOR PALETTE
// ============================================
const colors = {
  primary: { DEFAULT: '#1a2e44', light: '#2d4a6b', dark: '#0f1c2a' },
  secondary: { DEFAULT: '#8b7355', light: '#a69076', dark: '#6b5640' },
  accent: { DEFAULT: '#c9a962', light: '#d4bc82', dark: '#b89545' },
  cream: { DEFAULT: '#f5f1e8', light: '#faf8f3', dark: '#e8e2d5' },
  burgundy: { DEFAULT: '#722f37', light: '#8c4049', dark: '#5a252c' },
};

// ============================================
// STYLES
// ============================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Raleway:wght@300;400;500;600&display=swap');

  :root {
    --color-primary: #1a2e44;
    --color-primary-light: #2d4a6b;
    --color-primary-dark: #0f1c2a;
    --color-secondary: #8b7355;
    --color-secondary-light: #a69076;
    --color-secondary-dark: #6b5640;
    --color-accent: #c9a962;
    --color-accent-light: #d4bc82;
    --color-accent-dark: #b89545;
    --color-cream: #f5f1e8;
    --color-cream-light: #faf8f3;
    --color-cream-dark: #e8e2d5;
    --color-burgundy: #722f37;
    --color-burgundy-light: #8c4049;
    --color-burgundy-dark: #5a252c;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Raleway', sans-serif;
    background-color: var(--color-cream);
    color: var(--color-primary);
    line-height: 1.7;
    font-weight: 400;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 500;
    line-height: 1.2;
  }

  .nav-link {
    position: relative;
    text-decoration: none;
    color: var(--color-primary);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-size: 0.75rem;
    padding: 0.5rem 0;
    transition: color 0.3s ease;
    background: none;
    border: none;
    cursor: pointer;
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 1px;
    background-color: var(--color-accent);
    transition: width 0.3s ease;
  }

  .nav-link:hover::after,
  .nav-link.active::after {
    width: 100%;
  }

  .nav-link:hover,
  .nav-link.active {
    color: var(--color-accent-dark);
  }

  .divider {
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
    margin: 1.5rem auto;
  }

  .divider-left {
    width: 60px;
    height: 1px;
    margin: 1.5rem 0;
    background: linear-gradient(90deg, var(--color-accent), transparent);
  }

  .card {
    background: var(--color-cream-light);
    border: 1px solid var(--color-cream-dark);
    box-shadow: 0 4px 20px rgba(26, 46, 68, 0.05);
    transition: all 0.4s ease;
  }

  .card:hover {
    box-shadow: 0 8px 30px rgba(26, 46, 68, 0.1);
    transform: translateY(-2px);
  }

  .btn-primary {
    background-color: var(--color-primary);
    color: var(--color-cream);
    padding: 0.875rem 2rem;
    font-family: 'Raleway', sans-serif;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-size: 0.7rem;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
  }

  .btn-primary:hover {
    background-color: var(--color-primary-light);
    transform: translateY(-1px);
  }

  .btn-outline {
    background-color: transparent;
    color: var(--color-primary);
    padding: 0.875rem 2rem;
    font-family: 'Raleway', sans-serif;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-size: 0.7rem;
    border: 1px solid var(--color-primary);
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
  }

  .btn-outline:hover {
    background-color: var(--color-primary);
    color: var(--color-cream);
  }

  .iframe-container {
    width: 100%;
    height: calc(100vh - 200px);
    min-height: 500px;
    border: 1px solid var(--color-cream-dark);
    background: white;
  }

  .iframe-container iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  /* Mobile Menu Overlay */
  .mobile-menu {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-cream);
    z-index: 100;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2.5rem;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .mobile-menu.open {
    opacity: 1;
    visibility: visible;
  }

  .mobile-menu .nav-link {
    font-size: 0.9rem;
    letter-spacing: 0.15em;
  }

  /* Hamburger Button */
  .hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
    z-index: 101;
    padding: 10px;
    background: none;
    border: none;
  }

  .hamburger span {
    width: 24px;
    height: 1.5px;
    background-color: var(--color-primary);
    transition: all 0.3s ease;
  }

  .hamburger.open span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }

  .hamburger.open span:nth-child(2) {
    opacity: 0;
  }

  .hamburger.open span:nth-child(3) {
    transform: rotate(-45deg) translate(5px, -5px);
  }

  /* Desktop nav hidden on mobile, hamburger shown */
  @media (max-width: 768px) {
    .hamburger {
      display: flex;
    }
    .desktop-nav {
      display: none !important;
    }
  }

  .hobby-card {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    aspect-ratio: 1;
    background: var(--color-primary);
  }

  .hobby-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: inherit;
    opacity: 0.9;
    transition: opacity 0.4s ease;
  }

  .hobby-card:hover::before {
    opacity: 0.75;
  }

  .hobby-card-content {
    position: relative;
    z-index: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 2rem;
    color: var(--color-cream);
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .gallery-item {
    position: relative;
    aspect-ratio: 4/3;
    overflow: hidden;
    cursor: pointer;
    background: var(--color-cream-dark);
  }

  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .gallery-item:hover img {
    transform: scale(1.05);
  }

  .gallery-item-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    background: linear-gradient(transparent, rgba(26, 46, 68, 0.9));
    color: var(--color-cream);
    font-family: 'Raleway', sans-serif;
    font-size: 0.85rem;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }

  .gallery-item:hover .gallery-item-caption {
    transform: translateY(0);
  }

  .lightbox {
    position: fixed;
    inset: 0;
    background: rgba(15, 28, 42, 0.95);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .lightbox.open {
    opacity: 1;
    visibility: visible;
  }

  .lightbox img {
    max-width: 90%;
    max-height: 85vh;
    object-fit: contain;
  }

  .lightbox-close {
    position: absolute;
    top: 2rem;
    right: 2rem;
    color: var(--color-cream);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }

  .lightbox-caption {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    color: var(--color-cream);
    font-family: 'Raleway', sans-serif;
    text-align: center;
  }

  .lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-cream);
    background: none;
    border: none;
    cursor: pointer;
    padding: 1rem;
    font-size: 2rem;
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }

  .lightbox-nav:hover {
    opacity: 1;
  }

  .lightbox-nav.prev {
    left: 1rem;
  }

  .lightbox-nav.next {
    right: 1rem;
  }

  .blog-post {
    border-bottom: 1px solid var(--color-cream-dark);
    padding: 2rem 0;
    transition: all 0.3s ease;
  }

  .blog-post:hover {
    background: var(--color-cream-light);
    margin: 0 -1rem;
    padding: 2rem 1rem;
  }

  .blog-post:last-child {
    border-bottom: none;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-secondary);
    text-decoration: none;
    font-family: 'Raleway', sans-serif;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: color 0.3s ease;
    background: none;
    border: none;
    cursor: pointer;
  }

  .back-link:hover {
    color: var(--color-accent-dark);
  }

  .scroll-indicator {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    animation: bounce 2s infinite;
    color: var(--color-accent);
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
    40% { transform: translateX(-50%) translateY(-10px); }
    60% { transform: translateX(-50%) translateY(-5px); }
  }

  .empty-gallery {
    text-align: center;
    padding: 4rem 2rem;
    background: var(--color-cream-light);
    border: 2px dashed var(--color-cream-dark);
  }

  .recipe-card {
    background: var(--color-cream-light);
    border: 1px solid var(--color-cream-dark);
    padding: 2rem;
    margin-bottom: 1.5rem;
  }

  .recipe-card h4 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem;
    color: var(--color-primary);
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-cream-dark);
  }

  .recipe-section {
    margin-bottom: 1.5rem;
  }

  .recipe-section:last-child {
    margin-bottom: 0;
  }

  .recipe-section h5 {
    font-family: 'Raleway', sans-serif;
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-accent-dark);
    margin-bottom: 0.75rem;
  }

  .recipe-section ul {
    list-style: none;
    padding: 0;
  }

  .recipe-section li {
    font-family: 'Raleway', sans-serif;
    font-size: 0.9rem;
    color: var(--color-secondary);
    padding: 0.35rem 0;
    padding-left: 1.25rem;
    position: relative;
  }

  .recipe-section li::before {
    content: '·';
    position: absolute;
    left: 0;
    color: var(--color-accent);
    font-weight: bold;
  }

  .recipe-section p {
    font-family: 'Raleway', sans-serif;
    font-size: 0.9rem;
    color: var(--color-secondary);
    line-height: 1.8;
  }

  .former-hobby-card {
    opacity: 0.85;
  }

  .former-hobby-card::after {
    content: 'Former';
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-family: 'Raleway', sans-serif;
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.6);
    background: rgba(0,0,0,0.2);
    padding: 0.25rem 0.5rem;
    z-index: 2;
  }
`;

// ============================================
// ICONS
// ============================================
const Icons = {
  Cocktail: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2h8l-4 9v9m-3 2h6M5 2l3 9M19 2l-3 9" />
    </svg>
  ),
  Cooking: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3v2m0 14v2m-5-9H5m14 0h-2m-2.5-4.5l1.5-1.5m-8 0l1.5 1.5m5 8l1.5 1.5m-8 0l1.5-1.5" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  Radio: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="8" width="20" height="12" rx="2" />
      <path d="M6 8V6a2 2 0 012-2h8a2 2 0 012 2v2" />
      <circle cx="8" cy="14" r="2" />
      <path d="M14 12h4m-4 4h4" />
    </svg>
  ),
  Golf: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="18" r="3" />
      <path d="M12 3v12" />
      <path d="M12 3l6 4-6 2" />
    </svg>
  ),
  Running: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="17" cy="4" r="2" />
      <path d="M3 21h4l2-5" />
      <path d="M9 16l2-3 3 1 3-4" />
      <path d="M14 14l1 2h4" />
      <path d="M5 21l3-7" />
    </svg>
  ),
  Meat: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="12" rx="8" ry="6" />
      <ellipse cx="12" cy="12" rx="4" ry="2" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M19 12H5m0 0l7 7m-7-7l7-7" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12h14m0 0l-7-7m7 7l-7 7" />
    </svg>
  ),
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
  ),
  Email: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  ),
  LinkedIn: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <path d="M8 11v5m0-8v.01M12 16v-5c0-1 1-2 2-2s2 1 2 2v5" />
    </svg>
  ),
  GitHub: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
    </svg>
  ),
  Image: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  ExternalLink: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3" />
    </svg>
  ),
};

const hobbyIcons = {
  cocktails: Icons.Cocktail,
  cooking: Icons.Cooking,
  radios: Icons.Radio,
  golf: Icons.Golf,
  running: Icons.Running,
  dryaging: Icons.Meat,
};

// ============================================
// NAVIGATION COMPONENT
// ============================================
const Navigation = ({ currentPage, setCurrentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'resume', label: 'Resume' },
    { id: 'blog', label: 'Blog' },
  ];

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
  };

  const isHomePage = currentPage === 'home' || currentPage.startsWith('hobby-');

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: 'rgba(245, 241, 232, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${colors.cream.dark}`,
    }}>
      <nav style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1.25rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button
          onClick={() => handleNavClick('home')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.5rem',
            fontWeight: 500,
            color: colors.primary.DEFAULT,
            letterSpacing: '0.05em',
          }}
        >
          SS
        </button>

        {/* Desktop Navigation */}
        <div className="desktop-nav" style={{ display: 'flex', gap: '3rem' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`nav-link ${(item.id === 'home' ? isHomePage : currentPage === item.id) ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Hamburger Button (mobile only) */}
        <button
          className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};

// ============================================
// LIGHTBOX COMPONENT
// ============================================
const Lightbox = ({ photos, currentIndex, isOpen, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div className={`lightbox ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>
        <Icons.Close />
      </button>

      {photos.length > 1 && (
        <>
          <button
            className="lightbox-nav prev"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
          >
            ‹
          </button>
          <button
            className="lightbox-nav next"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
          >
            ›
          </button>
        </>
      )}

      <img
        src={currentPhoto?.url}
        alt={currentPhoto?.caption || ''}
        onClick={(e) => e.stopPropagation()}
      />

      {currentPhoto?.caption && (
        <div className="lightbox-caption">
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem' }}>
            {currentPhoto.caption}
          </p>
          <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>
            {currentIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================
// HOME PAGE COMPONENT
// ============================================
const HomePage = ({ setCurrentPage }) => {
  const currentHobbies = Object.entries(HOBBY_DATA).filter(([_, h]) => h.isCurrent);
  const formerHobbies = Object.entries(HOBBY_DATA).filter(([_, h]) => !h.isCurrent);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '6rem 2rem 4rem',
        position: 'relative',
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          fontWeight: 400,
          color: colors.primary.DEFAULT,
          marginBottom: '1.5rem',
          letterSpacing: '0.02em',
        }}>
          Shlomo Schwartz
        </h1>

        <div className="divider"></div>

        <p style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: '1rem',
          color: colors.secondary.DEFAULT,
          maxWidth: '500px',
          marginTop: '1rem',
          fontWeight: 300,
        }}>
          Building the future of healthcare @Palantir.
          <br />
          Yeshiva University Alum.
        </p>

        <div className="scroll-indicator">
          <Icons.ChevronDown />
        </div>
      </section>

      {/* About Section */}
      <section style={{
        padding: '6rem 2rem',
        maxWidth: '1000px',
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: '0.7rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: colors.accent.DEFAULT,
            marginBottom: '1rem',
          }}>
            Background
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 400,
            color: colors.primary.DEFAULT,
          }}>
            About Me
          </h2>
          <div className="divider"></div>
        </div>

        {/* Experience */}
        <div style={{ marginBottom: '4rem' }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.5rem',
            fontWeight: 500,
            color: colors.primary.DEFAULT,
            marginBottom: '1.5rem',
          }}>
            Experience
          </h3>
          <div className="divider-left"></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem 2rem' }}>
              <p style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: colors.accent.dark,
                marginBottom: '0.5rem',
              }}>
                2025 — Present
              </p>
              <h4 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.25rem',
                fontWeight: 500,
                color: colors.primary.DEFAULT,
              }}>
                Tech Lead
              </h4>
              <p style={{
                fontFamily: "'Raleway', sans-serif",
                color: colors.secondary.DEFAULT,
                fontSize: '0.95rem',
              }}>
                Palantir Technologies
              </p>
            </div>

            <div className="card" style={{ padding: '1.5rem 2rem' }}>
              <p style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: colors.accent.dark,
                marginBottom: '0.5rem',
              }}>
                2024 — 2025
              </p>
              <h4 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.25rem',
                fontWeight: 500,
                color: colors.primary.DEFAULT,
              }}>
                Forward Deployed Software Engineer
              </h4>
              <p style={{
                fontFamily: "'Raleway', sans-serif",
                color: colors.secondary.DEFAULT,
                fontSize: '0.95rem',
              }}>
                Palantir Technologies
              </p>
            </div>

            <div className="card" style={{ padding: '1.5rem 2rem' }}>
              <p style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: colors.accent.dark,
                marginBottom: '0.5rem',
              }}>
                2023 — 2024
              </p>
              <h4 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.25rem',
                fontWeight: 500,
                color: colors.primary.DEFAULT,
              }}>
                President, Student Council
              </h4>
              <p style={{
                fontFamily: "'Raleway', sans-serif",
                color: colors.secondary.DEFAULT,
                fontSize: '0.95rem',
              }}>
                Yeshiva College
              </p>
            </div>
          </div>
        </div>

        {/* Education */}
        <div>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.5rem',
            fontWeight: 500,
            color: colors.primary.DEFAULT,
            marginBottom: '1.5rem',
          }}>
            Education
          </h3>
          <div className="divider-left"></div>

          <div className="card" style={{ padding: '1.5rem 2rem' }}>
            <h4 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.25rem',
              fontWeight: 500,
              color: colors.primary.DEFAULT,
            }}>
              Bachelor of Arts in Computer Science
            </h4>
            <p style={{
              fontFamily: "'Raleway', sans-serif",
              color: colors.secondary.DEFAULT,
              fontSize: '0.95rem',
            }}>
              Yeshiva University
            </p>
          </div>
        </div>
      </section>

      {/* Hobbies Section */}
      <section style={{
        padding: '6rem 2rem',
        backgroundColor: colors.primary.DEFAULT,
        color: colors.cream.DEFAULT,
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              fontWeight: 400,
              color: colors.cream.DEFAULT,
            }}>
              Interests & Hobbies
            </h2>
            <div className="divider"></div>
          </div>

          {/* Current Hobby Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '4rem',
          }}>
            {currentHobbies.map(([key, hobby]) => {
              const Icon = hobbyIcons[key];
              return (
                <div
                  key={key}
                  className="hobby-card"
                  style={{ backgroundColor: hobby.color }}
                  onClick={() => setCurrentPage(`hobby-${key}`)}
                >
                  <div className="hobby-card-content">
                    <div style={{ marginBottom: '1rem', opacity: 0.9 }}>
                      <Icon />
                    </div>
                    <h3 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '1.75rem',
                      fontWeight: 500,
                      marginBottom: '0.5rem',
                    }}>
                      {hobby.name}
                    </h3>
                    <p style={{
                      fontFamily: "'Raleway', sans-serif",
                      fontSize: '0.8rem',
                      letterSpacing: '0.05em',
                      opacity: 0.8,
                    }}>
                      {hobby.tagline}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Former Interests */}
          <div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.25rem',
              fontWeight: 500,
              color: colors.secondary.light,
              marginBottom: '2rem',
              textAlign: 'center',
            }}>
              Former Interests
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}>
              {formerHobbies.map(([key, hobby]) => {
                const Icon = hobbyIcons[key];
                return (
                  <div
                    key={key}
                    className="hobby-card former-hobby-card"
                    style={{ backgroundColor: hobby.color, aspectRatio: '16/9' }}
                    onClick={() => setCurrentPage(`hobby-${key}`)}
                  >
                    <div className="hobby-card-content">
                      <div style={{ marginBottom: '0.75rem', opacity: 0.7 }}>
                        <Icon />
                      </div>
                      <h4 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '1.25rem',
                        fontWeight: 500,
                        marginBottom: '0.25rem',
                      }}>
                        {hobby.name}
                      </h4>
                      <p style={{
                        fontFamily: "'Raleway', sans-serif",
                        fontSize: '0.7rem',
                        letterSpacing: '0.05em',
                        opacity: 0.7,
                      }}>
                        {hobby.tagline}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{
        padding: '6rem 2rem',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: '0.7rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: colors.accent.DEFAULT,
          marginBottom: '1rem',
        }}>
          Get in Touch
        </p>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2rem, 5vw, 2.75rem)',
          fontWeight: 400,
          color: colors.primary.DEFAULT,
          marginBottom: '1rem',
        }}>
          Let's Connect
        </h2>
        <div className="divider"></div>

        <p style={{
          fontFamily: "'Raleway', sans-serif",
          color: colors.secondary.DEFAULT,
          marginBottom: '2rem',
          fontWeight: 300,
        }}>
          I'm always open to discussing new opportunities, interesting projects, or just having a good conversation.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}>
          <a href={`mailto:${CONFIG.email}`} className="btn-outline" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Icons.Email /> Email
          </a>
          <a href={CONFIG.linkedin} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Icons.LinkedIn /> LinkedIn
          </a>
          <a href={CONFIG.github} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Icons.GitHub /> GitHub
          </a>
        </div>
      </section>
    </div>
  );
};

// ============================================
// HOBBY PAGE COMPONENT
// ============================================
const HobbyPage = ({ hobbyKey, setCurrentPage }) => {
  const hobby = HOBBY_DATA[hobbyKey];
  const Icon = hobbyIcons[hobbyKey];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!hobby) {
    return <div>Hobby not found</div>;
  }

  const openLightbox = (index) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? hobby.photos.length - 1 : prev - 1
    );
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === hobby.photos.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        backgroundColor: hobby.color,
        color: colors.cream.DEFAULT,
        padding: '6rem 2rem',
        textAlign: 'center',
        position: 'relative',
      }}>
        {!hobby.isCurrent && (
          <div style={{
            position: 'absolute',
            top: '1.5rem',
            right: '2rem',
            fontFamily: "'Raleway', sans-serif",
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
            background: 'rgba(0,0,0,0.2)',
            padding: '0.35rem 0.75rem',
          }}>
            Former Hobby
          </div>
        )}

        <button
          className="back-link"
          onClick={() => setCurrentPage('home')}
          style={{
            color: colors.cream.DEFAULT,
            opacity: 0.8,
            marginBottom: '2rem',
          }}
        >
          <Icons.ArrowLeft /> Back to Home
        </button>

        <div style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
          <Icon />
        </div>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 400,
          marginBottom: '1rem',
        }}>
          {hobby.name}
        </h1>

        <p style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: '0.85rem',
          letterSpacing: '0.1em',
          opacity: 0.85,
          marginBottom: '2rem',
        }}>
          {hobby.pageTagline}
        </p>

        <div className="divider" style={{ background: `linear-gradient(90deg, transparent, ${colors.accent.DEFAULT}, transparent)` }}></div>

        <p style={{
          fontFamily: "'Raleway', sans-serif",
          maxWidth: '600px',
          margin: '1.5rem auto 0',
          fontWeight: 300,
          lineHeight: 1.8,
          opacity: 0.9,
        }}>
          {hobby.description}
        </p>
      </section>

      {/* Recipes Section (only for cocktails) */}
      {hobby.recipes && hobby.recipes.length > 0 && (
        <section style={{
          padding: '4rem 2rem',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.75rem',
            fontWeight: 500,
            color: colors.primary.DEFAULT,
            marginBottom: '0.5rem',
            textAlign: 'center',
          }}>
            My Recipes
          </h2>
          <div className="divider"></div>

          <div style={{ marginTop: '2rem' }}>
            {hobby.recipes.map((recipe, index) => (
              <div key={index} className="recipe-card">
                <h4>{recipe.name}</h4>

                <div className="recipe-section">
                  <h5>Ingredients</h5>
                  <ul>
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>

                <div className="recipe-section">
                  <h5>Instructions</h5>
                  <p>{recipe.instructions}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        borderTop: hobby.recipes && hobby.recipes.length > 0 ? `1px solid ${colors.cream.dark}` : 'none',
      }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.75rem',
          fontWeight: 500,
          color: colors.primary.DEFAULT,
          marginBottom: '0.5rem',
          textAlign: 'center',
        }}>
          Gallery
        </h2>
        <div className="divider"></div>

        {hobby.photos && hobby.photos.length > 0 ? (
          <div className="gallery-grid" style={{ marginTop: '2rem' }}>
            {hobby.photos.map((photo, index) => (
              <div
                key={index}
                className="gallery-item"
                onClick={() => openLightbox(index)}
              >
                <img src={photo.url} alt={photo.caption || `${hobby.name} photo ${index + 1}`} />
                {photo.caption && (
                  <div className="gallery-item-caption">
                    {photo.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-gallery" style={{ marginTop: '2rem' }}>
            <div style={{ color: colors.secondary.light, marginBottom: '1.5rem' }}>
              <Icons.Image />
            </div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.5rem',
              color: colors.primary.DEFAULT,
              marginBottom: '0.75rem',
            }}>
              Gallery Coming Soon
            </h3>
            <p style={{
              fontFamily: "'Raleway', sans-serif",
              color: colors.secondary.DEFAULT,
              fontSize: '0.9rem',
              maxWidth: '400px',
              margin: '0 auto',
            }}>
              Photos will be added here. Check back shortly.
            </p>
          </div>
        )}
      </section>

      <Lightbox
        photos={hobby.photos}
        currentIndex={currentPhotoIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onPrev={prevPhoto}
        onNext={nextPhoto}
      />
    </div>
  );
};

// ============================================
// RESUME PAGE COMPONENT
// ============================================
const ResumePage = () => {
  return (
    <div style={{
      paddingTop: '100px',
      minHeight: '100vh',
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: '0.7rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: colors.accent.DEFAULT,
            marginBottom: '1rem',
          }}>
            Professional Background
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 400,
            color: colors.primary.DEFAULT,
          }}>
            Resume
          </h1>
          <div className="divider"></div>
        </div>

        <div className="iframe-container">
          <iframe
            src={CONFIG.resumeUrl}
            title="Resume"
            allowFullScreen
          />
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontFamily: "'Raleway', sans-serif",
          fontSize: '0.85rem',
          color: colors.secondary.DEFAULT,
        }}>
          <a
            href={CONFIG.resumeUrl.replace('?embedded=true', '')}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: colors.accent.dark }}
          >
            Open in new tab →
          </a>
        </p>
      </div>
    </div>
  );
};

// ============================================
// BLOG PAGE COMPONENT
// ============================================
const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(corsProxy + encodeURIComponent(CONFIG.substackRss));

        if (!response.ok) throw new Error('Failed to fetch');

        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const items = xml.querySelectorAll('item');

        const parsedPosts = Array.from(items).slice(0, 10).map((item) => ({
          title: item.querySelector('title')?.textContent || '',
          link: item.querySelector('link')?.textContent || '',
          pubDate: item.querySelector('pubDate')?.textContent || '',
          description: item.querySelector('description')?.textContent || '',
        }));

        setPosts(parsedPosts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching RSS:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div style={{
      paddingTop: '100px',
      minHeight: '100vh',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: '0.7rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: colors.accent.DEFAULT,
            marginBottom: '1rem',
          }}>
            Essays and Writing
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 400,
            color: colors.primary.DEFAULT,
          }}>
            Blog
          </h1>
          <div className="divider"></div>
          <p style={{
            fontFamily: "'Raleway', sans-serif",
            color: colors.secondary.DEFAULT,
            marginTop: '1rem',
            fontSize: '0.9rem',
          }}>
            <a
              href={CONFIG.substackUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: colors.accent.dark,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              Subscribe on Substack <Icons.ExternalLink />
            </a>
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{
              fontFamily: "'Raleway', sans-serif",
              color: colors.secondary.DEFAULT,
            }}>
              Loading posts...
            </p>
          </div>
        ) : error || posts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: colors.cream.light,
            border: `1px solid ${colors.cream.dark}`,
          }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.75rem',
              fontWeight: 400,
              color: colors.primary.DEFAULT,
              marginBottom: '1rem',
            }}>
              {error ? 'Unable to Load Posts' : 'Coming Soon'}
            </h2>
            <p style={{
              fontFamily: "'Raleway', sans-serif",
              color: colors.secondary.DEFAULT,
              maxWidth: '400px',
              margin: '0 auto 1.5rem',
              fontWeight: 300,
            }}>
              {error
                ? 'Visit my Substack directly to read my latest posts.'
                : "I'm currently setting up my blog. Check back soon for thoughts on technology, engineering, and more."
              }
            </p>
            <a
              href={CONFIG.substackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Visit Substack <Icons.ExternalLink />
            </a>
          </div>
        ) : (
          <div>
            {posts.map((post, index) => (
              <a
                key={index}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="blog-post"
                style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
              >
                <p style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '0.7rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: colors.accent.dark,
                  marginBottom: '0.75rem',
                }}>
                  {formatDate(post.pubDate)}
                </p>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.5rem',
                  fontWeight: 500,
                  color: colors.primary.DEFAULT,
                  marginBottom: '0.75rem',
                  lineHeight: 1.3,
                }}>
                  {post.title}
                </h3>
                <p style={{
                  fontFamily: "'Raleway', sans-serif",
                  color: colors.secondary.DEFAULT,
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {stripHtml(post.description).slice(0, 200)}...
                </p>
                <span style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '0.8rem',
                  color: colors.accent.dark,
                  marginTop: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}>
                  Read more <Icons.ArrowRight />
                </span>
              </a>
            ))}

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <a
                href={CONFIG.substackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                View All Posts on Substack <Icons.ExternalLink />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// FOOTER COMPONENT
// ============================================
const Footer = () => {
  return (
    <footer style={{
      padding: '3rem 2rem',
      textAlign: 'center',
      borderTop: `1px solid ${colors.cream.dark}`,
    }}>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '1.25rem',
        color: colors.primary.DEFAULT,
        marginBottom: '0.5rem',
      }}>
        Shlomo Schwartz
      </p>
      <p style={{
        fontFamily: "'Raleway', sans-serif",
        fontSize: '0.75rem',
        color: colors.secondary.DEFAULT,
        letterSpacing: '0.1em',
      }}>
        © {new Date().getFullYear()} — All rights reserved
      </p>
    </footer>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const renderPage = () => {
    if (currentPage.startsWith('hobby-')) {
      const hobbyKey = currentPage.replace('hobby-', '');
      return <HobbyPage hobbyKey={hobbyKey} setCurrentPage={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'resume':
        return <ResumePage />;
      case 'blog':
        return <BlogPage />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}