// Cek token, jika tidak ada redirect ke login (kecuali di halaman login)
(function() {
  var isLoginPage = window.location.pathname.includes('auth-login.html');
  if (!isLoginPage && !localStorage.getItem('token')) {
    window.location.href = 'auth-login.html';
  }
})();