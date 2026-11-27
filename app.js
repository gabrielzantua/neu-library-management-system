"use strict";

const iconPaths = {
  book: '<path d="M12 5v16"/><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  issue: '<path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/>',
  return: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  sliders: '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
  userRound: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  arrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  menu: '<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  receipt: '<path d="M13 16H8"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"/>',
  dollar: '<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>',
};

const iconClassNames = {
  book: "book-open",
  users: "users",
  issue: "arrow-down-to-line",
  return: "rotate-ccw",
  search: "search",
  sliders: "sliders-horizontal",
  plus: "plus",
  userPlus: "user-plus",
  userRound: "user-round lucide-user-2",
  arrowUpRight: "arrow-up-right",
  check: "check",
  x: "x",
  menu: "menu",
  chevronDown: "chevron-down",
  receipt: "receipt-text",
  dollar: "circle-dollar-sign",
};

function icon(name, size = 17, strokeWidth = 2) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${iconClassNames[name] ?? name}" aria-hidden="true">${iconPaths[name] ?? ""}</svg>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function initials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function dateInputValue(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function addDays(value, days) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return dateInputValue(date);
}

function dateLabel(value) {
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00`));
}

function calendarDayNumber(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date.getTime() / 86_400_000;
}

function lateDays(dueDate, returnDate) {
  const due = calendarDayNumber(dueDate);
  const returned = calendarDayNumber(returnDate);
  if (due === null || returned === null) return 0;
  return Math.max(0, returned - due);
}

function returnDateError(loan, value) {
  const returned = calendarDayNumber(value);
  if (returned === null) return "Enter a valid return date.";
  const issued = calendarDayNumber(loan.issuedAt);
  const due = calendarDayNumber(loan.dueAt);
  if (issued === null || due === null || due < issued) return "The loan has invalid dates. Return not processed.";
  if (returned < issued) return "Return date cannot be before the issue date.";
  if (returned > calendarDayNumber(dateInputValue())) return "Return date cannot be in the future.";
  return "";
}

function peso(value) {
  return `₱${Number.isFinite(value) ? value.toLocaleString("en-PH") : "0"}`;
}

function bookTone(status) {
  if (status === "Available") return "sage";
  if (status === "Unavailable") return "terra";
  return "gold";
}

function badge(label, tone = "blue") {
  return `<span class="library-badge badge-${tone}">${escapeHtml(label)}</span>`;
}

function iconBox(name, tone = "blue") {
  return `<span class="icon-box icon-box-${tone}">${icon(name, 18)}</span>`;
}

function button(label, className = "button-primary", name = "", type = "button", disabled = false) {
  return `<button type="${type}" class="library-button ${className}"${disabled ? " disabled" : ""}>${name ? icon(name, 16, 2.2) : ""}${escapeHtml(label)}</button>`;
}

// Prototype loan settings. These are configurable demo rules, not official NEU policy.
const loanPolicy = { maxActiveLoansPerStudent: 1, defaultLoanDays: 14, finePerDay: 15 };

const unavailableReasons = {
  damaged: "Damaged",
  lost: "Lost",
  repair: "Under repair",
};

function emptyUnavailable() {
  return { damaged: 0, lost: 0, repair: 0 };
}

const seedBooks = [
  { id: "BK-1048", isbn: "978-0132350884", title: "Clean Code", author: "Robert C. Martin", category: "Technology", shelf: "A-03", available: 2, total: 3, unavailable: emptyUnavailable(), status: "Available" },
  // BK-1051 had one unexplained unavailable copy in the original seed. No loan or
  // unavailable-copy record accounted for it, so both copies are now available.
  { id: "BK-1051", isbn: "978-0262033848", title: "Introduction to Algorithms", author: "Thomas H. Cormen", category: "Technology", shelf: "A-07", available: 2, total: 2, unavailable: emptyUnavailable(), status: "Available" },
  { id: "BK-1073", isbn: "978-9715081227", title: "Florante at Laura", author: "Francisco Balagtas", category: "Literature", shelf: "B-11", available: 3, total: 3, unavailable: emptyUnavailable(), status: "Available" },
  { id: "BK-1110", isbn: "978-1449373320", title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", category: "Technology", shelf: "A-09", available: 0, total: 1, unavailable: emptyUnavailable(), status: "Issued" },
  { id: "BK-1156", isbn: "978-1032211261", title: "Research Methods for Students", author: "John Biggam", category: "Research", shelf: "C-02", available: 2, total: 2, unavailable: emptyUnavailable(), status: "Available" },
  { id: "BK-1182", isbn: "978-0199535569", title: "The Odyssey", author: "Homer", category: "Literature", shelf: "B-02", available: 0, total: 1, unavailable: emptyUnavailable(), status: "Issued" },
];

const seedUsers = [
  { id: "21-31426-708", name: "Alyssa Reyes", email: "alyssa.reyes@neu.edu.ph", department: "College of Computer Studies" },
  { id: "22-20814-365", name: "Daniel Villanueva", email: "daniel.villanueva@neu.edu.ph", department: "College of Nursing" },
  { id: "23-50114-286", name: "Rafael Santos", email: "rafael.santos@neu-library.test", department: "College of Computer Studies" },
  { id: "22-40719-582", name: "Camille Soriano", email: "camille.soriano@neu.edu.ph", department: "College of Arts and Sciences" },
];

const sampleIssueDate = dateInputValue();
const seedIssuedBooks = [
  { id: "IR-00412", bookId: "BK-1110", userId: "21-31426-708", issuedAt: "2026-08-20", dueAt: "2026-08-24" },
  { id: "IR-00413", bookId: "BK-1048", userId: "22-20814-365", issuedAt: "2026-08-25", dueAt: "2026-09-01" },
  { id: "IR-00414", bookId: "BK-1182", userId: "22-40719-582", issuedAt: sampleIssueDate, dueAt: addDays(sampleIssueDate, loanPolicy.defaultLoanDays) },
];

// Returned loan IDs remain unique for the lifetime of the in-memory records.
let nextBookNumber = 1200 + seedBooks.length;
let nextIssuedNumber = Math.max(...seedIssuedBooks.map((loan) => Number(loan.id.slice(3)))) + 1;

function initialView(value) {
  return ["users", "issue", "return"].includes(value) ? value : "books";
}

const demoSessionKey = "neu-library-demo-session";
const demoAccount = { id: "anna-lim", email: "librarian@neu-library.test", password: "library-demo" };

const state = {
  activeView: initialView(new URLSearchParams(window.location.search).get("view")),
  authenticated: window.sessionStorage.getItem(demoSessionKey) === demoAccount.id,
  loginError: "",
  books: seedBooks.map((book) => ({ ...book })),
  users: seedUsers.map((user) => ({ ...user })),
  issuedBooks: seedIssuedBooks.map((issuedBook) => ({ ...issuedBook })),
  returnRecords: [],
  bookSearch: "",
  userSearch: "",
  globalSearchQuery: "",
  bookFilter: "All",
  issueUserQuery: "",
  issueBookQuery: "",
  selectedUserId: "",
  selectedBookId: "",
  issueDate: dateInputValue(),
  dueDate: addDays(dateInputValue(), loanPolicy.defaultLoanDays),
  selectedIssuedId: "",
  returnDate: dateInputValue(),
  loanFilter: "all",
  returnHistorySearch: "",
  stockBookId: "",
  accountMenuOpen: "",
  modal: "",
  toast: "",
};

function unavailableTotal(book) {
  return Object.keys(unavailableReasons).reduce((total, reason) => {
    const count = book?.unavailable?.[reason];
    return total + (Number.isInteger(count) && count > 0 ? count : 0);
  }, 0);
}

function unavailableBreakdown(book) {
  return Object.entries(unavailableReasons)
    .filter(([reason]) => Number.isInteger(book?.unavailable?.[reason]) && book.unavailable[reason] > 0)
    .map(([reason, label]) => `${book.unavailable[reason]} ${label.toLowerCase()}`)
    .join(" · ");
}

function activeLoanCount(bookId) {
  return state.issuedBooks.filter((loan) => loan.bookId === bookId).length;
}

function inventoryTotals(book) {
  const borrowed = activeLoanCount(book.id);
  const unavailable = unavailableTotal(book);
  const accounted = book.available + borrowed + unavailable;
  return { borrowed, unavailable, accounted, consistent: accounted === book.total };
}

function bookStatus(book) {
  if (book.available > 0) return "Available";
  const totals = inventoryTotals(book);
  // Explicitly unavailable copies take priority over loans. A title is only
  // "Issued" when every copy is out on loan; damaged, lost, or under-repair
  // copies make it "Unavailable" even if other copies are also on loan.
  if (totals.unavailable > 0) return "Unavailable";
  if (totals.borrowed > 0) return "Issued";
  return "Unavailable";
}

function syncBookStatus(book) {
  return { ...book, status: bookStatus(book) };
}

function daysLabel(value) {
  return `${value} ${value === 1 ? "day" : "days"}`;
}

function markCopyUnavailable(bookId, reason) {
  const book = state.books.find((item) => item.id === bookId);
  if (!book) return { ok: false, message: "Book not found." };
  if (!Object.prototype.hasOwnProperty.call(unavailableReasons, reason)) return { ok: false, message: "Choose a valid unavailable reason." };
  const totals = inventoryTotals(book);
  if (!totals.consistent) return { ok: false, message: "Cannot adjust copies: the inventory record is inconsistent." };
  if (book.available < 1) return { ok: false, message: "No available copy can be marked unavailable." };
  const updated = syncBookStatus({
    ...book,
    available: book.available - 1,
    unavailable: { ...book.unavailable, [reason]: (book.unavailable?.[reason] ?? 0) + 1 },
  });
  const updatedTotals = inventoryTotals(updated);
  if (updated.available < 0 || updated.unavailable?.[reason] < 0 || !updatedTotals.consistent) {
    return { ok: false, message: "Cannot adjust copies without breaking the inventory total." };
  }
  state.books = state.books.map((item) => (item.id === book.id ? updated : item));
  return { ok: true, book: updated, message: `1 copy of ${book.title} marked ${unavailableReasons[reason].toLowerCase()}.` };
}

function restoreUnavailableCopy(bookId, reason) {
  const book = state.books.find((item) => item.id === bookId);
  if (!book) return { ok: false, message: "Book not found." };
  if (!Object.prototype.hasOwnProperty.call(unavailableReasons, reason)) return { ok: false, message: "Choose a valid unavailable reason." };
  const totals = inventoryTotals(book);
  if (!totals.consistent) return { ok: false, message: "Cannot adjust copies: the inventory record is inconsistent." };
  if (!Number.isInteger(book.unavailable?.[reason]) || book.unavailable[reason] < 1) {
    return { ok: false, message: `No copies are recorded as ${unavailableReasons[reason].toLowerCase()}.` };
  }
  const updated = syncBookStatus({
    ...book,
    available: book.available + 1,
    unavailable: { ...book.unavailable, [reason]: book.unavailable[reason] - 1 },
  });
  const updatedTotals = inventoryTotals(updated);
  if (!updatedTotals.consistent) return { ok: false, message: "Cannot restore a copy without breaking the inventory total." };
  state.books = state.books.map((item) => (item.id === book.id ? updated : item));
  return { ok: true, book: updated, message: `1 ${unavailableReasons[reason].toLowerCase()} copy of ${book.title} restored to available stock.` };
}

function normalizeSearchText(value) {
  return String(value ?? "").normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("en-PH").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function searchScore(tokens, fields) {
  const normalizedFields = fields.map(normalizeSearchText).filter(Boolean);
  const tokenScores = tokens.map((token) => Math.max(0, ...normalizedFields.map((field) => {
    if (field === token) return 100;
    if (field.startsWith(token)) return 70;
    if (field.split(" ").some((word) => word.startsWith(token))) return 50;
    return field.includes(token) ? 25 : 0;
  })));
  if (tokenScores.some((score) => !score)) return 0;
  const phrase = tokens.join(" ");
  return tokenScores.reduce((total, score) => total + score, 0)
    + (normalizedFields.includes(phrase) ? 120 : normalizedFields.some((field) => field.includes(phrase)) ? 60 : 0);
}

function searchLibrary(query) {
  const tokens = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const entries = [
    ...state.books.map((book) => ({ kind: "book", title: book.title, detail: `${book.author} · ${book.id}`, view: "books", record: book, fields: [book.title, book.author, book.isbn, book.category, book.shelf, book.id, bookStatus(book), unavailableBreakdown(book)] })),
    ...state.users.map((user) => ({ kind: "user", title: user.name, detail: `${user.id} · ${user.department}`, view: "users", record: user, fields: [user.name, user.id, user.email, user.department] })),
    ...state.issuedBooks.map((loan) => {
      const book = state.books.find((item) => item.id === loan.bookId);
      const user = state.users.find((item) => item.id === loan.userId);
      return { kind: "loan", title: book?.title ?? loan.id, detail: `${user?.name ?? "Student"} · Due ${dateLabel(loan.dueAt)}`, view: "return", record: loan, fields: [loan.id, loan.issuedAt, loan.dueAt, book?.title, book?.author, book?.isbn, user?.id, user?.name, user?.email, user?.department] };
    }),
    { kind: "module", title: "Books Entry", detail: "Browse the catalogue", view: "books", fields: ["Books Entry", "books", "catalogue"] },
    { kind: "module", title: "User Entry", detail: "Browse student records", view: "users", fields: ["User Entry", "students", "users"] },
    { kind: "module", title: "Issue Books", detail: "Issue an available book", view: "issue", fields: ["Issue Books", "borrowing", "issue"] },
    { kind: "module", title: "Return Books", detail: "Review active loans and due dates", view: "return", fields: ["Return Books", "returns", "due dates"] },
  ];
  const priority = { book: 4, user: 3, loan: 2, module: 1 };
  return entries.map((entry) => ({ ...entry, score: searchScore(tokens, entry.fields) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || priority[b.kind] - priority[a.kind] || a.title.localeCompare(b.title))
    .slice(0, 8);
}

function selectSearchResult(result) {
  if (!result) return;
  state.globalSearchQuery = "";
  if (result.kind === "book") { state.bookSearch = result.record.title; state.bookFilter = "All"; }
  if (result.kind === "user") state.userSearch = result.record.id;
  setView(result.view);
  if (result.kind === "loan") {
    state.selectedIssuedId = result.record.id;
    render();
  }
}

function signOut() {
  window.sessionStorage.removeItem(demoSessionKey);
  state.authenticated = false;
  state.loginError = "";
  state.globalSearchQuery = "";
  state.accountMenuOpen = "";
  render();
}

const app = document.querySelector("#app");
let toastTimer = 0;
let renderFrame = 0;

function renderAccountMenu(placement) {
  return `<div class="account-menu account-menu-${placement}" id="account-menu-${placement}" aria-label="Account options"><div class="account-menu-identity"><div class="avatar avatar-small">AL</div><div><strong>Anna Lim</strong><span>Librarian</span></div></div><button type="button" class="account-menu-signout logout-button">Sign out</button></div>`;
}

function renderSidebar() {
  const items = [
    ["books", "Books Entry", "book"],
    ["users", "User Entry", "users"],
    ["issue", "Issue Books", "issue"],
    ["return", "Return Books", "return"],
  ];
  return `<aside class="library-sidebar ${state.mobileOpen ? "sidebar-open" : ""}">
    <div class="brand-lockup"><div class="brand-mark"><img src="assets/neu-logo.png" alt="New Era University" width="42" height="42"></div><div><strong>NEU Library</strong><span>Management system</span></div><button type="button" class="mobile-close" aria-label="Close navigation">${icon("x", 18)}</button></div>
    <div class="sidebar-rule"></div>
    <div class="sidebar-context"><span>LIBRARY MANAGEMENT</span><strong>NEU / 1975</strong></div>
    <nav class="library-nav" aria-label="Library modules"><div class="nav-group"><p>Modules</p>${items.map(([id, label, iconName]) => `<a href="?view=${id}" data-view="${id}" class="nav-link ${state.activeView === id ? "nav-link-active" : ""}">${icon(iconName, 17, state.activeView === id ? 2.4 : 2)}<span>${label}</span>${state.activeView === id ? '<span class="nav-active-mark"></span>' : ""}</a>`).join("")}</div></nav>
    <div class="sidebar-bottom"><div class="desk-status"><span class="status-dot"></span><div><strong>Library desk open</strong><span>Mon–Sat / 7:00 AM–7:00 PM</span></div></div><div class="account-menu-wrap sidebar-account-wrap"><button type="button" class="sidebar-user account-menu-trigger" data-account-menu="sidebar" aria-label="Open account menu" aria-expanded="${state.accountMenuOpen === "sidebar"}" aria-controls="account-menu-sidebar"><div class="avatar avatar-small">AL</div><div><strong>Anna Lim</strong><span>Librarian</span></div>${icon("chevronDown", 15)}</button>${state.accountMenuOpen === "sidebar" ? renderAccountMenu("sidebar") : ""}</div></div>
  </aside>${state.mobileOpen ? '<button type="button" class="sidebar-scrim" aria-label="Close navigation"></button>' : ""}`;
}

function renderLoginView() {
  return `<main class="login-screen"><section class="login-identity"><div class="login-brand"><img src="assets/neu-logo.png" alt="New Era University"><div><strong>NEU Library</strong><span>Management system</span></div></div><div class="login-intro"><p>New Era University</p><h1>Library work, in one place.</h1><span>Keep the catalogue, student records, lending, and returns moving together.</span></div><div class="login-module-list"><span>Books</span><span>Students</span><span>Issues</span><span>Returns</span></div><p class="login-location">Quezon City · Philippines</p></section><section class="login-main"><div class="login-panel"><p class="login-kicker">Library staff</p><h2>Sign in</h2><p class="login-description">Open the library desk to continue.</p><form id="login-form" class="login-form"><label>Email address<input name="email" type="email" autocomplete="username" placeholder="librarian@neu-library.test" required autofocus></label><label>Password<input name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required></label>${state.loginError ? `<p class="login-error" role="alert">${escapeHtml(state.loginError)}</p>` : ""}<button type="submit" class="library-button button-primary login-submit">Sign in</button></form><section class="login-demo-access" aria-label="Demo account credentials"><div><strong>Demo access</strong><span>Shared credentials for this local prototype</span></div><dl><div><dt>Email</dt><dd>${escapeHtml(demoAccount.email)}</dd></div><div><dt>Password</dt><dd>${escapeHtml(demoAccount.password)}</dd></div></dl></section><p class="login-note">Demo only. This browser-only sign-in does not protect real data.</p></div></section></main>`;
}

function renderTopbar() {
  const titles = { books: "Books Entry", users: "User Entry", issue: "Issue Books", return: "Return Books" };
  const query = state.globalSearchQuery.trim();
  const results = query ? searchLibrary(query) : [];
  const icons = { book: "book", user: "users", loan: "return", module: "search" };
  const labels = { book: "Book", user: "Student", loan: "Loan", module: "Module" };
  return `<header class="library-topbar"><div class="topbar-heading"><button type="button" class="mobile-menu" aria-label="Open navigation">${icon("menu", 21)}</button><span class="breadcrumb">NEU LIBRARY <i>/</i></span><strong>${titles[state.activeView]}</strong></div><div class="topbar-actions"><div class="global-search"><div class="global-search-field">${icon("search", 17)}<input id="global-search-input" type="search" value="${escapeHtml(state.globalSearchQuery)}" placeholder="Search books, students, and loans" aria-label="Search the library" role="combobox" aria-haspopup="listbox" aria-autocomplete="list" aria-controls="global-search-results" aria-expanded="${Boolean(query)}" autocomplete="off"><kbd>⌘ / Ctrl K</kbd></div>${query ? `<div class="global-search-results" id="global-search-results" role="listbox" aria-label="Search results">${results.length ? results.map((result, index) => `<button type="button" class="global-search-result" role="option" data-search-index="${index}"><span class="search-result-icon">${icon(icons[result.kind], 16)}</span><span class="search-result-copy"><strong>${escapeHtml(result.title)}</strong><small>${escapeHtml(result.detail)}</small></span><span class="search-result-type">${labels[result.kind]}</span></button>`).join("") : `<div class="global-search-empty" role="status">No results for “${escapeHtml(state.globalSearchQuery)}”</div>`}</div>` : ""}</div><div class="topbar-account account-menu-wrap"><button type="button" class="topbar-avatar avatar account-menu-trigger" data-account-menu="topbar" aria-label="Open account menu" aria-expanded="${state.accountMenuOpen === "topbar"}" aria-controls="account-menu-topbar">AL</button>${state.accountMenuOpen === "topbar" ? renderAccountMenu("topbar") : ""}</div></div></header>`;
}

function sectionHeading(eyebrow, title, description, action = "") {
  return `<div class="section-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="section-description">${description}</p></div>${action}</div>`;
}

