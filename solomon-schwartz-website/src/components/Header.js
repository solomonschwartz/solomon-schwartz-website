import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li> {/* Link to the home screen */}
          <li><Link to="/resume">CV</Link></li>
          <li><Link to="/writing">Writing</Link></li>
          <li><Link to="/portfolio">Portfolio</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
