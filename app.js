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

function lateDays(dueDate, returnDate) {
  const due = new Date(`${dueDate}T12:00:00`);
  const returned = new Date(`${returnDate}T12:00:00`);
  if (Number.isNaN(due.getTime()) || Number.isNaN(returned.getTime())) return 0;
  return Math.max(0, Math.floor((returned.getTime() - due.getTime()) / 86_400_000));
}

function peso(value) {
  return `₱${Number.isFinite(value) ? value.toLocaleString("en-PH") : "0"}`;
}

function bookTone(status) {
  if (status === "Available") return "sage";
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

const seedBooks = [
  { id: "BK-1048", isbn: "978-0132350884", title: "Clean Code", author: "Robert C. Martin", category: "Technology", shelf: "A-03", available: 2, total: 3, status: "Issued" },
  { id: "BK-1051", isbn: "978-0262033848", title: "Introduction to Algorithms", author: "Thomas H. Cormen", category: "Technology", shelf: "A-07", available: 1, total: 2, status: "Available" },
  { id: "BK-1073", isbn: "978-9715081227", title: "Florante at Laura", author: "Francisco Balagtas", category: "Literature", shelf: "B-11", available: 3, total: 3, status: "Available" },
  { id: "BK-1110", isbn: "978-1449373320", title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", category: "Technology", shelf: "A-09", available: 0, total: 1, status: "Issued" },
  { id: "BK-1156", isbn: "978-1032211261", title: "Research Methods for Students", author: "John Biggam", category: "Research", shelf: "C-02", available: 2, total: 2, status: "Available" },
  { id: "BK-1182", isbn: "978-0199535569", title: "The Odyssey", author: "Homer", category: "Literature", shelf: "B-02", available: 1, total: 1, status: "Available" },
];

const seedUsers = [
  { id: "21-31426-708", name: "Alyssa Reyes", email: "alyssa.reyes@neu.edu.ph", department: "College of Computer Studies" },
  { id: "22-20814-365", name: "Daniel Villanueva", email: "daniel.villanueva@neu.edu.ph", department: "College of Nursing" },
  { id: "22-40719-582", name: "Camille Soriano", email: "camille.soriano@neu.edu.ph", department: "College of Arts and Sciences" },
];

const seedIssuedBooks = [
  { id: "IR-00412", bookId: "BK-1110", userId: "21-31426-708", issuedAt: "2026-08-20", dueAt: "2026-08-24" },
  { id: "IR-00413", bookId: "BK-1048", userId: "22-20814-365", issuedAt: "2026-08-25", dueAt: "2026-09-01" },
];

function initialView(value) {
  return ["users", "issue"].includes(value) ? value : "books";
}

const state = {
  activeView: initialView(new URLSearchParams(window.location.search).get("view")),
  books: seedBooks.map((book) => ({ ...book })),
  users: seedUsers.map((user) => ({ ...user })),
  issuedBooks: seedIssuedBooks.map((issuedBook) => ({ ...issuedBook })),
  bookSearch: "",
  userSearch: "",
  bookFilter: "All",
  filtersOpen: false,
  issueUserQuery: "",
  issueBookQuery: "",
  selectedUserId: "",
  selectedBookId: "",
  issueDate: dateInputValue(),
  dueDate: addDays(dateInputValue(), 14),
  selectedIssuedId: "",
  returnDate: dateInputValue(),
  modal: "",
  toast: "",
};

const app = document.querySelector("#app");
let toastTimer = 0;
let renderFrame = 0;

function renderSidebar() {
  const items = [
    ["books", "Books Entry", "book"],
    ["users", "User Entry", "users"],
    ["issue", "Issue Books", "issue"],
  ];
  return `<aside class="library-sidebar ${state.mobileOpen ? "sidebar-open" : ""}">
    <div class="brand-lockup"><div class="brand-mark"><img src="assets/neu-logo.png" alt="New Era University" width="42" height="42"></div><div><strong>NEU Library</strong><span>Management system</span></div><button type="button" class="mobile-close" aria-label="Close navigation">${icon("x", 18)}</button></div>
    <div class="sidebar-rule"></div>
    <div class="sidebar-context"><span>LIBRARY MANAGEMENT</span><strong>NEU / 1975</strong></div>
    <nav class="library-nav" aria-label="Library modules"><div class="nav-group"><p>Modules</p>${items.map(([id, label, iconName]) => `<a href="?view=${id}" data-view="${id}" class="nav-link ${state.activeView === id ? "nav-link-active" : ""}">${icon(iconName, 17, state.activeView === id ? 2.4 : 2)}<span>${label}</span>${state.activeView === id ? '<span class="nav-active-mark"></span>' : ""}</a>`).join("")}</div></nav>
    <div class="sidebar-bottom"><div class="desk-status"><span class="status-dot"></span><div><strong>Library desk open</strong><span>Mon–Sat / 7:00 AM–7:00 PM</span></div></div><div class="sidebar-user"><div class="avatar avatar-small">AL</div><div><strong>Anna Lim</strong><span>Librarian</span></div>${icon("chevronDown", 15)}</div></div>
  </aside>${state.mobileOpen ? '<button type="button" class="sidebar-scrim" aria-label="Close navigation"></button>' : ""}`;
}

function renderTopbar() {
  const titles = { books: "Books Entry", users: "User Entry", issue: "Issue Books", return: "Return Books" };
  return `<header class="library-topbar"><div class="topbar-heading"><button type="button" class="mobile-menu" aria-label="Open navigation">${icon("menu", 21)}</button><span class="breadcrumb">NEU LIBRARY <i>/</i></span><strong>${titles[state.activeView]}</strong></div><div class="topbar-actions"><div class="global-search">${icon("search", 17)}<span>Search the library</span><kbd>⌘ K</kbd></div><div class="topbar-avatar avatar">AL</div></div></header>`;
}

function sectionHeading(eyebrow, title, description, action = "") {
  return `<div class="section-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="section-description">${description}</p></div>${action}</div>`;
}

function emptyState(iconName, title, body) {
  return `<div class="empty-state">${iconBox(iconName, "ink")}<strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></div>`;
}

function renderBooksView() {
  const search = state.bookSearch.toLowerCase();
  const filtered = state.books.filter((book) => (state.bookFilter === "All" || book.status === state.bookFilter) && [book.title, book.author, book.isbn, book.category].some((value) => value.toLowerCase().includes(search)));
  const rows = filtered.map((book) => `<div class="data-table-row"><div class="book-cell"><div class="book-cover cover-${book.category.toLowerCase()}">${icon("book", 17)}</div><div><strong>${escapeHtml(book.title)}</strong><span>${escapeHtml(book.author)} · ${escapeHtml(book.id)}</span></div></div><span class="mono-cell">${escapeHtml(book.isbn)}</span><span>${escapeHtml(book.category)}</span><span class="shelf-cell">${escapeHtml(book.shelf)}</span><span><strong>${book.available}</strong><span class="muted-inline"> / ${book.total}</span></span>${badge(book.status, bookTone(book.status))}</div>`).join("");
  return `<div class="view-stack">${sectionHeading("MODULE 01 / BOOKS ENTRY", "The catalogue", "Enter and maintain the books received by the library.", button("Add a book", "button-primary add-book", "plus"))}<div class="subnav-strip"><span class="subnav-active">All books <b>${state.books.length}</b></span><span>Available <b>${state.books.filter((book) => book.status === "Available").length}</b></span><span>Issued <b>${state.books.filter((book) => book.status === "Issued").length}</b></span></div><div class="toolbar-row"><div class="field-with-icon">${icon("search", 17)}<input id="book-search" value="${escapeHtml(state.bookSearch)}" placeholder="Search title, author, or ISBN"></div>${button("Filters", "button-secondary filters-toggle", "sliders")}</div>${state.filtersOpen ? `<div class="filter-menu" role="group" aria-label="Book filters">${["All", "Available", "Issued"].map((option) => `<button type="button" class="filter-option ${state.bookFilter === option ? "filter-option-active" : ""}" data-filter="${option}">${option}</button>`).join("")}</div>` : ""}<section class="paper-card table-card"><div class="table-label"><span>BOOK RECORDS</span><span>${filtered.length} of ${state.books.length} titles</span></div><div class="data-table"><div class="data-table-header"><span>Book</span><span>ISBN</span><span>Category</span><span>Shelf</span><span>Copies</span><span>Status</span></div>${rows}</div>${filtered.length === 0 ? emptyState("book", "No books found", "Try a different title, author, ISBN, or filter.") : ""}</section></div>`;
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
  const bookMatches = state.books.filter((book) => book.available > 0 && [book.title, book.author, book.isbn].some((value) => value.toLowerCase().includes(state.issueBookQuery.toLowerCase()))).slice(0, 3);
  const hasActiveLoan = state.issuedBooks.some((loan) => loan.userId === selectedUser?.id);
  const canConfirm = Boolean(selectedUser && !hasActiveLoan && selectedBook && selectedBook.available > 0 && state.issueDate && state.dueDate && state.dueDate >= state.issueDate);
  const userPanel = selectedUser ? `<div class="selected-person"><div class="avatar avatar-large">${escapeHtml(initials(selectedUser.name))}</div><div><strong>${escapeHtml(selectedUser.name)}</strong><span>${escapeHtml(selectedUser.id)} · ${escapeHtml(selectedUser.department)}</span></div></div>` : `<div class="field-with-icon field-large">${icon("search", 18)}<input id="issue-user-search" value="${escapeHtml(state.issueUserQuery)}" placeholder="Search name, student number, or email" autofocus></div><div class="match-list">${userMatches.map((user) => `<button type="button" class="match-user" data-user-id="${escapeHtml(user.id)}"><div class="avatar avatar-small">${escapeHtml(initials(user.name))}</div><span><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.id)} · ${escapeHtml(user.department)}</small></span>${icon("arrowUpRight", 15)}</button>`).join("")}</div>`;
  const bookPanel = selectedBook ? `<div class="selected-book"><div class="book-cover cover-${selectedBook.category.toLowerCase()}">${icon("book", 22)}</div><div><strong>${escapeHtml(selectedBook.title)}</strong><span>${escapeHtml(selectedBook.author)} · Shelf ${escapeHtml(selectedBook.shelf)}</span>${badge(`${selectedBook.available} copy available`, "sage")}</div></div>` : `<div class="field-with-icon field-large">${icon("search", 18)}<input id="issue-book-search" value="${escapeHtml(state.issueBookQuery)}" placeholder="Search title, author, or ISBN"></div><div class="match-list">${bookMatches.map((book) => `<button type="button" class="match-book" data-book-id="${escapeHtml(book.id)}"><div class="book-mini">${icon("book", 15)}</div><span><strong>${escapeHtml(book.title)}</strong><small>${escapeHtml(book.author)} · ${book.available} available</small></span>${icon("arrowUpRight", 15)}</button>`).join("")}</div>`;
  return `<div class="view-stack">${sectionHeading("MODULE 03 / ISSUE OF BOOKS", "Issue a book", "Issue a book to a registered student based on availability and enter its issue and due dates.")}<div class="notice-banner issue-guide">${iconBox("book", "blue")}<div><strong>How to issue a book</strong><span>1. Select a student. 2. Select an available book. 3. Enter the issue date and due date. 4. Confirm issue.</span></div></div><div class="stepper"><div class="step step-done"><span>1</span><div><strong>Find a student</strong><small>Who is borrowing?</small></div></div><div class="step-line"></div><div class="step ${selectedUser ? "step-done" : "step-current"}"><span>2</span><div><strong>Choose a book</strong><small>What is available?</small></div></div><div class="step-line"></div><div class="step ${selectedUser && selectedBook ? "step-current" : ""}"><span>3</span><div><strong>Confirm issue</strong><small>Record the hand-off.</small></div></div></div><div class="issue-layout"><section class="paper-card issue-card"><div class="card-heading"><div><p class="eyebrow">STUDENT</p><h2>${selectedUser ? "Student selected" : "Find a student"}</h2></div>${selectedUser ? '<button type="button" class="clear-selection" data-clear="user">Change ' + icon("x", 14) + "</button>" : ""}</div>${userPanel}</section><section class="paper-card issue-card"><div class="card-heading"><div><p class="eyebrow">BOOK</p><h2>${selectedBook ? "Book selected" : "Choose a book"}</h2></div>${selectedBook ? '<button type="button" class="clear-selection" data-clear="book">Change ' + icon("x", 14) + "</button>" : ""}</div>${bookPanel}</section></div><form id="issue-form" class="paper-card issue-review ${canConfirm ? "review-ready" : ""}"><div><p class="eyebrow">ISSUE SUMMARY</p><h2>${hasActiveLoan ? "Borrowing unavailable" : canConfirm ? "Ready to hand over" : "Complete the selections above"}</h2><p>${hasActiveLoan ? "Return your borrowed book before borrowing another. Choose a different student to continue." : canConfirm && selectedUser ? `The book will be due on ${escapeHtml(dateLabel(state.dueDate))} for ${escapeHtml(selectedUser.name)}.` : "Choose a registered student and an available book to prepare the issue record."}</p></div><div class="issue-review-meta"><label><span>Issue date</span><input id="issue-date" type="date" value="${escapeHtml(state.issueDate)}" required></label><label><span>Due date</span><input id="due-date" type="date" value="${escapeHtml(state.dueDate)}" min="${escapeHtml(state.issueDate)}" required></label>${button(canConfirm ? "Confirm issue" : "Complete the form", "button-primary", "check", "submit", !canConfirm)}</div></form></div>`;
}

