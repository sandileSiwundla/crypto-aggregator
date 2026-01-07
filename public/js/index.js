// public/js/index.js

const routes = {
  '/': '/index.html',
  '/js/single-token': '/single-token.html',
  '/compare': '/compare.html'
};

const app = document.getElementById('app');

/**
 * Load HTML partial into the app container
 */
async function loadPage(path) {
  const page = routes[path] || routes['/'];

  try {
    const res = await fetch(page);

    if (!res.ok) throw new Error('Page not found');

    const html = await res.text();
    app.innerHTML = html;
  } catch (err) {
    app.innerHTML = `<h2>404 – Page Not Found</h2>`;
  }
}

/**
 * Navigate without reloading
 */
function navigate(path) {
  history.pushState({}, '', path);
  loadPage(path);
}

/**
 * Intercept internal link clicks
 */
document.addEventListener('click', e => {
  const link = e.target.closest('a[data-link]');
  if (!link) return;

  e.preventDefault();
  navigate(link.getAttribute('href'));
});

/**
 * Handle back/forward buttons
 */
window.addEventListener('popstate', () => {
  loadPage(window.location.pathname);
});

/**
 * Initial load
 */
document.addEventListener('DOMContentLoaded', () => {
  loadPage(window.location.pathname);
});
