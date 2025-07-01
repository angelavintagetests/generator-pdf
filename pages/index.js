import { useState } from 'react';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [pages, setPages] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, pages, level }),
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Generador de PDFs con IA</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tema del trabajo"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
        />
        <input
          type="number"
          placeholder="Número de páginas"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
        />
        <input
          type="text"
          placeholder="Nivel (ESO, Universidad...)"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
          {loading ? 'Generando...' : 'Generar PDF'}
        </button>
      </form>
    </div>
  );
}
