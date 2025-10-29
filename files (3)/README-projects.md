```markdown
# Projects JSON + Dynamic Cards

What I added
- projects.json — single JSON file containing your project entries (title, description, cover, tags, demo/repo links).
- projects-loader.js — fetches projects.json and generates responsive Bootstrap cards into the #projectsGrid element in projects.html. Adds:
  - Owner avatar overlay (assets/owner.jpg) on each card.
  - Cover-image lightbox using a Bootstrap modal.
  - Search wiring (top input or offcanvas input) to filter projects by title/description/tags.

How to use
1. Place these files into your site folder:
   - projects.json
   - projects-loader.js
   - replace the existing projects.html with the new one above (it loads the loader).
2. Add images:
   - assets/owner.jpg (your uploaded owner photo)
   - assets/project1.jpg
   - assets/project2.jpg
   - assets/project3.jpg
3. Open projects.html in a browser. The page will fetch projects.json and render the cards.
4. To add or change a project, edit projects.json (title, description, cover, tags, demoUrl, repoUrl) — no HTML edits required.

Notes & next ideas
- If you want, I can:
  - Add a small admin UI (client-side) to add projects directly in the browser and save to localStorage or export JSON.
  - Add pagination or "load more" for large lists.
  - Generate thumbnails automatically or add responsive srcset for cover images.

```