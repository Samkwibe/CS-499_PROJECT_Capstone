// This immediately invoked function expression keeps the auth helper variables out of the global scope.
(function attachMunchiesAuth() {
  // getToken() reads the JWT saved after login or signup.
  function getToken() {
    // localStorage keeps the token available while the user moves between pages.
    return localStorage.getItem('authToken');
  }

  // getUser() reads the saved user profile from localStorage.
  function getUser() {
    // try/catch protects the app in case localStorage contains invalid JSON.
    try {
      // Parse the saved JSON string back into a JavaScript object.
      return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch (error) {
      // If parsing fails, return null so the auth guard treats the user as logged out.
      return null;
    }
  }

  // getAuthHeaders() builds the headers needed for protected API calls.
  function getAuthHeaders() {
    // Read the token once so it can be conditionally added to the request.
    const token = getToken();

    // Return JSON headers plus an Authorization header when a token exists.
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  // logout() clears the saved login state and returns the user to the login page.
  function logout() {
    // Remove the JWT so future protected requests are no longer authorized.
    localStorage.removeItem('authToken');
    // Remove the saved user object so role checks cannot use stale data.
    localStorage.removeItem('currentUser');
    // Redirect to login after the local session is cleared.
    window.location.href = 'login.html';
  }

  // requireAuth() protects pages that should only be visible to logged-in users.
  function requireAuth(allowedRoles = []) {
    // Read both pieces of login state that the page needs.
    const token = getToken();
    const user = getUser();

    // If either the token or user profile is missing, send the visitor to login.
    if (!token || !user) {
      window.location.href = 'login.html';
      return null;
    }

    // If specific roles were provided, verify that the current user's role is allowed.
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Send staff/admin users to the staff dashboard and students to the student dashboard.
      window.location.href = user.role === 'staff' || user.role === 'admin'
        ? 'staff-dashboard.html'
        : 'student-dashboard.html';
      return null;
    }

    return user;
  }

  // setupLogoutLinks() attaches logout behavior to any link with data-logout.
  function setupLogoutLinks() {
    // Find every logout link on the current page.
    document.querySelectorAll('[data-logout]').forEach(link => {
      // Replace the normal link navigation with the logout function.
      link.addEventListener('click', event => {
        // Prevent the browser from following the href before logout runs.
        event.preventDefault();
        // Clear localStorage and redirect to login.
        logout();
      });
    });
  }

  // Expose the helper functions under one global object so plain HTML pages can use them.
  window.MunchiesAuth = {
    getToken,
    getUser,
    getAuthHeaders,
    logout,
    requireAuth,
    setupLogoutLinks
  };
}());