function renderReturnView() {
  const today = dateInputValue();
  const selected = state.issuedBooks.find((issuedBook) => issuedBook.id === state.selectedIssuedId);
  const rows = state.issuedBooks.map((issuedBook) => {
    const book = state.books.find((item) => item.id === issuedBook.bookId);
    const user = state.users.find((item) => item.id === issuedBook.userId);
    const overdue = lateDays(issuedBook.dueAt, today) > 0;
    return `<button type="button" class="issued-book-row ${selected?.id === issuedBook.id ? "issued-book-row-active" : ""}" data-issued-id="${escapeHtml(issuedBook.id)}"><div class="book-mini">${icon("book", 16)}</div><div class="issued-book-title"><strong>${escapeHtml(book?.title ?? "Book")}</strong><span>${escapeHtml(issuedBook.id)} · Issued ${escapeHtml(dateLabel(issuedBook.issuedAt))}</span></div><div class="issued-book-user"><span>${escapeHtml(user?.name ?? "Student")}</span><small>${escapeHtml(user?.id ?? "")}</small></div><div class="issued-book-due">${badge(overdue ? "Overdue" : "Active", overdue ? "terra" : "gold")}<span>${overdue ? `${lateDays(issuedBook.dueAt, today)} days late` : `Due ${escapeHtml(dateLabel(issuedBook.dueAt))}`}</span></div>${icon("arrowUpRight", 16)}</button>`;
  }).join("");
  let summary = `<section class="paper-card return-summary">${emptyState("receipt", "Select a book to return", "Choose a book from the list to prepare the return receipt.")}</section>`;
  if (selected) {
    const book = state.books.find((item) => item.id === selected.bookId);
    const user = state.users.find((item) => item.id === selected.userId);
    const fine = lateDays(selected.dueAt, state.returnDate) * 15;
    summary = `<form id="return-form" class="paper-card return-summary"><div class="receipt-top"><span class="receipt-seal">${icon("receipt", 21)}</span><div><p class="eyebrow">RETURN RECEIPT</p><h2>Review and close</h2></div></div><div class="receipt-rule"></div><div class="receipt-person"><div class="avatar avatar-small">${escapeHtml(initials(user?.name ?? ""))}</div><div><strong>${escapeHtml(user?.name ?? "Student")}</strong><span>${escapeHtml(user?.id ?? "")}</span></div></div><div class="receipt-line"><span>Book</span><strong>${escapeHtml(book?.title ?? "Book")}</strong></div><div class="receipt-line"><span>Due date</span><strong>${escapeHtml(dateLabel(selected.dueAt))}</strong></div><div class="receipt-line receipt-field"><label for="return-date">Return date</label><input id="return-date" type="date" value="${escapeHtml(state.returnDate)}" required></div><div class="fine-box ${fine ? "fine-due" : "fine-clear"}"><div><span>${fine ? "Fine due" : "No fine due"}</span><strong>${peso(fine)}</strong></div>${icon("dollar", 23)}</div>${button(fine ? "Return & record fine" : "Confirm return", "button-primary", "check", "submit")}</form>`;
  }
  return `<div class="view-stack">${sectionHeading("MODULE 04 / RETURN OF BOOKS", "Return a book", "Record the return date, restore availability, and calculate any fine for delayed return.", `<div class="desk-counter"><span class="status-dot"></span>${state.issuedBooks.length} books to be returned</div>`)}<div class="return-layout"><section class="paper-card table-card issued-book-table"><div class="table-label"><span>BOOKS TO BE RETURNED</span><span>Sorted by due date</span></div><div class="issued-book-list">${rows || emptyState("return", "No books to be returned", "All issued books have been returned.")}</div></section>${summary}</div></div>`;
}