function emptyState(iconName, title, body) {
  return `<div class="empty-state">${iconBox(iconName, "ink")}<strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></div>`;
}

function renderBooksView() {
  const search = state.bookSearch.trim().toLowerCase();
  const statusCounts = ["Available", "Issued", "Unavailable"].reduce((counts, status) => {
    counts[status] = state.books.filter((book) => bookStatus(book) === status).length;
    return counts;
  }, {});
  const filtered = state.books.filter((book) => {
    const status = bookStatus(book);
    return (state.bookFilter === "All" || status === state.bookFilter)
      && [book.title, book.author, book.isbn, book.id, book.category, book.shelf, status, unavailableBreakdown(book)].some((value) => value.toLowerCase().includes(search));
  });
  const rows = filtered.map((book) => {
    const status = bookStatus(book);
    const unavailable = unavailableBreakdown(book);
    return `<div class="data-table-row"><div class="book-cell"><div class="book-cover cover-${book.category.toLowerCase()}">${icon("book", 17)}</div><div><strong>${escapeHtml(book.title)}</strong><span>${escapeHtml(book.author)} · ${escapeHtml(book.id)}</span></div></div><span class="mono-cell">${escapeHtml(book.isbn)}</span><span>${escapeHtml(book.category)}</span><span class="shelf-cell">${escapeHtml(book.shelf)}</span><span class="copies-cell"><span><strong>${book.available}</strong><span class="muted-inline"> / ${book.total}</span></span>${unavailable ? `<small class="stock-note">${escapeHtml(unavailable)}</small>` : ""}<button type="button" class="stock-adjust" data-stock-book="${escapeHtml(book.id)}" aria-label="Manage copies of ${escapeHtml(book.title)}">${icon("sliders", 13)}<span>Manage</span></button></span>${badge(status, bookTone(status))}</div>`;
  }).join("");
  return `<div class="view-stack">${sectionHeading("MODULE 01 / BOOKS ENTRY", "The catalogue", "Enter and maintain the books received by the library.", button("Add a book", "button-primary add-book", "plus"))}<div class="subnav-strip" role="group" aria-label="Book filters">${["All", "Available", "Issued", "Unavailable"].map((status) => `<button type="button" class="filter-option" data-filter="${status}" aria-pressed="${state.bookFilter === status}">${status === "All" ? "All books" : status} <b>${status === "All" ? state.books.length : statusCounts[status]}</b></button>`).join("")}</div><div class="toolbar-row"><div class="field-with-icon">${icon("search", 17)}<input id="book-search" value="${escapeHtml(state.bookSearch)}" placeholder="Search title, author, ISBN, or book ID"></div></div><section class="paper-card table-card"><div class="table-label"><span>BOOK RECORDS</span><span>${filtered.length} of ${state.books.length} titles</span></div><div class="data-table"><div class="data-table-header"><span>Book</span><span>ISBN</span><span>Category</span><span>Shelf</span><span>Copies</span><span>Status</span></div>${rows}</div>${filtered.length === 0 ? emptyState("book", "No books found", "Try a different title, author, ISBN, book ID, or filter.") : ""}</section></div>`;
}

