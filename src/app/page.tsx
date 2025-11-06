import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>C</span>
            <span className={styles.brandName}>CULTURIA</span>
          </div>
          <nav className={styles.nav}>
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        <section className={styles.hero}>
          <h1>Culture, Curated.</h1>
          <p>
            Discover events, stories, and trends shaping creative communities.
          </p>
          <div className={styles.ctas}>
            <a className={styles.primary} href="#get-started">Get Started</a>
            <a
              className={styles.secondary}
              href="https://github.com/serdarsalim/culturia"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </section>

        <section id="features" className={styles.features}>
          <div className={styles.card}>
            <h3>Events</h3>
            <p>Find experiences around you.</p>
          </div>
          <div className={styles.card}>
            <h3>Stories</h3>
            <p>Read deep dives and interviews.</p>
          </div>
          <div className={styles.card}>
            <h3>Trends</h3>
            <p>Track what moves culture next.</p>
          </div>
        </section>

        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} CULTURIA</p>
        </footer>
      </main>
    </div>
  );
}
