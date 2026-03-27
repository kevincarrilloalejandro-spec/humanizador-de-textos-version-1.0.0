export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { texto, nivel } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured' });
  }

  const prompts = {
    basico: `Eres un escritor humano. Tu única tarea es reescribir 
      el texto que te dan para que suene 100% humano y natural.
      Haz cambios sutiles: elimina frases típicas de IA como 
      "es importante destacar", "cabe mencionar", "en conclusión", 
      "es fundamental", "sin lugar a dudas", "en el mundo actual".
      Usa palabras más cotidianas. Varía la longitud de oraciones.
      RESPONDE ÚNICAMENTE CON EL TEXTO REESCRITO. Sin más nada.`,

    normal: `Eres un escritor humano experto. Reescribe el texto 
      para que suene como escrito por una persona real.
      Usa tono conversacional, mezcla oraciones cortas y largas,
      agrega conectores naturales: "de hecho", "la verdad", "o sea",
      "al final", "lo que pasa es que". Elimina TODAS las frases de IA.
      Agrega matices personales ocasionales.
      RESPONDE ÚNICAMENTE CON EL TEXTO REESCRITO. Sin más nada.`,

    avanzado: `Eres un escritor humano con voz propia. Transforma 
      completamente el texto para que sea 100% indetectable como IA.
      Reorganiza ideas, cambia estructura, agrega preguntas retóricas,
      ejemplos cotidianos, reflexiones personales, humor sutil.
      Usa lenguaje natural con imperfecciones humanas ocasionales.
      Elimina absolutamente toda frase robótica de IA.
      RESPONDE ÚNICAMENTE CON EL TEXTO REESCRITO. Sin más nada.`
  };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: prompts[nivel || 'normal'],
        messages: [{ role: "user", content: texto }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const textoFinal = data.content?.[0]?.text || '';
    return res.status(200).json({ textoFinal });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
