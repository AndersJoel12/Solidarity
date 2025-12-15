import React from "react";

function Landing() {
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>MiApp</div>
        <nav style={styles.nav}>
          <a href="#features" style={styles.link}>Características</a>
          <a href="#about" style={styles.link}>Sobre</a>
          <a href="#contact" style={styles.link}>Contacto</a>
        </nav>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>Organiza, analiza y actúa.</h1>
          <p style={styles.subtitle}>
            Una landing minimalista para presentar tu producto o aplicación. Rápida, clara y lista para crecer.
          </p>
          <div style={styles.ctaGroup}>
            <button style={styles.primaryBtn}>Comenzar</button>
            <button style={styles.secondaryBtn}>Ver demo</button>
          </div>
        </div>
        <div style={styles.heroCard}>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Usuarios activos</span>
            <span style={styles.metricValue}>1,284</span>
          </div>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Tiempo medio</span>
            <span style={styles.metricValue}>4m 12s</span>
          </div>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Satisfacción</span>
            <span style={styles.metricValue}>92%</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={styles.section}>
        <h2 style={styles.sectionTitle}>Características clave</h2>
        <div style={styles.grid}>
          <Feature
            title="Rápida implementación"
            desc="Estructura limpia con componentes listos para extender."
            icon="⚡"
          />
          <Feature
            title="Diseño responsive"
            desc="Se adapta a móviles, tablets y escritorio sin esfuerzos."
            icon="📱"
          />
          <Feature
            title="Escalable"
            desc="Pensado para crecer con rutas, estado global y APIs."
            icon="📈"
          />
        </div>
      </section>

      {/* About */}
      <section id="about" style={styles.sectionAlt}>
        <h2 style={styles.sectionTitle}>Sobre el proyecto</h2>
        <p style={styles.paragraph}>
          Esta landing está hecha con React y estilos inline para que puedas copiar y pegar.
          Puedes migrar los estilos a CSS o Tailwind, y conectar con tu backend cuando lo necesites.
        </p>
      </section>

      {/* Contact */}
      <section id="contact" style={styles.section}>
        <h2 style={styles.sectionTitle}>Contacto</h2>
        <form style={styles.form} onSubmit={(e) => e.preventDefault()}>
          <input style={styles.input} type="text" placeholder="Tu nombre" />
          <input style={styles.input} type="email" placeholder="Tu correo" />
          <textarea style={styles.textarea} placeholder="Tu mensaje" rows={4} />
          <button style={styles.primaryBtn} type="submit">Enviar</button>
        </form>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <span>© {new Date().getFullYear()} MiApp — Todos los derechos reservados.</span>
        <div>
          <a href="#" style={styles.footerLink}>Privacidad</a>
          <a href="#" style={styles.footerLink}>Términos</a>
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, desc, icon }) {
  return (
    <div style={styles.card}>
      <div style={styles.icon}>{icon}</div>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardDesc}>{desc}</p>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
    color: "#0f172a",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    lineHeight: 1.5,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    position: "sticky",
    top: 0,
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(8px)",
    borderBottom: "1px solid #e2e8f0",
    zIndex: 10,
  },
  logo: {
    fontWeight: 700,
    letterSpacing: "0.5px",
  },
  nav: {
    display: "flex",
    gap: "16px",
  },
  link: {
    color: "#334155",
    textDecoration: "none",
    fontSize: "0.95rem",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "24px",
    padding: "64px 24px",
    maxWidth: 1100,
    margin: "0 auto",
  },
  heroContent: {
    alignSelf: "center",
  },
  title: {
    fontSize: "3rem",
    lineHeight: 1.1,
    margin: "0 0 12px",
  },
  subtitle: {
    color: "#475569",
    margin: "0 0 20px",
    maxWidth: 600,
  },
  ctaGroup: {
    display: "flex",
    gap: "12px",
  },
  primaryBtn: {
    padding: "12px 18px",
    background: "#0ea5e9",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    boxShadow: "0 10px 20px rgba(14,165,233,0.2)",
  },
  secondaryBtn: {
    padding: "12px 18px",
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
  },
  heroCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
    display: "grid",
    gap: "12px",
    alignSelf: "center",
    boxShadow: "0 8px 30px rgba(2, 6, 23, 0.06)",
  },
  metric: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 14px",
    background: "#f8fafc",
    borderRadius: "12px",
  },
  metricLabel: { color: "#475569" },
  metricValue: { fontWeight: 700 },
  section: {
    padding: "48px 24px",
    maxWidth: 1100,
    margin: "0 auto",
  },
  sectionAlt: {
    padding: "48px 24px",
    maxWidth: 900,
    margin: "0 auto",
    background: "#f8fafc",
    borderRadius: "16px",
  },
  sectionTitle: {
    fontSize: "1.8rem",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "18px",
  },
  icon: { fontSize: "1.6rem" },
  cardTitle: { margin: "12px 0 8px", fontSize: "1.15rem" },
  cardDesc: { color: "#475569" },
  paragraph: { color: "#334155" },
  form: {
    display: "grid",
    gap: "12px",
    maxWidth: 520,
  },
  input: {
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
  },
  textarea: {
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    resize: "vertical",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderTop: "1px solid #e2e8f0",
    marginTop: "24px",
    color: "#475569",
  },
  footerLink: {
    marginLeft: "12px",
    color: "#475569",
    textDecoration: "none",
  },
};

export default Landing;
