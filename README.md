# NEU Library Management System

This is the HTML, CSS, and JavaScript version of our New Era University
library interface. It includes these assignment modules:

1. **Books Entry:** record books received by the library. A title is Available
   whenever at least one copy remains, and Issued when no copies remain available.
2. **User Entry:** record student details.
3. **Issue Books:** select a registered student and an available book, set issue
   and due dates, and confirm the issue. Each student may have only one active
   loan, including loans already shown in the sample data. Unavailable books
   show their next return due date.
4. **Return Books:** select an issued book, record its return date, restore
   availability, and calculate any fine for a late return.

Library records are held in memory and reset on refresh. The demo sign-in lasts
for the current tab session.

## Module 4: Return Books

1. Open Return Books. Active loans appear in due-date order with their borrower
   and Active/Overdue status. With no active loans, the page displays
   **No books to be returned**.
2. Click an issued book to open its receipt. Review or change the return date;
   the fine preview updates automatically. The fine is **PHP 15 per overdue
   calendar day**, or **PHP 0** on or before the due date. Calendar-day counting
   is unaffected by daylight-saving clock changes.
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

**Return and fine records exist only in JavaScript memory and reset on page
refresh**, along with the rest of the library records. They are not written to
session storage, local storage, a database, or a server. Recording a fine does
not record payment, and there is no return-history or payment-management screen.

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
