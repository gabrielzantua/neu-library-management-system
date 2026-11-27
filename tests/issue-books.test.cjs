const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { runInNewContext } = require("node:vm");
const { test } = require("node:test");

class ElementStub {
  constructor(selector, dataset = {}) { this.selector = selector; this.dataset = dataset; }
  closest(selector) {
    if (selector === "a, button") return this;
    if (selector === ".global-search") return this.selector.includes("global-search-result") ? this : null;
    if (selector === ".account-menu-wrap") return this.selector.includes("account-menu-trigger") || this.selector.includes("account-menu-signout") ? this : null;
    return null;
  }
  matches(selector) { return selector.split(",").some((value) => value.trim().split(".").filter(Boolean).every((name) => this.selector.split(".").includes(name))); }
}

function loadApp(view = "issue", authenticated = true) {
  const handlers = {};
  const session = new Map(authenticated ? [["neu-library-demo-session", "anna-lim"]] : []);
  const sessionStorage = {
    getItem: (key) => session.get(key) ?? null,
    setItem: (key, value) => session.set(key, String(value)),
    removeItem: (key) => session.delete(key),
  };
  const app = { innerHTML: "", addEventListener: (name, handler) => { handlers[name] = handler; }, contains: () => true };
  const window = {
    location: { search: `?view=${view}`, href: `http://localhost/?view=${view}` },
    history: { pushState() {} },
    sessionStorage,
    addEventListener() {}, scrollTo() {}, clearTimeout() {}, setTimeout() {},
  };
  class FormDataStub { constructor(form) { this.values = form.values || {}; } get(name) { return this.values[name] ?? null; } }
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : ["2026-11-06T12:00:00Z"])); }
    static now() { return Date.parse("2026-11-06T12:00:00Z"); }
  }
  const context = { Date: FixedDate, document: { querySelector: () => app }, window, URL, URLSearchParams, FormData: FormDataStub, Element: ElementStub };
  runInNewContext(`${readFileSync(require.resolve("../app.js"), "utf8")}\nglobalThis.appState = state; globalThis.navigate = setView; globalThis.renderApp = render; globalThis.searchLibraryForTests = typeof searchLibrary === "function" ? searchLibrary : null;`, context);
  return {
    app, state: context.appState, navigate: context.navigate, render: context.renderApp,
    search: context.searchLibraryForTests,
    clickSearchResult: (index) => handlers.click({ target: new ElementStub(".global-search-result", { searchIndex: String(index) }), preventDefault() {}, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }),
    click: (selector, dataset = {}) => handlers.click({ target: new ElementStub(selector, dataset), preventDefault() {}, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }),
    submit: (id = "issue-form", values = {}) => handlers.submit({ preventDefault() {}, target: { getAttribute: () => id, values } }),
    sessionStorage,
  };
}

test("demo login gates views and signs in with the provided librarian account", () => {
  const { app, state, submit, sessionStorage } = loadApp("return", false);
  assert.match(app.innerHTML, /id="login-form"/);
  assert.doesNotMatch(app.innerHTML, /MODULE 04 \/ RETURN OF BOOKS/);
  submit("login-form", { email: "librarian@neu-library.test", password: "library-demo" });
  assert.equal(state.authenticated, true);
  assert.equal(sessionStorage.getItem("neu-library-demo-session"), "anna-lim");
  assert.match(app.innerHTML, /MODULE 04 \/ RETURN OF BOOKS/);
});

test("invalid demo credentials stay on login and sign-out ends the tab session", () => {
  const invalid = loadApp("books", false);
  invalid.submit("login-form", { email: "librarian@neu-library.test", password: "wrong" });
  assert.equal(invalid.state.authenticated, false);
  assert.equal(invalid.sessionStorage.getItem("neu-library-demo-session"), null);
  assert.match(invalid.app.innerHTML, /role="alert"/);

  const signedIn = loadApp("books");
  signedIn.click(".logout-button");
  assert.equal(signedIn.state.authenticated, false);
  assert.equal(signedIn.sessionStorage.getItem("neu-library-demo-session"), null);
  assert.match(signedIn.app.innerHTML, /id="login-form"/);
});

test("account menus open from the sidebar and top avatar and both sign out", () => {
  const { app, state, click, sessionStorage } = loadApp("books");
  click(".account-menu-trigger", { accountMenu: "sidebar" });
  assert.match(app.innerHTML, /id="account-menu-sidebar"/);
  click(".account-menu-trigger", { accountMenu: "topbar" });
  assert.match(app.innerHTML, /id="account-menu-topbar"/);
  assert.doesNotMatch(app.innerHTML, /id="account-menu-sidebar"/);
  click(".account-menu-signout.logout-button");
  assert.equal(state.authenticated, false);
  assert.equal(sessionStorage.getItem("neu-library-demo-session"), null);
  assert.match(app.innerHTML, /id="login-form"/);
});

test("Return Books includes a current loan with a future due date", () => {
  const { app, state } = loadApp("return");
  const currentLoan = state.issuedBooks.find((loan) => loan.id === "IR-00414");
  assert.ok(currentLoan);
  const rowStart = app.innerHTML.indexOf('data-issued-id="IR-00414"');
  const row = app.innerHTML.slice(rowStart, app.innerHTML.indexOf("</button>", rowStart));
  assert.match(row, /The Odyssey/);
  assert.match(row, /badge-sage/);
  assert.match(row, /Due /);
  assert.doesNotMatch(row, /Overdue|days late/);
});