function renderModal() {
  if (!state.modal) return "";
  const book = state.modal === "book";
  return `<div class="modal-layer" role="presentation"><button type="button" class="modal-backdrop" aria-label="Close dialog"></button><section class="library-modal" role="dialog" aria-modal="true"><button type="button" class="modal-close" aria-label="Close dialog">${icon("x", 18)}</button><p class="eyebrow">${book ? "BOOKS ENTRY" : "USER ENTRY"}</p><h2>${book ? "Add a book" : "Register a student"}</h2>${book ? `<form id="book-form" class="modal-form"><label>Title<input name="title" placeholder="Book title" autofocus required></label><label>Author<input name="author" placeholder="Author name" required></label><div class="form-row"><label>ISBN<input name="isbn" placeholder="978-..." required></label><label>Copies<input name="copies" type="number" min="1" value="1"></label></div><div class="form-row"><label>Category<select name="category"><option>Technology</option><option>Literature</option><option>Research</option><option>History</option></select></label><label>Shelf<input name="shelf" value="A-01"></label></div><div class="modal-actions"><button type="button" class="library-button button-secondary modal-cancel">Cancel</button>${button("Add book", "button-primary", "plus", "submit")}</div></form>` : `<form id="user-form" class="modal-form"><label>Full name<input name="name" placeholder="Full name" autofocus required></label><label>Student Number<input name="id" placeholder="19-11157-510" pattern="[0-9]{2}-[0-9]{5}-[0-9]{3}" title="Use YY-#####-###, for example 19-11157-510" required></label><label>Email<input name="email" type="email" placeholder="name@neu.edu.ph" required></label><label>College / Office<input name="department" placeholder="College or office"></label><div class="modal-actions"><button type="button" class="library-button button-secondary modal-cancel">Cancel</button>${button("Register student", "button-primary", "userPlus", "submit")}</div></form>`}</section></div>`;
}

