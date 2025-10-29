// script-additions.js — small additions for project cards & gallery owner markups
// Load after script.js

(function(){
  // If a gallery image is marked data-owner="true", add an aria-label for screen readers
  document.querySelectorAll('img[data-owner="true"]').forEach(img => {
    img.setAttribute('aria-label', 'Owner image (site owner)');
    img.setAttribute('role', 'img');
  });

  // When a project card cover is missing, replace with a placeholder (optional)
  document.querySelectorAll('.project-cover').forEach(img => {
    img.addEventListener('error', () => {
      img.src = 'https://placehold.co/1200x800?text=No+image';
    });
  });

  // If you want to dynamically populate projects from a JSON array, you can extend this script.
})();