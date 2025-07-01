import OpenAI from 'openai';
import pdf from 'html-pdf-node';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateSection(prompt) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-preview',
    messages: [
      { role: 'system', content: 'Eres un experto en redacción académica con estilo claro y ordenado.' },
      { role: 'user', content: prompt }
    ]
  });
  return completion.choices[0].message.content.replace(/\n/g, '<br>');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { topic, pages, level } = req.body;

  try {
    // Generar secciones por bloques
    const portada = await generateSection(`Crea la portada de un trabajo titulado "${topic}" para nivel ${level}.`);
    const indice = await generateSection(`Genera un índice para un trabajo de ${pages} páginas sobre "${topic}".`);
    const introduccion = await generateSection(`Redacta la introducción de un trabajo de ${pages} páginas sobre "${topic}" para nivel ${level}.`);
    const desarrollo = await generateSection(`Redacta el desarrollo con subtítulos del trabajo de ${pages} páginas sobre "${topic}" para nivel ${level}.`);
    const conclusiones = await generateSection(`Redacta las conclusiones del trabajo sobre "${topic}".`);
    const bibliografia = await generateSection(`Genera una bibliografía ficticia adecuada para un trabajo sobre "${topic}".`);

    // Montar HTML final
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.5; }
            h1, h2, h3 { color: #2c3e50; }
            footer { position: fixed; bottom: 30px; width: 100%; text-align: center; font-size: 12px; color: #aaa; }
          </style>
        </head>
        <body>
          ${portada}
          <h2>Índice</h2>
          ${indice}
          <h2>Introducción</h2>
          ${introduccion}
          <h2>Desarrollo</h2>
          ${desarrollo}
          <h2>Conclusiones</h2>
          ${conclusiones}
          <h2>Bibliografía</h2>
          ${bibliografia}
          <footer>Generado automáticamente con IA</footer>
        </body>
      </html>
    `;

    const file = { content: htmlContent };
    const options = { format: 'A4' };
    const pdfBuffer = await pdf.generatePdf(file, options);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${topic.replace(/ /g, '_')}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generando el PDF', error: error.message });
  }
}
