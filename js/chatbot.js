class ChatbotController {
    constructor() {
        this.elements = {
            toggle: document.getElementById('chatbotToggle'),
            window: document.getElementById('chatbotWindow'),
            close: document.getElementById('chatbotClose'),
            robot: document.getElementById('chatbotRobot'),
            messages: document.getElementById('chatbotMessages'),
            input: document.getElementById('chatbotInput'),
            send: document.getElementById('chatbotSend')
        };

        this.isOpen = false;
        this.isFirstOpen = true;
        this.apiUrl = 'https://portfolio-chatbot-od42.onrender.com/chat'; 
        this.init();
    }

    init() {
        // Event Listeners 
        this.elements.toggle?.addEventListener('click', () => this.openChat());
        this.elements.close?.addEventListener('click', () => this.closeChat());
        this.elements.window?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeChat();
            }
        });
        this.elements.send?.addEventListener('click', () => this.sendMessage()); 
        this.elements.input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

    }

    openChat() {
        this.isOpen = true;
        this.elements.window?.classList.add('active');
        this.elements.robot?.classList.remove('hidden');
        this.elements.toggle?.classList.add('hidden')

        const input = document.getElementById('chatbotInput');
        setTimeout(() => input?.focus(), 300); 

        // Show welcome message on first open
        if (this.isFirstOpen) {
            this.isFirstOpen = false;
            this.addMessage("Hello! My name is Exilus and I am Zifan's AI assistant. Feel free to ask me anything about him. Note: The first response might take a awhile as the server wakes up (free hosting tier).", false);
        }
    }

    closeChat() {
        this.isOpen = false;
        this.elements.window?.classList.remove('active');
        this.elements.robot?.classList.remove('active');
        this.elements.toggle?.classList.remove('hidden');
    }


    async sendMessage() {
        const input = this.elements.input;
        const messageText = input?.value.trim();

        if (!messageText) return;

        // Add user message
        this.addMessage(messageText, true);

        // Clear input
        input.value = '';
        
        // Show typing indicator while waiting for response
        this.showTypingIndicator();

        try {
            // Call the FastAPI backend
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({message:messageText}),

            });

            this.hideTypingIndicator();

            if (!response.ok) {
                throw new Error(`Server error': $(response.status)`);
            }

            const data = await response.json();
            this.addMessage(data.response, false);
        } catch (error) {
            this.hideTypingIndicator();
            console.error('Chatbot error:', error);
            this.addMessage("Sorry, I'm having trouble connecting right now. Please make sure the backend server is running.", false);

        }
    

    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';

        typingDiv.innerHTML = `
            <div class="message-avatar">
                <img src="images/robot/robot.svg">
            </div>
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        this.elements.messages.append(typingDiv);
        this.scrollToBottom()

    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }

    }

    addMessage(text, isUser) {

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

        // Create avatar (both user and bot)
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar'

        if (isUser) {
            avatarDiv.innerHTML = '<i class="fa-solid fa-user"></i>';
        } else {
            avatarDiv.innerHTML = '<img src="images/robot/robot.svg">';
        }

        // Create message content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (isUser) {
            contentDiv.textContent = text;
        } else {
            // Format bot response  - convert bullet points to proper HTML
            contentDiv.innerHTML = this.formatBotResponse(text);
        }
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        this.elements.messages.appendChild(messageDiv); 

        this.scrollToBottom();

    }

    formatBotResponse(text) {
        // Escape HTML to prevent XSS
        const escapeHtml = (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        };

        // Split by newlines or " - " patterns
        const lines = text.split(/\n|(?= - )/);

        let formattedLines = [];
        let inList = false;

        for (let line of lines) {
            line = line.trim();

            // Check if line is a bullet point (- or *)
            if (line.match(/^[-*•]\s/)){
                if (!inList) {
                    formattedLines.push('<ul>');
                    inList = true;
                }
                const content = escapeHtml(line.replace(/^[-*•]\s*/, ''))
                formattedLines.push(`<li>${content}</li>`);
                
            } else { // Close bullet point when bullets stop
                if (inList) {
                    formattedLines.push(`</ul>`);
                    inList = false;
                }
                formattedLines.push(`<p>${escapeHtml(line)}</p>`);
            }
        }
        
        if (inList) {
            formattedLines.push(`</ul>`);
        }

        return formattedLines.join('');
    }

    
    scrollToBottom() {
        if (this.elements.messages) {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }
    }

}


document.addEventListener('DOMContentLoaded', () => {
    new ChatbotController();
});
