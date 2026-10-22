const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { runInNewContext } = require("node:vm");
const { test } = require("node:test");

function loadApp(view = "issue") {
  const handlers = {};
  const app = { innerHTML: "", addEventListener: (name, handler) => { handlers[name] = handler; } };
  const window = {
    location: { search: `?view=${view}`, href: `http://localhost/?view=${view}` },
    history: { pushState() {} },
    addEventListener() {}, scrollTo() {}, clearTimeout() {}, setTimeout() {},
  };
  const context = { document: { querySelector: () => app }, window, URL, URLSearchParams, FormData: class {} };
  runInNewContext(`${readFileSync(require.resolve("../app.js"), "utf8")}\nglobalThis.appState = state; globalThis.navigate = setView; globalThis.renderApp = render;`, context);
  return {
    app, state: context.appState, navigate: context.navigate, render: context.renderApp,
    submit: () => handlers.submit({ preventDefault() {}, target: { getAttribute: () => "issue-form" } }),
  };
}

test("issue navigation and direct links work; return stays unavailable", () => {
  const { app, navigate } = loadApp();
  assert.match(app.innerHTML, /id="issue-form"/);
  assert.match(app.innerHTML, /data-view="issue"/);
  assert.doesNotMatch(app.innerHTML, /data-view="return"/);
  for (const view of ["books", "users", "issue"]) {
    navigate(view);
    assert.match(app.innerHTML, new RegExp(`data-view="${view}" class="nav-link nav-link-active"`));
  }
  assert.doesNotMatch(loadApp("return").app.innerHTML, /id="return-form"|id="issue-form"/);
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