test("closing the return receipt restores the select-a-book prompt", () => {
  const { app, state, render, click } = loadApp("return");
  state.selectedIssuedId = "IR-00414";
  render();
  assert.match(app.innerHTML, /id="return-form"/);
  click(".return-receipt-close");
  assert.equal(state.selectedIssuedId, "");
  assert.doesNotMatch(app.innerHTML, /id="return-form"/);
  assert.match(app.innerHTML, /Select a book to return/);
});

test("global search normalizes multiword queries and ranks complete matches", () => {
  const { app, search } = loadApp();
  assert.equal(typeof search, "function");
  assert.match(app.innerHTML, /id="global-search-input"/);
  const results = search("  CLEAN---code  ");
  assert.equal(results[0].kind, "book");
  assert.equal(results[0].title, "Clean Code");
  assert.equal(search("not-a-real-book").length, 0);
  assert.equal(search("Alyssa reyes")[0].kind, "user");
  assert.equal(search("Return Books")[0].kind, "module");
});

test("global search result clicks open their module and focus the selected record", () => {
  const { app, state, search, render, clickSearchResult } = loadApp();
  const bookIndex = search("Clean Code").findIndex((result) => result.kind === "book");
  state.globalSearchQuery = "Clean Code";
  render();
  assert.match(app.innerHTML, /class="global-search-results"/);
  assert.match(app.innerHTML, /class="global-search-result"/);
  clickSearchResult(bookIndex);
  assert.equal(state.activeView, "books");
  assert.equal(state.bookSearch, "Clean Code");
  assert.match(app.innerHTML, /Clean Code/);
  const loanIndex = search("IR-00412").findIndex((result) => result.kind === "loan");
  state.globalSearchQuery = "IR-00412";
  clickSearchResult(loanIndex);
  assert.equal(state.activeView, "return");
  assert.equal(state.selectedIssuedId, "IR-00412");
  assert.match(app.innerHTML, /RETURN RECEIPT/);
});

test("module navigation and direct links include Return Books", () => {
  const { app, navigate } = loadApp();
  assert.match(app.innerHTML, /id="issue-form"/);
  assert.match(app.innerHTML, /data-view="issue"/);
  for (const view of ["books", "users", "issue", "return"]) {
    navigate(view);
    assert.match(app.innerHTML, new RegExp(`data-view="${view}" class="nav-link nav-link-active"`));
  }
  assert.match(loadApp("return").app.innerHTML, /MODULE 04 \/ RETURN OF BOOKS/);
});

test("issuing updates inventory, confirms success, and prepares another issue", () => {
  const { app, state, submit } = loadApp();
  const book = state.books.find((item) => item.available > 0);
  const availableBefore = book.available;
  const count = state.issuedBooks.length;
  state.selectedUserId = state.users.find((user) => !state.issuedBooks.some((loan) => loan.userId === user.id)).id;
  state.selectedBookId = book.id;
  submit();
  assert.equal(state.issuedBooks.length, count + 1);
  assert.equal(state.issuedBooks[0].bookId, book.id);
  assert.equal(state.books.find((item) => item.id === book.id).available, availableBefore - 1);
  assert.equal(state.books.find((item) => item.id === book.id).status, availableBefore - 1 > 0 ? "Available" : "Issued");
  assert.equal(state.activeView, "issue");
  assert.equal(state.selectedUserId, "");
  assert.equal(state.selectedBookId, "");
  assert.match(app.innerHTML, /issued to/);
  assert.equal(app.innerHTML.includes(`data-book-id="${book.id}"`), availableBefore - 1 > 0);
  submit();
  assert.equal(state.issuedBooks.length, count + 1);
});

test("incomplete selections, unavailable books, and reversed dates cannot issue", () => {
  const { state, submit } = loadApp();
  const count = state.issuedBooks.length;
  submit();
  state.selectedUserId = state.users.find((user) => !state.issuedBooks.some((loan) => loan.userId === user.id)).id;
  state.selectedBookId = state.books.find((item) => item.available === 0).id;
  submit();
  state.selectedBookId = state.books.find((item) => item.available > 0).id;
  state.issueDate = "2026-10-22";
  state.dueDate = "2026-10-21";
  submit();
  assert.equal(state.issuedBooks.length, count);
});

for (const sameBook of [true, false]) {
  test(`student with an active loan cannot borrow ${sameBook ? "the same" : "another"} book`, () => {
    const { app, state, render, submit } = loadApp();
    const loan = state.issuedBooks.find((item) => state.books.find((book) => book.id === item.bookId).available > 0);
    state.selectedUserId = loan.userId;
    state.selectedBookId = state.books.find((book) => book.available > 0 && (sameBook ? book.id === loan.bookId : book.id !== loan.bookId)).id;
    const before = JSON.stringify({ books: state.books, loans: state.issuedBooks });
    render();
    assert.match(app.innerHTML, /Borrowing unavailable/);
    assert.match(app.innerHTML, /type="submit"[^>]*disabled/);
    submit();
    assert.equal(JSON.stringify({ books: state.books, loans: state.issuedBooks }), before);
    assert.match(app.innerHTML, /Return your borrowed book before borrowing another/);
    assert.match(app.innerHTML, /Borrowing unavailable/);
    assert.match(app.innerHTML, /type="submit"[^>]*disabled/);
  });
}

test("a successful issue blocks another loan for that student in this session", () => {
  const { state, submit } = loadApp();
  const user = state.users.find((user) => !state.issuedBooks.some((loan) => loan.userId === user.id));
  state.selectedUserId = user.id;
  state.selectedBookId = state.books.find((book) => book.available > 1).id;
  submit();
  const count = state.issuedBooks.length;
  state.selectedUserId = user.id;
  state.selectedBookId = state.books.find((book) => book.available > 0).id;
  submit();
  assert.equal(state.issuedBooks.length, count);
});