function renderUsersView() {
  const search = state.userSearch.toLowerCase();
  const filtered = state.users.filter((user) => [user.id, user.name, user.email, user.department].some((value) => value.toLowerCase().includes(search)));
  const rows = filtered.map((user) => `<div class="data-table-row user-row"><div class="book-cell"><div class="avatar avatar-table">${escapeHtml(initials(user.name))}</div><div><strong>${escapeHtml(user.name)}</strong><span>${escapeHtml(user.id)} · ${escapeHtml(user.email)}</span></div></div><span>${escapeHtml(user.department)}</span></div>`).join("");
  return `<div class="view-stack">${sectionHeading("MODULE 02 / USER ENTRY", "The students", "Enter and maintain the student details needed for borrowing.", button("Register a student", "button-primary register-student", "userPlus"))}<div class="notice-banner">${iconBox("userRound", "sage")}<div><strong>Every issue starts with a clear student record.</strong><span>Keep each student&apos;s details current.</span></div></div><div class="toolbar-row"><div class="field-with-icon">${icon("search", 17)}<input id="user-search" value="${escapeHtml(state.userSearch)}" placeholder="Search name, student number, or college"></div></div><section class="paper-card table-card"><div class="table-label"><span>STUDENT RECORDS</span><span>${filtered.length} records</span></div><div class="data-table"><div class="data-table-header user-header"><span>Student</span><span>College / office</span></div>${rows}</div>${filtered.length === 0 ? emptyState("users", "No students found", "Try a different name, school ID, or college.") : ""}</section></div>`;
}

