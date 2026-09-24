import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import JsonEditor from './components/JsonEditor.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import RichText, { ContentBlock } from './components/RichText.jsx';
import { renderInline } from './lib/inline.jsx';
import { parseLenient } from './lib/lenientJson.js';
import { validate, safeUrl } from './lib/schema.js';
import {
  ICON_NAMES, HOME_SCHEMA, HOME_HELP, HOME_BUILTIN_BLOCKS, RESUME_SCHEMA, RESUME_HELP,
  HOBBY_SCHEMA, HOBBY_HELP, LEDGER_CONFIG_SCHEMA, LEDGER_CONFIG_HELP, LEDGER_BACKUP_SCHEMA,
} from './lib/contentSchemas.js';

// ============================================
// FIREBASE INITIALIZATION
// ============================================
const isSandbox = typeof __firebase_config !== 'undefined';

const firebaseConfig = isSandbox ? JSON.parse(__firebase_config) : {
  apiKey: "AIzaSyDxeKWRmkluXfmuJluEKoOkMBYffQw1jGs",
  authDomain: "personal-website-db0e6.firebaseapp.com",
  projectId: "personal-website-db0e6",
  storageBucket: "personal-website-db0e6.firebasestorage.app",
  messagingSenderId: "972029016846",
  appId: "1:972029016846:web:aef731c76300ea05b0355f",
  measurementId: "G-T7HB89W9SL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'portfolio-app';

// ============================================
// CONFIGURATION
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
// INITIAL HOBBY DATA (Fallback)
// ============================================
const INITIAL_HOBBY_DATA = {
  cocktails: {
    name: "Cocktails",
    tagline: "I don't have a problem, I swear",
    pageTagline: "I only drink on weekends",
    description: "Favorite drinks currently are Moscow Mule, Mai Tai and Strawberry Daiquiri.",
    color: "#722f37",
    isCurrent: true,
    photos: [
      { url: "https://i.imgur.com/vHqA9u2.jpg", caption: "Flower and Fire Mule" },
    ],
    recipes: [
      {
        name: "Flower and Fire Mule",
        ingredients: ["1.5 oz Dark Jamaican Rum", "4-5 oz Ginger Beer"],
        instructions: "Shake all ingredients except ginger beer and bitters. Strain onto large ice cubes.",
      }
    ],
  },
  cooking: {
    name: "Cooking",
    tagline: "You may refer to me as chef",
    pageTagline: "A man who can cook",
    description: "I mostly make chicken and rice bowls but if you're down to pay for a steak, I will happily cook that too.",
    color: "#8b7355",
    isCurrent: true,
    photos: [],
  },
  radios: {
    name: "Radios",
    tagline: "Exploring why these things work without electricity",
    pageTagline: "I am a nerd :)",
    description: "I started off wondering why radios work and ended up building a couple for fun.",
    color: "#1a2e44",
    isCurrent: true,
    photos: [],
  }
};

// ============================================
// COLOR PALETTE & STYLES
// ============================================
const colors = {
  primary: { DEFAULT: '#1a2e44', light: '#2d4a6b', dark: '#0f1c2a' },
  secondary: { DEFAULT: '#4a6080', light: '#6a84a0', dark: '#2a4060' },
  accent: { DEFAULT: '#1a2e44', light: '#2d4a6b', dark: '#0f1c2a' },
  cream: { DEFAULT: '#ffffff', light: '#ffffff', dark: '#e8edf2' },
  burgundy: { DEFAULT: '#722f37', light: '#8c4049', dark: '#5a252c' },
};

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
    --color-cream: #ffffff;
    --color-cream-light: #ffffff;
    --color-cream-dark: #e8edf2;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  button { outline: none; }

  /* Interests split layout */
  .interests-layout { display: flex; gap: 4rem; align-items: flex-start; }
  .interests-list { width: 220px; flex-shrink: 0; }
  .interests-detail { flex: 1; padding-top: 0.25rem; }
  .mobile-detail { display: none !important; }
  @media (max-width: 600px) {
    .interests-layout { display: block; }
    .interests-list { width: 100%; }
    .interests-detail { display: none; }
    .mobile-detail { display: block !important; }
  }

  body {
    font-family: 'Inter', sans-serif;
    background-color: #ffffff;
    color: #1a2e44;
    line-height: 1.7;
    font-weight: 400;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Inter', sans-serif;
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

  .nav-link:hover::after, .nav-link.active::after { width: 100%; }
  .nav-link:hover, .nav-link.active { color: var(--color-accent-dark); }

  .divider {
    width: 60px; height: 1px;
    background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
    margin: 1.5rem auto;
  }

  .divider-left {
    width: 60px; height: 1px; margin: 1.5rem 0;
    background: linear-gradient(90deg, var(--color-accent), transparent);
  }

  .card {
    background: var(--color-cream-light);
    border: 1px solid var(--color-cream-dark);
    box-shadow: 0 4px 20px rgba(26, 46, 68, 0.05);
    transition: all 0.4s ease;
  }
  .card:hover { box-shadow: 0 8px 30px rgba(26, 46, 68, 0.1); transform: translateY(-2px); }

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
  .btn-primary:hover { background-color: var(--color-primary-light); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

  .btn-outline {
    background-color: transparent; color: var(--color-primary);
    padding: 0.875rem 2rem; font-family: 'Raleway', sans-serif; font-weight: 500;
    letter-spacing: 0.15em; text-transform: uppercase; font-size: 0.7rem;
    border: 1px solid var(--color-primary); cursor: pointer; transition: all 0.3s ease;
    display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none;
  }
  .btn-outline:hover { background-color: var(--color-primary); color: var(--color-cream); }

  /* Admin Portal Specific Styles */
  .admin-input {
    width: 100%; padding: 0.875rem; margin-top: 0.5rem; margin-bottom: 1.5rem;
    border: 1px solid var(--color-cream-dark); border-radius: 4px;
    font-family: 'Raleway', sans-serif; font-size: 0.95rem; background: #fff;
    color: var(--color-primary); transition: border-color 0.3s ease;
  }
  .admin-input:focus { outline: none; border-color: var(--color-accent); }
  .admin-label {
    font-size: 0.75rem; font-weight: 600; letter-spacing: 0.15em;
    text-transform: uppercase; color: var(--color-secondary); display: block;
  }
  .admin-panel-card {
    background: #fff; border: 1px solid var(--color-cream-dark);
    padding: 2rem; border-radius: 8px; margin-bottom: 2rem;
  }
  .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; }
  .photo-thumbnail-admin { position: relative; aspect-ratio: 1; border: 1px solid var(--color-cream-dark); overflow: hidden; }
  .photo-thumbnail-admin img { width: 100%; height: 100%; object-fit: cover; }
  .photo-delete-btn {
    position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(220,53,69,0.9);
    color: white; border: none; padding: 0.25rem 0.5rem; cursor: pointer; border-radius: 4px; font-size: 0.7rem;
  }

  /* Core Layout Styles */
  .iframe-container { width: 100%; height: calc(100vh - 200px); min-height: 500px; border: 1px solid var(--color-cream-dark); background: white; }
  .iframe-container iframe { width: 100%; height: 100%; border: none; }
  .mobile-menu { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: var(--color-cream); z-index: 100; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 2.5rem; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
  .mobile-menu.open { opacity: 1; visibility: visible; }
  .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; z-index: 101; padding: 10px; background: none; border: none; }
  .hamburger span { width: 24px; height: 1.5px; background-color: var(--color-primary); transition: all 0.3s ease; }
  .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
  .hamburger.open span:nth-child(2) { opacity: 0; }
  .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
  @media (max-width: 768px) { .hamburger { display: flex; } .desktop-nav { display: none !important; } }
  .hobby-card { position: relative; overflow: hidden; cursor: pointer; aspect-ratio: 1; background: var(--color-primary); }
  .hobby-card::before { content: ''; position: absolute; inset: 0; background: inherit; opacity: 0.9; transition: opacity 0.4s ease; }
  .hobby-card:hover::before { opacity: 0.75; }
  .hobby-card-content { position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 2rem; color: var(--color-cream); }
  .album-cover { position: relative; aspect-ratio: 1; max-width: 400px; margin: 0 auto; cursor: pointer; overflow: hidden; box-shadow: 0 10px 40px rgba(26, 46, 68, 0.2); transition: all 0.4s ease; }
  .album-cover:hover { transform: translateY(-4px); box-shadow: 0 15px 50px rgba(26, 46, 68, 0.3); }
  .album-cover img { width: 100%; height: 100%; object-fit: cover; }
  .album-cover-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 50%, rgba(26, 46, 68, 0.8)); display: flex; flex-direction: column; justify-content: flex-end; padding: 1.5rem; color: var(--color-cream); }
  
  /* Blog Post Card Styles */
  .blog-post { 
    background: var(--color-cream-dark); 
    border-radius: 8px;
    padding: 2.5rem; 
    margin-bottom: 2rem;
    transition: all 0.3s ease; 
    text-decoration: none; 
    color: inherit; 
    display: block; 
  }
  .blog-post:hover { 
    transform: translateY(-4px); 
    box-shadow: 0 12px 30px rgba(26, 46, 68, 0.08); 
  }
  
  .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--color-secondary); text-decoration: none; font-family: 'Raleway', sans-serif; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; background: none; border: none; cursor: pointer; transition: color 0.3s ease; }
  .back-link:hover { color: var(--color-accent-dark); }
  .recipe-section p {
    font-family: 'Raleway', sans-serif;
    font-size: 0.9rem;
    color: var(--color-secondary);
    line-height: 1.8;
  }

  .former-hobby-card {
    opacity: 0.85;
  }

  /* Timeline & Tab Styles */
  .tabs { display: flex; justify-content: center; gap: 2rem; margin-bottom: 3rem; border-bottom: 1px solid var(--color-cream-dark); }
  .tab-btn { background: none; border: none; font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; color: var(--color-secondary); cursor: pointer; padding-bottom: 0.75rem; border-bottom: 2px solid transparent; transition: all 0.3s ease; }
  .tab-btn.active { color: var(--color-primary); border-bottom-color: var(--color-accent); font-weight: 600; }
  .tab-btn:hover { color: var(--color-primary-light); }
  
  .timeline { border-left: 2px solid var(--color-accent); padding-left: 1.5rem; margin-left: 1rem; margin-top: 1rem; }
  .timeline-item { position: relative; margin-bottom: 2.5rem; }
  .timeline-item::before { content: ''; position: absolute; left: -1.85rem; top: 0.25rem; width: 12px; height: 12px; border-radius: 50%; background: var(--color-cream); border: 2px solid var(--color-accent); }
  .timeline-date { font-family: 'Raleway', sans-serif; font-size: 0.75rem; color: var(--color-accent-dark); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; display: block; }
  .timeline-card { background: var(--color-cream-light); border: 1px solid var(--color-cream-dark); padding: 1.5rem; border-radius: 8px; transition: all 0.3s ease; text-decoration: none; color: inherit; display: block; }
  .timeline-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(26, 46, 68, 0.05); border-color: var(--color-accent-light); }
  .timeline-type { display: inline-flex; align-items: center; gap: 0.35rem; font-family: 'Raleway', sans-serif; font-size: 0.7rem; color: var(--color-secondary); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; }

  /* Resume skills: wrap as spaced tags */
  .resume-skills-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .resume-skill-tag { font-family: 'Inter', sans-serif; font-size: 0.8rem; color: #4a6080; background: #f5f7fa; border: 1px solid #e6eaf0; padding: 0.25rem 0.7rem; border-radius: 999px; line-height: 1.5; white-space: nowrap; }
`;

// ============================================
// ICONS
// ============================================
const Icons = {
  Cocktail: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2h8l-4 9v9m-3 2h6M5 2l3 9M19 2l-3 9" /></svg>,
  Cooking: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v2m0 14v2m-5-9H5m14 0h-2m-2.5-4.5l1.5-1.5m-8 0l1.5 1.5m5 8l1.5 1.5m-8 0l1.5-1.5"/><circle cx="12" cy="12" r="4" /></svg>,
  Radio: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="8" width="20" height="12" rx="2" /><path d="M6 8V6a2 2 0 012-2h8a2 2 0 012 2v2" /><circle cx="8" cy="14" r="2" /><path d="M14 12h4m-4 4h4" /></svg>,
  Golf: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="18" r="3" /><path d="M12 3v12" /><path d="M12 3l6 4-6 2" /></svg>,
  Running: () => <svg width="32" height="32" viewBox="0 -960 960 960" fill="currentColor"><path d="m216-160-56-56 384-384H440v80h-80v-160h233q16 0 31 6t26 17l120 119q27 27 66 42t84 16v80q-62 0-112.5-19T718-476l-40-42-88 88 90 90-262 151-40-69 172-99-68-68-266 265Zm-96-280v-80h200v80H120ZM40-560v-80h200v80H40Zm739-80q-33 0-57-23.5T698-720q0-33 24-56.5t57-23.5q33 0 57 23.5t24 56.5q0 33-24 56.5T779-640Zm-659-40v-80h200v80H120Z"/></svg>,
  Meat: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="12" cy="12" rx="8" ry="6" /><ellipse cx="12" cy="12" rx="4" ry="2" /></svg>,
  Camera: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>,
  Book: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
  Code: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
  ChevronDown: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9l6 6 6-6" /></svg>,
  ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5m0 0l7 7m-7-7l7-7" /></svg>,
  ArrowRight: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14m0 0l-7-7m7 7l-7 7" /></svg>,
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 6l12 12M6 18L18 6" /></svg>,
  Email: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></svg>,
  LinkedIn: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M8 11v5m0-8v.01M12 16v-5c0-1 1-2 2-2s2 1 2 2v5" /></svg>,
  GitHub: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" /></svg>,
  Image: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>,
  ExternalLink: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3" /></svg>,
  Video: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>,
  Article: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
};

const hobbyIcons = { cocktails: Icons.Cocktail, cooking: Icons.Cooking, radios: Icons.Radio, golf: Icons.Golf, running: Icons.Running, dryaging: Icons.Meat };
const AVAILABLE_ICONS = ICON_NAMES;

// ============================================
// ADMIN PORTAL COMPONENT
// ============================================
const AdminPage = ({ hobbies, timelineItems, dbPathHobbies, dbPathTimeline, user, resumeData, dbPathResume, onResumeUpdate, homeData, dbPathHome, onHomeUpdate }) => {
  const [adminView, setAdminView] = useState('hobbies');
  const [hobbyEditMode, setHobbyEditMode] = useState('form'); // 'form' | 'json'

  // Ledger config state
  const [ledgerCfg, setLedgerCfg] = useState(null);
  const [lcSaving, setLcSaving] = useState(false);
  const [lcNewItem, setLcNewItem] = useState({label:'', cat:'', star:false});
  const [lcPromptView, setLcPromptView] = useState('checklist'); // checklist | char | hobby | friday | saturday
  const [lcNewPrompt, setLcNewPrompt] = useState('');
  const ledgerCfgPath = user ? ['artifacts', appId, 'users', user.uid, 'config', 'ledger'] : null;

  useEffect(() => {
    if (!ledgerCfgPath) return;
    const ref = doc(db, ...ledgerCfgPath);
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) setLedgerCfg(snap.data());
      else setLedgerCfg({ items: [...LEDGER_ITEMS], streakItems: ['minyan','fast'] });
    });
    return unsub;
  }, [user?.uid]);

  const saveLedgerCfg = async (cfg) => {
    if (!ledgerCfgPath) return;
    setLcSaving(true);
    try { await setDoc(doc(db, ...ledgerCfgPath), cfg); }
    catch (e) { alert('Save failed: ' + e.message); }
    finally { setLcSaving(false); }
  };

  const lcItems = ledgerCfg?.items || LEDGER_ITEMS;
  const lcStreakItems = ledgerCfg?.streakItems || ['minyan','fast'];

  // Hobby Editor State
  const [editingKey, setEditingKey] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeIngredients, setNewRecipeIngredients] = useState('');
  const [newRecipeInstructions, setNewRecipeInstructions] = useState('');

  // Timeline Editor State
  const [timelineForm, setTimelineForm] = useState({ title: '', url: '', type: 'Article', description: '', date: new Date().toISOString().split('T')[0] });

  const [isSaving, setIsSaving] = useState(false);

  // --- Hobby Functions ---
  const startEditing = (key) => {
    setEditingKey(key);
    setEditForm({ ...hobbies[key] });
    setHobbyEditMode('form');
  };

  const handleCreateNewHobby = () => {
    const newKey = `hobby_${Date.now()}`;
    setEditingKey(newKey);
    setHobbyEditMode('form');
    setEditForm({
      name: "New Hobby",
      tagline: "",
      pageTagline: "",
      description: "",
      color: "#1a2e44",
      icon: "Cocktail",
      isCurrent: true,
      photos: []
    });
  };

  const handleSaveHobby = async () => {
    const { value, errors } = validate(HOBBY_SCHEMA, editForm);
    if (errors.length) {
      alert('Please fix before saving:\n\n' + errors.slice(0, 8).map(e => `• ${e.path ? e.path + ': ' : ''}${e.message}`).join('\n'));
      return;
    }
    setIsSaving(true);
    try {
      await setDoc(doc(db, dbPathHobbies, editingKey), value);
      alert("Hobby changes saved successfully!");
      setEditingKey(null);
    } catch (err) {
      console.error(err);
      alert("Error saving: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const saveHobbyJson = async (value) => {
    await setDoc(doc(db, dbPathHobbies, editingKey), value);
    setEditForm(value);
  };

  const addPhoto = () => {
    if (!newPhotoUrl) return;
    let finalUrl = newPhotoUrl.trim();
    if (finalUrl.includes('imgur.com/') && !finalUrl.includes('i.imgur.com') && !finalUrl.includes('.jpg') && !finalUrl.includes('.png')) {
      const id = finalUrl.split('imgur.com/')[1].split('?')[0];
      if (!id.includes('/')) {
        finalUrl = `https://i.imgur.com/${id}.jpg`;
      }
    }
    if (!safeUrl(finalUrl)) { alert('Photo URL must start with https:// (or / for a local image).'); return; }
    setEditForm(prev => ({
      ...prev,
      photos: [...(prev.photos || []), { url: finalUrl, caption: newPhotoCaption }]
    }));
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const removePhoto = (index) => {
    setEditForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const addRecipe = () => {
    if (!newRecipeName) return;
    setEditForm(prev => ({
      ...prev,
      recipes: [...(prev.recipes || []), {
        name: newRecipeName,
        ingredients: newRecipeIngredients.split(',').map(i => i.trim()).filter(i => i),
        instructions: newRecipeInstructions
      }]
    }));
    setNewRecipeName('');
    setNewRecipeIngredients('');
    setNewRecipeInstructions('');
  };

  const removeRecipe = (index) => {
    setEditForm(prev => ({ ...prev, recipes: prev.recipes.filter((_, i) => i !== index) }));
  };

  // --- Timeline Functions ---
  const handleSaveTimeline = async (e) => {
    e.preventDefault();
    if (!safeUrl(timelineForm.url)) { alert('URL must start with https://'); return; }
    setIsSaving(true);
    try {
      const newKey = `item_${Date.now()}`;
      const docRef = doc(db, dbPathTimeline, newKey);
      await setDoc(docRef, timelineForm);
      alert("Timeline item added!");
      setTimelineForm({ title: '', url: '', type: 'Article', description: '', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error(err);
      alert("Error adding timeline item.");
    }
    setIsSaving(false);
  };

  const handleDeleteTimeline = async (id) => {
    if (!window.confirm("Are you sure you want to delete this timeline item?")) return;
    try {
      await deleteDoc(doc(db, dbPathTimeline, id));
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item.");
    }
  };

  // --- Render Editor View ---
  if (editingKey) {
    return (
      <div style={{ paddingTop: '100px', maxWidth: '800px', margin: '0 auto', padding: '100px 2rem 4rem' }}>
        <button className="back-link" onClick={() => setEditingKey(null)} style={{ marginBottom: '2rem' }}>
          <Icons.ArrowLeft /> Back to Dashboard
        </button>
        <h1 style={{ marginBottom: '2rem' }}>Editing: {editForm.name}</h1>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button className={hobbyEditMode === 'form' ? 'btn-primary' : 'btn-outline'} onClick={() => setHobbyEditMode('form')}>Form</button>
          <button className={hobbyEditMode === 'json' ? 'btn-primary' : 'btn-outline'} onClick={() => setHobbyEditMode('json')}>JSON (all fields)</button>
        </div>
        {hobbyEditMode === 'json' ? (
          <JsonEditor key={editingKey} help={HOBBY_HELP} schema={HOBBY_SCHEMA} value={editForm} onSave={saveHobbyJson} height={520} />
        ) : (
        <div className="admin-panel-card">
          <label className="admin-label">Hobby Name</label>
          <input className="admin-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
          <label className="admin-label">Card Tagline</label>
          <input className="admin-input" value={editForm.tagline} onChange={e => setEditForm({...editForm, tagline: e.target.value})} />
          <label className="admin-label">Page Subtitle</label>
          <input className="admin-input" value={editForm.pageTagline} onChange={e => setEditForm({...editForm, pageTagline: e.target.value})} />
          <label className="admin-label">Description</label>
          <textarea className="admin-input" rows="4" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <label className="admin-label">Theme Color</label>
              <input type="color" className="admin-input" style={{ padding: '0.2rem', height: '40px', width: '100px' }} value={editForm.color || '#1a2e44'} onChange={e => setEditForm({...editForm, color: e.target.value})} />
            </div>
            <div>
              <label className="admin-label">Icon</label>
              <select className="admin-input" style={{ padding: '0.4rem', height: '40px', width: '150px' }} value={editForm.icon || 'Cocktail'} onChange={e => setEditForm({...editForm, icon: e.target.value})}>
                {AVAILABLE_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Status</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontFamily: "'Raleway', sans-serif" }}>
                <input type="checkbox" checked={editForm.isCurrent !== false} onChange={e => setEditForm({...editForm, isCurrent: e.target.checked})} />
                Current Hobby
              </label>
            </div>
          </div>
          <div className="divider-left" style={{ margin: '2rem 0' }}></div>
          <h3 style={{ marginBottom: '1.5rem' }}>Recipes & Notes (Optional)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', background: 'var(--color-cream)', borderRadius: '8px', border: '1px solid var(--color-cream-dark)' }}>
            <input className="admin-input" style={{ marginBottom: 0 }} placeholder="Recipe/Section Name (e.g. Moscow Mule)" value={newRecipeName} onChange={e => setNewRecipeName(e.target.value)} />
            <input className="admin-input" style={{ marginBottom: 0 }} placeholder="Ingredients (comma separated)" value={newRecipeIngredients} onChange={e => setNewRecipeIngredients(e.target.value)} />
            <textarea className="admin-input" style={{ marginBottom: 0 }} rows="3" placeholder="Instructions or general notes" value={newRecipeInstructions} onChange={e => setNewRecipeInstructions(e.target.value)} />
            <button className="btn-primary" style={{ alignSelf: 'flex-start' }} onClick={addRecipe}>Add Recipe / Note</button>
          </div>
          {editForm.recipes && editForm.recipes.length > 0 && (
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              {editForm.recipes.map((recipe, i) => (
                <div key={i} style={{ padding: '1rem', border: '1px solid var(--color-cream-dark)', borderRadius: '4px', position: 'relative' }}>
                  <button className="photo-delete-btn" onClick={() => removeRecipe(i)}>X</button>
                  <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>{recipe.name}</h4>
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', marginBottom: '0.5rem' }}><strong>Ingredients:</strong> {recipe.ingredients.join(', ')}</p>
                  )}
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{recipe.instructions}</p>
                </div>
              ))}
            </div>
          )}
          <div className="divider-left" style={{ margin: '2rem 0' }}></div>
          <h3 style={{ marginBottom: '1.5rem' }}>Photo Gallery</h3>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <input className="admin-input" style={{ flex: 2, marginBottom: 0 }} placeholder="Image URL (e.g. https://imgur.com/image.jpg)" value={newPhotoUrl} onChange={e => setNewPhotoUrl(e.target.value)} />
            <input className="admin-input" style={{ flex: 1, marginBottom: 0 }} placeholder="Caption" value={newPhotoCaption} onChange={e => setNewPhotoCaption(e.target.value)} />
            <button className="btn-primary" onClick={addPhoto}>Add Photo</button>
          </div>
          <div className="photo-grid">
            {editForm.photos?.map((photo, i) => (
              <div key={i} className="photo-thumbnail-admin">
                <img src={photo.url} alt="thumbnail" />
                <button className="photo-delete-btn" onClick={() => removePhoto(i)}>X</button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '3rem', textAlign: 'right' }}>
            <button className="btn-primary" onClick={handleSaveHobby} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
        )}
      </div>
    );
  }

  // --- Render Main Dashboard ---
  return (
    <div style={{ paddingTop: '100px', maxWidth: '1000px', margin: '0 auto', padding: '100px 2rem 4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p className="admin-label" style={{ color: colors.accent.DEFAULT }}>Content Management</p>
        <h1 style={{ fontSize: '2.5rem', color: colors.primary.DEFAULT, marginBottom: '1.5rem' }}>Admin Dashboard</h1>

        {/* Toggle View */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button className={adminView === 'hobbies' ? 'btn-primary' : 'btn-outline'} onClick={() => setAdminView('hobbies')}>Manage Hobbies</button>
          <button className={adminView === 'timeline' ? 'btn-primary' : 'btn-outline'} onClick={() => setAdminView('timeline')}>Manage Timeline</button>
          <button className={adminView === 'ledger' ? 'btn-primary' : 'btn-outline'} onClick={() => setAdminView('ledger')}>Ledger Config</button>
          <button className={adminView === 'resume' ? 'btn-primary' : 'btn-outline'} onClick={() => setAdminView('resume')}>Edit Resume</button>
          <button className={adminView === 'home' ? 'btn-primary' : 'btn-outline'} onClick={() => setAdminView('home')}>Edit Home</button>
        </div>
        <div className="divider"></div>
      </div>

      {adminView === 'ledger' ? (() => {
        // Helper: generic prompt list editor (array of strings)
        const lcPromptArr = {
          char: ledgerCfg?.weekdayChar || LEDGER_WEEKDAY_CHAR,
          hobby: ledgerCfg?.hobbyLearn || LEDGER_HOBBY_LEARN,
          friday: ledgerCfg?.fridayPrep || LEDGER_FRIDAY_PREP,
          saturday: ledgerCfg?.saturdayRest || LEDGER_SATURDAY_REST,
        };
        const lcPromptKey = {char:'weekdayChar', hobby:'hobbyLearn', friday:'fridayPrep', saturday:'saturdayRest'};
        const lcPromptLabel = {char:'Weekday Character Reps', hobby:'Hobby / Learning Reps', friday:'Friday Prep (Erev Shabbat)', saturday:'Saturday Rest (Shabbat)'};

        const savePromptArr = (key, arr) => {
          const cfg = {...(ledgerCfg||{}), items:lcItems, streakItems:lcStreakItems, [lcPromptKey[key]]: arr};
          setLedgerCfg(cfg); saveLedgerCfg(cfg);
        };

        const PromptList = ({pKey}) => {
          const arr = lcPromptArr[pKey];
          return (
            <div>
              <div style={{display:'grid', gap:'0.6rem', marginBottom:'1.5rem'}}>
                {arr.map((text, i) => (
                  <div key={i} className="card" style={{padding:'0.75rem 1rem', display:'flex', alignItems:'flex-start', gap:'0.75rem'}}>
                    <span style={{fontFamily:'ui-monospace,monospace', fontSize:'0.7rem', color:colors.secondary.DEFAULT, paddingTop:2, minWidth:24}}>#{i+1}</span>
                    <span style={{flex:1, fontSize:'0.85rem', lineHeight:1.5}}>{text}</span>
                    <div style={{display:'flex', flexDirection:'column', gap:4, flexShrink:0}}>
                      <button onClick={() => { const a=[...arr]; const t=a[i]; a.splice(i,1); savePromptArr(pKey,a); setLcNewPrompt(''); }} style={{background:'rgba(180,67,45,0.1)', color:'#b4432d', border:'none', padding:'0.25rem 0.6rem', borderRadius:4, cursor:'pointer', fontSize:'0.7rem'}}>✕</button>
                      {i>0 && <button onClick={() => { const a=[...arr]; [a[i-1],a[i]]=[a[i],a[i-1]]; savePromptArr(pKey,a); }} style={{background:colors.cream.DEFAULT, border:`1px solid ${colors.cream.dark}`, padding:'0.25rem 0.5rem', borderRadius:4, cursor:'pointer', fontSize:'0.7rem'}}>↑</button>}
                      {i<arr.length-1 && <button onClick={() => { const a=[...arr]; [a[i],a[i+1]]=[a[i+1],a[i]]; savePromptArr(pKey,a); }} style={{background:colors.cream.DEFAULT, border:`1px solid ${colors.cream.dark}`, padding:'0.25rem 0.5rem', borderRadius:4, cursor:'pointer', fontSize:'0.7rem'}}>↓</button>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="admin-panel-card">
                <h4 style={{fontFamily:"'Cormorant Garamond',serif", marginBottom:'0.75rem'}}>Add prompt</h4>
                <textarea className="admin-input" rows="3" placeholder="Type the new prompt text…" value={lcNewPrompt} onChange={e=>setLcNewPrompt(e.target.value)} />
                <button className="btn-primary" disabled={!lcNewPrompt.trim()||lcSaving} onClick={() => { savePromptArr(pKey, [...arr, lcNewPrompt.trim()]); setLcNewPrompt(''); }}>{lcSaving ? 'Saving…' : 'Add Prompt'}</button>
              </div>
            </div>
          );
        };

        return (
          <div style={{maxWidth:760, margin:'0 auto'}}>
            {/* Sub-tab row */}
            <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap', justifyContent:'center', marginBottom:'2rem'}}>
              {[['checklist','✓ Checklist Items'],['char','💬 Weekday Reps'],['hobby','🎸 Hobby Reps'],['friday','🕯 Friday Prep'],['saturday','✡ Saturday Rest'],['json','{ } JSON']].map(([v,lbl]) => (
                <button key={v} className={lcPromptView===v ? 'btn-primary' : 'btn-outline'} style={{fontSize:'0.7rem', padding:'0.5rem 1rem'}} onClick={() => { setLcPromptView(v); setLcNewPrompt(''); }}>{lbl}</button>
              ))}
            </div>

            {lcPromptView === 'checklist' ? (
              <>
                <div style={{display:'grid', gap:'0.75rem', marginBottom:'2rem'}}>
                  {lcItems.map((it, i) => (
                    <div key={it.id} className="card" style={{padding:'1rem', display:'flex', alignItems:'center', gap:'1rem'}}>
                      <div style={{flex:1}}>
                        <span style={{fontWeight:600}}>{it.label}</span>
                        <span style={{fontSize:'0.75rem', color:colors.secondary.DEFAULT, marginLeft:'0.75rem'}}>{it.cat}</span>
                        {it.star && <span style={{color:'#b4432d', marginLeft:'0.5rem'}}>★</span>}
                      </div>
                      <label style={{display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.75rem', color:colors.secondary.DEFAULT}}>
                        <input type="checkbox" checked={lcStreakItems.includes(it.id)} onChange={e => {
                          const s = e.target.checked ? [...lcStreakItems, it.id] : lcStreakItems.filter(x=>x!==it.id);
                          const cfg = {...(ledgerCfg||{}), items:lcItems, streakItems:s};
                          setLedgerCfg(cfg); saveLedgerCfg(cfg);
                        }} /> streak
                      </label>
                      <button onClick={() => { const newItems=lcItems.filter((_,j)=>j!==i); const cfg={...(ledgerCfg||{}), items:newItems, streakItems:lcStreakItems}; setLedgerCfg(cfg); saveLedgerCfg(cfg); }} style={{background:'rgba(180,67,45,0.1)', color:'#b4432d', border:'none', padding:'0.35rem 0.75rem', borderRadius:4, cursor:'pointer', fontSize:'0.75rem'}}>Remove</button>
                      {i>0 && <button onClick={() => { const a=[...lcItems]; [a[i-1],a[i]]=[a[i],a[i-1]]; const cfg={...(ledgerCfg||{}), items:a, streakItems:lcStreakItems}; setLedgerCfg(cfg); saveLedgerCfg(cfg); }} style={{background:colors.cream.DEFAULT, border:`1px solid ${colors.cream.dark}`, padding:'0.35rem 0.6rem', borderRadius:4, cursor:'pointer', fontSize:'0.75rem'}}>↑</button>}
                      {i<lcItems.length-1 && <button onClick={() => { const a=[...lcItems]; [a[i],a[i+1]]=[a[i+1],a[i]]; const cfg={...(ledgerCfg||{}), items:a, streakItems:lcStreakItems}; setLedgerCfg(cfg); saveLedgerCfg(cfg); }} style={{background:colors.cream.DEFAULT, border:`1px solid ${colors.cream.dark}`, padding:'0.35rem 0.6rem', borderRadius:4, cursor:'pointer', fontSize:'0.75rem'}}>↓</button>}
                    </div>
                  ))}
                </div>
                <div className="admin-panel-card">
                  <h3 style={{fontFamily:"'Cormorant Garamond',serif", marginBottom:'1rem'}}>Add Item</h3>
                  <label className="admin-label">Label</label>
                  <input className="admin-input" placeholder="e.g. Cold shower" value={lcNewItem.label} onChange={e=>setLcNewItem(p=>({...p,label:e.target.value}))} />
                  <label className="admin-label">Category</label>
                  <input className="admin-input" placeholder="e.g. Reset" value={lcNewItem.cat} onChange={e=>setLcNewItem(p=>({...p,cat:e.target.value}))} />
                  <label style={{display:'flex', alignItems:'center', gap:'0.5rem', fontFamily:"'Raleway',sans-serif", fontSize:'0.8rem', marginBottom:'1rem'}}>
                    <input type="checkbox" checked={lcNewItem.star} onChange={e=>setLcNewItem(p=>({...p,star:e.target.checked}))} /> Mark as priority (★)
                  </label>
                  <button className="btn-primary" disabled={!lcNewItem.label||!lcNewItem.cat||lcSaving} onClick={() => {
                    const id = lcNewItem.label.toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_');
                    const newItem = {id, label:lcNewItem.label, cat:lcNewItem.cat, ...(lcNewItem.star ? {star:true} : {})};
                    const cfg = {...(ledgerCfg||{}), items:[...lcItems, newItem], streakItems:lcStreakItems};
                    setLedgerCfg(cfg); saveLedgerCfg(cfg);
                    setLcNewItem({label:'',cat:'',star:false});
                  }}>{lcSaving ? 'Saving…' : 'Add Item'}</button>
                </div>
              </>
            ) : lcPromptView === 'json' ? (
              <JsonEditor help={LEDGER_CONFIG_HELP} schema={LEDGER_CONFIG_SCHEMA} value={ledgerCfg}
                defaultValue={{ items: LEDGER_ITEMS, streakItems: ['minyan','fast'], weekdayChar: LEDGER_WEEKDAY_CHAR, hobbyLearn: LEDGER_HOBBY_LEARN, fridayPrep: LEDGER_FRIDAY_PREP, saturdayRest: LEDGER_SATURDAY_REST }}
                onSave={async (v) => { if (!ledgerCfgPath) throw new Error('Not signed in'); await setDoc(doc(db, ...ledgerCfgPath), v); }} />
            ) : (
              <PromptList pKey={lcPromptView} />
            )}
          </div>
        );
      })() : adminView === 'hobbies' ? (
        <>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
             <button className="btn-primary" onClick={handleCreateNewHobby}>+ Add New Hobby</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {Object.entries(hobbies).map(([key, hobby]) => (
              <div key={key} className="card" style={{ padding: '2rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => startEditing(key)}>
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>{hobby.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: colors.secondary.DEFAULT }}>{hobby.photos?.length || 0} Photos{hobby.hidden ? ' · hidden' : ''}</p>
                </div>
                <span style={{ color: colors.accent.DEFAULT }}><Icons.ArrowRight /></span>
              </div>
            ))}
          </div>
        </>
      ) : adminView === 'resume' ? (
        <JsonEditor title="Edit Resume" help={RESUME_HELP} schema={RESUME_SCHEMA} value={resumeData} defaultValue={RESUME_DEFAULT} height={520}
          onSave={async (v) => { await setDoc(doc(db, ...dbPathResume), v); if (onResumeUpdate) onResumeUpdate(v); }} />
      ) : adminView === 'home' ? (
        <JsonEditor title="Edit Home Page" help={HOME_HELP} schema={HOME_SCHEMA} value={homeData} defaultValue={HOME_DEFAULT} height={420}
          onSave={async (v) => { await setDoc(doc(db, ...dbPathHome), v); if (onHomeUpdate) onHomeUpdate(v); }} />
      ) : (
        <div>
          <div className="admin-panel-card" style={{ maxWidth: '600px', margin: '0 auto 3rem' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", marginBottom: '1.5rem' }}>Add Timeline Item</h2>
            <form onSubmit={handleSaveTimeline}>
              <label className="admin-label">Title</label>
              <input required className="admin-input" value={timelineForm.title} onChange={e => setTimelineForm({...timelineForm, title: e.target.value})} placeholder="e.g., The Future of AI" />

              <label className="admin-label">URL</label>
              <input required type="url" className="admin-input" value={timelineForm.url} onChange={e => setTimelineForm({...timelineForm, url: e.target.value})} placeholder="https://youtube.com/..." />

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="admin-label">Type</label>
                  <select className="admin-input" value={timelineForm.type} onChange={e => setTimelineForm({...timelineForm, type: e.target.value})}>
                    <option value="Article">Article</option>
                    <option value="Video">Video</option>
                    <option value="Website">Website</option>
                    <option value="Paper">Paper</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="admin-label">Date</label>
                  <input required type="date" className="admin-input" value={timelineForm.date} onChange={e => setTimelineForm({...timelineForm, date: e.target.value})} />
                </div>
              </div>

              <label className="admin-label">Description / Thoughts (Optional)</label>
              <textarea className="admin-input" rows="3" value={timelineForm.description} onChange={e => setTimelineForm({...timelineForm, description: e.target.value})} placeholder="Why is this interesting?" />

              <button type="submit" className="btn-primary" disabled={isSaving} style={{ width: '100%' }}>
                {isSaving ? "Adding..." : "+ Add to Timeline"}
              </button>
            </form>
          </div>

          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", textAlign: 'center', marginBottom: '1.5rem' }}>Existing Timeline Items</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
            {timelineItems.length === 0 ? <p style={{ textAlign: 'center' }}>No items yet.</p> : timelineItems.map((item) => (
               <div key={item.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: colors.secondary.DEFAULT }}>{item.date} • {item.type}</span>
                    <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', marginTop: '0.25rem' }}>{item.title}</h4>
                  </div>
                  <button onClick={() => handleDeleteTimeline(item.id)} style={{ background: 'rgba(220,53,69,0.1)', color: '#dc3545', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
               </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


// ============================================
// LEDGER PAGE (Admin Only — Personal Tracker)
// ============================================
const LEDGER_ITEMS = [
  {id:'minyan',  label:'Minyan',                       cat:'Foundations'},
  {id:'torah',   label:'Torah learning',               cat:'Foundations'},
  {id:'fast',    label:'Fasting window held',          cat:'Foundations'},
  {id:'workout', label:'Workout',                      cat:'Foundations'},
  {id:'work',    label:'Focused work block',           cat:'Work & Growth'},
  {id:'project', label:'Project progress',             cat:'Work & Growth'},
  {id:'charity', label:'Gave — time or money',         cat:'Connection'},
  {id:'family',  label:'Reached out to family/friend', cat:'Connection'},
  {id:'dating',  label:'Dating action',                cat:'Connection', star:true},
  {id:'room',    label:'Room & desk reset',            cat:'Reset'},
];
const LEDGER_WEEKDAY_CHAR = [
  "Write down 5 good things that happened in the last week.",
  "Ask a coworker about their weekend plans — 3 real follow-up questions.",
  "In one conversation today, don\'t offer advice. Just reflect back what they said.",
  "Catch one negative thought today and write the reframe next to it.",
  "Publicly credit someone else for something you actually contributed to.",
  "No phone for the first 15 minutes after waking.",
  "Text one person a specific, detailed thank-you — not just \"thanks.\"",
  "Make one phone call today instead of texting.",
  "Ask someone \"what\'s been the hardest part of your week\" and just listen.",
  "Give a specific, genuine compliment to a coworker or stranger.",
  "Ask someone for honest feedback on something you did — take it without defending.",
  "Eat one meal today with zero screens.",
  "Write a note to your future self about something good happening right now.",
  "Ask a family member a question you\'ve never asked them before.",
  "Let someone finish a full thought without interrupting, even if you disagree.",
  "Find one genuine thing to appreciate about a task you\'re dreading, before you start it.",
  "Do one task that feels \"beneath you\" without mentioning it to anyone.",
  "Take a walk with no destination and no headphones.",
  "Call someone just to tell them you\'re grateful for them — no other agenda.",
  "Ask a coworker about their longer-term goals, and actually listen.",
  "Sit with someone for 10 minutes and just ask open questions — phone away.",
  "Apologize for one small thing you\'ve been brushing off.",
];
const LEDGER_HOBBY_LEARN = [
  "20 min guitar — run scales you already know, focus on clean transitions.",
  "Cook a dish you\'ve never made before, start to finish.",
  "Run 20–30 min easy, no watch — run by feel.",
  "20 min guitar — learn a new chord shape or riff you\'ve never played.",
  "Cook a familiar dish, but improve one technique — knife work, searing, seasoning.",
  "Run with the watch on, but keep it strictly easy. Don\'t chase pace.",
  "20 min guitar — play along to a song you like, work on timing.",
  "Try a cuisine you haven\'t cooked before.",
  "Run a route you\'ve never run before.",
  "20 min guitar — work on the strumming or fingerpicking pattern you\'re weakest at.",
  "Cook for someone else, not just yourself.",
  "A short interval run — a few pickups mixed into an easy run.",
  "20 min guitar — record yourself playing something and listen back critically.",
  "Meal-prep something a bit more ambitious than usual.",
  "Run with no music or podcast — just think.",
];
const LEDGER_FRIDAY_PREP = [
  "Erev Shabbat: digital declutter — close every open tab, clear downloads, zero out your personal inbox.",
  "Erev Shabbat: 15-minute physical cleanup of your living space before sundown.",
  "Erev Shabbat: iron a shirt, lay out tomorrow\'s clothes. Dress a notch better than the day requires.",
  "Erev Shabbat: cook something simple and functional at home tonight, done before sundown.",
];
const LEDGER_SATURDAY_REST = [
  "Shabbat: read one chapter of a non-technical, non-self-help book.",
  "Shabbat: sit with your gratitude notebook and review the last 10–20 entries.",
  "Shabbat: full presence — no phone, no problem-solving, just be with whoever\'s around.",
  "Shabbat: read something reflective, zero screens.",
];
const LEDGER_EPOCH = new Date(2026, 0, 1);
const LEDGER_DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const ledgerDKey = (d) => {
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
};
const ledgerStartOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const ledgerEmptyEntry = () => ({checks:{}, charRep:false, learnRep:false, burnout:{energy:0,motivation:0,patience:0}});


// SHBPage — Shmiras Habris Streak Tracker ───────────────────────────────────
const SHBPage = ({ user }) => {
  const MILESTONES = [
    { days: 1,   hebrew: 'דרך המסילה',    label: 'Beginning of the Path',  emoji: '🌱',
      benefit: 'Dopamine baseline reset begins', science: 'Reward circuits start recalibrating after compulsive-use disruption.', peer: true,
      tags: ['DOPAMINE', 'REWARD CIRCUIT'] },
    { days: 3,   hebrew: 'חזק חזק',       label: 'Be Strong',              emoji: '💪',
      benefit: 'Acute withdrawal peaks, then clears', science: 'The 72-hour neurochemical instability window — mood & cravings most intense, then begin to settle.', peer: true,
      tags: ['WITHDRAWAL', 'NEUROCHEMICAL'] },
    { days: 7,   hebrew: 'הכובש את יצרו', label: 'Master of Desires',      emoji: '⚔️',
      benefit: 'Testosterone surges ~146% of baseline', science: 'Jiang et al. (2003, Zhejiang Univ.) found a significant testosterone peak at exactly 7 days of abstinence.', peer: true,
      tags: ['TESTOSTERONE', 'HORMONAL'] },
    { days: 14,  hebrew: "עבד ה׳",        label: 'Servant of God',         emoji: '🙏',
      benefit: 'Dopamine receptor sensitivity recovering', science: 'D2 receptors begin upregulating (Kühn & Gallinat, 2014) — dulled reward sensitivity starts to sharpen.', peer: true,
      tags: ['D2 RECEPTOR', 'DOPAMINE'] },
    { days: 28,  hebrew: 'שומר ברית',      label: 'Keeper of the Covenant',  emoji: '🛡️',
      benefit: 'Dopamine transporter density recovering', science: 'After ~4 weeks, DAT binding potential increases in striatal reward regions — first measurable neurochemical rebound (Laine et al., 1999).', peer: false,
      tags: ['DAT RECOVERY', 'STRIATUM'] },
    { days: 30,  hebrew: 'גבור כח',       label: 'Mighty One',             emoji: '🔥',
      benefit: 'Fatigue drops; prolactin normalises', science: 'Straub & Schmidt (2022) found significant fatigue reduction and hormonal stabilisation at the 30-day mark.', peer: true,
      tags: ['PROLACTIN', 'FATIGUE'] },
    { days: 50,  hebrew: 'ירא שמים',      label: 'God-Fearing',            emoji: '☀️',
      benefit: 'Prefrontal-limbic connectivity strengthens', science: 'Impulse-control circuits show measurable recovery; top-down regulation over urges improves (Bechara, 2005).', peer: false,
      tags: ['PREFRONTAL CORTEX', 'IMPULSE CONTROL'] },
    { days: 70,  hebrew: "אוהב ה׳",       label: 'Lover of God',           emoji: '❤️',
      benefit: 'Sleep architecture & HPA axis restore', science: 'Cortisol rhythms and deep-sleep quality normalise as the stress-response system recalibrates.', peer: false,
      tags: ['SLEEP', 'HPA AXIS', 'CORTISOL'] },
    { days: 84,  hebrew: 'נפש טהורה',      label: 'Pure Soul',              emoji: '🌟',
      benefit: 'Grey matter structural recovery begins', science: 'First measurable grey-matter volume rebound in prefrontal and striatal regions after ~12 weeks of abstinence (Connolly et al., PLOS ONE 2013).', peer: false,
      tags: ['GREY MATTER', 'NEUROPLASTICITY'] },
    { days: 90,  hebrew: 'צדיק',          label: 'Righteous',              emoji: '⭐',
      benefit: 'Dopamine receptor density substantially recovered', science: 'PET imaging studies (Volkow, NIDA) show D2 receptor density recovering to near-normal at ~90 days.', peer: true,
      tags: ['D2 RECEPTOR', 'PET IMAGING'] },
    { days: 180, hebrew: 'צדיק גמור',     label: 'Completely Righteous',   emoji: '✨',
      benefit: 'Gray matter volume begins recovering', science: 'Sustained abstinence linked to increased caudate volume and BDNF upregulation supporting neuroplastic repair.', peer: false,
      tags: ['GREY MATTER', 'BDNF', 'CAUDATE'] },
    { days: 365, hebrew: 'בעל תשובה',     label: 'Master of Repentance',   emoji: '👑',
      benefit: 'Long-term neuroplastic remodelling complete', science: 'White-matter integrity and dopamine transporter levels approach healthy baselines after one year (Lim et al., 2002).', peer: false,
      tags: ['WHITE MATTER', 'NEUROPLASTICITY'] },
  ];

  const [streakStart, setStreakStart] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [customDt, setCustomDt] = useState('');
  const [confirmEnd, setConfirmEnd] = useState(false);

  const dbRef = () => doc(db, 'artifacts', appId, 'users', user.uid, 'shb', 'current');

  useEffect(() => {
    return onSnapshot(dbRef(), snap => {
      const d = snap.exists() ? snap.data() : {};
      setStreakStart(d.startedAt || null);
      setLoading(false);
    });
  }, [user.uid]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsed = streakStart ? Math.max(0, now - streakStart) : 0;
  const elapsedDays = elapsed / 86400000;
  const totalSec = Math.floor(elapsed / 1000);
  const dDays = Math.floor(totalSec / 86400);
  const dHrs = Math.floor((totalSec % 86400) / 3600);
  const dMins = Math.floor((totalSec % 3600) / 60);
  const dSecs = totalSec % 60;
  const pad = n => String(n).padStart(2, '0');

  const passedMs = MILESTONES.filter(m => elapsedDays >= m.days);
  const currentMs = passedMs[passedMs.length - 1] || null;
  const nextMs = MILESTONES.find(m => elapsedDays < m.days) || null;
  const arcMaxDays = nextMs ? nextMs.days : 365;
  const arcProgress = Math.min(elapsedDays / arcMaxDays, 1);
  const arcMilestones = MILESTONES.filter(m => m.days <= arcMaxDays);

  // SVG ring constants
  const cx = 140, cy = 140, r = 110;
  const circ = 2 * Math.PI * r;
  const arcLen = circ * 0.75;        // 270° arc
  const gapLen = circ - arcLen;
  const trackDash = `${arcLen} ${gapLen}`;
  const progressDash = `${arcLen * arcProgress} ${circ}`;

  // Arc starts at 225° from top (7:30 o'clock), clockwise 270°
  const startDeg = 225;
  const toXY = deg => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: +(cx + r * Math.cos(rad)).toFixed(1), y: +(cy + r * Math.sin(rad)).toFixed(1) };
  };
  const milestoneAngle = d => startDeg + (d / arcMaxDays) * 270;

  const startNow = () => {
    setDoc(dbRef(), { startedAt: Date.now() });
    setShowPicker(false);
  };
  const startWithDate = () => {
    const t = customDt ? new Date(customDt).getTime() : NaN;
    if (isNaN(t)) return;
    setDoc(dbRef(), { startedAt: t });
    setShowPicker(false);
    setCustomDt('');
  };
  const endStreak = () => {
    setDoc(dbRef(), { startedAt: null });
    setConfirmEnd(false);
  };

  const nowISO = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  // Dark palette
  const D = {
    bg:         '#0d1117',
    surface:    '#161c2d',
    card:       '#1a2238',
    border:     'rgba(255,255,255,0.08)',
    borderStr:  'rgba(255,255,255,0.15)',
    text:       '#e8edf8',
    muted:      '#7a8ba8',
    faint:      '#4a5568',
    blue:       '#4d9ef7',
    blueDim:    'rgba(77,158,247,0.14)',
    amber:      '#f5a623',
    amberDim:   'rgba(245,166,35,0.14)',
    purple:     '#7c5cfc',
    red:        '#ef4444',
    line:       '#2a3550',
  };

  if (loading) return <div style={{padding:'120px 20px', textAlign:'center', background:D.bg, minHeight:'100vh', color:D.muted}}>Loading…</div>;

  return (
    <div style={{minHeight:'calc(100vh - 80px)', padding:'100px 20px 80px', background:D.bg, display:'flex', flexDirection:'column', alignItems:'center'}}>
      <div style={{width:'100%', maxWidth:480}}>

        {/* Header */}
        <div style={{marginBottom:32}}>
          <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.65rem', letterSpacing:'0.3em', textTransform:'uppercase', color:D.blue, marginBottom:12}}>
            PERSONAL TRACKER · STREAK
          </div>
          <h1 style={{fontFamily:"'Raleway',sans-serif", fontSize:'clamp(1.6rem,5vw,2.2rem)', fontWeight:700, color:D.text, margin:'0 0 8px', letterSpacing:'-0.02em'}}>שמירת הברית</h1>
          <p style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.82rem', color:D.muted, margin:0, lineHeight:1.5}}>
            Track your streak. Each milestone unlocks the science behind what’s changing in your brain.
          </p>
        </div>

        {/* Legend */}
        <div style={{background:D.surface, border:`1px solid ${D.border}`, borderRadius:10, padding:'10px 14px', display:'flex', gap:20, marginBottom:28, flexWrap:'wrap'}}>
          <div style={{display:'flex', alignItems:'center', gap:7}}>
            <div style={{width:8, height:8, borderRadius:'50%', background:D.blue, flexShrink:0}}></div>
            <span style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.75rem', color:D.muted}}>Peer-reviewed evidence</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:7}}>
            <div style={{width:8, height:8, borderRadius:'50%', background:D.amber, flexShrink:0}}></div>
            <span style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.75rem', color:D.muted}}>Inferred from addiction neuroscience</span>
          </div>
        </div>
        {/* SVG Ring */}
        <div style={{position:'relative', width:280, height:280, margin:'0 auto 28px'}}>
          <svg width="280" height="280" style={{overflow:'visible'}}>
            <defs>
              <linearGradient id="shbGrad" gradientUnits="userSpaceOnUse" x1="60" y1="60" x2="220" y2="220">
                <stop offset="0%" stopColor={D.blue} />
                <stop offset="100%" stopColor={D.purple} />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle cx={cx} cy={cy} r={r} fill="none"
              stroke={D.line} strokeWidth={20}
              strokeDasharray={trackDash} strokeLinecap="round"
              transform={`rotate(135 ${cx} ${cy})`} />
            {/* Progress arc */}
            {streakStart && arcProgress > 0 && (
              <circle cx={cx} cy={cy} r={r} fill="none"
                stroke="url(#shbGrad)" strokeWidth={20}
                strokeDasharray={progressDash} strokeLinecap="round"
                transform={`rotate(135 ${cx} ${cy})`} />
            )}
            {/* Milestone dots */}
            {arcMilestones.map(m => {
              const {x, y} = toXY(milestoneAngle(m.days));
              const passed = elapsedDays >= m.days;
              const isNext = m === nextMs;
              return (
                <g key={m.days}>
                  <circle cx={x} cy={y} r={isNext ? 15 : 11}
                    fill={passed ? D.blue : D.card}
                    stroke={passed ? D.blue : (isNext ? D.blue : D.border)}
                    strokeWidth={isNext ? 2.5 : 1.5} />
                  <text x={x} y={y + 4} textAnchor="middle"
                    fontSize={isNext ? 9 : 8}
                    fill={passed ? '#fff' : (isNext ? D.blue : D.faint)}
                    fontFamily="'Raleway',sans-serif" fontWeight="700">
                    {m.days}
                  </text>
                </g>
              );
            })}
          </svg>
          {/* Center readout */}
          <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none'}}>
            {streakStart ? (
              <>
                <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.6rem', letterSpacing:'0.14em', color:D.muted, textTransform:'uppercase', marginBottom:6}}>
                  {currentMs ? currentMs.label : 'Streak Active'}
                </div>
                <div style={{fontFamily:"'Raleway',sans-serif", fontSize: dDays >= 10 ? 32 : 40, fontWeight:700, color:D.text, lineHeight:1, letterSpacing:'-0.02em'}}>
                  {dDays > 0 ? `${dDays}d ${dHrs}h` : `${dHrs}h ${pad(dMins)}m`}
                </div>
                <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.8rem', color:D.muted, marginTop:4}}>
                  {dDays > 0 ? `${pad(dMins)}m ${pad(dSecs)}s` : `${pad(dSecs)}s`}
                </div>
                {nextMs && (
                  <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.6rem', color:D.amber, marginTop:10, textAlign:'center', lineHeight:1.5}}>
                    {Math.ceil(nextMs.days - elapsedDays) <= 1 ? '<1 day to' : `${Math.ceil(nextMs.days - elapsedDays)} days to`}
                    <br /><span style={{fontWeight:700}}>{nextMs.hebrew}</span>
                  </div>
                )}
                {!nextMs && (
                  <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.65rem', color:D.amber, marginTop:8}}>All milestones reached 👑</div>
                )}
              </>
            ) : (
              <>
                <div style={{fontSize:36}}>✦️</div>
                <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.75rem', color:D.muted, marginTop:8, textAlign:'center'}}>No active streak</div>
              </>
            )}
          </div>
        </div>
        {/* Buttons */}
        {!streakStart ? (
          <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:8}}>
            <button onClick={startNow}
              style={{width:'100%', padding:'14px', background:`linear-gradient(135deg, ${D.blue}, ${D.purple})`, color:'#fff', border:'none', borderRadius:12, fontSize:'1rem', fontWeight:600, letterSpacing:'0.04em', fontFamily:"'Raleway',sans-serif", cursor:'pointer'}}>
              Start Streak Now
            </button>
            <button onClick={() => setShowPicker(p => !p)}
              style={{width:'100%', padding:'12px', background:'none', border:`1px solid ${D.borderStr}`, color:D.text, borderRadius:12, fontSize:'0.9rem', fontFamily:"'Raleway',sans-serif", cursor:'pointer'}}>
              {showPicker ? 'Cancel' : 'Set a past start date'}
            </button>
            {showPicker && (
              <div style={{background:D.surface, border:`1px solid ${D.border}`, borderRadius:12, padding:'16px'}}>
                <p style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.8rem', color:D.muted, marginBottom:10}}>When did you start?</p>
                <input type="datetime-local" value={customDt} max={nowISO}
                  onChange={e => setCustomDt(e.target.value)}
                  style={{width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${D.border}`, fontFamily:"'Raleway',sans-serif", fontSize:'0.85rem', color:D.text, background:D.card, marginBottom:12, boxSizing:'border-box', colorScheme:'dark'}} />
                <button onClick={startWithDate}
                  style={{width:'100%', padding:'10px', background:D.blue, color:'#fff', border:'none', borderRadius:8, fontFamily:"'Raleway',sans-serif", fontWeight:600, cursor:'pointer'}}>
                  Set Start Time
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{marginBottom:8}}>
            {!confirmEnd ? (
              <button onClick={() => setConfirmEnd(true)}
                style={{width:'100%', padding:'14px', background:'rgba(239,68,68,0.10)', color:D.red, border:`1px solid rgba(239,68,68,0.25)`, borderRadius:12, fontSize:'1rem', fontWeight:600, fontFamily:"'Raleway',sans-serif", cursor:'pointer', letterSpacing:'0.04em'}}>
                End Streak
              </button>
            ) : (
              <div style={{background:D.surface, border:`1px solid ${D.border}`, borderRadius:12, padding:'18px', textAlign:'center'}}>
                <p style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.9rem', color:D.text, marginBottom:16}}>
                  End your streak of <strong style={{color:D.blue}}>{dDays > 0 ? `${dDays} days` : `${dHrs}h ${pad(dMins)}m`}</strong>?
                </p>
                <div style={{display:'flex', gap:10}}>
                  <button onClick={endStreak} style={{flex:1, padding:'10px', background:'rgba(239,68,68,0.15)', color:D.red, border:`1px solid rgba(239,68,68,0.3)`, borderRadius:8, fontFamily:"'Raleway',sans-serif", cursor:'pointer', fontWeight:600}}>Yes, end it</button>
                  <button onClick={() => setConfirmEnd(false)} style={{flex:1, padding:'10px', background:'none', border:`1px solid ${D.border}`, color:D.muted, borderRadius:8, fontFamily:"'Raleway',sans-serif", cursor:'pointer'}}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Current level card */}
        {streakStart && currentMs && (
          <div style={{marginTop:20, background:D.surface, border:`1px solid ${D.border}`, borderLeft:`3px solid ${D.amber}`, borderRadius:12, padding:'16px 18px'}}>
            <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.6rem', letterSpacing:'0.2em', textTransform:'uppercase', color:D.amber, marginBottom:6}}>Current Level</div>
            <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:6}}>
              <span style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.7rem', fontWeight:700, color:D.blue, letterSpacing:'0.15em'}}>DAY {currentMs.days}</span>
              <span style={{fontFamily:"'Raleway',sans-serif", fontSize:'1rem', fontWeight:700, color:D.text}}>{currentMs.benefit}</span>
            </div>
            <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:10}}>
              {currentMs.tags.map(t => (
                <span key={t} style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.6rem', letterSpacing:'0.1em', color:D.muted, border:`1px solid ${D.border}`, borderRadius:4, padding:'2px 7px'}}>{t}</span>
              ))}
            </div>
            <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.78rem', color:D.muted, lineHeight:1.6}}>{currentMs.science}</div>
            <div style={{marginTop:8}}>
              <span style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.6rem', letterSpacing:'0.1em', padding:'2px 8px', borderRadius:4,
                background: currentMs.peer ? D.blueDim : D.amberDim,
                color: currentMs.peer ? D.blue : D.amber,
                border: `1px solid ${currentMs.peer ? 'rgba(77,158,247,0.25)' : 'rgba(245,166,35,0.25)'}`}}>
                {currentMs.peer ? 'PEER-REVIEWED' : 'INFERRED'}
              </span>
            </div>
          </div>
        )}

        {/* Timeline milestone list */}
        <div style={{marginTop:24, position:'relative'}}>
          <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.6rem', letterSpacing:'0.25em', textTransform:'uppercase', color:D.muted, marginBottom:20}}>
            Journey Milestones
          </div>
          {/* Vertical line */}
          <div style={{position:'absolute', left:11, top:36, bottom:0, width:2, background:`linear-gradient(180deg, ${D.blue}55, transparent)`}}></div>
          <div style={{display:'flex', flexDirection:'column', gap:4}}>
            {MILESTONES.map((m, i) => {
              const passed = elapsedDays >= m.days;
              const isNext = m === nextMs;
              const daysLeft = Math.ceil(m.days - elapsedDays);
              const showDetail = passed || isNext;
              return (
                <div key={m.days} style={{display:'flex', gap:16, paddingBottom: i < MILESTONES.length-1 ? 16 : 0, opacity: !passed && !isNext && streakStart ? 0.32 : 1, transition:'opacity 0.4s'}}>
                  {/* Dot */}
                  <div style={{flexShrink:0, width:24, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:3}}>
                    <div style={{width:24, height:24, borderRadius:'50%', border:`2px solid ${passed ? D.blue : (isNext ? D.blue : D.border)}`, background: passed ? D.blue : (isNext ? D.blueDim : D.bg), display:'flex', alignItems:'center', justifyContent:'center', zIndex:1, flexShrink:0}}>
                      {passed
                        ? <span style={{color:'#fff', fontSize:11, fontWeight:700}}>✓</span>
                        : isNext
                          ? <div style={{width:8, height:8, borderRadius:'50%', background:D.blue}}></div>
                          : <div style={{width:6, height:6, borderRadius:'50%', background:D.faint}}></div>
                      }
                    </div>
                  </div>
                  {/* Card */}
                  <div style={{flex:1, background: isNext ? D.surface : (passed ? D.surface : 'transparent'), border: (isNext || passed) ? `1px solid ${isNext ? D.blue+'40' : D.border}` : 'none', borderRadius:10, padding: (isNext || passed) ? '14px 16px' : '2px 0 0'}}>
                    <div style={{display:'flex', alignItems:'center', gap:10, marginBottom: showDetail ? 8 : 0}}>
                      <span style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.14em', color: isNext ? D.blue : (passed ? D.blue : D.faint)}}>DAY {m.days}</span>
                      <span style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.88rem', fontWeight: isNext ? 700 : 500, color: isNext ? D.text : (passed ? D.text : D.muted)}}>{m.benefit}</span>
                      {isNext && streakStart && <span style={{marginLeft:'auto', fontFamily:"'Raleway',sans-serif", fontSize:'0.6rem', color:D.amber, fontWeight:600, flexShrink:0}}>{daysLeft}d left</span>}
                    </div>
                    {showDetail && (
                      <>
                        <div style={{display:'flex', flexWrap:'wrap', gap:5, marginBottom:8}}>
                          {m.tags.map(t => (
                            <span key={t} style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.58rem', letterSpacing:'0.1em', color:D.muted, border:`1px solid ${D.border}`, borderRadius:3, padding:'1px 6px'}}>{t}</span>
                          ))}
                        </div>
                        <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.75rem', color:D.muted, lineHeight:1.6, marginBottom:8, fontStyle:'italic'}}>{m.science}</div>
                        <span style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.58rem', letterSpacing:'0.1em', padding:'2px 7px', borderRadius:3,
                          background: m.peer ? D.blueDim : D.amberDim,
                          color: m.peer ? D.blue : D.amber,
                          border: `1px solid ${m.peer ? 'rgba(77,158,247,0.2)' : 'rgba(245,166,35,0.2)'}`}}>
                          {m.peer ? 'PEER-REVIEWED' : 'INFERRED'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start timestamp */}
        {streakStart && (
          <div style={{marginTop:20, fontFamily:"'Raleway',sans-serif", fontSize:'0.72rem', color:D.faint, textAlign:'center'}}>
            Started · {new Date(streakStart).toLocaleString('en-US', {month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit'})}
          </div>
        )}

      </div>
    </div>
  );
};

const LedgerPage = ({ user }) => {
  const L = {
    ink:           '#0d1117',
    inkSoft:       '#161c2d',
    inkLine:       'rgba(255,255,255,0.08)',
    parchment:     '#1a2238',
    parchmentDim:  '#1e2a42',
    parchmentLine: 'rgba(255,255,255,0.06)',
    brass:         '#f5a623',
    brassDeep:     '#d4891a',
    ember:         '#ef4444',
    text:          '#e8edf8',
    textMuted:     '#7a8ba8',
    textOnInk:     '#e8edf8',
    textOnInkMuted:'#7a8ba8',
    slate:         '#4d9ef7',
    slateDeep:     '#2d7fd4',
  };

  const today = ledgerStartOfDay(new Date());
  const todayKey = ledgerDKey(today);

  const [ledger, setLedger] = useState({});
  const [viewedDate, setViewedDate] = useState(today);
  const [statusMsg, setStatusMsg] = useState('Loading…');
  const [statusErr, setStatusErr] = useState(false);
  const [showHist, setShowHist] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [restoreText, setRestoreText] = useState('');

  const viewedKey = ledgerDKey(viewedDate);
  const entry = ledger[viewedKey] || ledgerEmptyEntry();

  const colSegments = user ? ['artifacts', appId, 'users', user.uid, 'ledger'] : null;
  const cfgSegments = user ? ['artifacts', appId, 'users', user.uid, 'config', 'ledger'] : null;

  const [ledgerConfig, setLedgerConfig] = useState(null);
  useEffect(() => {
    if (!cfgSegments) return;
    const ref = doc(db, ...cfgSegments);
    const unsub = onSnapshot(ref, snap => { if (snap.exists()) setLedgerConfig(snap.data()); });
    return unsub;
  }, [user?.uid]);

  const activeItems = ledgerConfig?.items || LEDGER_ITEMS;
  const activeStreakItems = ledgerConfig?.streakItems || ['minyan','fast'];
  const activeWeekdayChar = ledgerConfig?.weekdayChar || LEDGER_WEEKDAY_CHAR;
  const activeHobbyLearn = ledgerConfig?.hobbyLearn || LEDGER_HOBBY_LEARN;
  const activeFridayPrep = ledgerConfig?.fridayPrep || LEDGER_FRIDAY_PREP;
  const activeSaturdayRest = ledgerConfig?.saturdayRest || LEDGER_SATURDAY_REST;

  useEffect(() => {
    if (!colSegments) return;
    const q = collection(db, ...colSegments);
    const unsub = onSnapshot(q, snap => {
      const data = {};
      snap.docs.forEach(d => { data[d.id] = d.data(); });
      setLedger(data);
      setStatusMsg('');
      setStatusErr(false);
    }, () => { setStatusMsg('Could not load — check connection'); setStatusErr(true); });
    return unsub;
  }, [user?.uid]);

  const persist = async (key, e) => {
    if (!colSegments) return;
    try {
      await setDoc(doc(db, ...colSegments, key), e);
      setStatusMsg('Saved ' + new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}));
      setStatusErr(false);
    } catch {
      setStatusMsg('Could not save — try again');
      setStatusErr(true);
    }
  };

  const updateEntry = (updater) => {
    const current = ledger[viewedKey] || ledgerEmptyEntry();
    const updated = updater(current);
    setLedger(prev => ({...prev, [viewedKey]: updated}));
    persist(viewedKey, updated);
  };

  const toggleItem = (id) => updateEntry(e => ({...e, checks: {...(e.checks||{}), [id]: !(e.checks||{})[id]}}));
  const toggleRep = (field) => updateEntry(e => ({...e, [field]: !e[field]}));
  const setBurnout = (dim, val) => updateEntry(e => ({
    ...e, burnout: {...(e.burnout||{}), [dim]: (e.burnout||{})[dim]===val ? 0 : val}
  }));
  const resetDay = () => updateEntry(() => ledgerEmptyEntry());

  const goToDate = (d) => {
    const nd = ledgerStartOfDay(d);
    if (nd > today) return;
    setViewedDate(nd);
  };

  const computeStreak = (id) => {
    let count = 0;
    if (ledger[todayKey]?.checks?.[id]) count = 1;
    let cursor = new Date(today);
    cursor.setDate(cursor.getDate() - 1);
    while (true) {
      const k = ledgerDKey(cursor);
      if (ledger[k]?.checks?.[id]) { count++; cursor.setDate(cursor.getDate()-1); }
      else break;
    }
    return count;
  };

  const burnoutScore = (b) => b ? (b.energy||0)+(b.motivation||0)+(b.patience||0) : 0;
  const burnoutLogged = (b) => !!b && b.energy>0 && b.motivation>0 && b.patience>0;

  const completionFraction = (e, d) => {
    if (!e) return 0;
    const wd = d.getDay();
    const total = activeItems.length + 1 + ((wd===5||wd===6) ? 1 : 2);
    let done = 0;
    activeItems.forEach(it => { if (e.checks?.[it.id]) done++; });
    if (burnoutLogged(e.burnout)) done++;
    if (wd===5||wd===6) { if (e.charRep) done++; }
    else { if (e.charRep) done++; if (e.learnRep) done++; }
    return done / total;
  };

  const getDayContent = (d) => {
    const wd = d.getDay();
    const dse = Math.floor((d - LEDGER_EPOCH) / 86400000);
    const wse = Math.floor(dse / 7);
    const mod = (arr) => arr[((dse % arr.length) + arr.length) % arr.length];
    const modW = (arr) => arr[((wse % arr.length) + arr.length) % arr.length];
    if (wd===5) return {type:'single', title:"Today's rep", text: modW(activeFridayPrep)};
    if (wd===6) return {type:'single', title:"Today's rep", text: modW(activeSaturdayRest)};
    return {type:'double', charText: mod(activeWeekdayChar), learnText: mod(activeHobbyLearn)};
  };

  const dayContent = getDayContent(viewedDate);

  const LCheckBox = ({ checked }) => (
    <div style={{width:19, height:19, borderRadius:4, border:`1.5px solid ${checked ? L.brassDeep : L.textMuted}`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: checked ? L.brass : 'transparent', transition:'background 0.15s'}}>
      {checked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={L.text} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
    </div>
  );

  const LBtn = ({children, onClick, style={}}) => (
    <button onClick={onClick} style={{background:'none', border:`1px solid ${L.inkLine}`, color:L.textMuted, fontSize:'0.7rem', letterSpacing:'0.08em', padding:'6px 14px', borderRadius:20, cursor:'pointer', display:'block', margin:'10px auto 0', fontFamily:"'Raleway',sans-serif", ...style}}>{children}</button>
  );

  const RepCard = ({title, text, checked, onToggle, accent}) => (
    <div style={{background:L.parchment, border:`1px solid ${L.inkLine}`, borderLeft:`4px solid ${accent}`, borderRadius:8, padding:'14px 16px 16px', marginBottom:16, boxShadow:'0 4px 20px rgba(26,46,68,0.06)'}}>
      <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', color:accent===L.brass ? L.brassDeep : accent, marginBottom:6}}>{title}</div>
      <p style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.9rem', color:L.text, margin:'6px 0 12px', lineHeight:1.6}}>{text}</p>
      <div onClick={onToggle} style={{display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:4, cursor:'pointer'}}>
        <div style={{fontSize:15, color:L.text}}>Done</div>
        <LCheckBox checked={checked} />
      </div>
    </div>
  );

  // Build checklist rows with category headers
  const checklistRows = [];
  let lastCat = null;
  activeItems.forEach(it => {
    if (it.cat !== lastCat) { checklistRows.push({type:'header', cat:it.cat}); lastCat = it.cat; }
    checklistRows.push({type:'item', ...it});
  });

  const parchmentBg = {
    background: L.parchment,
    backgroundImage: `repeating-linear-gradient(${L.parchment} 0px, ${L.parchment} 37px, ${L.parchmentLine} 38px)`,
  };

  return (
    <div style={{background:L.ink, minHeight:'calc(100vh - 80px)', padding:'100px 20px 80px', display:'flex', justifyContent:'center'}}>
      <div style={{width:'100%', maxWidth:560}}>

        {/* Masthead */}
        <div style={{textAlign:'center', marginBottom:6}}>
          <p style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.7rem', letterSpacing:'0.3em', textTransform:'uppercase', color:L.brass, marginBottom:'0.5rem'}}>One ledger, every day</p>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(2rem,6vw,2.8rem)', fontWeight:400, color:L.text, margin:'0 0 0.5rem'}}>Daily Ledger</h1>
          <div className="divider"></div>
        </div>

        {/* Date nav */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:4}}>
          <button onClick={() => { const d=new Date(viewedDate); d.setDate(d.getDate()-1); goToDate(d); }} style={{background:L.inkSoft, border:`1px solid ${L.inkLine}`, color:L.text, width:32, height:32, borderRadius:8, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>‹</button>
          <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.75rem', letterSpacing:'0.06em', color:L.textMuted, minWidth:180, textAlign:'center'}}>
            {LEDGER_DAY_NAMES[viewedDate.getDay()]} · {viewedDate.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}
          </div>
          <button onClick={() => { const d=new Date(viewedDate); d.setDate(d.getDate()+1); goToDate(d); }} disabled={viewedKey===todayKey} style={{background:L.inkSoft, border:`1px solid ${L.inkLine}`, color:L.text, width:32, height:32, borderRadius:8, fontSize:18, cursor:viewedKey===todayKey?'default':'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:viewedKey===todayKey?0.3:1}}>›</button>
        </div>
        {viewedKey!==todayKey && (
          <div style={{textAlign:'center', marginBottom:16}}>
            <button onClick={() => goToDate(today)} style={{background:'none', border:'none', color:L.brass, fontSize:11, textDecoration:'underline', cursor:'pointer', padding:0}}>Jump to today</button>
          </div>
        )}
        <div style={{textAlign:'center', fontFamily:"'Raleway',sans-serif", fontSize:'0.7rem', color:L.textMuted, marginBottom:'1.5rem'}}>Synced to Firebase — saves as you check items.</div>

        {/* Streaks */}
        <div style={{display:'flex', gap:10, marginBottom:18}}>
          {activeStreakItems.map(id => [id, id.charAt(0).toUpperCase()+id.slice(1)+' streak']).map(([id,lbl]) => (
            <div key={id} style={{flex:1, background:L.inkSoft, border:`1px solid ${L.inkLine}`, borderRadius:10, padding:'10px 12px', textAlign:'center'}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:500, color:L.brass, lineHeight:1.1}}>{computeStreak(id)}</div>
              <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.7rem', color:L.textMuted, marginTop:2}}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Checklist */}
        <div style={{background:L.parchment, border:`1px solid ${L.inkLine}`, borderRadius:12, padding:'6px 18px 10px', boxShadow:'0 4px 20px rgba(26,46,68,0.06)', marginBottom:16}}>
          {checklistRows.map((row, i) => row.type==='header'
            ? <div key={`h-${row.cat}`} style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', color:L.brassDeep, paddingTop:14, paddingBottom:2}}>{row.cat}</div>
            : <div key={row.id} onClick={() => toggleItem(row.id)} style={{display:'flex', alignItems:'center', justifyContent:'space-between', height:38, cursor:'pointer'}}>
                <div style={{fontSize:15, color:L.text}}>{row.label}{row.star && <span style={{color:L.ember, marginLeft:4}}>★</span>}</div>
                <LCheckBox checked={!!(entry.checks?.[row.id])} />
              </div>
          )}
        </div>

        {/* Burnout */}
        {(() => {
          const b = entry.burnout || {energy:0,motivation:0,patience:0};
          const score = burnoutScore(b);
          const yDate = new Date(viewedDate); yDate.setDate(yDate.getDate()-1);
          const yEntry = ledger[ledgerDKey(yDate)];
          const showFlag = burnoutLogged(b) && yEntry && burnoutLogged(yEntry.burnout) && (score+burnoutScore(yEntry.burnout))/2 <= 7;
          return (
            <div style={{background:L.parchment, border:`1px solid ${L.inkLine}`, borderLeft:`4px solid ${L.slate}`, borderRadius:8, padding:'14px 16px 14px', marginBottom:16, boxShadow:'0 4px 20px rgba(26,46,68,0.06)'}}>
              <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', color:L.slateDeep, marginBottom:4}}>Burnout check</div>
              {[['energy','Energy'],['motivation','Motivation'],['patience','Patience']].map(([dim,lbl]) => (
                <div key={dim} style={{display:'flex', alignItems:'center', justifyContent:'space-between', height:32}}>
                  <div style={{fontSize:14, color:L.text}}>{lbl}</div>
                  <div style={{display:'flex', gap:5}}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} onClick={() => setBurnout(dim,i)} style={{width:16, height:16, borderRadius:'50%', cursor:'pointer', border:`1.5px solid ${(b[dim]||0)>=i ? L.slateDeep : L.textMuted}`, background:(b[dim]||0)>=i ? L.slate : 'transparent'}} />
                    ))}
                  </div>
                </div>
              ))}
              <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.75rem', color:L.textMuted, marginTop:8}}>Score: {score}/15</div>
              {showFlag && <div style={{fontSize:12, color:L.ember, marginTop:6, fontWeight:600}}>⚠ Two low days in a row — consider easing up.</div>}
            </div>
          );
        })()}

        {/* Rep cards */}
        {dayContent.type==='single'
          ? <RepCard title={dayContent.title} text={dayContent.text} checked={!!entry.charRep} onToggle={() => toggleRep('charRep')} accent={L.ember} />
          : <>
              <RepCard title="Character rep" text={dayContent.charText} checked={!!entry.charRep} onToggle={() => toggleRep('charRep')} accent={L.ember} />
              <RepCard title="Hobby practice · 15–30 min" text={dayContent.learnText} checked={!!entry.learnRep} onToggle={() => toggleRep('learnRep')} accent={L.brass} />
            </>
        }

        {/* 30-day strip */}
        <div style={{marginTop:8}}>
          <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.65rem', letterSpacing:'0.15em', textTransform:'uppercase', color:L.textMuted, marginBottom:8, textAlign:'center'}}>Last 30 days · tap a bar to view that day</div>
          <div style={{display:'flex', alignItems:'flex-end', gap:3, height:58, background:L.inkSoft, border:`1px solid ${L.inkLine}`, borderRadius:10, padding:'8px 8px 10px'}}>
            {Array.from({length:30}, (_,i) => {
              const d = new Date(today); d.setDate(d.getDate()-(29-i));
              const k = ledgerDKey(d);
              const e2 = k===viewedKey ? entry : ledger[k];
              const frac = completionFraction(e2, d);
              const isViewed = k===viewedKey;
              const isToday = k===todayKey;
              return (
                <div key={k} onClick={() => goToDate(d)} title={`${k}: ${Math.round(frac*100)}%`} style={{flex:1, borderRadius:2, minHeight:3, cursor:'pointer', height:Math.max(3,Math.round(frac*40)), background: frac>0 ? `linear-gradient(180deg,${L.brass},${L.brassDeep})` : L.inkLine, outline: isViewed ? `1.5px solid ${L.ember}` : isToday ? `1px solid ${L.brass}` : 'none', outlineOffset:1, position:'relative'}} />
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div style={{textAlign:'center', fontFamily:"'Raleway',sans-serif", fontSize:'0.7rem', color:statusErr ? L.ember : L.textMuted, marginTop:14, minHeight:16}}>{statusMsg}</div>

        {/* Insights */}
        <LBtn onClick={() => setShowInsights(v=>!v)}>{showInsights ? 'Hide insights' : '📊 Insights'}</LBtn>
        {showInsights && (() => {
          const last30 = Array.from({length:30}, (_,i) => {
            const d = new Date(today); d.setDate(d.getDate()-(29-i));
            const k = ledgerDKey(d);
            return {d, k, e: k===viewedKey ? entry : ledger[k]};
          });
          const daysWithData = last30.filter(({e})=>e && Object.keys(e.checks||{}).length>0);
          const avgCompletion = daysWithData.length ? Math.round(daysWithData.reduce((s,{e,d})=>s+completionFraction(e,d),0)/daysWithData.length*100) : 0;

          // Per-item rates
          const itemRates = activeItems.map(it => {
            const done = last30.filter(({e})=>e?.checks?.[it.id]).length;
            return {id:it.id, label:it.label, rate: done/30, done};
          }).sort((a,b)=>b.rate-a.rate);

          // Day-of-week averages
          const dowData = Array.from({length:7}, (_,wd) => {
            const days = last30.filter(({d})=>d.getDay()===wd);
            const avg = days.length ? days.reduce((s,{e,d:dd})=>s+completionFraction(e,dd),0)/days.length : 0;
            return {wd, avg: Math.round(avg*100), n: days.length};
          });
          const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

          // Burnout avg (last 14 logged days)
          const burnoutDays = last30.filter(({e})=>burnoutLogged(e?.burnout));
          const burnoutAvg = burnoutDays.length ? (burnoutDays.reduce((s,{e})=>s+burnoutScore(e.burnout),0)/burnoutDays.length).toFixed(1) : null;

          // Weekly completion trend (last 4 weeks)
          const weekTrend = Array.from({length:4}, (_,wi) => {
            const days = Array.from({length:7}, (_,di) => {
              const d = new Date(today); d.setDate(d.getDate()-((3-wi)*7+di));
              const k = ledgerDKey(d);
              return {d, e: ledger[k]};
            });
            const logged = days.filter(({e})=>e && Object.keys(e.checks||{}).length>0);
            return {w:3-wi, avg: logged.length ? Math.round(logged.reduce((s,{e,d})=>s+completionFraction(e,d),0)/logged.length*100) : null};
          });

          const barStyle = (pct, color) => ({display:'inline-block', height:8, width:`${Math.max(2,pct)}%`, background:color, borderRadius:4, transition:'width 0.3s'});

          return (
            <div style={{marginTop:14, background:L.inkSoft, border:`1px solid ${L.inkLine}`, borderRadius:10, padding:'16px 14px', display:'flex', flexDirection:'column', gap:20}}>
              {/* Overview */}
              <div>
                <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.65rem', letterSpacing:'0.18em', textTransform:'uppercase', color:L.textMuted, marginBottom:8}}>30-day overview</div>
                <div style={{display:'flex', gap:16}}>
                  <div style={{flex:1, background:L.ink, border:`1px solid ${L.inkLine}`, borderRadius:8, padding:'10px 12px', textAlign:'center'}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:500, color:L.brass}}>{avgCompletion}%</div>
                    <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.65rem', color:L.textMuted, marginTop:2}}>avg completion</div>
                  </div>
                  <div style={{flex:1, background:L.ink, border:`1px solid ${L.inkLine}`, borderRadius:8, padding:'10px 12px', textAlign:'center'}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:500, color:L.brass}}>{daysWithData.length}</div>
                    <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.65rem', color:L.textMuted, marginTop:2}}>days logged</div>
                  </div>
                  {burnoutAvg && <div style={{flex:1, background:L.ink, border:`1px solid ${L.inkLine}`, borderRadius:8, padding:'10px 12px', textAlign:'center'}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:500, color: parseFloat(burnoutAvg)<8 ? L.ember : L.brass}}>{burnoutAvg}</div>
                    <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.65rem', color:L.textMuted, marginTop:2}}>burnout avg/15</div>
                  </div>}
                </div>
              </div>

              {/* Habit rates */}
              <div>
                <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.65rem', letterSpacing:'0.18em', textTransform:'uppercase', color:L.textMuted, marginBottom:10}}>Habit consistency (30 days)</div>
                {itemRates.map(({id,label,rate,done}) => (
                  <div key={id} style={{marginBottom:7}}>
                    <div style={{display:'flex', justifyContent:'space-between', fontFamily:"'Raleway',sans-serif", fontSize:'0.75rem', color:L.text, marginBottom:3}}>
                      <span>{label}</span>
                      <span style={{fontFamily:'ui-monospace,monospace', color: rate>=0.7?L.brass:rate>=0.4?L.text:L.ember}}>{done}/30</span>
                    </div>
                    <div style={{background:L.inkLine, borderRadius:4, height:8}}>
                      <div style={barStyle(rate*100, rate>=0.7?L.brass:rate>=0.4?L.slate:L.ember)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Day-of-week pattern */}
              <div>
                <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.65rem', letterSpacing:'0.18em', textTransform:'uppercase', color:L.textMuted, marginBottom:10}}>Best days of week</div>
                <div style={{display:'flex', gap:4, alignItems:'flex-end', height:60}}>
                  {dowData.map(({wd,avg,n}) => (
                    <div key={wd} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
                      <div style={{width:'100%', background: avg>0?`linear-gradient(180deg,${L.brass},${L.brassDeep})`:L.inkLine, borderRadius:3, height:n?Math.max(4,Math.round(avg*0.44)):4, minHeight:4}} title={n?`${avg}% avg`:'no data'} />
                      <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.6rem', color:L.textMuted}}>{DAY_SHORT[wd]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly trend */}
              <div>
                <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.65rem', letterSpacing:'0.18em', textTransform:'uppercase', color:L.textMuted, marginBottom:8}}>Weekly trend (4 weeks)</div>
                {weekTrend.map(({w,avg}) => (
                  <div key={w} style={{marginBottom:7}}>
                    <div style={{display:'flex', justifyContent:'space-between', fontFamily:"'Raleway',sans-serif", fontSize:'0.75rem', color:L.text, marginBottom:3}}>
                      <span style={{color:L.textMuted}}>{w===0?'This week':w===1?'Last week':`${w+1} weeks ago`}</span>
                      <span style={{fontFamily:"'Cormorant Garamond',serif", fontSize:15, color:L.brass}}>{avg!=null?avg+'%':'—'}</span>
                    </div>
                    <div style={{background:L.inkLine, borderRadius:4, height:8}}>
                      {avg!=null && <div style={barStyle(avg, L.brass)} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* History */}
        <LBtn onClick={() => setShowHist(h=>!h)}>{showHist ? 'Hide history' : 'Show history'}</LBtn>
        {showHist && (
          <div style={{marginTop:14, background:L.inkSoft, border:`1px solid ${L.inkLine}`, borderRadius:10, padding:'10px 14px'}}>
            {Array.from({length:14}, (_,i) => {
              const d = new Date(today); d.setDate(d.getDate()-(i+1));
              const k = ledgerDKey(d);
              const e2 = ledger[k];
              const pct = Math.round(completionFraction(e2,d)*100);
              return (
                <div key={k} onClick={() => goToDate(d)} style={{display:'flex', justifyContent:'space-between', fontFamily:"'Raleway',sans-serif", fontSize:'0.75rem', padding:'6px 0', borderBottom: i<13 ? `1px solid ${L.inkLine}` : 'none', color:L.textMuted, cursor:'pointer'}}>
                  <span>{d.toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span>
                  <span style={{color:L.brass}}>{e2 ? pct+'%' : '—'}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Reset */}
        <LBtn onClick={resetDay} style={{color:L.ember}}>Clear this day</LBtn>

        {/* Backup / restore */}
        <LBtn onClick={() => { setShowBackup(b=>!b); setRestoreText(JSON.stringify(ledger,null,2)); }}>{showBackup ? 'Hide backup' : 'Backup / restore'}</LBtn>
        {showBackup && (
          <div style={{marginTop:14, background:L.inkSoft, border:`1px solid ${L.inkLine}`, borderRadius:10, padding:'14px'}}>
            <div style={{fontFamily:"'Raleway',sans-serif", fontSize:'0.75rem', color:L.textMuted, marginBottom:8}}>Your data is in Firebase. Copy this JSON somewhere safe as a backup, or paste it back to restore.</div>
            <textarea
              spellCheck={false} autoCorrect="off" autoCapitalize="off"
              value={restoreText}
              onChange={e => setRestoreText(e.target.value)}
              style={{width:'100%', height:90, fontFamily:'ui-monospace,monospace', fontSize:'0.7rem', background:L.inkSoft, color:L.text, border:`1px solid ${L.inkLine}`, borderRadius:6, padding:8, resize:'vertical'}}
            />
            <div style={{display:'flex', gap:8, marginTop:8}}>
              <button onClick={() => { try { navigator.clipboard.writeText(JSON.stringify(ledger,null,2)); setStatusMsg('Copied to clipboard'); } catch { setStatusMsg('Select text and copy manually'); } }}
                style={{flex:1, background:'none', border:`1px solid ${L.inkLine}`, color:L.textMuted, fontFamily:"'Raleway',sans-serif", fontSize:'0.7rem', padding:'6px 12px', borderRadius:20, cursor:'pointer'}}>Copy</button>
              <button onClick={async () => {
                if (!colSegments) return;
                let parsed;
                try { parsed = parseLenient(restoreText).value; }
                catch (e) { setStatusMsg(`Could not restore — ${e.toString()}`); setStatusErr(true); return; }
                const { value, errors } = validate(LEDGER_BACKUP_SCHEMA, parsed);
                if (errors.length) {
                  setStatusMsg(`Could not restore — ${errors[0].path}: ${errors[0].message}${errors.length > 1 ? ` (+${errors.length - 1} more)` : ''}`);
                  setStatusErr(true);
                  return;
                }
                const entries = Object.entries(value);
                if (!window.confirm(`Restore ${entries.length} day(s)? Days with the same date will be overwritten.`)) return;
                try {
                  // Firestore batches cap at 500 writes; each chunk is all-or-nothing.
                  for (let i = 0; i < entries.length; i += 400) {
                    const batch = writeBatch(db);
                    entries.slice(i, i + 400).forEach(([k, e]) => batch.set(doc(db, ...colSegments, k), e));
                    await batch.commit();
                  }
                  setStatusMsg(`Restored ${entries.length} days`);
                  setStatusErr(false);
                } catch (e) { setStatusMsg(`Restore failed: ${e.message}`); setStatusErr(true); }
              }} style={{flex:1, background:'none', border:`1px solid ${L.inkLine}`, color:L.textMuted, fontFamily:"'Raleway',sans-serif", fontSize:'0.7rem', padding:'6px 12px', borderRadius:20, cursor:'pointer'}}>Restore</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// ============================================
// NAVIGATION COMPONENT
// ============================================
const Navigation = ({ currentPage, setCurrentPage, isAdmin }) => {
  const publicTabs = [
    { id: 'home', label: 'Shlomo' },
    { id: 'resume', label: 'Resume' },
    { id: 'interests', label: 'Interests' },
    { id: 'essays', label: 'Essays' },
  ];
  const adminTabs = isAdmin ? [
    { id: 'admin', label: 'Dashboard' },
    { id: 'ledger', label: 'Tracker' },
    { id: 'shb', label: 'Streak' },
  ] : [];
  const allTabs = [...publicTabs, ...adminTabs];
  const isActive = (id) => {
    if (id === 'home') return currentPage === 'home' || currentPage.startsWith('hobby-');
    return currentPage === id || (id === 'essays' && currentPage === 'blog');
  };
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem 2rem 0' }}>
      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
        {allTabs.map((tab, idx) => (
          <button key={tab.id} onClick={() => setCurrentPage(tab.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", fontSize: '1rem',
              fontWeight: isActive(tab.id) ? 600 : 400,
              color: tab.id === 'admin' ? '#c0392b' : isActive(tab.id) ? '#1a2e44' : '#a0abb8',
              padding: 0, marginRight: idx < allTabs.length - 1 ? '2rem' : 0,
              letterSpacing: '-0.01em', lineHeight: 1.4, transition: 'color 0.15s',
            }}>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

// ============================================
// PAGE COMPONENTS
// ============================================
const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);

const HobbyDetail = ({ hobby }) => {
  const recipes = asList(hobby.recipes).filter(r => r && typeof r === 'object');
  const notes = hobby.notes || hobby.description || '';
  const links = asList(hobby.links).filter(l => l && safeUrl(l.url));
  const sections = asList(hobby.sections).filter(s => s && typeof s === 'object' && !s.hidden);
  const isEmpty = !notes && recipes.length === 0 && links.length === 0 && sections.length === 0;
  const S = { heading: { fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b9bae', marginBottom: '0.75rem', fontFamily: "'Inter', sans-serif" }, body: { fontSize: '0.9rem', color: '#4a6080', lineHeight: 1.7, fontFamily: "'Inter', sans-serif" } };
  const linkStyle = { color: '#1a2e44', textDecoration: 'underline', textDecorationColor: '#c8d4e0' };
  return (
    <div>
      <p style={{ fontSize: '1rem', fontWeight: 500, color: '#1a2e44', marginBottom: '1.25rem', fontFamily: "'Inter', sans-serif" }}>{hobby.name}</p>
      {isEmpty && <p style={S.body}>Nothing here yet.</p>}
      {notes ? <div style={{ marginBottom: '1.5rem' }}><RichText text={notes} style={S.body} linkStyle={linkStyle} /></div> : null}
      {recipes.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={S.heading}>{hobby.recipesTitle || 'Recipes'}</p>
          {recipes.map((r, i) => (
            <div key={i} style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #eef0f3' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1a2e44', marginBottom: '0.4rem', fontFamily: "'Inter', sans-serif" }}>
                {safeUrl(r.link) ? <a href={safeUrl(r.link)} target="_blank" rel="noopener noreferrer" style={linkStyle}>{r.name || r.title}</a> : (r.name || r.title)}
              </p>
              <RichText text={r.description} style={S.body} linkStyle={linkStyle} />
              {asList(r.ingredients).length > 0 && (
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.1rem' }}>
                  {asList(r.ingredients).map((ing, j) => <li key={j} style={S.body}>{renderInline(ing, linkStyle)}</li>)}
                </ul>
              )}
              {r.instructions && <div style={{ marginTop: '0.5rem' }}><RichText text={r.instructions} style={S.body} linkStyle={linkStyle} /></div>}
              {asList(r.steps).length > 0 && (
                <ol style={{ marginTop: '0.5rem', paddingLeft: '1.1rem' }}>
                  {asList(r.steps).map((step, j) => <li key={j} style={S.body}>{renderInline(step, linkStyle)}</li>)}
                </ol>
              )}
            </div>
          ))}
        </div>
      )}
      {sections.map((sec, i) => (
        <ContentBlock key={i} block={sec} headingStyle={S.heading} textStyle={S.body} linkStyle={linkStyle} bullet="• " />
      ))}
      {links.length > 0 && (
        <div>
          <p style={S.heading}>Links</p>
          {links.map((l, i) => (
            <a key={i} href={safeUrl(l.url)} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '0.9rem', color: '#1a2e44', textDecoration: 'underline', textDecorationColor: '#c8d4e0', marginBottom: '0.5rem', fontFamily: "'Inter', sans-serif" }}>{l.label || l.url}</a>
          ))}
        </div>
      )}
    </div>
  );
};

const InterestsPage = ({ hobbies }) => {
  const [selected, setSelected] = useState(null);
  // `hidden: true` hides a hobby; `order` (lower first) sorts it. Unordered hobbies keep their existing order.
  const entries = Object.entries(hobbies || {})
    .filter(([, h]) => h && typeof h === 'object' && !h.hidden)
    .sort(([, a], [, b]) => (Number.isFinite(a.order) ? a.order : 1e9) - (Number.isFinite(b.order) ? b.order : 1e9));
  const current = entries.filter(([,h]) => h.isCurrent);
  const former  = entries.filter(([,h]) => !h.isCurrent);

  const ListRow = ({ hobbyKey, h, dimmed }) => {
    const isSelected = selected === hobbyKey;
    return (
      <>
        <button onClick={() => setSelected(isSelected ? null : hobbyKey)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            width: '100%', padding: '0.75rem 0', background: 'none', border: 'none',
            borderBottom: '1px solid #eef0f3', cursor: 'pointer', textAlign: 'left' }}>
          <span style={{ fontSize: '0.95rem', fontFamily: "'Inter', sans-serif",
            color: isSelected ? '#1a2e44' : dimmed ? '#8b9bae' : '#4a6080',
            fontWeight: isSelected ? 500 : 400 }}>{h.name}</span>
          <span style={{ fontSize: '0.8rem', color: '#c8d4e0', transform: isSelected ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>→</span>
        </button>
        {/* Mobile: expand inline */}
        {isSelected && (
          <div style={{ display: 'block' }} className="mobile-detail">
            <div style={{ padding: '1.25rem 0 1.25rem 0.5rem', borderBottom: '1px solid #eef0f3' }}>
              <HobbyDetail hobbyKey={hobbyKey} hobby={h} />
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3.5rem 2rem 6rem' }}>
      <div className="interests-layout">
        {/* Left: list */}
        <div className="interests-list">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {current.map(([key, h]) => <ListRow key={key} hobbyKey={key} h={h} dimmed={false} />)}
          </div>
          {former.length > 0 && (
            <div style={{ marginTop: '2.5rem' }}>
              <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b0bbc8', marginBottom: '0.75rem', fontFamily: "'Inter', sans-serif" }}>Former</p>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {former.map(([key, h]) => <ListRow key={key} hobbyKey={key} h={h} dimmed={true} />)}
              </div>
            </div>
          )}
        </div>
        {/* Right: detail (desktop only) */}
        {selected && hobbies[selected] && (
          <div className="interests-detail">
            <HobbyDetail hobbyKey={selected} hobby={hobbies[selected]} />
          </div>
        )}
      </div>
    </div>
  );
};


const HOME_DEFAULT = { about: "", rightNow: "", otherStuff: [] };

const HomePage = ({ homeData }) => {
  const hd = homeData && typeof homeData === 'object' ? homeData : HOME_DEFAULT;
  const T = { fontSize: '0.95rem', color: '#4a6080', lineHeight: 1.75, fontFamily: "'Inter', sans-serif" };
  const H = { fontSize: '1rem', fontWeight: 500, color: '#1a2e44', marginBottom: '0.75rem', fontFamily: "'Inter', sans-serif" };
  const link = { color: '#1a2e44', textDecoration: 'underline', textDecorationColor: '#c8d4e0' };
  const titles = { about: 'About', rightNow: 'Right now', contact: 'Get in touch', otherStuff: 'Other stuff', ...(hd.titles && typeof hd.titles === 'object' ? hd.titles : {}) };
  const custom = asList(hd.sections).filter(s => s && typeof s === 'object');
  const otherStuff = asList(hd.otherStuff);
  // `layout` lists block ids in order; anything left out is hidden.
  const layout = Array.isArray(hd.layout) ? hd.layout : [...HOME_BUILTIN_BLOCKS, ...custom.map((s, i) => s.id || `#${i}`)];

  const block = (key, title, children) => (
    <div key={key} style={{ marginBottom: '3rem' }}>
      <h2 style={H}>{title}</h2>
      {children}
    </div>
  );

  const renderBlock = (id) => {
    if (id === 'about') return block(id, titles.about, <RichText text={hd.about} style={T} linkStyle={link} />);
    if (id === 'rightNow') return block(id, titles.rightNow, <RichText text={hd.rightNow} style={T} linkStyle={link} />);
    if (id === 'contact') return block(id, titles.contact, (
      <p style={T}>
        The best way to reach me is by emailing{' '}
        <a href={`mailto:${CONFIG.email}`} style={link}>{CONFIG.email}</a>.
        {' '}I'm also on{' '}
        <a href={CONFIG.linkedin} target="_blank" rel="noopener noreferrer" style={link}>LinkedIn</a>
        {' '}and{' '}
        <a href={CONFIG.github} target="_blank" rel="noopener noreferrer" style={link}>GitHub</a>.
      </p>
    ));
    if (id === 'otherStuff') {
      if (otherStuff.length === 0) return null;
      return block(id, titles.otherStuff, (
        <p style={T}>
          {otherStuff.map((line, i) => (
            <span key={i}>— {renderInline(line, link)}{i < otherStuff.length - 1 ? <br /> : null}</span>
          ))}
        </p>
      ));
    }
    const sec = typeof id === 'string' && id.startsWith('#') ? custom[Number(id.slice(1))] : custom.find(s => s.id === id);
    return sec ? <ContentBlock key={id} block={sec} headingStyle={H} textStyle={T} linkStyle={link} /> : null;
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3.5rem 2rem 6rem' }}>
      {layout.map(renderBlock)}
    </div>
  );
};


const HobbyPage = ({ hobbyKey, hobbies, setCurrentPage }) => {
  const hobby = hobbies[hobbyKey];
  if (!hobby) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Hobby not found</div>;
  const Icon = (hobby.icon && Icons[hobby.icon]) ? Icons[hobby.icon] : (hobbyIcons[hobbyKey] || Icons.Cocktail);


  return (
    <div style={{ minHeight: '100vh' }}>
      <section style={{ backgroundColor: hobby.color, color: colors.cream.DEFAULT, padding: '6rem 2rem', textAlign: 'center', position: 'relative', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
        {!hobby.isCurrent && (
          <div style={{
            position: 'absolute', top: '1.5rem', right: '2rem', fontFamily: "'Raleway', sans-serif", fontSize: '0.65rem',
            letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.4)',
            padding: '0.35rem 0.75rem', zIndex: 10, textShadow: 'none', borderRadius: '3px'
          }}>Former Hobby</div>
        )}
        <button className="back-link" onClick={() => setCurrentPage('interests')} style={{ color: colors.cream.DEFAULT, background: 'rgba(0,0,0,0.4)', padding: '0.5rem 1rem', borderRadius: '4px', marginBottom: '2rem', textShadow: 'none' }}>
          <Icons.ArrowLeft /> Back to Home
        </button>
        <div style={{ marginBottom: '1.5rem', opacity: 0.9 }}><Icon /></div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 400, marginBottom: '1rem' }}>{hobby.name}</h1>
        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.85rem', letterSpacing: '0.1em', opacity: 0.85, marginBottom: '2rem' }}>{hobby.pageTagline}</p>
        <div className="divider" style={{ background: `linear-gradient(90deg, transparent, ${colors.accent.DEFAULT}, transparent)` }}></div>
        <p style={{ fontFamily: "'Raleway', sans-serif", maxWidth: '600px', margin: '1.5rem auto 0', fontWeight: 300, lineHeight: 1.8, opacity: 0.9 }}>{hobby.description}</p>
      </section>

      {hobby.recipes && hobby.recipes.length > 0 && (
        <section className="recipe-section" style={{ padding: '4rem 2rem 0', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', fontWeight: 500, color: colors.primary.DEFAULT, marginBottom: '0.5rem', textAlign: 'center' }}>Recipes & Notes</h2>
          <div className="divider"></div>
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {hobby.recipes.map((recipe, index) => (
              <div key={index} style={{ background: colors.cream.light, border: `1px solid ${colors.cream.dark}`, padding: '2rem', borderRadius: '4px' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: colors.primary.DEFAULT, marginBottom: '1rem' }}>{recipe.name}</h3>
                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.accent.dark, marginBottom: '0.5rem' }}>Ingredients</h4>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                      {recipe.ingredients.map((item, idx) => (
                        <li key={idx} style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.9rem', color: colors.primary.DEFAULT, paddingBottom: '0.35rem', borderBottom: `1px dashed ${colors.cream.dark}`, marginBottom: '0.35rem' }}>
                          <span style={{ color: colors.secondary.DEFAULT, marginRight: '0.5rem' }}>•</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {recipe.instructions && (
                  <div>
                    <h4 style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.accent.dark, marginBottom: '0.5rem' }}>Instructions</h4>
                    <p>{recipe.instructions}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}


    </div>
  );
};

const RESUME_DEFAULT = {
  sections: [
    {
      title: "Education",
      entries: [
        { title: "Yeshiva University \u2014 Yeshiva College", date: "2021 \u2013 2025", sub: "B.A. in Computer Science \u00b7 Jay and Jeanie Schottenstein Honors Program", bullets: ["GPA 3.73 \u00b7 ACT 36 \u00b7 Dean\u2019s List 2021\u20132023"] },
        { title: "Yeshivat HaKotel \u00b7 S. Daniel Abraham Israel Program", date: "2019 \u2013 2021", sub: "Jerusalem, Israel", bullets: [] }
      ]
    },
    {
      title: "Experience",
      entries: [
        { title: "Palantir Technologies", date: "2025 \u2013 Present", sub: "Forward Deployed Engineer", bullets: ["Building the future of healthcare technology."] },
        { title: "Yeshiva College Student Council \u2014 President", date: "May 2023 \u2013 May 2024", sub: "", bullets: ["Orchestrated the inaugural YU Tech Fair \u2014 10 companies, 80%+ of CS/Math majors attending.", "Led redesign of the Yeshiva College logo and launched a new apparel line.", "Grew digital presence through an Instagram account and marketing campaign for incoming students."] },
        { title: "Intervest \u2014 Summer Analyst", date: "Summer 2023", sub: "New York, NY", bullets: ["Automated cash reconciliation, cutting a manual 10-min-per-statement process to seconds.", "Built financial models for ABS Auto Loans and projected loss curves for underlying assets.", "Completed credit analysis and risk assessments to prepare term sheets for early-stage loans.", "Trained in DCF, Comparable Company Analysis, and Precedent Transaction Analysis."] },
        { title: "Algorithmic Trading \u2014 Self-Employed", date: "June 2022 \u2013 Present", sub: "", bullets: ["Built a backtesting environment covering 5+ years of historical intraday data.", "Integrated TD Ameritrade REST API via Python wrapper for live order placement and market data streaming.", "Focused on event-based volatility trading and intraday momentum strategies across equities and options."] }
      ]
    },
    {
      title: "Research",
      entries: [
        { title: "Sy Syms School of Business, Yeshiva University", date: "Oct 2022 \u2013 May 2023", sub: "Research Assistant \u00b7 Prof. Pablo Hernandez-Lagos \u2014 Startup Differentiation from Industry", bullets: ["Studied startup differentiation as a predictor of exit \u2014 model predicted exit likelihood, timeline, and valuation above baseline accuracy.", "Applied NLP (doc2vec) to archived startup websites to quantify similarity at founding."] }
      ]
    }
  ],
  skills: ["Java","Python","C","SQL","PostgreSQL","MongoDB","Docker","Git","Excel","q/kdb+","Data Science","Machine Learning","REST APIs","Linux"]
};

const ResumePage = ({ resumeData }) => {
  const rd = resumeData && typeof resumeData === 'object' ? resumeData : RESUME_DEFAULT;
  const contact = rd.contact && typeof rd.contact === 'object' ? rd.contact : {};
  const email = contact.email || 'solomonschwartz01@gmail.com';
  const contactLinks = asList(contact.links).filter(l => l && safeUrl(l.url));
  const links = contactLinks.length ? contactLinks : [{ label: 'github.com/solomonschwartz', url: 'https://github.com/solomonschwartz' }];
  const linkStyle = { color: 'inherit', textDecoration: 'underline', textDecorationColor: '#c8d4e0' };
  const topLink = { fontSize: '0.85rem', color: '#4a6080', textDecoration: 'none' };
  const skills = asList(rd.skills);
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '5rem 2rem 6rem', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#1a2e44', marginBottom: '0.4rem' }}>Shlomo Schwartz</h1>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
        <a href={`mailto:${email}`} style={topLink}>{email}</a>
        {links.map((l, i) => (
          <a key={i} href={safeUrl(l.url)} target="_blank" rel="noopener noreferrer" style={topLink}>{l.label || l.url}</a>
        ))}
      </div>
      {asList(rd.sections).filter(sec => sec && typeof sec === 'object' && !sec.hidden).map((sec, si) => (
        <div className="resume-section" key={si}>
          <p className="resume-section-title">{sec.title}</p>
          {asList(sec.entries).filter(e => e && typeof e === 'object' && !e.hidden).map((entry, ei) => (
            <div style={{ marginBottom: '1.75rem' }} key={ei}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span className="resume-entry-title">
                  {safeUrl(entry.link) ? <a href={safeUrl(entry.link)} target="_blank" rel="noopener noreferrer" style={linkStyle}>{entry.title}</a> : entry.title}
                </span>
                {entry.date && <span className="resume-entry-date">{entry.date}</span>}
              </div>
              {entry.sub && <div className="resume-entry-sub">{entry.sub}</div>}
              {asList(entry.bullets).length > 0 && (
                <ul className="resume-bullets">{asList(entry.bullets).map((b, bi) => <li key={bi}>{renderInline(b, linkStyle)}</li>)}</ul>
              )}
            </div>
          ))}
        </div>
      ))}
      {skills.length > 0 && (
        <div className="resume-section">
          <p className="resume-section-title">{rd.skillsTitle || 'Skills'}</p>
          <div className="resume-skills-list">
            {skills.map((s, i) => <span key={`${s}-${i}`} className="resume-skill-tag">{s}</span>)}
          </div>
        </div>
      )}
    </div>
  );
};

const BlogPage = ({ timelineItems }) => {
  const [activeTab, setActiveTab] = useState('essays'); // 'essays' or 'timeline'
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
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const stripHtml = (html) => {
    // DOMParser documents are inert: scripts and onerror handlers never run.
    const parsed = new DOMParser().parseFromString(String(html || ''), 'text/html');
    return parsed.body.textContent || '';
  };

  const getTimelineIcon = (type) => {
    switch(String(type || '').toLowerCase()) {
      case 'video': return <Icons.Video />;
      case 'article': return <Icons.Article />;
      default: return <Icons.ExternalLink />;
    }
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: colors.accent.DEFAULT, marginBottom: '1rem' }}>Writing & Curation</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 400, color: colors.primary.DEFAULT }}>Interests & Essays</h1>
        </div>

        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'essays' ? 'active' : ''}`} onClick={() => setActiveTab('essays')}>Essays</button>
          <button className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>Things Worth Watching/Reading</button>
        </div>

        {activeTab === 'essays' ? (
          <div>
            <p style={{ fontFamily: "'Raleway', sans-serif", color: colors.secondary.DEFAULT, marginTop: '1rem', fontSize: '0.9rem', textAlign: 'center', marginBottom: '3rem' }}>
              <a href={CONFIG.substackUrl} target="_blank" rel="noopener noreferrer" style={{ color: colors.accent.dark, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                Subscribe on Substack <Icons.ExternalLink />
              </a>
            </p>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <p style={{ fontFamily: "'Raleway', sans-serif", color: colors.secondary.DEFAULT }}>Loading posts...</p>
              </div>
            ) : error || posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: colors.cream.light, border: `1px solid ${colors.cream.dark}` }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', fontWeight: 400, color: colors.primary.DEFAULT, marginBottom: '1rem' }}>{error ? 'Unable to Load Posts' : 'Coming Soon'}</h2>
                <p style={{ fontFamily: "'Raleway', sans-serif", color: colors.secondary.DEFAULT, maxWidth: '400px', margin: '0 auto 1.5rem', fontWeight: 300 }}>
                  {error ? 'Visit my Substack directly to read my latest posts.' : "I'm currently setting up my blog. Check back soon for thoughts on technology, engineering, and more."}
                </p>
                <a href={CONFIG.substackUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>Visit Substack <Icons.ExternalLink /></a>
              </div>
            ) : (
              <div>
                {posts.map((post, index) => (
                  <a key={index} href={safeUrl(post.link) || CONFIG.substackUrl} target="_blank" rel="noopener noreferrer" className="blog-post">
                    <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: colors.accent.dark, marginBottom: '0.75rem' }}>{formatDate(post.pubDate)}</p>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 500, color: colors.primary.DEFAULT, marginBottom: '0.75rem', lineHeight: 1.3 }}>{post.title}</h3>
                    <p style={{ fontFamily: "'Raleway', sans-serif", color: colors.secondary.DEFAULT, fontSize: '0.9rem', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{stripHtml(post.description).slice(0, 200)}...</p>
                    <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.8rem', color: colors.accent.dark, marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>Read more <Icons.ArrowRight /></span>
                  </a>
                ))}
                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                  <a href={CONFIG.substackUrl} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>View All Posts on Substack <Icons.ExternalLink /></a>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="timeline">
            {timelineItems.length === 0 ? (
               <p style={{ fontFamily: "'Raleway', sans-serif", color: colors.secondary.DEFAULT, fontStyle: 'italic', paddingLeft: '1rem' }}>No timeline items yet. Curations coming soon.</p>
            ) : (
              timelineItems.map((item, index) => (
                <div key={item.id || index} className="timeline-item">
                  <span className="timeline-date">{formatDate(item.date)}</span>
                  <a href={safeUrl(item.url) || undefined} target="_blank" rel="noopener noreferrer" className="timeline-card">
                    <span className="timeline-type">
                      {getTimelineIcon(item.type)} {item.type}
                    </span>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: colors.primary.DEFAULT, marginBottom: '0.5rem' }}>{item.title}</h3>
                    {item.description && (
                      <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.9rem', color: colors.secondary.DEFAULT, lineHeight: 1.6 }}>{item.description}</p>
                    )}
                  </a>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [hobbies, setHobbies] = useState(INITIAL_HOBBY_DATA);
  const [timelineItems, setTimelineItems] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [homeData, setHomeData] = useState(null);

  const dbPathHobbies = `artifacts/${appId}/public/data/hobbies`;
  const dbPathTimeline = `artifacts/${appId}/public/data/timeline`;
  const dbPathResume = ['artifacts', appId, 'public', 'data', 'resume', 'content'];
  const dbPathHome = ['artifacts', appId, 'public', 'data', 'homepage', 'content'];

  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [currentPage]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isSandbox && typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (isSandbox) {
          await signInAnonymously(auth); // Fallback required in preview
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const ALLOWED_EMAILS = ['shlomoschwartz01@gmail.com', 'solomonschwartz01@gmail.com'];
      setIsAdmin(currentUser && ALLOWED_EMAILS.includes(currentUser.email));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // We added a quick check for `user` if in sandbox mode to prevent console spam
    if (isSandbox && !user && !auth.currentUser) return;

    // Listen to Hobbies
    const qHobbies = collection(db, 'artifacts', appId, 'public', 'data', 'hobbies');
    const unsubHobbies = onSnapshot(qHobbies, async (snapshot) => {
      if (snapshot.empty) {
        if (auth.currentUser) {
          for (const [key, data] of Object.entries(INITIAL_HOBBY_DATA)) {
            try { await setDoc(doc(db, dbPathHobbies, key), data); } catch (e) { console.error(e); }
          }
        }
      } else {
        const fetchedHobbies = {};
        snapshot.docs.forEach(doc => { fetchedHobbies[doc.id] = doc.data(); });
        setHobbies(fetchedHobbies);
      }
    }, (error) => {
      console.error("Firestore Hobbies Error:", error);
    });

    // Listen to Timeline Items
    const qTimeline = collection(db, 'artifacts', appId, 'public', 'data', 'timeline');
    const unsubTimeline = onSnapshot(qTimeline, (snapshot) => {
      const fetchedItems = [];
      snapshot.docs.forEach(doc => {
        fetchedItems.push({ id: doc.id, ...doc.data() });
      });
      fetchedItems.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTimelineItems(fetchedItems);
    }, (error) => {
      console.error("Firestore Timeline Error:", error);
    });

    const resumeRef = doc(db, 'artifacts', appId, 'public', 'data', 'resume', 'content');
    const unsubResume = onSnapshot(resumeRef, s => { if (s.exists()) setResumeData(s.data()); });
    const homeRef = doc(db, 'artifacts', appId, 'public', 'data', 'homepage', 'content');
    const unsubHome = onSnapshot(homeRef, s => { if (s.exists()) setHomeData(s.data()); });
    return () => { unsubHobbies(); unsubTimeline(); unsubResume(); unsubHome(); };
  }, [user]);

  const handleAdminLogin = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const ALLOWED_EMAILS = ['shlomoschwartz01@gmail.com', 'solomonschwartz01@gmail.com'];
      if (!ALLOWED_EMAILS.includes(result.user.email)) {
        alert(`Access denied: ${result.user.email} is not authorized.`);
        await signOut(auth);
      }
    } catch (err) {
      console.error(err);
      alert("Google login failed. See console.");
    }
  };

  const renderPage = () => {
    if (currentPage === 'shb' && isAdmin) return <SHBPage user={user} />;
    if (currentPage === 'ledger' && isAdmin) return <LedgerPage user={user} />;
    if (currentPage === 'admin' && isAdmin) return <AdminPage hobbies={hobbies} timelineItems={timelineItems} dbPathHobbies={dbPathHobbies} dbPathTimeline={dbPathTimeline} user={user} resumeData={resumeData} dbPathResume={dbPathResume} onResumeUpdate={setResumeData} homeData={homeData} dbPathHome={dbPathHome} onHomeUpdate={setHomeData} />;
    if (currentPage.startsWith('hobby-')) return <HobbyPage hobbyKey={currentPage.replace('hobby-', '')} hobbies={hobbies} setCurrentPage={setCurrentPage} />;
    if (currentPage === 'resume') return <ResumePage resumeData={resumeData} />;
    if (currentPage === 'interests') return <InterestsPage hobbies={hobbies} />;
    if (currentPage === 'essays' || currentPage === 'blog') return <BlogPage timelineItems={timelineItems} />;
    return <HomePage homeData={homeData} />;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} isAdmin={isAdmin} />

      <main style={{ flex: 1 }}>
        <ErrorBoundary resetKey={currentPage} isAdmin={isAdmin}>{renderPage()}</ErrorBoundary>
      </main>

      <footer style={{ padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid #eef0f3', backgroundColor: '#ffffff' }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', fontWeight: 500, color: '#1a2e44', marginBottom: '0.4rem' }}>Shlomo Schwartz</p>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#8b9bae', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <span>© {new Date().getFullYear()} — All rights reserved</span>
          <span>|</span>
          {isAdmin ? (
            <button onClick={() => { signOut(auth); }} style={{ background: 'none', border: 'none', color: colors.accent.dark, cursor: 'pointer' }}>Logout</button>
          ) : (
            <button onClick={handleAdminLogin} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.5 }}>Admin Login</button>
          )}
        </div>
      </footer>
    </div>
  );
}