function renderToast() {
  return state.toast ? `<div class="library-toast" role="status"><span class="toast-check">${icon("check", 15)}</span><span>${escapeHtml(state.toast)}</span><button type="button" aria-label="Dismiss notification" class="dismiss-toast">${icon("x", 15)}</button></div>` : "";
}

function render() {
  const views = { books: renderBooksView, users: renderUsersView, issue: renderIssueView };
  app.innerHTML = `<main class="library-app">${renderSidebar()}<section class="library-main">${renderTopbar()}<div class="library-content">${views[state.activeView]()}</div><footer class="library-footer"><span>NEU LIBRARY MANAGEMENT SYSTEM</span><span>New Era University · Quezon City · 2026</span></footer></section>${renderToast()}${renderModal()}</main>`;
}

function setView(view) {
  state.activeView = initialView(view);
  state.mobileOpen = false;
  if (state.activeView === "issue") {
    state.issueUserQuery = "";
    state.issueBookQuery = "";
    state.selectedUserId = "";
    state.selectedBookId = "";
    state.issueDate = dateInputValue();
    state.dueDate = addDays(state.issueDate, 14);
  }
  if (state.activeView === "return") {
    state.selectedIssuedId = "";
    state.returnDate = dateInputValue();
  }
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
    render();
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

function handleInput(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (input.id === "book-search") { state.bookSearch = input.value; focusAfterRender(input.id); }
  if (input.id === "user-search") { state.userSearch = input.value; focusAfterRender(input.id); }
  if (input.id === "issue-user-search") { state.issueUserQuery = input.value; focusAfterRender(input.id); }
  if (input.id === "issue-book-search") { state.issueBookQuery = input.value; focusAfterRender(input.id); }
  if (input.id === "issue-date") { state.issueDate = input.value; focusAfterRender(input.id); }
  if (input.id === "due-date") { state.dueDate = input.value; focusAfterRender(input.id); }
  if (input.id === "return-date") { state.returnDate = input.value; focusAfterRender(input.id); }
}

app.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target.closest("a, button") : null;
  if (!target || !app.contains(target)) return;
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
  if (target.matches(".filters-toggle")) { state.filtersOpen = !state.filtersOpen; render(); return; }
  if (target.matches(".filter-option")) { state.bookFilter = target.dataset.filter; render(); return; }
  if (target.matches(".modal-close, .modal-backdrop, .modal-cancel")) { state.modal = ""; render(); return; }
  if (target.matches(".dismiss-toast")) { state.toast = ""; render(); return; }
  if (target.matches(".match-user")) { state.selectedUserId = target.dataset.userId; state.issueUserQuery = ""; render(); return; }
  if (target.matches(".match-book")) { state.selectedBookId = target.dataset.bookId; state.issueBookQuery = ""; render(); return; }
  if (target.matches(".clear-selection")) { if (target.dataset.clear === "user") state.selectedUserId = ""; if (target.dataset.clear === "book") state.selectedBookId = ""; render(); return; }
  if (target.matches(".issued-book-row")) { state.selectedIssuedId = target.dataset.issuedId; render(); }
});

