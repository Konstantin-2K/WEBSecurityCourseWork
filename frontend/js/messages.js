document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');

    checkAuth();
    loadMessages();

    function isTokenExpired(token) {
        try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                const currentTime = Math.floor(Date.now() / 1000);
                return payload.exp && payload.exp < currentTime;
            }
            return true;
        } catch (e) {
            return true;
        }
    }

    function loadMessages() {
        const token = localStorage.getItem('token');
        if (token && isTokenExpired(token)) {
            logout();
            return;
        }
        fetch('http://localhost:3000/api/messages', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const messageList = document.getElementById('messageList');

                    if (data.data.messages.length === 0) {
                        messageList.innerHTML = '<p>No messages yet. Be the first to post!</p>';
                        return;
                    }

                    let html = '';

                    data.data.messages.forEach(message => {
                        html += `
            <div class="message-card" data-id="${message._id}">
              <div class="message-content">${message.content}</div>
              <div class="message-meta">
                <span>Posted by: ${message.user ? message.user.username : 'Anonymous'}</span>
                <span>Date: ${new Date(message.createdAt).toLocaleString()}</span>
              </div>
              <div class="message-actions">
                <button class="btn btn-small btn-delete" onclick="deleteMessage('${message._id}')">Delete</button>
              </div>
            </div>
          `;
                    });

                    messageList.innerHTML = html;
                } else {
                    document.getElementById('messageList').innerHTML = `<p>Error: ${data.message}</p>`;
                }
            })
            .catch(error => {
                document.getElementById('messageList').innerHTML = `<p>Error: ${error.message}</p>`;
            });
    }

    document.getElementById('messageForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const content = document.getElementById('messageContent').value;

        fetch('http://localhost:3000/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({content})
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    document.getElementById('messageStatus').innerHTML = 'Message posted successfully!';
                    document.getElementById('messageForm').reset();

                    loadMessages();
                } else {
                    document.getElementById('messageStatus').innerHTML = `Error: ${data.message}`;
                }
            })
            .catch(error => {
                document.getElementById('messageStatus').innerHTML = `Error: ${error.message}`;
            });
    });

    window.deleteMessage = function (messageId) {
        const token = localStorage.getItem('token');
        if (token && isTokenExpired(token)) {
            // Token is expired, logout user
            logout();
            return;
        }
        if (confirm('Are you sure you want to delete this message?')) {
            const token = localStorage.getItem('token');

            fetch(`http://localhost:3000/api/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            })
                .then(response => {
                    if (response.status === 204) {
                        const message = document.querySelector(`.message-card[data-id="${messageId}"]`);
                        if (message) {
                            message.remove();
                        }
                    } else {
                        return response.json().then(data => {
                            alert(`Error: ${data.message}`);
                        });
                    }
                })
                .catch(error => {
                    alert(`Error: ${error.message}`);
                });
        }
    };
});