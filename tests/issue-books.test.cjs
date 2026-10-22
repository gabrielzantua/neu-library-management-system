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
  runInNewContext(`${readFileSync(require.resolve("../app.js"), "utf8")}\nglobalThis.appState = state; globalThis.navigate = setView;`, context);
  return {
    app, state: context.appState, navigate: context.navigate,
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
  state.selectedUserId = state.users[0].id;
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
  state.selectedUserId = state.users[0].id;
  state.selectedBookId = state.books.find((item) => item.available === 0).id;
  submit();
  state.selectedBookId = state.books.find((item) => item.available > 0).id;
  state.issueDate = "2026-10-22";
  state.dueDate = "2026-10-21";
  submit();
  assert.equal(state.issuedBooks.length, count);
});
