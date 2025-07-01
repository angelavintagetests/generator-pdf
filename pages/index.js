import { useState } from "react";
import { jsPDF } from "jspdf";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [pages, setPages] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/generate-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, pages, level }),
    });

    const data = await res.json();
    if (data.content) {
      const doc = new jsPDF();
      const lines = doc.splitTextToSize(data.content, 180);
      let y = 20;
      lines.forEach((line) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(15, y, line);
        y += 7;
      });
      doc.save(`${topic.replace(/ /g, "_")}.pdf`);
    } else {
      alert("Error generando el contenido.");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem", fontFamily: "Arial" }}>
      <h1>Generador de Trabajos Universitarios en PDF con IA</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tema del trabajo"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
        />
        <input
          type="number"
          placeholder="Número de páginas"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
        />
        <input
          type="text"
          placeholder="Nivel (Universidad, ESO...)"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
        />
        <button type="submit" disabled={loading} style={{ padding: "10px 20px" }}>
          {loading ? "Generando..." : "Generar PDF"}
        </button>
      </form>
    </div>
  );
}