test("changing to a student without a loan restores confirmation", () => {
  const { app, state, render } = loadApp();
  state.selectedBookId = state.books.find((book) => book.available > 0).id;
  state.selectedUserId = state.issuedBooks[0].userId;
  render();
  assert.match(app.innerHTML, /Borrowing unavailable/);
  state.selectedUserId = state.users.find((user) => !state.issuedBooks.some((loan) => loan.userId === user.id)).id;
  render();
  assert.doesNotMatch(app.innerHTML, /Borrowing unavailable|type="submit"[^>]*disabled/);
  assert.match(app.innerHTML, /Ready to hand over/);
});

test("student choices show borrowing status and selected student shows loan details", () => {
  const { app, state, render } = loadApp();
  assert.equal((app.innerHTML.match(/>Book borrowed</g) || []).length, 2);
  assert.equal((app.innerHTML.match(/>No active loan</g) || []).length, 1);
  for (const loan of state.issuedBooks) {
    state.selectedUserId = loan.userId;
    render();
    const book = state.books.find((book) => book.id === loan.bookId);
    assert.ok(app.innerHTML.includes(`Currently borrowed: ${book.title}`));
    assert.match(app.innerHTML, /Issued: .* · Due: /);
    assert.match(app.innerHTML, /Return this book before borrowing another/);
  }
  state.selectedUserId = state.users.find((user) => !state.issuedBooks.some((loan) => loan.userId === user.id)).id;
  render();
  assert.doesNotMatch(app.innerHTML, /Currently borrowed:/);
  assert.match(app.innerHTML, /This student can borrow an available book/);
});

test("new borrowing is visible immediately after issuing", () => {
  const { app, state, render, submit } = loadApp();
  const user = state.users.find((user) => !state.issuedBooks.some((loan) => loan.userId === user.id));
  const book = state.books.find((book) => book.available > 0);
  state.selectedUserId = user.id;
  state.selectedBookId = book.id;
  submit();
  assert.equal((app.innerHTML.match(/>Book borrowed</g) || []).length, 3);
  state.selectedUserId = user.id;
  render();
  assert.ok(app.innerHTML.includes(`Currently borrowed: ${book.title}`));
});

function librarySnapshot(state) {
  return JSON.stringify({ books: state.books, loans: state.issuedBooks, returns: state.returnRecords });
}

test("empty Return Books page shows the empty list and default receipt prompt", () => {
  const { app, state, render } = loadApp("return");
  state.issuedBooks = [];
  render();
  assert.match(app.innerHTML, /No books to be returned/);
  assert.match(app.innerHTML, /Select a book to return/);
  assert.doesNotMatch(app.innerHTML, /data-issued-id=|id="return-form"/);
});

test("selecting and closing a receipt changes no loans, stock, dates, or return records", () => {
  const { app, state, click } = loadApp("return");
  const loan = state.issuedBooks[0];
  const before = librarySnapshot(state);
  click(".issued-book-row", { issuedId: loan.id });
  assert.equal(state.selectedIssuedId, loan.id);
  assert.match(app.innerHTML, /RETURN RECEIPT/);
  state.returnDate = "2026-08-24";
  click(".return-receipt-close");
  assert.equal(state.selectedIssuedId, "");
  assert.equal(state.returnDate, "2026-08-24");
  assert.equal(librarySnapshot(state), before);
  assert.deepEqual(Array.from(state.returnRecords), []);
  assert.match(app.innerHTML, /Select a book to return/);
});

for (const [returnDate, overdueDays, fineAmount] of [["2026-08-23", 0, 0], ["2026-08-24", 0, 0], ["2026-08-28", 4, 60]]) {
  test(`return on ${returnDate} previews and saves PHP ${fineAmount}, restoring exactly one copy`, () => {
    const { app, state, click, render, submit, search } = loadApp("return");
    const loan = state.issuedBooks[0];
    const book = state.books.find((item) => item.id === loan.bookId);
    const count = state.issuedBooks.length;
    const available = book.available;
    click(".issued-book-row", { issuedId: loan.id });
    state.returnDate = returnDate;
    render();
    assert.ok(app.innerHTML.includes(`₱${fineAmount}`));
    submit("return-form");
    assert.equal(state.issuedBooks.length, count - 1);
    assert.equal(state.issuedBooks.some((item) => item.id === loan.id), false);
    assert.equal(state.books.find((item) => item.id === book.id).available, available + 1);
    assert.equal(state.books.find((item) => item.id === book.id).status, "Available");
    assert.equal(state.returnRecords.length, 1);
    assert.deepEqual(JSON.parse(JSON.stringify(state.returnRecords[0])), {
      loanId: loan.id, studentId: loan.userId, bookId: loan.bookId,
      dueDate: loan.dueAt, returnDate, overdueDays, fineAmount,
    });
    assert.equal(state.selectedIssuedId, "");
    assert.match(app.innerHTML, /Select a book to return/);
    assert.match(state.toast, /returned on/);
    assert.ok(state.toast.includes(fineAmount ? `₱${fineAmount}` : "No fine due"));
    assert.equal(search(loan.id).some((entry) => entry.kind === "loan"), false);
  });
}

for (const returnDate of ["", " ", null, 123, "not-a-date", "2026-02-30", "2026-13-01", "2026-08-19", "2026-11-07", "2026-8-24", "2026-08-24T12:00:00Z"]) {
  test(`invalid return date ${JSON.stringify(returnDate)} cannot change library records`, () => {
    const { app, state, click, render, submit } = loadApp("return");
    click(".issued-book-row", { issuedId: state.issuedBooks[0].id });
    state.returnDate = returnDate;
    const before = librarySnapshot(state);
    render();
    assert.match(app.innerHTML, /type="submit"[^>]*disabled/);
    assert.match(app.innerHTML, /role="alert"/);
    submit("return-form");
    assert.equal(librarySnapshot(state), before);
    assert.match(state.toast, /date/i);
    assert.notEqual(state.selectedIssuedId, "");
  });
}

