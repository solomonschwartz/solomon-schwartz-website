module.exports = {
  content: [
    "./index.html",
    "./blog.html",
    "./videos.html",
    "./admin/*.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
