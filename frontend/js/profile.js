document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    let userId;
    try {
        const user = getUserFromToken(token);
        userId = user.id;
    } catch (e) {
        console.error('Error parsing token:', e);
        window.location.href = 'login.html';
        return;
    }

    checkAuth();
    loadProfile();

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

    function loadProfile() {
        const token = localStorage.getItem('token');
        if (token && isTokenExpired(token)) {
            logout();
            return;
        }
        fetch(`http://localhost:3000/api/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const profileData = document.getElementById('profileData');
                    profileData.innerHTML = `
          <h2>Welcome, ${data.data.user.username}!</h2>
          <p><strong>Email:</strong> ${data.data.user.email}</p>
          <p><strong>Account Type:</strong> ${data.data.user.isAdmin ? 'Administrator' : 'Regular User'}</p>
          <p><strong>Account Created:</strong> ${new Date(data.data.user.createdAt).toLocaleDateString()}</p>
        `;

                    document.getElementById('updateEmail').value = data.data.user.email;
                } else {
                    document.getElementById('profileData').innerHTML = `<p>Error: ${data.message}</p>`;
                }
            })
            .catch(error => {
                document.getElementById('profileData').innerHTML = `<p>Error: ${error.message}</p>`;
            });
    }

    document.getElementById('updateProfileForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('updateEmail').value;
        const password = document.getElementById('updatePassword').value;

        const updateData = {email};
        if (password) {
            updateData.password = password;
        }

        fetch(`http://localhost:3000/api/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    document.getElementById('updateMessage').innerHTML = 'Profile updated successfully!';
                    loadProfile();
                } else {
                    document.getElementById('updateMessage').innerHTML = `Error: ${data.message}`;
                }
            })
            .catch(error => {
                document.getElementById('updateMessage').innerHTML = `Error: ${error.message}`;
            });
    });
});