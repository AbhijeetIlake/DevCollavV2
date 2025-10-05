import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import "./LandingPage.css";

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const navLinks = (
    <SignedOut>
      <SignInButton redirectUrl="/dashboard">
        <button className="nav-button primary" aria-label="Sign in to your account">
          Sign In
        </button>
      </SignInButton>
      <Link to="/sign-up" onClick={closeMenu}>
        <button className="nav-button secondary" aria-label="Register for a new account">
          Register
        </button>
      </Link>
    </SignedOut>
  );

  const signedInLinks = (
    <SignedIn>
      <Link to="/dashboard" onClick={closeMenu}>
        <button className="nav-button" aria-label="Go to dashboard">
          Dashboard
        </button>
      </Link>
      <Link to="/snippets" onClick={closeMenu}>
        <button className="nav-button" aria-label="View code snippets">
          Snippets
        </button>
      </Link>
      <Link to="/workspaces" onClick={closeMenu}>
        <button className="nav-button" aria-label="Manage workspaces">
          Workspaces
        </button>
      </Link>
      <UserButton afterSignOutUrl="/" />
    </SignedIn>
  );

  const ctaButtons = (
    <div className="cta-buttons fade-in-up delay-2">
      <SignedOut>
        <SignInButton redirectUrl="/dashboard">
          <button className="btn primary" aria-label="Get started with DevCollab">
            Get Started →
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Link to="/dashboard">
          <button className="btn secondary" aria-label="Go to your dashboard">
            Go to Dashboard →
          </button>
        </Link>
      </SignedIn>
    </div>
  );

  const bottomCta = (
    <section className="cta fade-in">
      <h2>Start collaborating today</h2>
      <p>
        Join thousands of developers using DevCollab to organize snippets and build
        projects together.
      </p>
      <SignedOut>
        <SignInButton redirectUrl="/dashboard">
          <button className="btn light" aria-label="Create your DevCollab account">
            Create Your Account
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Link to="/dashboard">
          <button className="btn light" aria-label="Access your dashboard">
            Go to Dashboard
          </button>
        </Link>
      </SignedIn>
    </section>
  );

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <div className="navbar-logo">
          <img
            src="/tabLogo2.png"
            alt="DevCollab logo"
            className="logo-image"
            height={40}
            width={40}
            aria-hidden="true"
          />
          <span className="logo-text" aria-label="DevCollab brand">
            DevCollab
          </span>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          {navLinks}
          {signedInLinks}
          {/* Close button for mobile */}
          {menuOpen && (
            <button className="close-menu" onClick={closeMenu} aria-label="Close menu">
              ×
            </button>
          )}
        </div>
      </nav>

      {/* Main Landing Content */}
      <main className="landing">
        {/* Hero Section */}
        <header className="hero" role="banner">
          <div className="hero-bg">
            <div className="hero-content">
            <h1 className="fade-in-up">
              Welcome to <span className="gradient-text">DevCollab</span>
            </h1>
            <p className="subtitle fade-in-up delay-1">
              Share code snippets, collaborate with your team, and build projects
              faster in one unified workspace.
            </p>
            {ctaButtons}
          </div>
            </div> 
          
        </header>

        {/* Screenshot Mockup */}
        <section className="mockup fade-in" aria-labelledby="mockup-heading">
          <h2 id="mockup-heading" className="sr-only">App Preview</h2>
          <div className="mockup-window pop-in">
            <div className="mockup-bar" aria-hidden="true">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <img
              src="/dashboardimg.png"
              alt="Screenshot of DevCollab dashboard showing snippets and workspaces"
              className="mockup-img"
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="features fade-in" aria-labelledby="features-heading">
          <h2 id="features-heading">Why Choose DevCollab?</h2>
          <div className="feature-grid">
            <article className="feature-card glow-hover">
              <h3>Snippet Sharing</h3>
              <p>
                Easily save, organize, and share code snippets with your team in seconds.
              </p>
            </article>
            <article className="feature-card glow-hover">
              <h3>Real-Time Collaboration</h3>
              <p>Work together seamlessly in dedicated workspaces with live updates.</p>
            </article>
            <article className="feature-card glow-hover">
              <h3>Productivity Boost</h3>
              <p>Streamline your workflow and accelerate project development.</p>
            </article>
          </div>
        </section>

        {/* Bottom CTA */}
        {bottomCta}

        {/* Footer */}
        <footer className="footer fade-in" role="contentinfo">
          <div className="footer-content">
            <p>&copy; {new Date().getFullYear()} DevCollab. Built for developers, by developers.</p>
            <nav className="footer-nav" aria-label="Footer links">
              <Link to="/privacy" className="footer-link">Privacy</Link>
              <Link to="/terms" className="footer-link">Terms</Link>
              <Link to="/contact" className="footer-link">Contact</Link>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default LandingPage;
