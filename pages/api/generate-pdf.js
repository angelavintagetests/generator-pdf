import OpenAI from 'openai';
import pdf from 'html-pdf-node';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { topic, pages, level } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-preview',
      messages: [
        {
          role: 'system',
          content: `Eres un experto en redacción académica. Genera un trabajo de ${pages} páginas sobre ${topic} con nivel ${level}. Incluye portada, índice, introducción, desarrollo con subtítulos, conclusiones y bibliografía en estilo formal.`
        }
      ]
    });

    const content = completion.choices[0].message.content.replace(/\n/g, '<br>');

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
          ${content}
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
