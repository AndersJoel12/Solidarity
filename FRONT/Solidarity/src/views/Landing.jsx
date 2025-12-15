import React from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";

function Landing() {
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>PetSolidarity</div>
        <nav style={styles.nav}>
          <a href="#about" style={styles.link}>Sobre</a>
          <a href="#contact" style={styles.link}>Contacto</a>
        </nav>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.title}>Un aporte, una vida feliz 🐾</h1>
        <p style={styles.subtitle}>
          Tu apoyo transforma la vida de perritos y gatitos en necesidad.
        </p>
        <div style={styles.ctaGroup}>
          <button style={styles.primaryBtn}>Donar</button>
          <button style={styles.secondaryBtn}>Ver más</button>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={styles.section}>
        <h2 style={styles.sectionTitle}>Lo que hacemos</h2>
        <div style={styles.grid}>
          <Feature
            title="Rescate"
            desc="Salvamos mascotas abandonadas y les damos una segunda oportunidad."
            icon="🐶"
          />
          <Feature
            title="Adopción"
            desc="Conectamos familias con perritos y gatitos que buscan hogar."
            icon="🐱"
          />
          <Feature
            title="Solidaridad"
            desc="Cada donación se convierte en alimento, medicinas y cuidados."
            icon="❤️"
          />
        </div>
      </section>

      {/* About */}
      <section id="about" style={styles.sectionAlt}>
        <h2 style={styles.sectionTitle}>Sobre PetSolidarity</h2>
        <p style={styles.paragraph}>
          Somos una comunidad dedicada a rescatar, cuidar y dar en adopción a mascotas
          que necesitan amor. Tu ayuda hace posible que más animales tengan un futuro feliz.
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

      <footer style={styles.footer}>
        <span>© {new Date().getFullYear()} PetSolidarity — Todos los derechos reservados.</span>
        <div style={styles.socialIcons}>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
        <FaFacebook size={28} color="#1877F2" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
        <FaInstagram size={28} color="#E4405F" />
        </a>
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
    fontFamily: "system-ui, sans-serif",
    color: "#fff",
    backgroundImage: "url('https://images.unsplash.com/photo-1558788353-f76d92427f16?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    lineHeight: 1.5,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    background: "rgba(0,0,0,0.5)",
  },
  logo: { fontWeight: 700 },
  nav: { display: "flex", gap: "16px" },
  link: { color: "#fff", textDecoration: "none" },
  hero: {
    textAlign: "center",
    padding: "100px 24px",
    background: "rgba(0,0,0,0.4)",
  },
  title: { fontSize: "2.5rem", marginBottom: "12px" },
  subtitle: { fontSize: "1.2rem", marginBottom: "20px" },
  ctaGroup: { display: "flex", gap: "12px", justifyContent: "center" },
  primaryBtn: {
    padding: "12px 18px",
    background: "#f97316",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "12px 18px",
    background: "#374151",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  section: { padding: "48px 24px", background: "rgba(0,0,0,0.5)" },
  sectionAlt: { padding: "48px 24px", background: "rgba(0,0,0,0.7)" },
  sectionTitle: { fontSize: "1.8rem", marginBottom: "20px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "18px",
  },
  icon: { fontSize: "2rem" },
  cardTitle: { margin: "12px 0 8px" },
  cardDesc: { fontSize: "0.95rem" },
  paragraph: { fontSize: "1rem" },
  form: { display: "grid", gap: "12px", maxWidth: 400, margin: "0 auto" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
  },
  textarea: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    resize: "vertical",
  },
  footer: {
    textAlign: "center",
    padding: "20px",
    background: "rgba(0,0,0,0.6)",
  },
};

export default Landing;
