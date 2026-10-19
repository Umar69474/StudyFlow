# StudyFlow — Student Study Planner

StudyFlow is a small, responsive study-planning web app prototype. Students can organise assignments, track due dates, and see their progress.

## Features
- Create, view, edit, complete, filter, and delete tasks (CRUD).
- Add a subject, due date, priority, and optional notes.
- Dashboard counters for total, completed, upcoming, and progress.
- Due-date indicators for tasks due today or overdue.
- A 25-minute focus-session timer.
- Responsive layout for desktop and mobile.
- Browser `localStorage` saves tasks on the same browser/device.

## Run locally in VS Code
1. Download and extract the project folder.
2. Open the `StudyFlow` folder in VS Code.
3. Open `index.html` in a browser. Recommended: install the **Live Server** extension, right-click `index.html`, then choose **Open with Live Server**.
4. No package installation or API keys are required.

## Test checklist
- Add a task with a name and due date.
- Edit its name or priority.
- Mark it complete, then use the Completed filter.
- Delete a task and confirm the prompt.
- Refresh the page and confirm tasks remain saved in the same browser.
- Try a due date in the past to see the overdue indicator.
- Test the layout at a narrow/mobile browser width.
- Start and pause the focus timer.

## Technology
HTML5, CSS3, and vanilla JavaScript. No server or external database is used. Task data is stored locally in the browser; clearing browser storage removes it.

## Publishing
This is a static website and can be published for free with GitHub Pages:
1. Create a GitHub repository and upload `index.html`, `style.css`, `app.js`, and `README.md` to the repository root.
2. Open **Settings → Pages** in the repository.
3. Under build/deployment, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Wait for GitHub Pages to publish, then copy the public URL into the assignment submission.

## AI use and improvement
AI assistance was used to brainstorm the concept, generate a first version, and support implementation and testing. The app was improved with input validation, confirmation before deletion, accessible labels, responsive styling, and a test checklist. Review the code and be prepared to explain how task data is stored and updated.

## Project description
StudyFlow is a student planner that helps users manage assignments and study deadlines in one place. It provides task CRUD, priority labels, due-date warnings, progress statistics, and a focus timer. It is a prototype intended for demonstration and uses browser-local storage rather than a shared online database.
