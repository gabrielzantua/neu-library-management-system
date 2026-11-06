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
  const context = { document: { querySelector: () => app }, window, URL, URLSearchParams, FormData: FormDataStub, Element: ElementStub };
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
  const book = state.books.find((item) => item.available === 1);
  const count = state.issuedBooks.length;
  state.selectedUserId = state.users.find((user) => !state.issuedBooks.some((loan) => loan.userId === user.id)).id;
  state.selectedBookId = book.id;
  submit();
  assert.equal(state.issuedBooks.length, count + 1);
  assert.equal(state.issuedBooks[0].bookId, book.id);
  assert.equal(state.books.find((item) => item.id === book.id).available, 0);
  assert.equal(state.activeView, "issue");
  assert.equal(state.selectedUserId, "");
  assert.equal(state.selectedBookId, "");
  assert.match(app.innerHTML, /issued to/);
  assert.doesNotMatch(app.innerHTML, new RegExp(`data-book-id="${book.id}"`));
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
