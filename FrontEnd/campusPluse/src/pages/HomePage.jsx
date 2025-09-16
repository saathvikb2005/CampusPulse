import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <>
      <header>
        <h1>Campus Pulse</h1>
        <nav>
          <a href="#" className="active">Home</a>
          <a href="#events">Events</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h2>Stay connected with campus life</h2>
          <p>
            One hub for Past, Present, and Upcoming events — plus notifications,
            blogs, and feedback. Built for students and organizers.
          </p>
        </div>
      </section>

      <section id="events" className="event-strip">
        <article className="event-card past-events" aria-label="Past Events">
          <div className="card-icon">📅</div>
          <h3>Past Events</h3>
          <p>Explore details, photos, and blogs (no registrations).</p>
          <a href="/events/past" className="card-btn">View Past</a>
        </article>

        <article className="event-card present-events" aria-label="Present Events">
          <div className="card-icon">🎯</div>
          <h3>Present Events</h3>
          <p>
            See what's happening now. Register only if spot registration is open.
          </p>
          <a href="/events/present" className="card-btn">View Ongoing</a>
        </article>

        <article className="event-card upcoming-events" aria-label="Upcoming Events">
          <div className="card-icon">🚀</div>
          <h3>Upcoming Events</h3>
          <p>Browse details, register as a participant, or volunteer.</p>
          <a href="/events/upcoming" className="card-btn">View Upcoming</a>
        </article>
      </section>

      <section id="features" className="feature-section">
        <h2 className="section-title">Platform Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h4>Feedback</h4>
            <p>Submit anonymous or verified feedback after each event.</p>
            <a href="/feedback" className="feature-link">Open Feedback</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h4>Notifications</h4>
            <p>Opt-in department updates, general alerts, reactions & polls.</p>
            <a href="/notifications" className="feature-link">See Notifications</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h4>Blogs & Gallery</h4>
            <p>Share photos and stories from past events.</p>
            <a href="/blogs" className="feature-link">Browse Blogs</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h4>Admin Tools</h4>
            <p>Create events, approve posts, and review feedback.</p>
            <a href="/admin" className="feature-link">Open Admin</a>
          </div>
        </div>
      </section>

      <footer id="contact">
        <p>&copy; 2025 Campus Pulse. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Home;