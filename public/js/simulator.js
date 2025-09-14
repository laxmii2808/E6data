document.addEventListener('DOMContentLoaded', () => {
    const requestForm = document.getElementById('request-form');
    const sendButton = document.getElementById('send-request-btn');
    const responseOutput = document.getElementById('response-output');

    if (!requestForm) return;

    requestForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        sendButton.disabled = true;
        sendButton.innerText = 'Sending...';
        responseOutput.textContent = '// Loading...';
        Prism.highlightElement(responseOutput);

        try {
            const formData = new FormData(requestForm);
            const requestData = Object.fromEntries(formData.entries());

            const response = await fetch('/api/simulate/connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const responseData = await response.json();
            const formattedJson = JSON.stringify(responseData, null, 2);
            responseOutput.textContent = formattedJson;

        } catch (error) {
            console.error('Error:', error);
            responseOutput.textContent = `// An error occurred:\n${error.message}`;
        } finally {
            sendButton.disabled = false;
            sendButton.innerText = 'Send Request';
            Prism.highlightElement(responseOutput);
        }
    });
});