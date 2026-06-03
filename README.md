# WellSync Enterprise

**SDI Assignment 1 - Bronze Challenge**

A React + Vite + TailwindCSS wellness management platform for companies.

---

## Tech Stack

- **React 18** — UI framework
- **Vite 5** — build tool & dev server
- **TailwindCSS 3** — utility-first styling (visual aspects separated from logic)
- **React Router 6** — client-side routing
- **Vitest + Testing Library** — unit tests with coverage

---

## Setup & Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test -- --coverage
```
## Bronze Requirements Checklist

- [x] **Presentation view** — HomePage with logo, name ("WellSync Enterprise"), tagline ("Harmonizing Work and Wellbeing"), and description of the 3 pillars
- [x] **Master view** — paginated table of resources (ServicesPage)
- [x] **Detail view** — separate page per resource (ResourceDetailPage, route `/services/:id`)
- [x] **Create** — Add New Resource modal with form
- [x] **Update** — Edit Resource modal pre-filled with existing data
- [x] **Delete** — Delete confirmation modal
- [x] **Data validation** — required fields, email format, rating range, password match
- [x] **Visual separated from logic** — TailwindCSS classes in JSX, validation in `hooks/`, data in `data/`
- [x] **Data in RAM** — `useState` in App.jsx, initialized from `initialResources` array
- [x] **Tests** — validation, store integrity, CRUD unit tests

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | HomePage | Presentation view |
| `/login` | LoginPage | Login form |
| `/signup` | SignUpPage | Registration form |
| `/dashboard` | DashboardPage | Admin overview |
| `/services` | ServicesPage | Master view (table) |
| `/services/:id` | ResourceDetailPage | Detail view |