function renderIssueView() {
  const selectedUser = state.users.find((user) => user.id === state.selectedUserId);
  const selectedBook = state.books.find((book) => book.id === state.selectedBookId);
  const userMatches = state.users.filter((user) => [user.name, user.id, user.email].some((value) => value.toLowerCase().includes(state.issueUserQuery.toLowerCase()))).slice(0, 3);
  const bookMatches = state.books.filter((book) => book.available > 0 && [book.title, book.author, book.isbn, book.id].some((value) => value.toLowerCase().includes(state.issueBookQuery.toLowerCase()))).slice(0, 3);
  const unavailableMatches = state.books.filter((book) => book.available < 1 && [book.title, book.author, book.isbn, book.id].some((value) => value.toLowerCase().includes(state.issueBookQuery.toLowerCase()))).slice(0, Math.max(0, 3 - bookMatches.length));
  const noBooksAvailable = state.books.length > 0 && !state.books.some((book) => book.available > 0);
  const nextReturn = state.issuedBooks.map((loan) => ({ loan, book: state.books.find((book) => book.id === loan.bookId) })).filter((item) => item.book).sort((a, b) => a.loan.dueAt.localeCompare(b.loan.dueAt))[0];
  const nextReturnOverdueDays = nextReturn?.loan.dueAt ? lateDays(nextReturn.loan.dueAt, dateInputValue()) : 0;
  const activeLoan = state.issuedBooks.find((loan) => loan.userId === selectedUser?.id);
  const borrowedBook = state.books.find((book) => book.id === activeLoan?.bookId);
  const hasActiveLoan = Boolean(activeLoan);
  const selectedBookTotals = selectedBook ? inventoryTotals(selectedBook) : null;
  const canConfirm = Boolean(selectedUser && !hasActiveLoan && selectedBook && selectedBook.available > 0 && selectedBookTotals?.consistent && state.issueDate && state.dueDate && state.dueDate >= state.issueDate);
  const userPanel = selectedUser ? `<div class="selected-person"><div class="avatar avatar-large">${escapeHtml(initials(selectedUser.name))}</div><div><strong>${escapeHtml(selectedUser.name)}</strong><span>${escapeHtml(selectedUser.id)} · ${escapeHtml(selectedUser.department)}</span></div></div>` : `<div class="field-with-icon field-large">${icon("search", 18)}<input id="issue-user-search" value="${escapeHtml(state.issueUserQuery)}" placeholder="Search name, student number, or email" autofocus></div><div class="match-list">${userMatches.map((user) => `<button type="button" class="match-user" data-user-id="${escapeHtml(user.id)}"><div class="avatar avatar-small">${escapeHtml(initials(user.name))}</div><span><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.id)} · ${escapeHtml(user.department)}</small>${badge(state.issuedBooks.some((loan) => loan.userId === user.id) ? "Book borrowed" : "No active loan", state.issuedBooks.some((loan) => loan.userId === user.id) ? "gold" : "sage")}</span>${icon("arrowUpRight", 15)}</button>`).join("")}</div>`;
  const unavailableRows = unavailableMatches.map((book) => {
    const dueAt = state.issuedBooks.filter((loan) => loan.bookId === book.id).map((loan) => loan.dueAt).sort()[0];
    const overdueDays = dueAt ? lateDays(dueAt, dateInputValue()) : 0;
    const borrowed = activeLoanCount(book.id);
    const unavailable = unavailableBreakdown(book);
    const reasons = [borrowed ? `${borrowed} on loan` : "", unavailable].filter(Boolean).join(" · ");
    const detail = reasons ? `No borrowable copies · ${reasons}` : "No copies available";
    return `<button type="button" class="match-book" disabled><div class="book-mini">${icon("book", 15)}</div><span><strong>${escapeHtml(book.title)}</strong><small>${escapeHtml(detail)}${dueAt ? ` · Return due ${escapeHtml(dateLabel(dueAt))}${overdueDays ? ` · ${daysLabel(overdueDays)} overdue` : ""}` : ""}</small></span>${icon("return", 15)}</button>`;
  }).join("");
  const selectedBookUnavailable = selectedBook ? unavailableBreakdown(selectedBook) : "";
  const bookPanel = selectedBook ? `<div class="selected-book"><div class="book-cover cover-${selectedBook.category.toLowerCase()}">${icon("book", 22)}</div><div><strong>${escapeHtml(selectedBook.title)}</strong><span>${escapeHtml(selectedBook.author)} · Shelf ${escapeHtml(selectedBook.shelf)}</span>${badge(`${selectedBook.available} copy available`, "sage")}${selectedBookUnavailable ? `<span class="stock-note">${escapeHtml(selectedBookUnavailable)}</span>` : ""}</div></div>` : `<div class="field-with-icon field-large">${icon("search", 18)}<input id="issue-book-search" value="${escapeHtml(state.issueBookQuery)}" placeholder="Search title, author, ISBN, or book ID"></div>${noBooksAvailable ? `<div class="notice-banner" role="status">${iconBox("book", "gold")}<div><strong>No books are available to issue</strong><span>${nextReturn?.loan.dueAt ? `Next return due: ${escapeHtml(nextReturn.book.title)} on ${escapeHtml(dateLabel(nextReturn.loan.dueAt))}${nextReturnOverdueDays ? ` · ${daysLabel(nextReturnOverdueDays)} overdue` : ""}` : "No copies are currently borrowable. Return or restore a copy to continue."}</span></div></div>` : ""}<div class="match-list">${[...bookMatches.map((book) => `<button type="button" class="match-book" data-book-id="${escapeHtml(book.id)}"><div class="book-mini">${icon("book", 15)}</div><span><strong>${escapeHtml(book.title)}</strong><small>${escapeHtml(book.author)} · ${book.available} available</small></span>${icon("arrowUpRight", 15)}</button>`), unavailableRows].join("") || emptyState("book", "No matching books", "Try a different title, author, ISBN, or book ID.")}</div>`;
  const issuePolicyBanner = `<div class="policy-banner" role="note">${iconBox("users", "gold")}<div><strong>One active loan per student</strong><span>Return the current book before borrowing another. The ${loanPolicy.defaultLoanDays}-day default loan period is a prototype setting and can be adjusted before confirming the issue.</span></div></div>`;
  return `<div class="view-stack">${sectionHeading("MODULE 03 / ISSUE OF BOOKS", "Issue a book", "Issue a book to a registered student based on availability and enter its issue and due dates.")}<div class="notice-banner issue-guide">${iconBox("book", "blue")}<div><strong>How to issue a book</strong><span>1. Select a student. 2. Select an available book. 3. Enter the issue date and due date. 4. Confirm issue.</span></div></div>${issuePolicyBanner}<div class="stepper"><div class="step step-done"><span>1</span><div><strong>Find a student</strong><small>Who is borrowing?</small></div></div><div class="step-line"></div><div class="step ${selectedUser ? "step-done" : "step-current"}"><span>2</span><div><strong>Choose a book</strong><small>What is available?</small></div></div><div class="step-line"></div><div class="step ${selectedUser && selectedBook ? "step-current" : ""}"><span>3</span><div><strong>Confirm issue</strong><small>Record the hand-off.</small></div></div></div><div class="issue-layout"><section class="paper-card issue-card"><div class="card-heading"><div><p class="eyebrow">STUDENT</p><h2>${selectedUser ? "Student selected" : "Find a student"}</h2></div>${selectedUser ? '<button type="button" class="clear-selection" data-clear="user">Change ' + icon("x", 14) + "</button>" : ""}</div>${userPanel}${activeLoan ? `<div class="notice-banner" role="status">${iconBox("book", "gold")}<div><strong>Currently borrowed: ${escapeHtml(borrowedBook?.title ?? "Book")}</strong><span>Issued: ${escapeHtml(dateLabel(activeLoan.issuedAt))} · Due: ${escapeHtml(dateLabel(activeLoan.dueAt))}</span><span>Return this book before borrowing another.</span></div></div>` : selectedUser ? `<div class="notice-banner">${iconBox("check", "sage")}<div><strong>No active loan</strong><span>This student can borrow an available book.</span></div></div>` : ""}</section><section class="paper-card issue-card"><div class="card-heading"><div><p class="eyebrow">BOOK</p><h2>${selectedBook ? "Book selected" : "Choose a book"}</h2></div>${selectedBook ? '<button type="button" class="clear-selection" data-clear="book">Change ' + icon("x", 14) + "</button>" : ""}</div>${bookPanel}</section></div><form id="issue-form" class="paper-card issue-review ${canConfirm ? "review-ready" : ""}"><div><p class="eyebrow">ISSUE SUMMARY</p><h2>${hasActiveLoan ? "Borrowing unavailable" : canConfirm ? "Ready to hand over" : "Complete the selections above"}</h2><p>${hasActiveLoan ? "Return your borrowed book before borrowing another. Choose a different student to continue." : canConfirm && selectedUser ? `The book will be due on ${escapeHtml(dateLabel(state.dueDate))} for ${escapeHtml(selectedUser.name)}.` : "Choose a registered student and an available book to prepare the issue record."}</p></div><div class="issue-review-meta"><label><span>Issue date</span><input id="issue-date" type="date" value="${escapeHtml(state.issueDate)}" required></label><label><span>Due date</span><input id="due-date" type="date" value="${escapeHtml(state.dueDate)}" min="${escapeHtml(state.issueDate)}" required></label>${button(canConfirm ? "Confirm issue" : "Complete the form", "button-primary", "check", "submit", !canConfirm)}</div></form></div>`;
}

