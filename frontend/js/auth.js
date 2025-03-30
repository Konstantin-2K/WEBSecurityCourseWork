function checkAuth() {
    const token = localStorage.getItem('token');

    if (token) {
        try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {

                const payload = JSON.parse(atob(tokenParts[1]));
                const currentTime = Math.floor(Date.now() / 1000);

                if (payload.exp && payload.exp < currentTime) {
                    console.log('Token expired, logging out');
                    logout();
                    return;
                }

                const loginRegisterLink = document.getElementById('loginRegisterLink');
                const logoutLink = document.getElementById('logoutLink');
                const profileLink = document.getElementById('profileLink');
                const adminLink = document.getElementById('adminLink');
                const logoutButton = document.getElementById('logout');

                if (loginRegisterLink) loginRegisterLink.style.display = 'none';
                if (logoutLink) logoutLink.style.display = 'inline-block';
                if (profileLink) profileLink.style.display = 'inline-block';

                if (payload.isAdmin && adminLink) {
                    adminLink.style.display = 'inline-block';
                }

                if (logoutButton) {
                    logoutButton.addEventListener('click', function (e) {
                        e.preventDefault();
                        logout();
                    });
                }
            } else {
                throw new Error('Invalid token format');
            }
        } catch (e) {
            console.error('Error parsing token:', e);
            logout();
        }
    }
}

function getUserFromToken(token) {
    try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));

            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < currentTime) {
                throw new Error('Token expired');
            }

            return {
                id: payload.id,
                isAdmin: payload.isAdmin
            };
        }
        throw new Error('Invalid token format');
    } catch (e) {
        console.error('Error parsing token:', e);
        throw e;
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Only store the token, not user data
                    localStorage.setItem('token', data.token);

                    document.getElementById('loginMessage').innerHTML = 'Login successful! Redirecting...';
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    document.getElementById('loginMessage').innerHTML = `Error: ${data.message}`;
                }
            })
            .catch(error => {
                document.getElementById('loginMessage').innerHTML = `Error: ${error.message}`;
            });
    });
}

if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, email, password})
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    document.getElementById('registerMessage').innerHTML = 'Registration successful! You can now login.';
                    document.getElementById('registerForm').reset();
                } else {
                    document.getElementById('registerMessage').innerHTML = `Error: ${data.message}`;
                }
            })
            .catch(error => {
                document.getElementById('registerMessage').innerHTML = `Error: ${error.message}`;
            });
    });
}