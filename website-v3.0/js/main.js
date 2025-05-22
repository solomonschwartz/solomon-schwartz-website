// Fetch blog posts and videos dynamically using the GitHub API (or use static imports if preferred)

document.addEventListener('DOMContentLoaded', () => {
  fetch('/posts')
    .then(response => response.json())
    .then(data => {
      const blogContainer = document.getElementById('blog-posts');
      data.forEach(post => {
        const postCard = document.createElement('div');
        postCard.classList.add('border-b', 'border-gray-300', 'py-4');
        postCard.innerHTML = `
          <h2 class="text-2xl font-semibold text-gray-900 hover:text-blue-600">${post.title}</h2>
          <p class="text-sm text-gray-500">${post.date}</p>
          <p class="mt-2 text-gray-700">${post.excerpt}</p>
        `;
        blogContainer.appendChild(postCard);
      });
    });
});