function renderReturnHistory() {
  const query = normalizeSearchText(state.returnHistorySearch);
  const records = [...state.returnRecords].reverse().map((record) => {
    const book = state.books.find((item) => item.id === record.bookId);
    const user = state.users.find((item) => item.id === record.studentId);
    const searchText = normalizeSearchText([
      record.loanId, record.studentId, record.bookId, record.dueDate, record.returnDate,
      book?.title, book?.author, book?.isbn, user?.name, user?.email,
    ].filter(Boolean).join(" "));
    return { record, book, user, searchText };
  });
  const filtered = query ? records.filter((entry) => entry.searchText.includes(query)) : records;
  const rows = filtered.map(({ record, book, user }) => {
    const overdue = record.overdueDays > 0;
    return `<div class="history-row" data-return-id="${escapeHtml(record.loanId)}"><div class="history-book" data-label="Book"><strong>${escapeHtml(book?.title ?? "Removed book")}</strong><span>${escapeHtml(book?.author ?? record.bookId)}</span></div><div class="history-student" data-label="Student"><strong>${escapeHtml(user?.name ?? "Removed student")}</strong><span>${escapeHtml(user?.id ?? record.studentId)}</span></div><span class="mono-cell" data-label="Loan ID">${escapeHtml(record.loanId)}</span><span data-label="Due date">${escapeHtml(dateLabel(record.dueDate))}</span><span data-label="Returned">${escapeHtml(dateLabel(record.returnDate))}</span><span class="${overdue ? "history-overdue" : ""}" data-label="Overdue days">${daysLabel(record.overdueDays)}</span><span class="history-fine ${overdue ? "history-fine-due" : ""}" data-label="Fine">${peso(record.fineAmount)}</span></div>`;
  }).join("");
  const emptyTitle = state.returnRecords.length ? "No returns match your search" : "No returns recorded yet";
  const emptyBody = state.returnRecords.length
    ? "Try a different student, book title, or loan ID."
    : "Completed returns appear here for the current page session and reset on refresh.";
  return `<section class="paper-card table-card return-history" aria-labelledby="return-history-heading"><div class="table-label"><span id="return-history-heading">RETURN HISTORY</span><span>${filtered.length} of ${state.returnRecords.length} returns</span></div><div class="history-toolbar"><div class="field-with-icon">${icon("search", 17)}<input id="return-history-search" type="search" value="${escapeHtml(state.returnHistorySearch)}" placeholder="Search student, book, or loan ID" aria-label="Search return history"></div><span class="history-note">Session only · resets on refresh</span></div>${filtered.length ? `<div class="history-table"><div class="history-header"><span>Book</span><span>Student</span><span>Loan ID</span><span>Due date</span><span>Returned</span><span>Overdue</span><span>Fine</span></div>${rows}</div>` : emptyState("receipt", emptyTitle, emptyBody)}</section>`;
}

