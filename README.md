# NEU Library Management System

This is the HTML, CSS, and JavaScript version of our New Era University
library interface. It includes these assignment modules:

1. **Books Entry:** record books received by the library.
2. **User Entry:** record student details.
3. **Issue Books:** select a registered student and an available book, set issue
   and due dates, and confirm the issue. Each student may have only one active
   loan, including loans already shown in the sample data. Unavailable books
   show their next return due date.
4. **Return Books:** select an issued book, record its return date, restore
   availability, and calculate any fine for a late return.

Library records are held in memory and reset on refresh. The demo sign-in lasts
for the current tab session.

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
