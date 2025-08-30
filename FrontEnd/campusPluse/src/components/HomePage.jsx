import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <>
      <header>
        <h1>Campus Pulse</h1>
        <nav>
          <a href="#">Home</a>
          <a href="#events">Events</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero">
        <h2>Stay connected with campus life</h2>
        <p>
          One hub for Past, Present, and Upcoming events — plus notifications,
          blogs, and feedback. Built for students and organizers.
        </p>
        <button className="cta">Get Started</button>
      </section>

      <section id="events" className="event-strip">
        <article className="event-card" aria-label="Past Events">
          <h3>Past Events</h3>
          <p>Explore details, photos, and blogs (no registrations).</p>
          <a href="/events/past">View Past</a>
        </article>

        <article className="event-card" aria-label="Present Events">
          <h3>Present Events</h3>
          <p>
            See what’s happening now. Register only if spot registration is open.
          </p>
          <a href="/events/present">View Ongoing</a>
        </article>

        <article className="event-card" aria-label="Upcoming Events">
          <h3>Upcoming Events</h3>
          <p>Browse details, register as a participant, or volunteer.</p>
          <a href="/events/upcoming">View Upcoming</a>
        </article>
      </section>

      <section id="features" className="feature-grid">
        <div className="feature-card">
          <h4>Feedback</h4>
          <p>Submit anonymous or verified feedback after each event.</p>
          <a href="/feedback">Open Feedback</a>
        </div>

        <div className="feature-card">
          <h4>Notifications</h4>
          <p>Opt-in department updates, general alerts, reactions & polls.</p>
          <a href="/notifications">See Notifications</a>
        </div>

        <div className="feature-card">
          <h4>Blogs & Gallery</h4>
          <p>Share photos and stories from past events.</p>
          <a href="/blogs">Browse Blogs</a>
        </div>

        <div className="feature-card">
          <h4>Admin Tools</h4>
          <p>Create events, approve posts, and review feedback.</p>
          <a href="/admin">Open Admin</a>
        </div>
      </section>

      <footer id="contact">
        &copy; 2025 Campus Pulse. All rights reserved.
      </footer>
    </>
  );
};

export default Home;