function renderReturnView() {
  const today = dateInputValue();
  const selected = state.issuedBooks.find((issuedBook) => issuedBook.id === state.selectedIssuedId);
  const annotated = [...state.issuedBooks].sort((a, b) => a.dueAt.localeCompare(b.dueAt)).map((issuedBook) => ({
    loan: issuedBook,
    book: state.books.find((item) => item.id === issuedBook.bookId),
    user: state.users.find((item) => item.id === issuedBook.userId),
    overdueDays: lateDays(issuedBook.dueAt, today),
  }));
  const counts = {
    all: annotated.length,
    active: annotated.filter((entry) => entry.overdueDays === 0).length,
    overdue: annotated.filter((entry) => entry.overdueDays > 0).length,
  };
  const estimatedFine = annotated.reduce((total, entry) => total + entry.overdueDays * loanPolicy.finePerDay, 0);
  const activeFilter = ["all", "active", "overdue"].includes(state.loanFilter) ? state.loanFilter : "all";
  const filtered = annotated.filter((entry) => activeFilter === "all" || (activeFilter === "overdue" ? entry.overdueDays > 0 : entry.overdueDays === 0));
  const rows = filtered.map(({ loan, book, user, overdueDays }) => {
    const overdue = overdueDays > 0;
    return `<button type="button" class="issued-book-row ${selected?.id === loan.id ? "issued-book-row-active" : ""}" data-issued-id="${escapeHtml(loan.id)}"><div class="book-mini">${icon("book", 16)}</div><div class="issued-book-title"><strong>${escapeHtml(book?.title ?? "Book")}</strong><span>${escapeHtml(loan.id)} · Issued ${escapeHtml(dateLabel(loan.issuedAt))}</span></div><div class="issued-book-user"><span>${escapeHtml(user?.name ?? "Student")}</span><small>${escapeHtml(user?.id ?? "")}</small></div><div class="issued-book-due">${badge(overdue ? "Overdue" : "Active", overdue ? "terra" : "sage")}<span>Due ${escapeHtml(dateLabel(loan.dueAt))}</span>${overdue ? `<small>${daysLabel(overdueDays)} late · Est. fine ${peso(overdueDays * loanPolicy.finePerDay)}</small>` : ""}</div>${icon("arrowUpRight", 16)}</button>`;
  }).join("");
  const filterOptions = [["all", "All loans", counts.all], ["active", "Active", counts.active], ["overdue", "Overdue", counts.overdue]];
  const filterRow = `<div class="loan-filter-row" role="group" aria-label="Filter issued books">${filterOptions.map(([value, label, count]) => `<button type="button" class="loan-filter ${activeFilter === value ? "loan-filter-active" : ""}" data-loan-filter="${value}" aria-pressed="${activeFilter === value}">${label} <b>${count}</b></button>`).join("")}</div>`;
  const emptyTitle = counts.all === 0 ? "No books to be returned" : activeFilter === "overdue" ? "No overdue loans" : "No active loans";
  const emptyBody = counts.all === 0
    ? "All issued books have been returned."
    : activeFilter === "overdue"
      ? "No active loan has passed its due date."
      : "Every active loan is overdue. Use the Overdue filter to review them.";
  let summary = `<section class="paper-card return-summary">${emptyState("receipt", "Select a book to return", "Choose a book from the list to prepare the return receipt.")}</section>`;
  if (selected) {
    const book = state.books.find((item) => item.id === selected.bookId);
    const user = state.users.find((item) => item.id === selected.userId);
    const dateError = returnDateError(selected, state.returnDate);
    const fine = dateError ? null : lateDays(selected.dueAt, state.returnDate) * loanPolicy.finePerDay;
    summary = `<form id="return-form" class="paper-card return-summary"><div class="receipt-top"><span class="receipt-seal">${icon("receipt", 21)}</span><div><p class="eyebrow">RETURN RECEIPT</p><h2>Review and close</h2></div><button type="button" class="return-receipt-close" aria-label="Close return receipt">${icon("x", 16)}</button></div><div class="receipt-rule"></div><div class="receipt-person"><div class="avatar avatar-small">${escapeHtml(initials(user?.name ?? ""))}</div><div><strong>${escapeHtml(user?.name ?? "Student")}</strong><span>${escapeHtml(user?.id ?? "")}</span></div></div><div class="receipt-line"><span>Book</span><strong>${escapeHtml(book?.title ?? "Book")}</strong></div><div class="receipt-line"><span>Due date</span><strong>${escapeHtml(dateLabel(selected.dueAt))}</strong></div><div class="receipt-line receipt-field"><label for="return-date">Return date</label><input id="return-date" type="date" value="${escapeHtml(state.returnDate)}" min="${escapeHtml(selected.issuedAt)}" max="${today}" required></div><div class="fine-box ${fine ? "fine-due" : "fine-clear"}"${dateError ? ' role="alert"' : ""}><div><span>${escapeHtml(dateError || (fine ? "Fine due" : "No fine due"))}</span><strong>${fine === null ? "—" : peso(fine)}</strong></div>${icon("dollar", 23)}</div><p class="receipt-note">No late fine is charged when the return date is on or before the due date.</p>${button(fine ? "Return & record fine" : "Confirm return", "button-primary", "check", "submit", Boolean(dateError))}</form>`;
  }
  const policyBanner = `<div class="policy-banner" role="note">${iconBox("dollar", "gold")}<div><strong>Late fine: ${peso(loanPolicy.finePerDay)} per overdue calendar day</strong><span>Returns on or before the due date incur no late fine. The ${loanPolicy.defaultLoanDays}-day loan period and ${peso(loanPolicy.finePerDay)} rate are prototype-configured policies, not official New Era University regulations.</span></div></div>`;
  const overview = `<div class="loan-overview"><div class="loan-stat"><span>Active loans</span><strong>${counts.all}</strong></div><div class="loan-stat ${counts.overdue ? "loan-stat-alert" : ""}"><span>Overdue</span><strong>${counts.overdue}</strong></div><div class="loan-stat"><span>Estimated fines</span><strong>${peso(estimatedFine)}</strong></div><div class="loan-stat"><span>Returned this session</span><strong>${state.returnRecords.length}</strong></div></div>`;
  return `<div class="view-stack">${sectionHeading("MODULE 04 / RETURN OF BOOKS", "Return a book", "Record the return date, restore availability, and calculate any fine for delayed return.", `<div class="desk-counter"><span class="status-dot"></span>${counts.all} books to be returned${counts.overdue ? ` · ${counts.overdue} overdue` : ""}</div>`)}${policyBanner}${overview}<div class="return-layout"><section class="paper-card table-card issued-book-table"><div class="table-label"><span>BOOKS TO BE RETURNED</span><span>${filtered.length} of ${counts.all} · Sorted by due date</span></div>${filterRow}<div class="issued-book-list">${rows || emptyState("return", emptyTitle, emptyBody)}</div></section>${summary}</div>${renderReturnHistory()}</div>`;
}

function canRemoveBook(bookId) {
  return !activeLoanCount(bookId) && !state.returnRecords.some((record) => record.bookId === bookId);
}

function renderStockModal() {
  const book = state.books.find((item) => item.id === state.stockBookId);
  if (!book) return "";
  const totals = inventoryTotals(book);
  const breakdown = unavailableBreakdown(book);
  const canRemove = canRemoveBook(book.id);
  if (state.modal === "remove-book") {
    return `<div class="modal-layer"><button type="button" class="modal-backdrop" aria-label="Cancel removal"></button><section class="library-modal" role="dialog" aria-modal="true" aria-labelledby="remove-book-title"><h2 id="remove-book-title">Remove book?</h2><p class="stock-title">${escapeHtml(book.title)} · ${escapeHtml(book.id)}</p><form id="remove-book-form" class="modal-form"><label>Type ${escapeHtml(book.id)} to remove this record and all ${book.total} copies<input name="confirmation" required autocomplete="off"></label><div class="modal-actions">${button("Cancel", "button-secondary modal-cancel")}${button("Remove permanently", "button-primary", "", "submit")}</div></form></section></div>`;
  }
  return `<div class="modal-layer" role="presentation"><button type="button" class="modal-backdrop" aria-label="Close dialog"></button><section class="library-modal" role="dialog" aria-modal="true" aria-labelledby="stock-modal-title"><button type="button" class="modal-close" aria-label="Close dialog">${icon("x", 18)}</button><p class="eyebrow">BOOKS ENTRY / INVENTORY</p><h2 id="stock-modal-title">Manage copies</h2><p class="stock-title">${escapeHtml(book.title)} · ${escapeHtml(book.id)}</p><div class="stock-facts"><div><span>Total</span><strong>${book.total}</strong></div><div><span>Available</span><strong>${book.available}</strong></div><div><span>Borrowed</span><strong>${totals.borrowed}</strong></div><div><span>Unavailable</span><strong>${totals.unavailable}</strong></div></div><p class="stock-invariant ${totals.consistent ? "stock-ok" : "stock-bad"}">Total ${book.total} = ${book.available} available + ${totals.borrowed} borrowed + ${totals.unavailable} unavailable</p><p class="stock-breakdown">${breakdown ? `Unavailable copies: ${escapeHtml(breakdown)}.` : "No copies are currently marked damaged, lost, or under repair."}</p><form id="stock-form" class="modal-form"><input type="hidden" name="bookId" value="${escapeHtml(book.id)}"><div class="form-row"><label>Action<select name="action"><option value="mark">Mark one copy unavailable</option><option value="restore">Restore one unavailable copy</option></select></label><label>Reason<select name="reason">${Object.entries(unavailableReasons).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select></label></div><p class="stock-hint">Lost copies remain part of the title&apos;s total until written off. This prototype does not write off copies.</p><div class="modal-actions"><button type="button" class="library-button button-secondary modal-cancel">Cancel</button>${button("Update inventory", "button-primary", "check", "submit")}</div></form><div class="modal-actions">${button("Remove book", "button-secondary remove-book", "", "button", !canRemove)}</div>${canRemove ? "" : '<p class="stock-hint">Books with active loans or return history cannot be removed.</p>'}</section></div>`;
}

