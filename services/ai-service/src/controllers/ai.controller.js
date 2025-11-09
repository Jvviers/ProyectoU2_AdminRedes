const { GoogleGenerativeAI } = require("@google/generative-ai");

// Validar que la API Key de Gemini esté configurada
if (!process.env.GEMINI_API_KEY) {
  throw new Error('La variable de entorno GEMINI_API_KEY no está configurada.');
}

// Inicializar el cliente de Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// El contexto o "personalidad" del asistente virtual
const systemPrompt = `
Eres un asistente virtual de la Municipalidad de Las Condes, Chile. 
Tu propósito es ayudar a los ciudadanos con sus dudas y consultas sobre trámites, servicios, horarios de atención y eventos de la comuna.
Debes ser siempre amable, servicial y entregar información precisa y concisa.
No debes inventar información. Si no sabes la respuesta a una pregunta, debes indicarlo y sugerir al usuario que contacte directamente a la municipalidad a través de sus canales oficiales.
Fecha de hoy: ${new Date().toLocaleDateString('es-CL')}
`;

// Usaremos un historial en memoria para mantener el contexto de la conversación.
// En un entorno de producción real, esto debería almacenarse en una base de datos o Redis.
const conversationHistory = {};

/**
 * Maneja las solicitudes de chat del usuario.
 * Espera un cuerpo de solicitud con "message" y opcionalmente "conversationId".
 */
async function chat(req, res) {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'El campo "message" es requerido.' });
    }

    // Seleccionar el modelo
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Iniciar un chat con historial
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: systemPrompt,
        },
        {
          role: "model",
          parts: "Entendido. Estoy listo para ayudar a los ciudadanos de Las Condes.",
        },
      ],
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const assistantResponse = response.text();

    res.json({
      reply: assistantResponse,
      // Podríamos devolver un ID de conversación para seguir el hilo
      // conversationId: newConversationId, 
    });

  } catch (error) {
    console.error('Error al comunicarse con la API de Gemini:', error);
    res.status(500).json({ 
        error: 'No se pudo procesar la solicitud con la API de Gemini en este momento.',
        details: error.message
    });
  }
}

module.exports = {
  chat,
};