app.addEventListener("input", handleInput);
app.addEventListener("change", handleInput);

app.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const formId = form.getAttribute("id");
  const data = new FormData(form);
  if (formId === "book-form") {
    const title = String(data.get("title") ?? "").trim();
    const author = String(data.get("author") ?? "").trim();
    const isbn = String(data.get("isbn") ?? "").trim();
    if (!title || !author || !isbn) return;
    const total = Math.max(1, Number(data.get("copies")) || 1);
    const book = { id: `BK-${1200 + state.books.length}`, isbn, title, author, category: String(data.get("category") ?? "Technology"), shelf: String(data.get("shelf") ?? "").trim() || "A-01", available: total, total, status: "Available" };
    state.books.unshift(book);
    state.modal = "";
    notify(`${book.title} added to the catalogue.`);
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
    const issuedBook = { id: `IR-${414 + state.issuedBooks.length}`, bookId: book.id, userId: user.id, issuedAt: state.issueDate, dueAt: state.dueDate };
    state.issuedBooks.unshift(issuedBook);
    state.books = state.books.map((item) => item.id === book.id ? { ...item, available: item.available - 1, status: "Issued" } : item);
    state.selectedUserId = "";
    state.selectedBookId = "";
    notify(`${book.title} issued to ${user.name}.`);
    return;
  }
  if (formId === "return-form") {
    const issuedBook = state.issuedBooks.find((item) => item.id === state.selectedIssuedId);
    if (!issuedBook || !state.returnDate) return;
    const book = state.books.find((item) => item.id === issuedBook.bookId);
    const delayedDays = lateDays(issuedBook.dueAt, state.returnDate);
    state.issuedBooks = state.issuedBooks.filter((item) => item.id !== issuedBook.id);
    state.books = state.books.map((item) => {
      if (item.id !== issuedBook.bookId) return item;
      const available = Math.min(item.total, item.available + 1);
      return { ...item, available, status: available >= item.total ? "Available" : "Issued" };
    });
    state.selectedIssuedId = "";
    notify(`${book?.title ?? "Book"} returned on ${dateLabel(state.returnDate)}. ${delayedDays ? `Fine recorded: ${peso(delayedDays * 15)}.` : "No fine due."}`);
  }
});

window.addEventListener("popstate", () => {
  state.activeView = initialView(new URLSearchParams(window.location.search).get("view"));
  state.mobileOpen = false;
  render();
});

render();