function renderModal() {
  if (!state.modal) return "";
  if (state.modal === "stock" || state.modal === "remove-book") return renderStockModal();
  const book = state.modal === "book";
  return `<div class="modal-layer" role="presentation"><button type="button" class="modal-backdrop" aria-label="Close dialog"></button><section class="library-modal" role="dialog" aria-modal="true"><button type="button" class="modal-close" aria-label="Close dialog">${icon("x", 18)}</button><p class="eyebrow">${book ? "BOOKS ENTRY" : "USER ENTRY"}</p><h2>${book ? "Add a book" : "Register a student"}</h2>${book ? `<form id="book-form" class="modal-form"><label>Title<input name="title" placeholder="Book title" autofocus required></label><label>Author<input name="author" placeholder="Author name" required></label><div class="form-row"><label>ISBN (same ISBN adds copies)<input name="isbn" placeholder="978-..." required></label><label>Copies<input name="copies" type="number" min="1" value="1"></label></div><div class="form-row"><label>Category<select name="category"><option>Technology</option><option>Literature</option><option>Research</option><option>History</option></select></label><label>Shelf<input name="shelf" value="A-01"></label></div><div class="modal-actions"><button type="button" class="library-button button-secondary modal-cancel">Cancel</button>${button("Add book", "button-primary", "plus", "submit")}</div></form>` : `<form id="user-form" class="modal-form"><label>Full name<input name="name" placeholder="Full name" autofocus required></label><label>Student Number<input name="id" placeholder="19-11157-510" pattern="[0-9]{2}-[0-9]{5}-[0-9]{3}" title="Use YY-#####-###, for example 19-11157-510" required></label><label>Email<input name="email" type="email" placeholder="name@neu.edu.ph" required></label><label>College / Office<input name="department" placeholder="College or office"></label><div class="modal-actions"><button type="button" class="library-button button-secondary modal-cancel">Cancel</button>${button("Register student", "button-primary", "userPlus", "submit")}</div></form>`}</section></div>`;
}

function renderToast() {
  return state.toast ? `<div class="library-toast" role="status"><span class="toast-check">${icon("check", 15)}</span><span>${escapeHtml(state.toast)}</span><button type="button" aria-label="Dismiss notification" class="dismiss-toast">${icon("x", 15)}</button></div>` : "";
}

function render() {
  if (!state.authenticated) {
    app.innerHTML = renderLoginView();
    return;
  }
  const views = { books: renderBooksView, users: renderUsersView, issue: renderIssueView, return: renderReturnView };
  app.innerHTML = `<main class="library-app">${renderSidebar()}<section class="library-main">${renderTopbar()}<div class="library-content">${views[state.activeView]()}</div><footer class="library-footer"><span>NEU LIBRARY MANAGEMENT SYSTEM</span><span>New Era University · Quezon City · 2026</span></footer></section>${renderToast()}${renderModal()}</main>`;
}

function setView(view) {
  state.globalSearchQuery = "";
  state.accountMenuOpen = "";
  state.activeView = initialView(view);
  state.mobileOpen = false;
  if (state.activeView === "issue") {
    state.issueUserQuery = "";
    state.issueBookQuery = "";
    state.selectedUserId = "";
    state.selectedBookId = "";
    state.issueDate = dateInputValue();
    state.dueDate = addDays(state.issueDate, loanPolicy.defaultLoanDays);
  }
  if (state.activeView === "return") {
    state.selectedIssuedId = "";
    state.returnDate = dateInputValue();
    state.loanFilter = "all";
    state.returnHistorySearch = "";
  }
  state.modal = "";
  state.stockBookId = "";
  const url = new URL(window.location.href);
  url.searchParams.set("view", state.activeView);
  window.history.pushState(null, "", url);
  window.scrollTo({ top: 0, behavior: "auto" });
  render();
}

function notify(message) {
  state.toast = message;
  window.clearTimeout(toastTimer);
  render();
  toastTimer = window.setTimeout(() => {
    state.toast = "";
    app.querySelector?.(".library-toast")?.remove();
  }, 3200);
}

function focusAfterRender(id) {
  window.cancelAnimationFrame(renderFrame);
  renderFrame = window.requestAnimationFrame(() => {
    render();
    const input = document.getElementById(id);
    if (input) {
      input.focus();
      if (!['date', 'number'].includes(input.type) && typeof input.setSelectionRange === "function") input.setSelectionRange(input.value.length, input.value.length);
    }
  });
}

function updateDateField(input) {
  const isReturn = input.id === "return-date";
  const isIssueDate = input.id === "issue-date";
  const key = isReturn ? "returnDate" : isIssueDate ? "issueDate" : "dueDate";
  if (state[key] === input.value) return;
  state[key] = input.value;

  // Keep the native date controls mounted so typing retains the active segment.
  const form = input.form;
  const preview = document.createElement("template");
  preview.innerHTML = isReturn ? renderReturnView() : renderIssueView();
  const updatedForm = preview.content.querySelector(isReturn ? "#return-form" : "#issue-form");
  if (isIssueDate) form.querySelector("#due-date").min = input.value;
  const details = isReturn ? ".fine-box" : ":scope > div:first-child";
  form.querySelector(details).replaceWith(updatedForm.querySelector(details));
  const button = form.querySelector('button[type="submit"]');
  const updatedButton = updatedForm.querySelector('button[type="submit"]');
  button.disabled = updatedButton.disabled;
  button.innerHTML = updatedButton.innerHTML;
  if (!isReturn) form.classList.toggle("review-ready", updatedForm.classList.contains("review-ready"));
}

function handleInput(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (input.id === "global-search-input") { state.globalSearchQuery = input.value; focusAfterRender(input.id); }
  if (input.id === "book-search") {
    state.bookSearch = input.value;
    const query = input.value.trim().toLowerCase();
    if (state.books.some((book) => book.id.toLowerCase() === query)) state.bookFilter = "All";
    focusAfterRender(input.id);
  }
  if (input.id === "user-search") { state.userSearch = input.value; focusAfterRender(input.id); }
  if (input.id === "issue-user-search") { state.issueUserQuery = input.value; focusAfterRender(input.id); }
  if (input.id === "issue-book-search") { state.issueBookQuery = input.value; focusAfterRender(input.id); }
  if (["issue-date", "due-date", "return-date"].includes(input.id)) updateDateField(input);
  if (input.id === "return-history-search") { state.returnHistorySearch = input.value; focusAfterRender(input.id); }
}

app.addEventListener("click", (event) => {
  const origin = event.target instanceof Element ? event.target : null;
  const target = origin?.closest("a, button");
  let dismissedOverlay = false;
  if (state.globalSearchQuery && origin && !origin.closest(".global-search")) {
    state.globalSearchQuery = "";
    dismissedOverlay = true;
  }
  if (state.accountMenuOpen && origin && !origin.closest(".account-menu-wrap")) {
    state.accountMenuOpen = "";
    dismissedOverlay = true;
  }
  if (!target || !app.contains(target)) {
    if (dismissedOverlay) {
      const focusId = origin?.id;
      render();
      if (focusId) document.getElementById(focusId)?.focus();
    }
    return;
  }
  if (target.matches(".account-menu-trigger")) {
    const placement = target.dataset.accountMenu;
    state.accountMenuOpen = state.accountMenuOpen === placement ? "" : placement;
    render();
    return;
  }
  if (target.matches(".logout-button")) { signOut(); return; }
  if (target.matches(".return-receipt-close")) {
    state.selectedIssuedId = "";
    render();
    return;
  }
  if (target.matches(".global-search-result")) {
    selectSearchResult(searchLibrary(state.globalSearchQuery)[Number(target.dataset.searchIndex)]);
    return;
  }
  if (target.matches(".nav-link")) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setView(target.dataset.view);
    return;
  }
  if (target.matches(".mobile-menu")) { state.mobileOpen = true; render(); return; }
  if (target.matches(".mobile-close, .sidebar-scrim")) { state.mobileOpen = false; render(); return; }
  if (target.matches(".add-book")) { state.modal = "book"; render(); return; }
  if (target.matches(".register-student")) { state.modal = "user"; render(); return; }
  if (target.matches(".stock-adjust")) { state.stockBookId = target.dataset.stockBook; state.modal = "stock"; render(); return; }
  if (target.matches(".remove-book") && state.modal === "stock" && canRemoveBook(state.stockBookId)) {
    state.modal = "remove-book";
    render();
    return;
  }
  if (target.matches(".filter-option")) {
    state.bookFilter = target.dataset.filter;
    render();
    app.querySelector?.('.subnav-strip [aria-pressed="true"]')?.focus();
    return;
  }
  if (target.matches(".loan-filter")) { state.loanFilter = target.dataset.loanFilter; render(); return; }
  if (target.matches(".modal-close, .modal-backdrop, .modal-cancel")) { state.modal = ""; state.stockBookId = ""; render(); return; }
  if (target.matches(".dismiss-toast")) { state.toast = ""; render(); return; }
  if (target.matches(".match-user")) { state.selectedUserId = target.dataset.userId; state.issueUserQuery = ""; render(); return; }
  if (target.matches(".match-book")) { state.selectedBookId = target.dataset.bookId; state.issueBookQuery = ""; render(); return; }
  if (target.matches(".clear-selection")) { if (target.dataset.clear === "user") state.selectedUserId = ""; if (target.dataset.clear === "book") state.selectedBookId = ""; render(); return; }
  if (target.matches(".issued-book-row")) { state.selectedIssuedId = target.dataset.issuedId; render(); }
});

