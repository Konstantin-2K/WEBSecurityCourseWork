document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');

    let isAdmin = false;
    if (token) {
        try {
            const user = getUserFromToken(token);
            isAdmin = user.isAdmin;
        } catch (e) {
            console.error('Error parsing token:', e);
        }
    }

    if (!token || !isAdmin) {
        window.location.href = 'index.html';
        return;
    }

    checkAuth();
    loadUsers();

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

    function loadUsers() {
        const token = localStorage.getItem('token');
        if (token && isTokenExpired(token)) {
            logout();
            return;
        }
        fetch('http://localhost:3000/api/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const userList = document.getElementById('userList');

                    if (data.data.users.length === 0) {
                        userList.innerHTML = '<p>No users found.</p>';
                        return;
                    }

                    let html = '<table class="data-table"><thead><tr>';
                    html += '<th>Username</th><th>Email</th><th>Admin</th><th>Created</th><th>Actions</th>';
                    html += '</tr></thead><tbody>';

                    data.data.users.forEach(user => {
                        html += `
            <tr data-id="${user._id}">
              <td>${user.username}</td>
              <td>${user.email}</td>
              <td>${user.isAdmin ? 'Yes' : 'No'}</td>
              <td>${new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <button class="btn btn-small btn-delete" onclick="deleteUser('${user._id}')">Delete</button>
              </td>
            </tr>
          `;
                    });

                    html += '</tbody></table>';
                    userList.innerHTML = html;
                } else {
                    document.getElementById('userList').innerHTML = `<p>Error: ${data.message}</p>`;
                }
            })
            .catch(error => {
                document.getElementById('userList').innerHTML = `<p>Error: ${error.message}</p>`;
            });
    }

    window.deleteUser = function (userId) {
        const token = localStorage.getItem('token');
        if (token && isTokenExpired(token)) {
            logout();
            return;
        }
        if (confirm('Are you sure you want to delete this user?')) {
            fetch(`http://localhost:3000/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    if (response.status === 204) {
                        // Remove user from table
                        const row = document.querySelector(`tr[data-id="${userId}"]`);
                        if (row) {
                            row.remove();
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