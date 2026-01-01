// Utility to check auth and redirect
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/citizen/login.html';
        return null;
    }
    return token;
}

// Utility to logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}