app.addEventListener("input", handleInput);
app.addEventListener("change", handleInput);

window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.getElementById("global-search-input")?.focus();
  } else if (event.key === "Escape" && (state.globalSearchQuery || state.accountMenuOpen)) {
    state.globalSearchQuery = "";
    state.accountMenuOpen = "";
    render();
  } else if (event.key === "Enter" && document.activeElement?.id === "global-search-input") {
    const firstResult = searchLibrary(state.globalSearchQuery)[0];
    if (firstResult) {
      event.preventDefault();
      selectSearchResult(firstResult);
    }
  }
});

app.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const formId = form.getAttribute("id");
  const data = new FormData(form);
  if (formId === "login-form") {
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");
    if (email !== demoAccount.email || password !== demoAccount.password) {
      state.loginError = "Email or password did not match the demo account.";
      render();
      return;
    }
    window.sessionStorage.setItem(demoSessionKey, demoAccount.id);
    state.authenticated = true;
    state.loginError = "";
    render();
    return;
  }
  if (formId === "book-form") {
    const title = String(data.get("title") ?? "").trim();
    const author = String(data.get("author") ?? "").trim();
    const isbn = String(data.get("isbn") ?? "").trim();
    if (!title || !author || !isbn) return;
    const total = Number(String(data.get("copies") ?? "").trim() || "1");
    if (!Number.isSafeInteger(total) || total < 1) {
      notify("Enter a positive whole number of copies.");
      return;
    }

    const isbnKey = (value) => value.replace(/[\s-]+/g, "").toLowerCase();
    const key = isbnKey(isbn);
    if (!key) {
      notify("Enter a valid ISBN.");
      return;
    }
    const matches = state.books.filter((book) => isbnKey(book.isbn) === key);
    if (matches.length > 1) {
      notify("Multiple catalogue records have this ISBN. Copies were not added.");
      return;
    }
    const existing = matches[0];
    if (existing) {
      if (!inventoryTotals(existing).consistent || !Number.isSafeInteger(existing.total + total)) {
        notify("Cannot add copies to this inventory record.");
        return;
      }
      state.books = state.books.map((book) => book.id === existing.id
        ? syncBookStatus({ ...book, available: book.available + total, total: book.total + total })
        : book);
      state.modal = "";
      notify(`Added ${total} ${total === 1 ? "copy" : "copies"} to ${existing.title} (${existing.id}).`);
      return;
    }
    const book = { id: `BK-${nextBookNumber++}`, isbn, title, author, category: String(data.get("category") ?? "Technology"), shelf: String(data.get("shelf") ?? "").trim() || "A-01", available: total, total, unavailable: emptyUnavailable(), status: "Available" };
    state.books.unshift(book);
    state.modal = "";
    notify(`${book.title} added to the catalogue.`);
    return;
  }
  if (formId === "remove-book-form") {
    const book = state.books.find((item) => item.id === state.stockBookId);
    if (state.modal !== "remove-book" || !book) return;
    if (!canRemoveBook(book.id)) {
      notify("This book has active loans or return history and cannot be removed.");
      return;
    }
    if (String(data.get("confirmation") ?? "").trim() !== book.id) {
      notify(`Type ${book.id} to confirm removal.`);
      return;
    }
    state.books = state.books.filter((item) => item.id !== book.id);
    state.stockBookId = "";
    state.modal = "";
    notify(`${book.title} removed from the catalogue.`);
    return;
  }
  if (formId === "stock-form") {
    const bookId = String(data.get("bookId") ?? "");
    const action = String(data.get("action") ?? "");
    const reason = String(data.get("reason") ?? "");
    const result = action === "restore"
      ? restoreUnavailableCopy(bookId, reason)
      : action === "mark"
        ? markCopyUnavailable(bookId, reason)
        : { ok: false, message: "Choose a valid inventory action." };
    notify(result.message);
    return;
  }
  if (formId === "user-form") {
    const user = { id: String(data.get("id") ?? "").trim(), name: String(data.get("name") ?? "").trim(), email: String(data.get("email") ?? "").trim(), department: String(data.get("department") ?? "").trim() || "New student" };
    if (!/^\d{2}-\d{5}-\d{3}$/.test(user.id) || !user.name || !user.email || state.users.some((item) => item.id === user.id)) return;
    state.users.unshift(user);
    state.modal = "";
    notify(`${user.name} registered as a library user.`);
    return;
  }
  if (formId === "issue-form") {
    const user = state.users.find((item) => item.id === state.selectedUserId);
    const book = state.books.find((item) => item.id === state.selectedBookId);
    if (!user || !book || book.available < 1 || !state.issueDate || !state.dueDate || state.dueDate < state.issueDate) return;
    if (state.issuedBooks.some((loan) => loan.userId === user.id)) {
      notify("Return your borrowed book before borrowing another.");
      return;
    }
    if (!inventoryTotals(book).consistent) {
      notify("Cannot issue this book: the inventory record is inconsistent.");
      return;
    }
    const issuedBook = { id: `IR-${String(nextIssuedNumber++).padStart(5, "0")}`, bookId: book.id, userId: user.id, issuedAt: state.issueDate, dueAt: state.dueDate };
    state.issuedBooks.unshift(issuedBook);
    state.books = state.books.map((item) => {
      if (item.id !== book.id) return item;
      return syncBookStatus({ ...item, available: item.available - 1 });
    });
    state.selectedUserId = "";
    state.selectedBookId = "";
    notify(`${book.title} issued to ${user.name}.`);
    return;
  }
  if (formId === "return-form") {
    const issuedBook = state.issuedBooks.find((item) => item.id === state.selectedIssuedId);
    if (!issuedBook || state.returnRecords.some((record) => record.loanId === issuedBook.id)) {
      notify("This loan is no longer active or has already been returned.");
      return;
    }
    const dateError = returnDateError(issuedBook, state.returnDate);
    if (dateError) { notify(dateError); return; }
    const book = state.books.find((item) => item.id === issuedBook.bookId);
    const totals = book ? inventoryTotals(book) : null;
    if (!book || !state.users.some((user) => user.id === issuedBook.userId)
      || !Number.isInteger(book.available) || !Number.isInteger(book.total)
      || book.available < 0 || !totals?.consistent) {
      notify("Cannot process return: the loan or stock record is inconsistent.");
      return;
    }
    const delayedDays = lateDays(issuedBook.dueAt, state.returnDate);
    const returnRecord = {
      loanId: issuedBook.id, studentId: issuedBook.userId, bookId: issuedBook.bookId,
      dueDate: issuedBook.dueAt, returnDate: state.returnDate,
      overdueDays: delayedDays, fineAmount: delayedDays * loanPolicy.finePerDay,
    };
    const updatedBooks = state.books.map((item) => {
      if (item.id !== issuedBook.bookId) return item;
      return syncBookStatus({ ...item, available: item.available + 1 });
    });
    state.returnRecords.push(returnRecord);
    state.issuedBooks = state.issuedBooks.filter((item) => item.id !== issuedBook.id);
    state.books = updatedBooks;
    state.selectedIssuedId = "";
    notify(`${book?.title ?? "Book"} returned on ${dateLabel(state.returnDate)}. ${delayedDays ? `Fine recorded: ${peso(delayedDays * loanPolicy.finePerDay)}.` : "No fine due."}`);
  }
});

window.addEventListener("popstate", () => {
  state.activeView = initialView(new URLSearchParams(window.location.search).get("view"));
  state.mobileOpen = false;
  state.accountMenuOpen = "";
  render();
});

render();