test("returning one of several copies restores availability while an unavailable copy stays accounted for", () => {
  const { state, submit } = loadApp("return");
  const loan = state.issuedBooks.find((item) => item.bookId === "BK-1048");
  const book = state.books.find((item) => item.id === loan.bookId);
  book.available = 1;
  book.unavailable = { damaged: 1, lost: 0, repair: 0 };
  state.selectedIssuedId = loan.id;
  state.returnDate = "2026-09-01";
  submit("return-form");
  const updated = state.books.find((item) => item.id === loan.bookId);
  assert.equal(updated.available, 2);
  assert.equal(updated.unavailable.damaged, 1);
  assert.equal(updated.available + updated.unavailable.damaged, updated.total);
  assert.equal(updated.status, "Available");
});

for (const problem of ["missing book", "missing student", "full stock"]) {
  test(`return rejects ${problem} without partial changes`, () => {
    const { state, submit } = loadApp("return");
    const loan = state.issuedBooks[0];
    state.selectedIssuedId = loan.id;
    state.returnDate = "2026-08-24";
    if (problem === "missing book") state.books = state.books.filter((item) => item.id !== loan.bookId);
    if (problem === "missing student") state.users = state.users.filter((item) => item.id !== loan.userId);
    if (problem === "full stock") state.books.find((item) => item.id === loan.bookId).available = 1;
    const before = librarySnapshot(state);
    submit("return-form");
    assert.equal(librarySnapshot(state), before);
    assert.match(state.toast, /inconsistent/);
  });
}

test("repeated submissions and stale returned loan IDs cannot process another return", () => {
  const { state, submit } = loadApp("return");
  const loan = state.issuedBooks[0];
  state.selectedIssuedId = loan.id;
  state.returnDate = "2026-08-24";
  submit("return-form");
  const after = librarySnapshot(state);
  submit("return-form");
  state.selectedIssuedId = loan.id;
  submit("return-form");
  assert.equal(librarySnapshot(state), after);
  assert.equal(state.returnRecords.length, 1);
  assert.match(state.toast, /already been returned|no longer active/);
  // Even a stale active entry must not replay an already recorded loan ID.
  state.issuedBooks.push(loan);
  const stale = librarySnapshot(state);
  submit("return-form");
  assert.equal(librarySnapshot(state), stale);
});

for (const [dueAt, returnDate] of [["2024-02-28", "2024-03-01"], ["2026-03-07", "2026-03-09"]]) {
  test(`fine counts calendar days from ${dueAt} to ${returnDate}`, () => {
    const { state, submit } = loadApp("return");
    const loan = state.issuedBooks[0];
    loan.issuedAt = dueAt;
    loan.dueAt = dueAt;
    state.selectedIssuedId = loan.id;
    state.returnDate = returnDate;
    submit("return-form");
    assert.equal(state.returnRecords[0].overdueDays, 2);
    assert.equal(state.returnRecords[0].fineAmount, 30);
  });
}

test("return records reset with a fresh page and are not stored in session storage", () => {
  const { state, submit, sessionStorage } = loadApp("return");
  state.selectedIssuedId = state.issuedBooks[0].id;
  state.returnDate = "2026-08-24";
  submit("return-form");
  assert.equal(state.returnRecords.length, 1);
  assert.equal(sessionStorage.getItem("returnRecords"), null);
  const fresh = loadApp("return");
  assert.equal(fresh.state.returnRecords.length, 0);
  assert.equal(fresh.state.issuedBooks.length, 3);
});

test("reissuing after returns uses unique loan IDs and keeps other modules synchronized", () => {
  const { state, submit, navigate, app } = loadApp("return");
  const original = state.issuedBooks[0];
  const ids = new Set();
  for (let i = 0; i < 5; i++) {
    const loan = state.issuedBooks.find((item) => item.userId === original.userId);
    assert.equal(ids.has(loan.id), false);
    ids.add(loan.id);
    state.selectedIssuedId = loan.id;
    state.returnDate = "2026-11-06";
    submit("return-form");
    navigate("books");
    assert.equal(state.books.find((book) => book.id === original.bookId).available, 1);
    navigate("issue");
    state.selectedUserId = original.userId;
    state.selectedBookId = original.bookId;
    submit("issue-form");
    assert.match(state.toast, /issued to/);
    navigate("return");
    assert.match(app.innerHTML, /data-issued-id=/);
  }
  assert.equal(state.returnRecords.length, 5);
  assert.equal(new Set(state.issuedBooks.map((loan) => loan.id)).size, state.issuedBooks.length);
});

