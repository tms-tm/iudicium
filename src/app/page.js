export default function Home() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Iiucidium</h1>

      <p style={styles.subtitle}>
        AI-powered decision tracking system
      </p>

      <div style={styles.grid}>
        <a href="/add" style={styles.card}>➕ Add Decision</a>
        <a href="/library" style={styles.card}>📚 Library</a>
        <a href="/dashboard" style={styles.card}>📊 Dashboard</a>
        <a href="/compare" style={styles.card}>⚖️ Compare</a>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1c",
    color: "white",
    fontFamily: "Arial",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: "36px",
    marginBottom: "10px",
  },

  subtitle: {
    opacity: 0.7,
    marginBottom: "30px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 200px)",
    gap: "15px",
  },

  card: {
    padding: "20px",
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "10px",
    textAlign: "center",
    color: "white",
    textDecoration: "none",
  },
};