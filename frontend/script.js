const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const chatContainer = document.getElementById('chatContainer');

const sessionId = crypto.randomUUID();

function addMessage(message, type) {
    const div = document.createElement('div');

    if (type === 'user') {
        div.className = 'flex justify-end';

        div.innerHTML = `
            <div class="bg-blue-600 rounded-lg px-4 py-3 max-w-[80%]">
                ${message}
            </div>
        `;
    } else {
        div.className = 'flex justify-start';

        div.innerHTML = `
            <div class="bg-gray-800 rounded-lg px-4 py-3 max-w-[80%] prose prose-invert max-w-none">
                ${DOMPurify.sanitize(marked.parse(message))}
            </div>
        `;
    }

    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showLoader() {
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.className = 'flex justify-start';
    loader.innerHTML = `
            <div class="bg-gray-800 rounded-lg px-4 py-3">
                <div class="flex gap-1 items-center">
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                </div>
            </div>
        `;

    chatContainer.appendChild(loader);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.remove();
    }
}

chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return;
    addMessage(message, 'user');
    messageInput.value = '';
    showLoader();

    try {
        const response = await fetch(
            'https://simple-ai-chatbot-mu.vercel.app/chat',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: message,
                }),
            },
        );

        const data = await response.json();

        removeLoader();

        addMessage(data.response, 'ai');
    } catch (error) {
        console.error(error.message);
        removeLoader();
        addMessage('Something went wrong. Please try again.', 'ai');
    }
});
