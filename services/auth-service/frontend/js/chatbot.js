document.addEventListener('DOMContentLoaded', () => {
    const chatbotContainer = document.getElementById('chatbot-container');
    const openBtn = document.getElementById('chatbot-open-btn');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const chatForm = document.getElementById('chatbot-form');
    const chatInput = document.getElementById('chatbot-input');
    const chatMessages = document.getElementById('chatbot-messages');

    // API endpoint del chatbot
    const API_URL = 'http://localhost:8080/api/ai/chat';

    // Mostrar/Ocultar el chatbot
    openBtn.addEventListener('click', () => {
        chatbotContainer.style.display = 'flex';
        openBtn.style.display = 'none';
    });

    closeBtn.addEventListener('click', () => {
        chatbotContainer.style.display = 'none';
        openBtn.style.display = 'block';
    });

    // Enviar mensaje
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();

        if (!message) return;

        // Añadir mensaje del usuario al chat
        addMessage(message, 'user');
        chatInput.value = '';

        // Mostrar indicador de "escribiendo..."
        showTypingIndicator();

        try {
            // Enviar mensaje a la API
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message }),
            });

            // Ocultar indicador de "escribiendo..."
            hideTypingIndicator();

            if (!response.ok) {
                throw new Error('Error en la respuesta de la API');
            }

            const data = await response.json();
            const reply = data.reply || 'No he podido entender tu solicitud.';

            // Añadir respuesta del bot al chat
            addMessage(reply, 'bot');

        } catch (error) {
            console.error('Error al contactar al servicio de IA:', error);
            hideTypingIndicator();
            addMessage('Lo siento, no puedo conectarme con el asistente en este momento. Por favor, inténtalo más tarde.', 'bot');
        }
    });

    /**
     * Añade un mensaje a la ventana del chat.
     * @param {string} message - El contenido del mensaje.
     * @param {string} sender - 'user' o 'bot'.
     */
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        // Hacer scroll hacia el último mensaje
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Muestra el indicador de que el bot está "escribiendo".
     */
    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.id = 'typing-indicator';
        typingElement.classList.add('chat-message', 'bot', 'typing');
        typingElement.textContent = 'Escribiendo...';
        chatMessages.appendChild(typingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Oculta el indicador de "escribiendo".
     */
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
});