test("Return Books actually lists active loans in due-date order", () => {
  const { app, state, render } = loadApp("return");
  state.issuedBooks.reverse();
  render();
  const ids = [...app.innerHTML.matchAll(/data-issued-id="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(ids, ["IR-00412", "IR-00413", "IR-00414"]);
});

test("book and student entry still work alongside return records", () => {
  const { state, submit, navigate, app } = loadApp("books");
  submit("book-form", { title: "Test Book", author: "Test Author", isbn: "test-isbn", copies: "2" });
  assert.equal(state.books[0].title, "Test Book");
  assert.equal(state.books[0].available, 2);
  navigate("users");
  submit("user-form", { id: "24-12345-678", name: "Test Student", email: "student@example.test" });
  assert.equal(state.users[0].id, "24-12345-678");
  assert.match(app.innerHTML, /Test Student/);
  assert.equal(state.returnRecords.length, 0);
});

test("returning the final active loan displays the empty state and keeps all return records", () => {
  const { app, state, submit } = loadApp("return");
  const count = state.issuedBooks.length;
  for (const loan of [...state.issuedBooks]) {
    state.selectedIssuedId = loan.id;
    state.returnDate = "2026-11-06";
    submit("return-form");
  }
  assert.equal(state.issuedBooks.length, 0);
  assert.equal(state.returnRecords.length, count);
  assert.match(app.innerHTML, /No books to be returned/);
  assert.match(app.innerHTML, /Select a book to return/);
  assert.doesNotMatch(app.innerHTML, /id="return-form"/);
});

test("catalogue marks partially borrowed titles available in badges, counts, filters and search", () => {
  const { app, state, click, search } = loadApp("books");
  const book = state.books.find((item) => item.id === "BK-1048");
  assert.equal(book.available, 2);
  assert.equal(book.status, "Available");
  assert.match(app.innerHTML, /Available <b>4<\/b>/);
  assert.match(app.innerHTML, /Issued <b>2<\/b>/);
  state.bookSearch = book.title;
  click(".filter-option", { filter: "Available" });
  assert.match(app.innerHTML, /Clean Code/);
  assert.match(app.innerHTML, /badge-sage">Available/);
  click(".filter-option", { filter: "Issued" });
  assert.match(app.innerHTML, /No books found/);
  assert.equal(search("available clean code")[0].record.id, book.id);
});

for (const [bookId, remaining, expectedStatus] of [["BK-1048", 1, "Available"], ["BK-1051", 1, "Available"]]) {
  test(`issuing a copy with ${remaining} remaining gives catalogue status ${expectedStatus}`, () => {
    const { app, state, submit, navigate, click, search } = loadApp("issue");
    state.selectedUserId = state.users.find((user) => !state.issuedBooks.some((loan) => loan.userId === user.id)).id;
    state.selectedBookId = bookId;
    submit("issue-form");
    const book = state.books.find((item) => item.id === bookId);
    assert.equal(book.available, remaining);
    assert.equal(book.status, expectedStatus);
    navigate("books");
    state.bookSearch = book.title;
    click(".filter-option", { filter: expectedStatus });
    assert.ok(app.innerHTML.includes(book.title));
    assert.ok(app.innerHTML.includes(`>${expectedStatus}</span>`));
    assert.equal(search(`${expectedStatus} ${book.title}`)[0].record.id, bookId);
    click(".filter-option", { filter: expectedStatus === "Available" ? "Issued" : "Available" });
    assert.match(app.innerHTML, /No books found/);
  });
}

test("issuing the final copy gives the catalogue Issued status", () => {
  const { app, state, submit, navigate, click, search } = loadApp("issue");
  submit("book-form", { title: "Single Copy Title", author: "Test Author", isbn: "single-copy", copies: "1", category: "Technology", shelf: "A-01" });
  const book = state.books[0];
  state.selectedUserId = state.users.find((user) => !state.issuedBooks.some((loan) => loan.userId === user.id)).id;
  state.selectedBookId = book.id;
  submit("issue-form");
  const updated = state.books.find((item) => item.id === book.id);
  assert.equal(updated.available, 0);
  assert.equal(updated.status, "Issued");
  navigate("books");
  state.bookSearch = book.title;
  click(".filter-option", { filter: "Issued" });
  assert.ok(app.innerHTML.includes(book.title));
  assert.ok(app.innerHTML.includes(">Issued</span>"));
  assert.equal(search(`Issued ${book.title}`)[0].record.id, book.id);
  click(".filter-option", { filter: "Available" });
  assert.match(app.innerHTML, /No books found/);
});

function inventorySnapshot(state) {
  return state.books.map((book) => ({
    id: book.id,
    available: book.available,
    total: book.total,
    unavailable: { ...book.unavailable },
    borrowed: state.issuedBooks.filter((loan) => loan.bookId === book.id).length,
  }));
}

function assertInventoryInvariant(state) {
  for (const book of state.books) {
    const borrowed = state.issuedBooks.filter((loan) => loan.bookId === book.id).length;
    const unavailable = Object.values(book.unavailable ?? {}).reduce((total, count) => total + (Number.isInteger(count) ? count : 0), 0);
    assert.equal(book.available + borrowed + unavailable, book.total, `${book.id} must reconcile to its total copies`);
    assert.ok(book.available >= 0, `${book.id} cannot have negative available copies`);
    assert.ok(unavailable >= 0, `${book.id} cannot have negative unavailable copies`);
  }
}

test("initial inventory reconciles every title, including the corrected BK-1051 record", () => {
  const { state } = loadApp("books");
  const algorithms = state.books.find((book) => book.id === "BK-1051");
  assert.equal(algorithms.total, 2);
  assert.equal(algorithms.available, 2);
  assert.equal(state.issuedBooks.filter((loan) => loan.bookId === "BK-1051").length, 0);
  assert.deepEqual(JSON.parse(JSON.stringify(algorithms.unavailable)), { damaged: 0, lost: 0, repair: 0 });
  assertInventoryInvariant(state);
});

test("issuing and returning preserve the inventory invariant", () => {
  const { state, submit } = loadApp("issue");
  const book = state.books.find((item) => item.id === "BK-1051");
  const user = state.users.find((item) => !state.issuedBooks.some((loan) => loan.userId === item.id));
  state.selectedUserId = user.id;
  state.selectedBookId = book.id;
  submit("issue-form");
  assert.equal(state.books.find((item) => item.id === book.id).available, 1);
  assertInventoryInvariant(state);

  const loan = state.issuedBooks.find((item) => item.userId === user.id);
  state.selectedIssuedId = loan.id;
  state.returnDate = "2026-11-06";
  submit("return-form");
  assert.equal(state.books.find((item) => item.id === book.id).available, 2);
  assert.equal(state.returnRecords.length, 1);
  assertInventoryInvariant(state);
});

test("librarians can mark copies damaged or lost and restore them without changing loans", () => {
  const { app, state, submit, navigate, click, render } = loadApp("books");
  const book = state.books.find((item) => item.id === "BK-1051");
  const loanCount = state.issuedBooks.length;
  click(".stock-adjust", { stockBook: book.id });
  assert.equal(state.modal, "stock");
  assert.match(app.innerHTML, /Manage copies/);
  assert.match(app.innerHTML, /No copies are currently marked damaged, lost, or under repair/);

  submit("stock-form", { bookId: book.id, action: "mark", reason: "damaged" });
  let updated = state.books.find((item) => item.id === book.id);
  assert.equal(updated.available, 1);
  assert.equal(updated.unavailable.damaged, 1);
  assert.equal(updated.status, "Available");
  assert.equal(state.issuedBooks.length, loanCount);
  assert.equal(state.returnRecords.length, 0);
  assert.match(app.innerHTML, /1 damaged/);
  assertInventoryInvariant(state);

  submit("stock-form", { bookId: book.id, action: "mark", reason: "lost" });
  updated = state.books.find((item) => item.id === book.id);
  assert.equal(updated.available, 0);
  assert.equal(updated.unavailable.damaged, 1);
  assert.equal(updated.unavailable.lost, 1);
  assert.equal(updated.status, "Unavailable");
  assertInventoryInvariant(state);

  const before = JSON.stringify(inventorySnapshot(state));
  submit("stock-form", { bookId: book.id, action: "mark", reason: "lost" });
  assert.equal(JSON.stringify(inventorySnapshot(state)), before);
  assert.match(state.toast, /No available copy/);
  submit("stock-form", { bookId: book.id, action: "restore", reason: "repair" });
  assert.equal(JSON.stringify(inventorySnapshot(state)), before);
  assert.match(state.toast, /No copies are recorded as under repair/);

  submit("stock-form", { bookId: book.id, action: "restore", reason: "damaged" });
  updated = state.books.find((item) => item.id === book.id);
  assert.equal(updated.available, 1);
  assert.equal(updated.unavailable.damaged, 0);
  assert.equal(updated.unavailable.lost, 1);
  assert.equal(updated.status, "Available");
  assertInventoryInvariant(state);

  state.modal = "";
  navigate("books");
  state.bookSearch = "Introduction to Algorithms";
  render();
  assert.match(app.innerHTML, /1 lost/);
  click(".filter-option", { filter: "Available" });
  assert.match(app.innerHTML, /Introduction to Algorithms/);
  click(".filter-option", { filter: "Unavailable" });
  assert.match(app.innerHTML, /No books found/);
});

test("librarians can write off only confirmed unavailable copies without changing loans or return history", () => {
  const { app, state, submit } = loadApp("books");
  const book = state.books.find((item) => item.id === "BK-1048");
  const loanCount = state.issuedBooks.length;
  const historyCount = state.returnRecords.length;
  state.stockBookId = book.id;
  state.modal = "stock";
  submit("stock-form", { bookId: book.id, action: "mark", reason: "damaged" });
  const before = state.books.find((item) => item.id === book.id);
  assert.equal(before.total, 3);
  assert.equal(before.available, 1);
  assert.equal(before.unavailable.damaged, 1);

  submit("write-off-form", { reason: "damaged" });
  assert.equal(state.books.find((item) => item.id === book.id).total, 3);
  assert.match(state.toast, /Confirm that you want/);
  assert.match(app.innerHTML, /Write off unavailable copy/);

  submit("write-off-form", { reason: "repair", confirm: "on" });
  assert.equal(state.books.find((item) => item.id === book.id).total, 3);
  submit("write-off-form", { reason: "damaged", confirm: "on" });
  const after = state.books.find((item) => item.id === book.id);
  assert.equal(after.total, 2);
  assert.equal(after.available, 1);
  assert.equal(after.unavailable.damaged, 0);
  assert.equal(after.status, "Available");
  assert.equal(state.issuedBooks.length, loanCount);
  assert.equal(state.returnRecords.length, historyCount);
  assertInventoryInvariant(state);
});

test("whole-title removal requires every copy to be unavailable", () => {
  const { app, state, submit, click } = loadApp("books");
  submit("book-form", { title: "Write-off Test", author: "Test Author", isbn: "write-off-test", copies: "2" });
  const book = state.books[0];
  click(".stock-adjust", { stockBook: book.id });
  assert.match(app.innerHTML, /class="library-button button-secondary remove-book" disabled/);
  submit("stock-form", { bookId: book.id, action: "mark", reason: "damaged" });
  submit("stock-form", { bookId: book.id, action: "mark", reason: "repair" });
  assert.match(app.innerHTML, /class="library-button button-secondary remove-book"/);
  assert.doesNotMatch(app.innerHTML, /class="library-button button-secondary remove-book" disabled/);
});

test("all-unavailable titles appear as Unavailable and cannot be issued", () => {
  const { app, state, submit, navigate, click, render } = loadApp("books");
  const book = state.books.find((item) => item.id === "BK-1051");
  state.modal = "stock";
  state.stockBookId = book.id;
  submit("stock-form", { bookId: book.id, action: "mark", reason: "damaged" });
  submit("stock-form", { bookId: book.id, action: "mark", reason: "repair" });
  const updated = state.books.find((item) => item.id === book.id);
  assert.equal(updated.available, 0);
  assert.equal(updated.unavailable.damaged, 1);
  assert.equal(updated.unavailable.repair, 1);
  assert.equal(updated.status, "Unavailable");
  assertInventoryInvariant(state);

  state.modal = "";
  navigate("books");
  state.bookSearch = book.title;
  click(".filter-option", { filter: "Unavailable" });
  assert.match(app.innerHTML, /badge-terra">Unavailable/);
  assert.match(app.innerHTML, /1 damaged · 1 under repair/);

  navigate("issue");
  const user = state.users.find((item) => !state.issuedBooks.some((loan) => loan.userId === item.id));
  state.selectedUserId = user.id;
  state.selectedBookId = "";
  state.issueBookQuery = book.title;
  const loanCount = state.issuedBooks.length;
  render();
  assert.doesNotMatch(app.innerHTML, new RegExp(`data-book-id="${book.id}"`));
  assert.match(app.innerHTML, /No borrowable copies/);
  state.selectedBookId = book.id;
  submit("issue-form");
  assert.equal(state.issuedBooks.length, loanCount);
  assert.equal(state.books.find((item) => item.id === book.id).available, 0);
  assertInventoryInvariant(state);

  state.modal = "stock";
  state.stockBookId = book.id;
  submit("stock-form", { bookId: book.id, action: "restore", reason: "repair" });
  state.modal = "";
  state.selectedBookId = "";
  render();
  assert.match(app.innerHTML, new RegExp(`data-book-id="${book.id}"`));
  state.selectedBookId = book.id;
  submit("issue-form");
  assert.equal(state.issuedBooks.length, loanCount + 1);
  const issuedBook = state.books.find((item) => item.id === book.id);
  assert.equal(issuedBook.available, 0);
  assert.equal(issuedBook.unavailable.damaged, 1);
  assert.equal(issuedBook.status, "Unavailable");
  assertInventoryInvariant(state);
});

test("returns restore only the borrowed copy and leave damaged copies accounted for", () => {
  const { state, submit } = loadApp("return");
  const book = state.books.find((item) => item.id === "BK-1048");
  const loan = state.issuedBooks.find((item) => item.bookId === book.id);
  state.modal = "stock";
  state.stockBookId = book.id;
  submit("stock-form", { bookId: book.id, action: "mark", reason: "damaged" });
  assert.equal(state.books.find((item) => item.id === book.id).available, 1);
  assertInventoryInvariant(state);

  state.selectedIssuedId = loan.id;
  state.returnDate = "2026-09-01";
  submit("return-form");
  const updated = state.books.find((item) => item.id === book.id);
  assert.equal(updated.available, 2);
  assert.equal(updated.unavailable.damaged, 1);
  assert.equal(updated.status, "Available");
  assert.equal(state.returnRecords.length, 1);
  assertInventoryInvariant(state);
});

test("completed returns immediately appear in searchable return history", () => {
  const { app, state, submit, render } = loadApp("return");
  const historyIds = () => [...app.innerHTML.matchAll(/data-return-id="([^"]+)"/g)].map((match) => match[1]);
  assert.match(app.innerHTML, /No returns recorded yet/);
  assert.match(app.innerHTML, /Session only · resets on refresh/);

  const loan = state.issuedBooks.find((item) => item.id === "IR-00412");
  state.selectedIssuedId = loan.id;
  state.returnDate = "2026-08-28";
  submit("return-form");
  assert.equal(state.returnRecords.length, 1);
  assert.deepEqual(historyIds(), ["IR-00412"]);
  assert.match(app.innerHTML, /RETURN HISTORY/);
  assert.match(app.innerHTML, /Designing Data-Intensive Applications/);
  assert.match(app.innerHTML, /Alyssa Reyes/);
  assert.match(app.innerHTML, /21-31426-708/);
  assert.match(app.innerHTML, /4 days/);
  assert.match(app.innerHTML, /₱60/);

  state.returnHistorySearch = "alyssa reyes";
  render();
  assert.deepEqual(historyIds(), ["IR-00412"]);
  state.returnHistorySearch = "designing data";
  render();
  assert.deepEqual(historyIds(), ["IR-00412"]);
  state.returnHistorySearch = "IR-00412";
  render();
  assert.deepEqual(historyIds(), ["IR-00412"]);
  state.returnHistorySearch = "no such return";
  render();
  assert.deepEqual(historyIds(), []);
  assert.match(app.innerHTML, /No returns match your search/);
});

test("Return Books filters All, Active, and Overdue loans with estimated fines", () => {
  const { app, state, click } = loadApp("return");
  const loanIds = () => [...app.innerHTML.matchAll(/data-issued-id="([^"]+)"/g)].map((match) => match[1]);
  assert.match(app.innerHTML, /All loans <b>3<\/b>/);
  assert.match(app.innerHTML, /Active <b>1<\/b>/);
  assert.match(app.innerHTML, /Overdue <b>2<\/b>/);
  assert.match(app.innerHTML, /Estimated fines/);
  assert.match(app.innerHTML, /₱2,100/);

  click(".loan-filter", { loanFilter: "overdue" });
  assert.deepEqual(loanIds(), ["IR-00412", "IR-00413"]);
  assert.match(app.innerHTML, /74 days late/);
  assert.match(app.innerHTML, /₱1,110/);
  assert.match(app.innerHTML, /Est\. fine ₱1,110/);
  assert.match(app.innerHTML, /66 days late/);
  assert.match(app.innerHTML, /₱990/);

  click(".loan-filter", { loanFilter: "active" });
  assert.deepEqual(loanIds(), ["IR-00414"]);
  assert.match(app.innerHTML, /badge-sage">Active/);
  assert.doesNotMatch(app.innerHTML, /days late/);

  click(".loan-filter", { loanFilter: "all" });
  assert.deepEqual(loanIds(), ["IR-00412", "IR-00413", "IR-00414"]);
});

test("loan filters and empty states update immediately after returns", () => {
  const { app, state, submit, click } = loadApp("return");
  const loanIds = () => [...app.innerHTML.matchAll(/data-issued-id="([^"]+)"/g)].map((match) => match[1]);
  click(".loan-filter", { loanFilter: "overdue" });
  const firstOverdue = state.issuedBooks.find((item) => item.id === "IR-00412");
  state.selectedIssuedId = firstOverdue.id;
  state.returnDate = "2026-08-28";
  submit("return-form");
  assert.equal(state.loanFilter, "overdue");
  assert.deepEqual(loanIds(), ["IR-00413"]);
  assert.match(app.innerHTML, /Overdue <b>1<\/b>/);
  assert.match(app.innerHTML, /All loans <b>2<\/b>/);
  assert.match(app.innerHTML, /data-return-id="IR-00412"/);

  const current = state.issuedBooks.find((item) => item.id === "IR-00414");
  state.selectedIssuedId = current.id;
  state.returnDate = "2026-11-06";
  submit("return-form");
  click(".loan-filter", { loanFilter: "active" });
  assert.deepEqual(loanIds(), []);
  assert.match(app.innerHTML, /No active loans/);
  assert.match(app.innerHTML, /Every active loan is overdue/);

  for (const loan of [...state.issuedBooks]) {
    state.selectedIssuedId = loan.id;
    state.returnDate = "2026-11-06";
    submit("return-form");
  }
  click(".loan-filter", { loanFilter: "all" });
  assert.deepEqual(loanIds(), []);
  assert.match(app.innerHTML, /No books to be returned/);
  assert.equal(state.returnRecords.length, 3);
  assert.match(app.innerHTML, /RETURN HISTORY/);
});

test("new catalogue titles start fully available with zero unavailable copies", () => {
  const { state, submit, navigate } = loadApp("books");
  submit("book-form", { title: "Inventory Test", author: "Test Author", isbn: "inventory-test", copies: "2" });
  const book = state.books[0];
  assert.equal(book.available, 2);
  assert.equal(book.total, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(book.unavailable)), { damaged: 0, lost: 0, repair: 0 });
  assert.equal(book.status, "Available");
  assertInventoryInvariant(state);
  navigate("issue");
  assert.match(state.books[0].title, /Inventory Test/);
});

for (const [reason, label] of [["damaged", "damaged"], ["lost", "lost"], ["repair", "under repair"]]) {
  test(`a title whose only copies are ${label} shows Unavailable, not Issued`, () => {
    const { app, state, submit, navigate, click, search } = loadApp("books");
    const book = state.books.find((item) => item.id === "BK-1051");
    state.modal = "stock";
    state.stockBookId = book.id;
    submit("stock-form", { bookId: book.id, action: "mark", reason });
    submit("stock-form", { bookId: book.id, action: "mark", reason });

    const updated = state.books.find((item) => item.id === book.id);
    assert.equal(updated.available, 0);
    assert.equal(updated.unavailable[reason], 2);
    assert.equal(updated.status, "Unavailable");
    assert.equal(state.issuedBooks.filter((loan) => loan.bookId === book.id).length, 0);
    assertInventoryInvariant(state);

    state.modal = "";
    navigate("books");
    state.bookSearch = book.title;
    click(".filter-option", { filter: "Unavailable" });
    assert.match(app.innerHTML, /badge-terra">Unavailable/);
    assert.doesNotMatch(app.innerHTML, /badge-gold">Issued/);
    assert.equal(search(`Unavailable ${book.title}`)[0].record.id, book.id);

    click(".filter-option", { filter: "Issued" });
    assert.match(app.innerHTML, /No books found/);
  });
}

test("mixed loans and unavailable copies stay Unavailable until a copy is restored", () => {
  const { app, state, submit, navigate, click } = loadApp("books");
  const book = state.books.find((item) => item.id === "BK-1048");
  const loan = state.issuedBooks.find((item) => item.bookId === book.id);
  state.modal = "stock";
  state.stockBookId = book.id;
  submit("stock-form", { bookId: book.id, action: "mark", reason: "damaged" });
  submit("stock-form", { bookId: book.id, action: "mark", reason: "damaged" });

  let updated = state.books.find((item) => item.id === book.id);
  assert.equal(updated.available, 0);
  assert.equal(updated.unavailable.damaged, 2);
  assert.equal(state.issuedBooks.filter((item) => item.bookId === book.id).length, 1);
  assert.equal(updated.status, "Unavailable");
  assertInventoryInvariant(state);

  state.modal = "";
  navigate("books");
  state.bookSearch = book.title;
  click(".filter-option", { filter: "Unavailable" });
  assert.match(app.innerHTML, /2 damaged/);
  assert.match(app.innerHTML, /badge-terra">Unavailable/);
  click(".filter-option", { filter: "Issued" });
  assert.match(app.innerHTML, /No books found/);

  state.selectedIssuedId = loan.id;
  state.returnDate = "2026-09-01";
  submit("return-form");
  updated = state.books.find((item) => item.id === book.id);
  assert.equal(updated.available, 1);
  assert.equal(updated.unavailable.damaged, 2);
  assert.equal(updated.status, "Available");
  assertInventoryInvariant(state);
});
