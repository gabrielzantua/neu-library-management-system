# NEU Library Management System

This is the HTML, CSS, and JavaScript version of our New Era University
library interface. It includes these assignment modules:

1. **Books Entry:** record books received by the library, review available,
   borrowed, and explicitly unavailable copies, and mark or restore damaged,
   lost, or under-repair copies. A title is **Available** when at least one copy
   is borrowable and **Issued** only when every copy is on loan. It is
   **Unavailable** when no copy is borrowable and at least one copy is damaged,
   lost, or under repair, even if other copies are also on loan.
2. **User Entry:** record student details.
3. **Issue Books:** select a registered student and an available book, set issue
   and due dates, and confirm the issue. Each student may have only one active
   loan, including loans already shown in the sample data. Unavailable books
   show their next return due date or the reason no copy is borrowable.
4. **Return Books:** select an issued book, record its return date, restore
   availability, and calculate any fine for a late return. Active loans can be
   filtered as All loans, Active, or Overdue, and completed returns appear in a
   searchable Return History section.

Library records are held in memory and reset on refresh. The demo sign-in lasts
for the current tab session.

## Inventory accounting

Every title follows this invariant:

```
Total copies = Available copies + Active borrowed copies + Other unavailable copies
```

`Other unavailable copies` are explicitly recorded as **Damaged**, **Lost**, or
**Under repair**. Use **Manage** in the Books Entry copies column to mark one
available copy unavailable or restore one unavailable copy. The action is
blocked when it would make any quantity negative or break the total. Unavailable
copies cannot be issued. Status and counts are recalculated after every issue,
return, and inventory adjustment.

Title status is recalculated from the copy counts, so labels stay accurate after
every issue, return, and inventory adjustment:

- **Available:** at least one copy can be borrowed.
- **Issued:** no copy is available and every copy is on loan.
- **Unavailable:** no copy is available and at least one copy is damaged, lost,
  or under repair. This also applies when other copies are on loan, so a mixed
  record is never mislabelled as fully Issued.

**Lost copies remain part of a title's total until they are formally written
off.** This prototype does not implement write-off or replacement accounting, so
lost copies stay in the total and in the unavailable count.

### Seed-data reconciliation

The original seed data had one unreconciled record: **Introduction to
Algorithms (`BK-1051`)** reported 2 total copies, 1 available copy, and no active
loan or explicit unavailable-copy record. The missing copy could not be
explained by any recorded transaction, so the record was corrected to **2
available copies**. No borrowing transaction was invented. All other seed
titles reconcile against their active loans: `BK-1048` has 2 available, 1
borrowed, and 3 total; `BK-1110` and `BK-1182` each have 1 borrowed copy and 1
total. No other seed discrepancy was found.

## Borrowing and fine policies

The prototype enforces these configured rules:

- **One active loan per student.** A student with an active loan must return it
  before borrowing another title.
- **14-day default loan period.** The issue form starts with that due date, and
  the librarian can adjust the issue and due dates before confirming.
- **PHP 15 per overdue calendar day.** A return on or before the due date has no
  late fine. The fine is calculated from whole calendar days, independent of
  daylight-saving clock changes.
- **Overdue estimates are informational.** The Return Books summary and each
  overdue row show the current estimated fine; no fine payment or collection is
  implemented.

The one-loan limit, 14-day default, and PHP 15 rate are **prototype-configured
policies for this class project**. They are not presented as official New Era
University regulations. An official policy document should replace these values
before production use.

## Module 4: Return Books

1. Open Return Books. Active loans appear in due-date order with their borrower
   and Active/Overdue status. The overview shows active loans, overdue loans,
   total estimated fines, and returns completed this session. Filter the list
   with **All loans**, **Active**, or **Overdue**; each filter shows its count,
   and empty filters explain why no loan is listed. With no active loans, the
   page displays **No books to be returned**.
2. Click an issued book to open its receipt. Review or change the return date;
   the fine preview updates automatically. The fine is **PHP 15 per overdue
   calendar day**, or **PHP 0** on or before the due date. Calendar-day counting
   is unaffected by daylight-saving clock changes. Overdue rows also show how
   many days late the loan is and its current estimated fine.
3. The actual return date must be a valid `YYYY-MM-DD` date, on or after the
   issue date and no later than today (using the computer's local date).
   Invalid dates show an error and disable confirmation. Confirmation also
   revalidates the dates, active loan, book/student references, and copy counts.
   Rejected transactions do not change loans, stock, or return records.
4. **Close (X)** only clears the selected loan and restores **Select a book to
   return**. It does not process a return or change the date, stock, or records.
5. **Confirm return** / **Return & record fine** saves one return record in
   `state.returnRecords`, removes the active loan, restores exactly one available
   copy, clears the selection, refreshes the list, and shows a success message.
   Every record contains `loanId`, `studentId`, `bookId`, `dueDate`, `returnDate`
   (the actual return date), `overdueDays`, and `fineAmount` (PHP). Returned loan
   IDs cannot be processed again; newly issued loans use unique IDs for the page
   session.
6. **Return History** appears below the return layout. It lists completed returns
   newest first with the book, student, loan ID, due date, actual return date,
   overdue days, and recorded fine. Search by student name or ID, book title,
   author, ISBN, or loan ID. Before any return it shows **No returns recorded
   yet**; a search with no matches shows **No returns match your search**. The
   history count and the return overview update immediately after each return.

**Return and fine records exist only in JavaScript memory and reset on page
refresh**, along with the rest of the library records and the Return History.
They are not written to session storage, local storage, a database, or a server.
Recording a fine does not record payment, and there is no payment-management
screen.

Run the regression tests with `node --test tests/*.test.cjs`.

## Demo sign-in

Use the account shown on the sign-in page. This front-end-only demo check is not
real access control and must not be used to protect real accounts or data.

## Run locally

From this folder, start any simple static file server:

```bash
python3 -m http.server 4173
```

Open [http://localhost:4173](http://localhost:4173). The interface uses local
browser-session data and does not require a database, build tool, or hosting
service.
