/* =============================================
   SQL TRAINER — LESSON DATA
   All lessons, exercises, and review cards.
   ============================================= */

// ── Shared database schema (used by all lessons) ──────────────────────────────
const BASE_SCHEMA = `
CREATE TABLE departments (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  budget   REAL,
  location TEXT
);

CREATE TABLE employees (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  salary        REAL,
  hire_date     TEXT,
  manager_id    INTEGER REFERENCES employees(id)
);

CREATE TABLE projects (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  start_date TEXT,
  end_date   TEXT,
  status     TEXT
);

CREATE TABLE employee_projects (
  employee_id INTEGER REFERENCES employees(id),
  project_id  INTEGER REFERENCES projects(id),
  role        TEXT,
  PRIMARY KEY (employee_id, project_id)
);

INSERT INTO departments VALUES
  (1, 'Engineering', 500000, 'New York'),
  (2, 'Marketing',   200000, 'Los Angeles'),
  (3, 'Sales',       300000, 'Chicago'),
  (4, 'HR',          150000, 'New York');

INSERT INTO employees VALUES
  (1,  'Alice Johnson',  1, 95000, '2019-03-15', NULL),
  (2,  'Bob Smith',      1, 85000, '2020-07-01', 1),
  (3,  'Carol White',    1, 78000, '2021-01-20', 1),
  (4,  'David Brown',    2, 72000, '2019-11-05', NULL),
  (5,  'Eve Davis',      2, 65000, '2022-03-10', 4),
  (6,  'Frank Miller',   3, 88000, '2018-06-15', NULL),
  (7,  'Grace Wilson',   3, 76000, '2020-09-20', 6),
  (8,  'Henry Moore',    3, 71000, '2021-05-11', 6),
  (9,  'Iris Taylor',    4, 68000, '2020-02-28', NULL),
  (10, 'Jack Anderson',  NULL, 55000, '2023-01-10', NULL);

INSERT INTO projects VALUES
  (1, 'Website Redesign',   '2023-01-01', '2023-06-30', 'completed'),
  (2, 'Mobile App',         '2023-03-15', NULL,         'active'),
  (3, 'Data Pipeline',      '2023-02-01', '2023-09-30', 'completed'),
  (4, 'Marketing Campaign', '2023-07-01', NULL,         'active'),
  (5, 'HR System',          '2024-01-01', NULL,         'planned');

INSERT INTO employee_projects VALUES
  (1, 1, 'lead'),      (2, 1, 'developer'), (3, 1, 'developer'),
  (1, 2, 'lead'),      (2, 2, 'developer'),
  (3, 3, 'developer'), (1, 3, 'reviewer'),
  (4, 4, 'lead'),      (5, 4, 'coordinator'),
  (9, 5, 'lead');
`;

// ── Module metadata ───────────────────────────────────────────────────────────
const MODULES = [
  { id: 1, name: 'Foundations',   color: '#3b82f6' },
  { id: 2, name: 'Aggregations',  color: '#10b981' },
  { id: 3, name: 'JOINs',         color: '#f59e0b' },
  { id: 4, name: 'Intermediate',  color: '#8b5cf6' },
  { id: 5, name: 'Power Features',color: '#ec4899' },
];

// ── Lessons ───────────────────────────────────────────────────────────────────
const LESSONS = [

  // ══════════════════════════════════════════════════════════
  // MODULE 1 — FOUNDATIONS
  // ══════════════════════════════════════════════════════════
  {
    id: 1, module: 1, title: 'SELECT Deep Dive', duration: '20 min',
    objectives: ['Select specific columns', 'Use column aliases', 'Create computed columns', 'Eliminate duplicates with DISTINCT'],

    theory: `
<h2>SELECT Deep Dive</h2>
<p>You already know basic <code>SELECT</code>. Let's go deeper and use it like a pro.</p>

<h3>Selecting specific columns</h3>
<p>Instead of <code>SELECT *</code> (which grabs every column), name what you need. Faster, clearer, and safer when schemas change.</p>
<pre><code>SELECT name, salary
FROM employees;</code></pre>

<h3>Column aliases with AS</h3>
<p>Rename a column in the output — the original table isn't affected.</p>
<pre><code>SELECT name AS employee_name,
       salary AS annual_salary
FROM employees;</code></pre>
<p>The <code>AS</code> keyword is optional — <code>salary annual_salary</code> works too — but use <code>AS</code> for clarity.</p>

<h3>Computed columns</h3>
<p>You can do math directly in <code>SELECT</code>. Useful for on-the-fly calculations.</p>
<pre><code>-- Salary after a 10% raise
SELECT name,
       salary,
       salary * 1.10 AS projected_salary
FROM employees;</code></pre>

<h3>DISTINCT — remove duplicates</h3>
<p><code>DISTINCT</code> filters out identical rows from the result. Applied to all selected columns together.</p>
<pre><code>-- Unique departments that have employees
SELECT DISTINCT department_id
FROM employees;</code></pre>

<div class="tip">💡 <strong>Tip:</strong> Always be specific about which columns you need. <code>SELECT *</code> is fine for exploration but avoid it in production queries.</div>

<div class="note">📋 <strong>Database schema:</strong> You have <code>employees</code>, <code>departments</code>, <code>projects</code>, and <code>employee_projects</code>. Run <code>SELECT * FROM employees;</code> to explore the data.</div>
`,

    exercises: [
      {
        id: 1,
        prompt: 'Select the name and salary of all employees.',
        hint: 'Name the two columns explicitly, separated by a comma.',
        solution: 'SELECT name, salary FROM employees',
      },
      {
        id: 2,
        prompt: 'Select every employee\'s name and salary, but label the salary column as "annual_salary".',
        hint: 'Use the AS keyword after salary.',
        solution: 'SELECT name, salary AS annual_salary FROM employees',
      },
      {
        id: 3,
        prompt: 'Show each employee\'s name and their salary after a 15% raise. Call the new column "projected_salary". Round to 2 decimal places using ROUND(value, 2).',
        hint: 'Multiply salary by 1.15, then wrap in ROUND(...).',
        solution: 'SELECT name, ROUND(salary * 1.15, 2) AS projected_salary FROM employees',
      },
      {
        id: 4,
        prompt: 'List all unique values of department_id in the employees table (including NULL).',
        hint: 'Use SELECT DISTINCT on department_id.',
        solution: 'SELECT DISTINCT department_id FROM employees',
      },
    ],

    reviewCard: {
      title: 'SELECT Basics',
      description: 'Retrieve and shape column data.',
      syntax: `-- Pick columns
SELECT col1, col2 FROM table;

-- Alias
SELECT col AS alias FROM table;

-- Computed column
SELECT price * qty AS total FROM orders;

-- No duplicates
SELECT DISTINCT status FROM orders;`,
    },
  },

  // ──────────────────────────────────────────────────────────
  {
    id: 2, module: 1, title: 'WHERE Mastery', duration: '25 min',
    objectives: ['Use all comparison operators', 'Filter with BETWEEN, IN, LIKE', 'Handle NULL values correctly', 'Combine conditions with AND/OR/NOT'],

    theory: `
<h2>WHERE Mastery</h2>
<p><code>WHERE</code> filters rows <em>before</em> they reach your result. It's the most-used clause in SQL.</p>

<h3>Comparison operators</h3>
<pre><code>WHERE salary > 80000      -- greater than
WHERE salary >= 80000     -- greater than or equal
WHERE salary = 85000      -- exact match (= not ==)
WHERE salary <> 85000     -- not equal (also: !=)
WHERE hire_date < '2021-01-01'</code></pre>

<h3>BETWEEN ... AND</h3>
<p>Inclusive range check — cleaner than writing two conditions.</p>
<pre><code>-- Employees hired in 2020
WHERE hire_date BETWEEN '2020-01-01' AND '2020-12-31'

-- Same as:
WHERE hire_date >= '2020-01-01' AND hire_date <= '2020-12-31'</code></pre>

<h3>IN — match a list</h3>
<pre><code>-- Employees in departments 1 or 3
WHERE department_id IN (1, 3)

-- Exclude departments
WHERE department_id NOT IN (2, 4)</code></pre>

<h3>LIKE — pattern matching</h3>
<p><code>%</code> matches any sequence of characters. <code>_</code> matches exactly one character.</p>
<pre><code>WHERE name LIKE 'A%'      -- starts with A
WHERE name LIKE '%son'    -- ends with "son"
WHERE name LIKE '%an%'    -- contains "an"
WHERE name LIKE 'A_ice'   -- A + any char + ice</code></pre>

<h3>IS NULL / IS NOT NULL</h3>
<p><strong>Never use <code>= NULL</code></strong> — it won't work. NULL means "unknown", and unknown = unknown is also unknown.</p>
<pre><code>WHERE department_id IS NULL      -- unassigned employees
WHERE manager_id IS NOT NULL     -- employees with a manager</code></pre>

<h3>AND, OR, NOT — precedence</h3>
<p><code>AND</code> binds tighter than <code>OR</code>. Use parentheses to be explicit.</p>
<pre><code>-- Find high earners in Engineering OR all HR staff
WHERE (salary > 80000 AND department_id = 1)
   OR department_id = 4</code></pre>

<div class="warning">⚠️ <strong>Common mistake:</strong> <code>WHERE col = NULL</code> always returns no rows. Always use <code>IS NULL</code>.</div>
`,

    exercises: [
      {
        id: 1,
        prompt: 'Find all employees with a salary greater than 80,000.',
        hint: 'Use WHERE salary > 80000.',
        solution: 'SELECT * FROM employees WHERE salary > 80000',
      },
      {
        id: 2,
        prompt: 'Find employees in department 1 or department 3. Use IN.',
        hint: 'WHERE department_id IN (...)',
        solution: 'SELECT * FROM employees WHERE department_id IN (1, 3)',
      },
      {
        id: 3,
        prompt: 'Find employees whose name starts with the letter "G".',
        hint: 'Use LIKE with a % wildcard.',
        solution: "SELECT * FROM employees WHERE name LIKE 'G%'",
      },
      {
        id: 4,
        prompt: 'Find the one employee who has no department assigned (department_id is NULL).',
        hint: 'Remember: use IS NULL, not = NULL.',
        solution: 'SELECT * FROM employees WHERE department_id IS NULL',
      },
      {
        id: 5,
        prompt: 'Find employees hired between January 1, 2020 and December 31, 2021 (inclusive).',
        hint: "Use BETWEEN '2020-01-01' AND '2021-12-31'.",
        solution: "SELECT * FROM employees WHERE hire_date BETWEEN '2020-01-01' AND '2021-12-31'",
      },
    ],

    reviewCard: {
      title: 'WHERE Operators',
      description: 'All the ways to filter rows.',
      syntax: `WHERE salary > 80000
WHERE salary BETWEEN 70000 AND 90000
WHERE dept IN (1, 2, 3)
WHERE name LIKE 'A%'
WHERE manager_id IS NULL
WHERE (a > 1 AND b < 5) OR c = 'x'`,
    },
  },

  // ──────────────────────────────────────────────────────────
  {
    id: 3, module: 1, title: 'ORDER BY, LIMIT & OFFSET', duration: '20 min',
    objectives: ['Sort results with ORDER BY', 'Reverse sort with DESC', 'Sort by multiple columns', 'Paginate with LIMIT and OFFSET'],

    theory: `
<h2>ORDER BY, LIMIT & OFFSET</h2>
<p>Databases don't guarantee row order unless you ask for it. Here's how to control it.</p>

<h3>ORDER BY</h3>
<p>Sorts the result. Default is <code>ASC</code> (ascending). Use <code>DESC</code> for highest first.</p>
<pre><code>-- Cheapest to most expensive
SELECT name, salary FROM employees ORDER BY salary;

-- Most expensive first
SELECT name, salary FROM employees ORDER BY salary DESC;</code></pre>

<h3>Multiple sort keys</h3>
<p>Add a second column as a tiebreaker. Evaluated left to right.</p>
<pre><code>-- Group by department, then sort each group by salary (highest first)
SELECT name, department_id, salary
FROM employees
ORDER BY department_id ASC, salary DESC;</code></pre>

<h3>LIMIT — take only N rows</h3>
<pre><code>-- Top 3 earners
SELECT name, salary
FROM employees
ORDER BY salary DESC
LIMIT 3;</code></pre>

<h3>OFFSET — skip N rows (pagination)</h3>
<p><code>OFFSET</code> skips rows from the beginning. Combine with <code>LIMIT</code> for paging.</p>
<pre><code>-- Page 1 (rows 1-3)
... ORDER BY salary DESC LIMIT 3 OFFSET 0;

-- Page 2 (rows 4-6)
... ORDER BY salary DESC LIMIT 3 OFFSET 3;</code></pre>

<div class="tip">💡 <strong>Tip:</strong> <code>LIMIT</code> without <code>ORDER BY</code> returns random rows. Always pair them.</div>
`,

    exercises: [
      {
        id: 1,
        prompt: 'List all employees sorted by salary from highest to lowest.',
        hint: 'ORDER BY salary DESC.',
        solution: 'SELECT * FROM employees ORDER BY salary DESC',
      },
      {
        id: 2,
        prompt: 'Show the name and salary of the top 3 highest-paid employees.',
        hint: 'ORDER BY salary DESC LIMIT 3.',
        solution: 'SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3',
      },
      {
        id: 3,
        prompt: 'Show employees ranked 4th through 6th by salary (skip the top 3). Show name and salary.',
        hint: 'Use LIMIT 3 OFFSET 3.',
        solution: 'SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3 OFFSET 3',
      },
      {
        id: 4,
        prompt: 'List all employees sorted by department_id ascending, and within each department by salary descending.',
        hint: 'ORDER BY department_id ASC, salary DESC.',
        solution: 'SELECT * FROM employees ORDER BY department_id ASC, salary DESC',
      },
    ],

    reviewCard: {
      title: 'Sorting & Pagination',
      description: 'Control order and row count.',
      syntax: `SELECT ... FROM t
ORDER BY col DESC          -- sort
ORDER BY a ASC, b DESC     -- multi-sort
LIMIT 10                   -- first 10
LIMIT 10 OFFSET 20         -- rows 21-30`,
    },
  },

  // ══════════════════════════════════════════════════════════
  // MODULE 2 — AGGREGATIONS
  // ══════════════════════════════════════════════════════════
  {
    id: 4, module: 2, title: 'Aggregate Functions', duration: '20 min',
    objectives: ['Count rows with COUNT', 'Sum, average, min, max values', 'Understand how NULLs affect aggregates'],

    theory: `
<h2>Aggregate Functions</h2>
<p>Aggregate functions collapse many rows into a single summary value.</p>

<h3>COUNT</h3>
<pre><code>-- Total rows in the table
SELECT COUNT(*) AS total FROM employees;

-- Rows where the column is NOT NULL
SELECT COUNT(department_id) AS with_dept FROM employees;</code></pre>
<p><code>COUNT(*)</code> counts all rows. <code>COUNT(col)</code> skips NULLs — useful difference!</p>

<h3>SUM and AVG</h3>
<pre><code>SELECT SUM(salary) AS total_payroll FROM employees;
SELECT AVG(salary) AS avg_salary   FROM employees;

-- Round to 2 decimal places
SELECT ROUND(AVG(salary), 2) AS avg_salary FROM employees;</code></pre>

<h3>MIN and MAX</h3>
<pre><code>SELECT MIN(salary) AS lowest,
       MAX(salary) AS highest
FROM employees;</code></pre>

<h3>NULLs in aggregates</h3>
<p>All aggregate functions (except <code>COUNT(*)</code>) <strong>ignore NULL values</strong>. Keep that in mind when calculating averages.</p>
<pre><code>-- These two give different results if some salaries are NULL:
SELECT COUNT(*) FROM employees;        -- includes NULLs
SELECT COUNT(salary) FROM employees;   -- excludes NULLs</code></pre>

<div class="tip">💡 <strong>Tip:</strong> Aggregates over an empty set return NULL (except COUNT which returns 0).</div>
`,

    exercises: [
      {
        id: 1,
        prompt: 'Count the total number of employees.',
        hint: 'Use COUNT(*) and give it an alias.',
        solution: 'SELECT COUNT(*) AS total_employees FROM employees',
      },
      {
        id: 2,
        prompt: 'Find the average salary rounded to 2 decimal places. Alias as "avg_salary".',
        hint: 'Wrap AVG(...) in ROUND(..., 2).',
        solution: 'SELECT ROUND(AVG(salary), 2) AS avg_salary FROM employees',
      },
      {
        id: 3,
        prompt: 'Find the lowest and highest salary in one query. Alias as "min_salary" and "max_salary".',
        hint: 'Select both MIN and MAX in one SELECT.',
        solution: 'SELECT MIN(salary) AS min_salary, MAX(salary) AS max_salary FROM employees',
      },
      {
        id: 4,
        prompt: 'Calculate the total payroll (sum of all salaries). Alias as "total_payroll".',
        hint: 'SUM(salary)',
        solution: 'SELECT SUM(salary) AS total_payroll FROM employees',
      },
      {
        id: 5,
        prompt: 'Count how many employees have a department assigned (department_id is not NULL). Alias as "assigned".',
        hint: 'COUNT(department_id) skips NULLs.',
        solution: 'SELECT COUNT(department_id) AS assigned FROM employees',
      },
    ],

    reviewCard: {
      title: 'Aggregate Functions',
      description: 'Summarize many rows into one value.',
      syntax: `SELECT COUNT(*)            -- all rows
       COUNT(col)          -- non-NULL only
       SUM(col)
       AVG(col)
       MIN(col)
       MAX(col)
       ROUND(AVG(col), 2)  -- round result
FROM table;`,
    },
  },

  // ──────────────────────────────────────────────────────────
  {
    id: 5, module: 2, title: 'GROUP BY', duration: '25 min',
    objectives: ['Group rows by a column', 'Aggregate within groups', 'Group by multiple columns'],

    theory: `
<h2>GROUP BY</h2>
<p><code>GROUP BY</code> splits rows into groups and lets you aggregate each group separately.</p>

<h3>Basic GROUP BY</h3>
<pre><code>-- How many employees per department?
SELECT department_id,
       COUNT(*) AS employee_count
FROM employees
GROUP BY department_id;</code></pre>

<h3>Multiple aggregates per group</h3>
<pre><code>SELECT department_id,
       COUNT(*)          AS headcount,
       ROUND(AVG(salary),0) AS avg_salary,
       MAX(salary)       AS top_salary
FROM employees
GROUP BY department_id;</code></pre>

<h3>The GROUP BY rule</h3>
<p>Every column in <code>SELECT</code> must either be:</p>
<ol>
  <li>In the <code>GROUP BY</code> clause, <strong>or</strong></li>
  <li>Inside an aggregate function.</li>
</ol>
<pre><code>-- ✗ WRONG — "name" is not aggregated or grouped
SELECT department_id, name, COUNT(*) FROM employees GROUP BY department_id;

-- ✓ CORRECT
SELECT department_id, COUNT(*) FROM employees GROUP BY department_id;</code></pre>

<h3>Grouping by multiple columns</h3>
<pre><code>-- Count projects per status per employee
SELECT employee_id, role, COUNT(*) AS n
FROM employee_projects
GROUP BY employee_id, role;</code></pre>

<div class="note">📋 NULLs form their own group. So <code>GROUP BY department_id</code> will create one group for all employees with <code>department_id IS NULL</code>.</div>
`,

    exercises: [
      {
        id: 1,
        prompt: 'Count the number of employees in each department_id. Show department_id and the count as "employee_count".',
        hint: 'GROUP BY department_id, SELECT COUNT(*) AS employee_count.',
        solution: 'SELECT department_id, COUNT(*) AS employee_count FROM employees GROUP BY department_id',
      },
      {
        id: 2,
        prompt: 'Show the average salary per department_id. Alias as "avg_salary". Round to the nearest whole number.',
        hint: 'ROUND(AVG(salary), 0)',
        solution: 'SELECT department_id, ROUND(AVG(salary), 0) AS avg_salary FROM employees GROUP BY department_id',
      },
      {
        id: 3,
        prompt: 'For each department_id, show the highest and lowest salary. Alias as "max_salary" and "min_salary".',
        hint: 'Both MAX and MIN in the same SELECT.',
        solution: 'SELECT department_id, MAX(salary) AS max_salary, MIN(salary) AS min_salary FROM employees GROUP BY department_id',
      },
      {
        id: 4,
        prompt: 'Count how many projects have each status. Show status and count as "total".',
        hint: 'Use the projects table. GROUP BY status.',
        solution: 'SELECT status, COUNT(*) AS total FROM projects GROUP BY status',
      },
    ],

    reviewCard: {
      title: 'GROUP BY',
      description: 'Aggregate data by category.',
      syntax: `SELECT dept, COUNT(*), AVG(salary)
FROM employees
GROUP BY dept;

-- Rule: non-aggregate columns
-- must appear in GROUP BY`,
    },
  },

  // ──────────────────────────────────────────────────────────
  {
    id: 6, module: 2, title: 'HAVING', duration: '20 min',
    objectives: ['Filter groups with HAVING', 'Understand the difference between WHERE and HAVING'],

    theory: `
<h2>HAVING</h2>
<p><code>HAVING</code> filters groups — it's like <code>WHERE</code>, but runs after <code>GROUP BY</code>.</p>

<h3>WHERE vs HAVING</h3>
<pre><code>-- WHERE filters rows BEFORE grouping
-- HAVING filters groups AFTER grouping

SELECT department_id, COUNT(*) AS cnt
FROM employees
WHERE salary > 60000       -- ← filter rows first
GROUP BY department_id
HAVING COUNT(*) > 1;       -- ← then filter groups</code></pre>

<h3>Use aggregate functions in HAVING</h3>
<pre><code>-- Departments with more than 2 employees
SELECT department_id, COUNT(*) AS headcount
FROM employees
GROUP BY department_id
HAVING COUNT(*) > 2;

-- Departments where average salary > 75,000
SELECT department_id, ROUND(AVG(salary),0) AS avg_sal
FROM employees
GROUP BY department_id
HAVING AVG(salary) > 75000;</code></pre>

<h3>Execution order (mental model)</h3>
<ol>
  <li><code>FROM</code> — which table?</li>
  <li><code>WHERE</code> — filter rows</li>
  <li><code>GROUP BY</code> — form groups</li>
  <li><code>HAVING</code> — filter groups</li>
  <li><code>SELECT</code> — pick columns</li>
  <li><code>ORDER BY</code> — sort</li>
  <li><code>LIMIT</code> — cap rows</li>
</ol>

<div class="warning">⚠️ You cannot use a SELECT alias in HAVING (in most databases). Write the aggregate expression again: <code>HAVING COUNT(*) > 2</code>, not <code>HAVING headcount > 2</code>.</div>
`,

    exercises: [
      {
        id: 1,
        prompt: 'Find departments that have more than 2 employees. Show department_id and the count as "headcount".',
        hint: 'HAVING COUNT(*) > 2',
        solution: 'SELECT department_id, COUNT(*) AS headcount FROM employees GROUP BY department_id HAVING COUNT(*) > 2',
      },
      {
        id: 2,
        prompt: 'Find departments where the average salary is above 75,000. Show department_id and avg_salary (rounded to 0 decimals).',
        hint: 'HAVING AVG(salary) > 75000',
        solution: 'SELECT department_id, ROUND(AVG(salary), 0) AS avg_salary FROM employees GROUP BY department_id HAVING AVG(salary) > 75000',
      },
      {
        id: 3,
        prompt: 'Find departments where the total payroll (SUM of salaries) is between 200,000 and 300,000. Show department_id and total_payroll.',
        hint: 'HAVING SUM(salary) BETWEEN 200000 AND 300000',
        solution: 'SELECT department_id, SUM(salary) AS total_payroll FROM employees GROUP BY department_id HAVING SUM(salary) BETWEEN 200000 AND 300000',
      },
    ],

    reviewCard: {
      title: 'HAVING',
      description: 'Filter groups after aggregation.',
      syntax: `SELECT dept, COUNT(*) AS cnt
FROM employees
WHERE salary > 50000       -- filter rows first
GROUP BY dept
HAVING COUNT(*) >= 2       -- then filter groups
ORDER BY cnt DESC;`,
    },
  },

  // ══════════════════════════════════════════════════════════
  // MODULE 3 — JOINs
  // ══════════════════════════════════════════════════════════
  {
    id: 7, module: 3, title: 'INNER JOIN', duration: '25 min',
    objectives: ['Join two tables on a matching key', 'Use table aliases', 'Understand what rows are excluded'],

    theory: `
<h2>INNER JOIN</h2>
<p>Rows from two tables are combined when a condition is true. <code>INNER JOIN</code> only keeps rows where a match exists in <em>both</em> tables.</p>

<h3>Basic syntax</h3>
<pre><code>SELECT e.name, d.name AS department
FROM employees e
INNER JOIN departments d ON e.department_id = d.id;</code></pre>
<p>The <code>ON</code> clause says: link row from <code>employees</code> to the row in <code>departments</code> where their IDs match.</p>
<p><code>e</code> and <code>d</code> are table aliases — they save typing.</p>

<h3>What gets excluded</h3>
<p>Jack Anderson has <code>department_id = NULL</code>. Since NULL doesn't match any department ID, he's excluded from the INNER JOIN result.</p>

<h3>Joining three tables</h3>
<pre><code>-- Employees, their department, and their projects
SELECT e.name, d.name AS dept, p.name AS project
FROM employees e
JOIN departments d        ON e.department_id = d.id
JOIN employee_projects ep ON e.id = ep.employee_id
JOIN projects p           ON ep.project_id = p.id;</code></pre>

<div class="note">📋 <code>JOIN</code> without a qualifier is the same as <code>INNER JOIN</code>. Most people drop "INNER" for brevity.</div>
`,

    exercises: [
      {
        id: 1,
        prompt: 'Show each employee\'s name alongside their department name. Alias the department name column as "department".',
        hint: 'JOIN departments d ON e.department_id = d.id',
        solution: 'SELECT e.name, d.name AS department FROM employees e JOIN departments d ON e.department_id = d.id',
      },
      {
        id: 2,
        prompt: 'Show employee name, department name, and department location. Alias the dept name as "department" and location as "location".',
        hint: 'Same join, just select more columns from d.',
        solution: 'SELECT e.name, d.name AS department, d.location FROM employees e JOIN departments d ON e.department_id = d.id',
      },
      {
        id: 3,
        prompt: 'Show employee name and the name of each project they work on. Alias the project name as "project". Use the employee_projects join table.',
        hint: 'You need two JOINs: employees→employee_projects→projects.',
        solution: 'SELECT e.name, p.name AS project FROM employees e JOIN employee_projects ep ON e.id = ep.employee_id JOIN projects p ON ep.project_id = p.id',
      },
    ],

    reviewCard: {
      title: 'INNER JOIN',
      description: 'Combine rows that match in both tables.',
      syntax: `SELECT a.col, b.col
FROM table_a a
JOIN table_b b ON a.id = b.a_id;

-- Only rows with a match in BOTH
-- tables appear in the result.`,
    },
  },

  // ──────────────────────────────────────────────────────────
  {
    id: 8, module: 3, title: 'LEFT JOIN', duration: '25 min',
    objectives: ['Preserve unmatched rows with LEFT JOIN', 'Find rows without a match using IS NULL'],

    theory: `
<h2>LEFT JOIN</h2>
<p><code>LEFT JOIN</code> keeps all rows from the <em>left</em> table, even if there's no matching row in the right table. Non-matching right columns become <code>NULL</code>.</p>

<h3>Comparison with INNER JOIN</h3>
<pre><code>-- INNER JOIN: Jack Anderson disappears (no dept)
SELECT e.name, d.name AS department
FROM employees e
JOIN departments d ON e.department_id = d.id;

-- LEFT JOIN: Jack appears with NULL department
SELECT e.name, d.name AS department
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id;</code></pre>

<h3>Finding rows WITHOUT a match</h3>
<p>The classic "anti-join" pattern: left join, then filter for NULL on the right side.</p>
<pre><code>-- Employees who have no department
SELECT e.name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
WHERE d.id IS NULL;</code></pre>

<h3>LEFT JOIN + GROUP BY</h3>
<pre><code>-- Count employees per department, including empty departments
SELECT d.name,
       COUNT(e.id) AS headcount
FROM departments d
LEFT JOIN employees e ON d.id = e.department_id
GROUP BY d.id, d.name;</code></pre>
<p>Notice: the table order is reversed — departments is the "left" table so no department gets dropped.</p>

<div class="tip">💡 Use <code>COUNT(e.id)</code> not <code>COUNT(*)</code> when left-joining, so departments with 0 employees show 0, not 1.</div>
`,

    exercises: [
      {
        id: 1,
        prompt: 'Show all employees and their department name (including employees without a department). Use NULL for missing departments. Alias dept name as "department".',
        hint: 'Use LEFT JOIN so all employees appear.',
        solution: 'SELECT e.name, d.name AS department FROM employees e LEFT JOIN departments d ON e.department_id = d.id',
      },
      {
        id: 2,
        prompt: 'Find employees who are NOT assigned to any department. Show only their name.',
        hint: 'LEFT JOIN then WHERE d.id IS NULL.',
        solution: 'SELECT e.name FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE d.id IS NULL',
      },
      {
        id: 3,
        prompt: 'Show all departments and how many employees each has (including departments with 0 employees). Show department name and count as "headcount".',
        hint: 'departments is the left table. Use COUNT(e.id), not COUNT(*).',
        solution: 'SELECT d.name, COUNT(e.id) AS headcount FROM departments d LEFT JOIN employees e ON d.id = e.department_id GROUP BY d.id, d.name',
      },
    ],

    reviewCard: {
      title: 'LEFT JOIN',
      description: 'Keep all left rows, NULL for no match.',
      syntax: `-- All left rows preserved
SELECT a.col, b.col
FROM a LEFT JOIN b ON a.id = b.a_id;

-- Find rows with NO match
... LEFT JOIN b ON ...
WHERE b.id IS NULL;`,
    },
  },

  // ──────────────────────────────────────────────────────────
  {
    id: 9, module: 3, title: 'Multiple JOINs & Self-Joins', duration: '25 min',
    objectives: ['Chain multiple JOINs', 'Join a table to itself (self-join)'],

    theory: `
<h2>Multiple JOINs & Self-Joins</h2>

<h3>Chaining JOINs</h3>
<p>You can join as many tables as you need. Each <code>JOIN</code> adds another table to the result.</p>
<pre><code>-- Full picture: employee + dept + project
SELECT e.name        AS employee,
       d.name        AS department,
       p.name        AS project,
       ep.role
FROM employees e
LEFT JOIN departments d        ON e.department_id = d.id
LEFT JOIN employee_projects ep ON e.id = ep.employee_id
LEFT JOIN projects p           ON ep.project_id   = p.id;</code></pre>

<h3>Self-Join — join a table to itself</h3>
<p>The <code>employees</code> table has a <code>manager_id</code> column that references another row in the same table. To get the manager's name, join employees to itself with different aliases.</p>
<pre><code>-- Employee name + their manager's name
SELECT e.name AS employee,
       m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;</code></pre>
<p>Here <code>e</code> is the employee, <code>m</code> is their manager (also from <code>employees</code>). We use <code>LEFT JOIN</code> so top-level employees (no manager) are kept.</p>

<div class="tip">💡 Self-joins are common for hierarchical data: org charts, categories with parent categories, comment threads.</div>
`,

    exercises: [
      {
        id: 1,
        prompt: 'Show every employee\'s name and the name of their manager. Alias as "employee" and "manager". Include employees with no manager (show NULL for manager).',
        hint: 'LEFT JOIN employees m ON e.manager_id = m.id.',
        solution: 'SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id',
      },
      {
        id: 2,
        prompt: 'Show employee name, their department name, and the projects they work on (role included). Include employees without projects. Alias dept as "department", project as "project".',
        hint: 'Chain: employees → departments, employees → employee_projects → projects. Use LEFT JOINs.',
        solution: 'SELECT e.name, d.name AS department, p.name AS project, ep.role FROM employees e LEFT JOIN departments d ON e.department_id = d.id LEFT JOIN employee_projects ep ON e.id = ep.employee_id LEFT JOIN projects p ON ep.project_id = p.id',
      },
    ],

    reviewCard: {
      title: 'Multiple JOINs & Self-Join',
      description: 'Chain JOINs and query hierarchies.',
      syntax: `-- Chain JOINs
FROM a
JOIN b ON a.id = b.a_id
JOIN c ON b.id = c.b_id;

-- Self-join (manager example)
FROM employees e
LEFT JOIN employees m
  ON e.manager_id = m.id;`,
    },
  },

  // ══════════════════════════════════════════════════════════
  // MODULE 4 — INTERMEDIATE
  // ══════════════════════════════════════════════════════════
  {
    id: 10, module: 4, title: 'Subqueries in WHERE', duration: '25 min',
    objectives: ['Use subqueries with IN and NOT IN', 'Use EXISTS for existence checks', 'Understand correlated vs non-correlated subqueries'],

    theory: `
<h2>Subqueries in WHERE</h2>
<p>A subquery is a query nested inside another query. In <code>WHERE</code>, they let you filter based on derived data.</p>

<h3>IN (subquery)</h3>
<pre><code>-- Employees in the Engineering department
SELECT name
FROM employees
WHERE department_id = (
  SELECT id FROM departments WHERE name = 'Engineering'
);</code></pre>
<pre><code>-- Employees working on any active project
SELECT name FROM employees
WHERE id IN (
  SELECT employee_id FROM employee_projects
  WHERE project_id IN (
    SELECT id FROM projects WHERE status = 'active'
  )
);</code></pre>

<h3>NOT IN (subquery)</h3>
<pre><code>-- Employees NOT assigned to any project
SELECT name FROM employees
WHERE id NOT IN (
  SELECT DISTINCT employee_id FROM employee_projects
);</code></pre>
<div class="warning">⚠️ <code>NOT IN</code> returns no rows if the subquery result contains any NULL. Use <code>NOT EXISTS</code> or add <code>WHERE employee_id IS NOT NULL</code> to the subquery to be safe.</div>

<h3>EXISTS</h3>
<p><code>EXISTS</code> checks whether the subquery returns at least one row. It's often faster than <code>IN</code> on large datasets.</p>
<pre><code>-- Employees who lead at least one project
SELECT name FROM employees e
WHERE EXISTS (
  SELECT 1 FROM employee_projects ep
  WHERE ep.employee_id = e.id AND ep.role = 'lead'
);</code></pre>

<div class="tip">💡 In <code>EXISTS</code>, you can write <code>SELECT 1</code> — the actual value doesn't matter, only whether a row is found.</div>
`,

    exercises: [
      {
        id: 1,
        prompt: 'Find all employees in the Engineering department using a subquery (not a JOIN). Show only name.',
        hint: "Subquery: SELECT id FROM departments WHERE name = 'Engineering'",
        solution: "SELECT name FROM employees WHERE department_id = (SELECT id FROM departments WHERE name = 'Engineering')",
      },
      {
        id: 2,
        prompt: 'Find employees who are working on at least one active project. Use a subquery with IN. Show only name.',
        hint: 'Two nested subqueries: active project IDs, then employee IDs for those projects.',
        solution: "SELECT name FROM employees WHERE id IN (SELECT employee_id FROM employee_projects WHERE project_id IN (SELECT id FROM projects WHERE status = 'active'))",
      },
      {
        id: 3,
        prompt: 'Find employees who are NOT assigned to any project. Show only name.',
        hint: "NOT IN (SELECT DISTINCT employee_id FROM employee_projects)",
        solution: 'SELECT name FROM employees WHERE id NOT IN (SELECT DISTINCT employee_id FROM employee_projects)',
      },
    ],

    reviewCard: {
      title: 'Subqueries in WHERE',
      description: 'Filter using nested queries.',
      syntax: `-- IN subquery
WHERE col IN (SELECT col FROM t WHERE ...)

-- NOT IN (watch out for NULLs)
WHERE col NOT IN (SELECT col FROM t)

-- EXISTS
WHERE EXISTS (
  SELECT 1 FROM t WHERE t.fk = outer.id
)`,
    },
  },

  // ──────────────────────────────────────────────────────────
  {
    id: 11, module: 4, title: 'Subqueries in FROM', duration: '20 min',
    objectives: ['Use subqueries as derived tables in FROM', 'Aggregate on top of aggregates'],

    theory: `
<h2>Subqueries in FROM (Derived Tables)</h2>
<p>You can use a full query as if it were a table in the <code>FROM</code> clause. This is called a <em>derived table</em>.</p>

<h3>Basic derived table</h3>
<pre><code>-- Average salary per department, then find those above overall average
SELECT dept_stats.department_id,
       dept_stats.avg_sal
FROM (
  SELECT department_id,
         AVG(salary) AS avg_sal
  FROM employees
  GROUP BY department_id
) AS dept_stats
WHERE dept_stats.avg_sal > (SELECT AVG(salary) FROM employees);</code></pre>

<h3>Why use this?</h3>
<p>You can't use a WHERE clause to filter on an aggregate directly:</p>
<pre><code>-- ✗ NOT VALID
SELECT department_id, AVG(salary) AS avg_sal
FROM employees
WHERE AVG(salary) > 70000;  -- Can't use aggregate in WHERE!

-- ✓ Use HAVING instead (for simple cases)
-- ✓ Or a derived table (for more complex logic)</code></pre>

<div class="tip">💡 In modern SQL, CTEs (<code>WITH</code>) are often cleaner than nested derived tables. We'll cover CTEs in Lesson 13.</div>
`,

    exercises: [
      {
        id: 1,
        prompt: 'Find departments where the average salary is above the overall average salary. Show department_id and avg_sal (rounded to 0 decimals). Use a subquery in FROM.',
        hint: 'Put the GROUP BY query inside FROM as a derived table, then WHERE avg_sal > (SELECT AVG(salary) FROM employees).',
        solution: 'SELECT d.department_id, d.avg_sal FROM (SELECT department_id, ROUND(AVG(salary), 0) AS avg_sal FROM employees GROUP BY department_id) AS d WHERE d.avg_sal > (SELECT AVG(salary) FROM employees)',
      },
      {
        id: 2,
        prompt: 'Count how many departments have more than 2 employees. Show this as a single number aliased as "count".',
        hint: 'First GROUP BY to get headcounts, then wrap in FROM and count the rows.',
        solution: 'SELECT COUNT(*) AS count FROM (SELECT department_id, COUNT(*) AS cnt FROM employees GROUP BY department_id HAVING COUNT(*) > 2) AS big_depts',
      },
    ],

    reviewCard: {
      title: 'Derived Tables (FROM Subquery)',
      description: 'Use a query as a table.',
      syntax: `SELECT outer.col, outer.agg
FROM (
  SELECT col, AGG(x) AS agg
  FROM t
  GROUP BY col
) AS outer_alias
WHERE outer.agg > 100;`,
    },
  },

  // ──────────────────────────────────────────────────────────
  {
    id: 12, module: 4, title: 'CASE Expressions', duration: '20 min',
    objectives: ['Write conditional logic in SQL with CASE', 'Use CASE in SELECT and ORDER BY'],

    theory: `
<h2>CASE Expressions</h2>
<p><code>CASE</code> is SQL's if-else. It works anywhere an expression is valid.</p>

<h3>Searched CASE</h3>
<pre><code>SELECT name, salary,
  CASE
    WHEN salary >= 90000 THEN 'Senior'
    WHEN salary >= 70000 THEN 'Mid'
    ELSE 'Junior'
  END AS level
FROM employees;</code></pre>

<h3>Simple CASE (match on one value)</h3>
<pre><code>SELECT name,
  CASE status
    WHEN 'active'    THEN 'In Progress'
    WHEN 'completed' THEN 'Done'
    WHEN 'planned'   THEN 'Upcoming'
    ELSE 'Unknown'
  END AS status_label
FROM projects;</code></pre>

<h3>CASE in aggregation</h3>
<pre><code>-- Count active vs completed projects in one row
SELECT
  COUNT(CASE WHEN status = 'active'    THEN 1 END) AS active_count,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) AS done_count
FROM projects;</code></pre>

<h3>COALESCE — shortcut for NULL handling</h3>
<pre><code>-- Return the first non-NULL value
SELECT name, COALESCE(department_id, 0) AS dept
FROM employees;</code></pre>
`,

    exercises: [
      {
        id: 1,
        prompt: 'Show each employee\'s name, salary, and a "level" column: "Senior" if salary >= 85000, "Mid" if >= 68000, otherwise "Junior".',
        hint: 'CASE WHEN salary >= 85000 THEN ... WHEN ... ELSE ... END AS level',
        solution: "SELECT name, salary, CASE WHEN salary >= 85000 THEN 'Senior' WHEN salary >= 68000 THEN 'Mid' ELSE 'Junior' END AS level FROM employees",
      },
      {
        id: 2,
        prompt: 'Show each project\'s name and a "status_label" column: \'active\'→\'In Progress\', \'completed\'→\'Done\', \'planned\'→\'Upcoming\'.',
        hint: 'Use simple CASE on the status column.',
        solution: "SELECT name, CASE status WHEN 'active' THEN 'In Progress' WHEN 'completed' THEN 'Done' WHEN 'planned' THEN 'Upcoming' END AS status_label FROM projects",
      },
      {
        id: 3,
        prompt: 'In one row, count how many projects are active and how many are completed. Aliases: "active_count" and "done_count".',
        hint: 'COUNT(CASE WHEN status = ... THEN 1 END)',
        solution: "SELECT COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_count, COUNT(CASE WHEN status = 'completed' THEN 1 END) AS done_count FROM projects",
      },
    ],

    reviewCard: {
      title: 'CASE Expressions',
      description: 'Conditional logic inside SQL.',
      syntax: `-- Searched CASE
CASE
  WHEN cond1 THEN val1
  WHEN cond2 THEN val2
  ELSE default
END

-- Simple CASE
CASE col
  WHEN 'x' THEN 'X'
  WHEN 'y' THEN 'Y'
END

-- NULL fallback
COALESCE(col, 'default')`,
    },
  },

  // ══════════════════════════════════════════════════════════
  // MODULE 5 — POWER FEATURES
  // ══════════════════════════════════════════════════════════
  {
    id: 13, module: 5, title: 'CTEs (WITH)', duration: '25 min',
    objectives: ['Write readable multi-step queries with CTEs', 'Chain multiple CTEs', 'Understand when to use CTEs vs subqueries'],

    theory: `
<h2>CTEs — Common Table Expressions</h2>
<p>A CTE (<code>WITH</code> clause) names a subquery so you can refer to it cleanly. Think of it as a named temporary result.</p>

<h3>Basic CTE</h3>
<pre><code>WITH high_earners AS (
  SELECT * FROM employees WHERE salary > 80000
)
SELECT name, salary FROM high_earners ORDER BY salary DESC;</code></pre>

<h3>Multiple CTEs</h3>
<p>Chain them with commas. Later CTEs can reference earlier ones.</p>
<pre><code>WITH
dept_headcount AS (
  SELECT department_id, COUNT(*) AS cnt
  FROM employees
  GROUP BY department_id
),
dept_avg AS (
  SELECT department_id, ROUND(AVG(salary), 0) AS avg_sal
  FROM employees
  GROUP BY department_id
)
SELECT d.name,
       h.cnt,
       a.avg_sal
FROM departments d
JOIN dept_headcount h ON d.id = h.department_id
JOIN dept_avg       a ON d.id = a.department_id;</code></pre>

<h3>CTEs vs subqueries</h3>
<ul>
  <li><strong>CTEs</strong> are named and sit at the top — easier to read and debug.</li>
  <li><strong>Subqueries</strong> are inline — fine for simple one-off cases.</li>
  <li>Both produce the same result; CTEs win on readability for complex logic.</li>
</ul>

<div class="tip">💡 When a query has more than two levels of nesting, a CTE almost always makes it clearer.</div>
`,

    exercises: [
      {
        id: 1,
        prompt: 'Use a CTE named "high_earners" for employees with salary > 80000. Then count how many there are. Show the result as "count".',
        hint: 'WITH high_earners AS (...) SELECT COUNT(*) AS count FROM high_earners',
        solution: 'WITH high_earners AS (SELECT * FROM employees WHERE salary > 80000) SELECT COUNT(*) AS count FROM high_earners',
      },
      {
        id: 2,
        prompt: 'Use two CTEs: "dept_counts" (department_id + employee count as "cnt") and "dept_avgs" (department_id + avg salary rounded to 0 as "avg_sal"). Join them with departments to show: department name, cnt, avg_sal.',
        hint: 'WITH a AS (...), b AS (...) SELECT ... FROM departments JOIN a ... JOIN b ...',
        solution: 'WITH dept_counts AS (SELECT department_id, COUNT(*) AS cnt FROM employees GROUP BY department_id), dept_avgs AS (SELECT department_id, ROUND(AVG(salary), 0) AS avg_sal FROM employees GROUP BY department_id) SELECT d.name, c.cnt, a.avg_sal FROM departments d JOIN dept_counts c ON d.id = c.department_id JOIN dept_avgs a ON d.id = a.department_id',
      },
    ],

    reviewCard: {
      title: 'CTEs (WITH)',
      description: 'Name subqueries for readability.',
      syntax: `WITH cte_name AS (
  SELECT ...
  FROM ...
  WHERE ...
),
second_cte AS (
  SELECT ... FROM cte_name
)
SELECT * FROM second_cte;`,
    },
  },

  // ──────────────────────────────────────────────────────────
  {
    id: 14, module: 5, title: 'Window Functions', duration: '30 min',
    objectives: ['Use OVER() to apply functions without collapsing rows', 'Rank with ROW_NUMBER and RANK', 'Partition with PARTITION BY', 'Access adjacent rows with LAG and LEAD'],

    theory: `
<h2>Window Functions</h2>
<p>Window functions let you calculate aggregates across a "window" of rows — without collapsing them into one row like <code>GROUP BY</code> does.</p>

<h3>OVER() — the window</h3>
<pre><code>-- Show each salary alongside the average salary
SELECT name, salary,
       AVG(salary) OVER() AS overall_avg
FROM employees;</code></pre>
<p>Every row still shows up. The <code>OVER()</code> defines the window — empty <code>OVER()</code> means "all rows".</p>

<h3>ROW_NUMBER, RANK, DENSE_RANK</h3>
<pre><code>SELECT name, salary,
       ROW_NUMBER() OVER(ORDER BY salary DESC) AS row_num,
       RANK()       OVER(ORDER BY salary DESC) AS rank,
       DENSE_RANK() OVER(ORDER BY salary DESC) AS dense_rank
FROM employees;</code></pre>
<p>
  <code>RANK</code> skips numbers after ties (1,1,3). <br>
  <code>DENSE_RANK</code> doesn't skip (1,1,2). <br>
  <code>ROW_NUMBER</code> always unique (1,2,3).
</p>

<h3>PARTITION BY — reset per group</h3>
<pre><code>-- Rank employees within their own department
SELECT name, department_id, salary,
       RANK() OVER(PARTITION BY department_id ORDER BY salary DESC) AS dept_rank
FROM employees
WHERE department_id IS NOT NULL;</code></pre>

<h3>LAG and LEAD — peek at other rows</h3>
<pre><code>-- Compare each employee's salary with the next one (ordered by salary)
SELECT name, salary,
       LAG(salary)  OVER(ORDER BY salary) AS prev_salary,
       LEAD(salary) OVER(ORDER BY salary) AS next_salary
FROM employees;</code></pre>

<div class="note">📋 Window functions cannot be used in WHERE. Wrap in a CTE or subquery if you need to filter on them.</div>
`,

    exercises: [
      {
        id: 1,
        prompt: 'Rank all employees by salary (highest = rank 1). Show name, salary, and rank as "salary_rank". Use RANK().',
        hint: 'RANK() OVER(ORDER BY salary DESC) AS salary_rank',
        solution: 'SELECT name, salary, RANK() OVER(ORDER BY salary DESC) AS salary_rank FROM employees',
      },
      {
        id: 2,
        prompt: 'Rank employees within their department by salary (highest first). Show name, department_id, salary, and "dept_rank". Exclude employees without a department.',
        hint: 'RANK() OVER(PARTITION BY department_id ORDER BY salary DESC)',
        solution: 'SELECT name, department_id, salary, RANK() OVER(PARTITION BY department_id ORDER BY salary DESC) AS dept_rank FROM employees WHERE department_id IS NOT NULL',
      },
      {
        id: 3,
        prompt: 'For each employee (ordered by salary ascending), show their salary, the previous salary as "prev_salary", and the next salary as "next_salary".',
        hint: 'LAG(salary) OVER(ORDER BY salary) and LEAD(salary) OVER(ORDER BY salary)',
        solution: 'SELECT name, salary, LAG(salary) OVER(ORDER BY salary) AS prev_salary, LEAD(salary) OVER(ORDER BY salary) AS next_salary FROM employees ORDER BY salary',
      },
    ],

    reviewCard: {
      title: 'Window Functions',
      description: 'Calculate over rows without collapsing them.',
      syntax: `func() OVER(
  PARTITION BY col   -- reset per group
  ORDER BY col DESC  -- order within window
)

ROW_NUMBER()  -- always unique
RANK()        -- gaps after ties
DENSE_RANK()  -- no gaps
LAG(col, n)   -- look back n rows
LEAD(col, n)  -- look forward n rows`,
    },
  },

  // ──────────────────────────────────────────────────────────
  {
    id: 15, module: 5, title: 'String & Date Functions', duration: '20 min',
    objectives: ['Transform text with string functions', 'Extract date parts in SQLite'],

    theory: `
<h2>String & Date Functions</h2>
<p>SQLite has a solid set of built-in functions for manipulating text and dates.</p>

<h3>String functions</h3>
<pre><code>SELECT UPPER('hello')          -- 'HELLO'
SELECT LOWER('HELLO')          -- 'hello'
SELECT LENGTH('Alice Johnson') -- 13

-- Substring: start position, length (1-indexed)
SELECT SUBSTR('Alice Johnson', 1, 5)  -- 'Alice'

-- Find position of a character
SELECT INSTR('Alice Johnson', ' ')    -- 6

-- First name extraction
SELECT SUBSTR(name, 1, INSTR(name,' ') - 1) AS first_name
FROM employees;

SELECT REPLACE('hello world', 'world', 'SQL') -- 'hello SQL'
SELECT TRIM('  hello  ')                       -- 'hello'</code></pre>

<h3>Date functions (SQLite)</h3>
<pre><code>-- Current date
SELECT date('now');

-- Extract parts with strftime
SELECT strftime('%Y', hire_date) AS year   -- '2019'
SELECT strftime('%m', hire_date) AS month  -- '03'
SELECT strftime('%Y-%m', hire_date) AS ym  -- '2019-03'

-- Date arithmetic
SELECT date(hire_date, '+1 year') AS one_year_later
FROM employees;</code></pre>

<div class="note">📋 Date formats vary by database. SQLite uses <code>strftime</code>. PostgreSQL uses <code>EXTRACT</code>. MySQL uses <code>YEAR()</code>, <code>MONTH()</code>. The concept is the same.</div>
`,

    exercises: [
      {
        id: 1,
        prompt: 'Show each employee\'s name in ALL CAPS. Alias as "name_upper".',
        hint: 'UPPER(name)',
        solution: 'SELECT UPPER(name) AS name_upper FROM employees',
      },
      {
        id: 2,
        prompt: 'Extract the first name of each employee (the part before the space). Show name and first_name.',
        hint: 'SUBSTR(name, 1, INSTR(name, \' \') - 1) AS first_name',
        solution: "SELECT name, SUBSTR(name, 1, INSTR(name, ' ') - 1) AS first_name FROM employees",
      },
      {
        id: 3,
        prompt: 'Show each employee\'s name, the year they were hired (as "hire_year"), and the month (as "hire_month").',
        hint: "strftime('%Y', hire_date) and strftime('%m', hire_date)",
        solution: "SELECT name, strftime('%Y', hire_date) AS hire_year, strftime('%m', hire_date) AS hire_month FROM employees",
      },
    ],

    reviewCard: {
      title: 'String & Date Functions',
      description: 'Transform text and dates.',
      syntax: `UPPER(s) / LOWER(s) / LENGTH(s)
SUBSTR(s, start, len)
INSTR(s, target)
REPLACE(s, old, new)
TRIM(s)

-- SQLite dates:
strftime('%Y', date_col)  -- year
strftime('%m', date_col)  -- month
date(col, '+1 year')      -- add 1 year`,
    },
  },

]; // end LESSONS

// ── Capstone Challenges (one per module) ─────────────────────────────────────
const CAPSTONES = [
  {
    id: -1, moduleId: 1, isCapstone: true,
    title: 'Module 1 Challenge', duration: '20 min',
    objectives: ['Combine SELECT, WHERE, ORDER BY, and LIMIT in one query'],
    theory: `<h2>Module 1 Challenge</h2>
<p>This challenge combines everything from Module 1: column selection, aliases, computed values, WHERE filtering, sorting, and LIMIT.</p>
<div class="note">📋 No hints or solutions available for challenges. Work through it on your own!</div>`,
    exercises: [
      {
        id: 1,
        prompt: "Show the name and projected_salary (salary × 1.10, rounded to 0 decimals) of the 3 highest-paid employees who were hired after '2019-12-31'. Alias the computed column as projected_salary.",
        hint: 'Combine WHERE hire_date > ..., ORDER BY salary DESC, and LIMIT 3.',
        solution: "SELECT name, ROUND(salary * 1.10, 0) AS projected_salary FROM employees WHERE hire_date > '2019-12-31' ORDER BY salary DESC LIMIT 3",
      },
    ],
    reviewCard: null,
  },
  {
    id: -2, moduleId: 2, isCapstone: true,
    title: 'Module 2 Challenge', duration: '20 min',
    objectives: ['Chain GROUP BY, HAVING, and ORDER BY in one query'],
    theory: `<h2>Module 2 Challenge</h2>
<p>This challenge combines aggregation, GROUP BY, HAVING, and ORDER BY in one query.</p>
<div class="note">📋 No hints or solutions available. Think through it step by step!</div>`,
    exercises: [
      {
        id: 1,
        prompt: "For each department_id (excluding NULL), show: department_id, total_payroll (SUM of salaries), and avg_salary (AVG rounded to 0 decimals). Only include departments where the average salary > 75,000. Sort by total_payroll descending.",
        hint: 'WHERE filters rows first, then HAVING filters the groups.',
        solution: "SELECT department_id, SUM(salary) AS total_payroll, ROUND(AVG(salary), 0) AS avg_salary FROM employees WHERE department_id IS NOT NULL GROUP BY department_id HAVING AVG(salary) > 75000 ORDER BY total_payroll DESC",
      },
    ],
    reviewCard: null,
  },
  {
    id: -3, moduleId: 3, isCapstone: true,
    title: 'Module 3 Challenge', duration: '25 min',
    objectives: ['Chain multiple LEFT JOINs including a self-join'],
    theory: `<h2>Module 3 Challenge</h2>
<p>Chain multiple JOINs — including a self-join for the manager relationship. Draw it out on paper first if it helps.</p>
<div class="note">📋 No hints or solutions available for challenges.</div>`,
    exercises: [
      {
        id: 1,
        prompt: "Show each employee's name as 'employee', their manager's name as 'manager' (NULL if none), and their department name as 'department' (NULL if unassigned). Sort alphabetically by employee name.",
        hint: "Two LEFT JOINs: self-join for manager (employees m ON e.manager_id = m.id), then departments.",
        solution: "SELECT e.name AS employee, m.name AS manager, d.name AS department FROM employees e LEFT JOIN employees m ON e.manager_id = m.id LEFT JOIN departments d ON e.department_id = d.id ORDER BY e.name",
      },
    ],
    reviewCard: null,
  },
  {
    id: -4, moduleId: 4, isCapstone: true,
    title: 'Module 4 Challenge', duration: '25 min',
    objectives: ['Use a CTE combined with CASE expression'],
    theory: `<h2>Module 4 Challenge</h2>
<p>Combine a CTE, a JOIN, and a CASE expression. Break it into steps: write the CTE first, then the outer query.</p>
<div class="note">📋 No hints or solutions available for challenges.</div>`,
    exercises: [
      {
        id: 1,
        prompt: "Using a CTE named 'dept_summary', calculate each non-NULL department_id with its headcount as 'cnt' and avg_salary as 'avg_sal' (rounded to 0). Then join with departments to show: department name, cnt, avg_sal, and a 'size' column: 'Large' if cnt >= 3, else 'Small'. Sort by cnt descending.",
        hint: "WITH dept_summary AS (...) SELECT d.name, s.cnt, s.avg_sal, CASE WHEN ... END AS size FROM ...",
        solution: "WITH dept_summary AS (SELECT department_id, COUNT(*) AS cnt, ROUND(AVG(salary), 0) AS avg_sal FROM employees WHERE department_id IS NOT NULL GROUP BY department_id) SELECT d.name, s.cnt, s.avg_sal, CASE WHEN s.cnt >= 3 THEN 'Large' ELSE 'Small' END AS size FROM dept_summary s JOIN departments d ON s.department_id = d.id ORDER BY s.cnt DESC",
      },
    ],
    reviewCard: null,
  },
  {
    id: -5, moduleId: 5, isCapstone: true,
    title: 'Module 5 Challenge', duration: '30 min',
    objectives: ['Combine window functions with string functions'],
    theory: `<h2>Module 5 Challenge</h2>
<p>The final challenge — combine window functions and string functions in one query. You have all the tools.</p>
<div class="note">📋 No hints or solutions available for challenges. You've got this!</div>`,
    exercises: [
      {
        id: 1,
        prompt: "Show: name, first_name (extracted: the part before the space), salary, overall salary rank as 'salary_rank' (highest salary = rank 1), and department salary rank as 'dept_rank' (highest in dept = rank 1). Exclude employees with no department. Sort by salary_rank.",
        hint: "RANK() OVER(ORDER BY salary DESC), RANK() OVER(PARTITION BY department_id ORDER BY salary DESC), SUBSTR(name, 1, INSTR(name, ' ') - 1)",
        solution: "SELECT name, SUBSTR(name, 1, INSTR(name, ' ') - 1) AS first_name, salary, RANK() OVER(ORDER BY salary DESC) AS salary_rank, RANK() OVER(PARTITION BY department_id ORDER BY salary DESC) AS dept_rank FROM employees WHERE department_id IS NOT NULL ORDER BY salary_rank",
      },
    ],
    reviewCard: null,
  },
];

// ── Quiz Questions (3 per lesson × 15 = 45 total) ────────────────────────────
const QUIZ_QUESTIONS = [
  // ── Lesson 1: SELECT
  { id:  1, lessonId:  1, question: "Which SQL keyword removes duplicate rows from a result?", options: ["UNIQUE","DISTINCT","DEDUP","NODUPE"], answer: "DISTINCT" },
  { id:  2, lessonId:  1, question: "To rename a column in the output you use:", options: ["RENAME","AS","ALIAS","LABEL"], answer: "AS" },
  { id:  3, lessonId:  1, question: "Which correctly computes a 10% raise?", options: ["SELECT salary + 0.10 AS raised","SELECT salary * 1.10 AS raised FROM employees","SELECT RAISE(salary,0.10) FROM employees","SELECT salary, 10% FROM employees"], answer: "SELECT salary * 1.10 AS raised FROM employees" },

  // ── Lesson 2: WHERE
  { id:  4, lessonId:  2, question: "To check if a column has no value, you must write:", options: ["col = NULL","col == NULL","col IS NULL","ISNULL(col)"], answer: "col IS NULL" },
  { id:  5, lessonId:  2, question: "BETWEEN 60000 AND 80000 is equivalent to:", options: ["salary > 60000 AND salary < 80000","salary >= 60000 AND salary <= 80000","salary >= 60000 OR salary <= 80000","salary > 60000 OR salary < 80000"], answer: "salary >= 60000 AND salary <= 80000" },
  { id:  6, lessonId:  2, question: "Which LIKE pattern matches 'Johnson' but not 'Johns'?", options: ["J%","Johns%","%son","J_hnson"], answer: "%son" },

  // ── Lesson 3: ORDER BY
  { id:  7, lessonId:  3, question: "The default sort direction of ORDER BY is:", options: ["DESC","ASC","RANDOM","ALPHA"], answer: "ASC" },
  { id:  8, lessonId:  3, question: "LIMIT 5 OFFSET 10 returns:", options: ["The first 5 rows","Rows 6 through 10","Rows 11 through 15","The last 5 rows"], answer: "Rows 11 through 15" },
  { id:  9, lessonId:  3, question: "Sort by department ascending, then salary highest-first within each department:", options: ["ORDER BY dept, salary","ORDER BY dept ASC, salary DESC","ORDER BY salary DESC, dept ASC","ORDER BY dept DESC, salary ASC"], answer: "ORDER BY dept ASC, salary DESC" },

  // ── Lesson 4: Aggregates
  { id: 10, lessonId:  4, question: "The difference between COUNT(*) and COUNT(column) is:", options: ["No difference","COUNT(*) is always faster","COUNT(column) ignores NULL values","COUNT(*) ignores NULL values"], answer: "COUNT(column) ignores NULL values" },
  { id: 11, lessonId:  4, question: "AVG(salary) on a column containing NULLs will:", options: ["Return NULL","Include NULLs as 0","Ignore NULL values automatically","Throw an error"], answer: "Ignore NULL values automatically" },
  { id: 12, lessonId:  4, question: "Which function returns the largest value in a column?", options: ["GREATEST()","TOP()","MAX()","CEILING()"], answer: "MAX()" },

  // ── Lesson 5: GROUP BY
  { id: 13, lessonId:  5, question: "In a GROUP BY query, SELECT can contain:", options: ["Only aggregated columns","Only GROUP BY columns","GROUP BY columns and aggregated expressions","Any column in the table"], answer: "GROUP BY columns and aggregated expressions" },
  { id: 14, lessonId:  5, question: "What happens to NULL values in GROUP BY?", options: ["They are excluded","They cause an error","They form their own group","They are treated as 0"], answer: "They form their own group" },
  { id: 15, lessonId:  5, question: "To count employees per department: SELECT department_id, ___ FROM employees GROUP BY department_id", options: ["SUM(*)","COUNT(*)","TOTAL(*)","NUMBER(*)"], answer: "COUNT(*)" },

  // ── Lesson 6: HAVING
  { id: 16, lessonId:  6, question: "HAVING filters:", options: ["Rows before any grouping","Individual column values","Groups after GROUP BY","Nothing — it is identical to WHERE"], answer: "Groups after GROUP BY" },
  { id: 17, lessonId:  6, question: "A WHERE clause in a GROUP BY query filters rows:", options: ["After grouping","Before grouping","At the same time as HAVING","After ORDER BY"], answer: "Before grouping" },
  { id: 18, lessonId:  6, question: "Can you use COUNT(*) directly inside HAVING?", options: ["No, only in SELECT","Yes","Only COUNT, not other aggregates","Only inside subqueries"], answer: "Yes" },

  // ── Lesson 7: INNER JOIN
  { id: 19, lessonId:  7, question: "INNER JOIN returns:", options: ["All rows from the left table","All rows from both tables","Only rows with a match in both tables","All rows from the right table"], answer: "Only rows with a match in both tables" },
  { id: 20, lessonId:  7, question: "The ON clause in a JOIN:", options: ["Specifies which columns to SELECT","Defines the matching condition between tables","Filters rows after the join","Creates table aliases"], answer: "Defines the matching condition between tables" },
  { id: 21, lessonId:  7, question: "An employee with department_id = NULL in an INNER JOIN with departments will:", options: ["Appear with NULL department name","Not appear in the result","Cause an error","Always appear as the last row"], answer: "Not appear in the result" },

  // ── Lesson 8: LEFT JOIN
  { id: 22, lessonId:  8, question: "LEFT JOIN ensures:", options: ["Only matching rows appear","All left rows appear, NULLs for unmatched right","All right rows appear","Both tables have equal row counts"], answer: "All left rows appear, NULLs for unmatched right" },
  { id: 23, lessonId:  8, question: "The pattern to find employees with NO department assigned:", options: ["WHERE department_id IS NOT NULL","INNER JOIN then WHERE dept IS NULL","LEFT JOIN departments d, then WHERE d.id IS NULL","WHERE NOT EXISTS(departments)"], answer: "LEFT JOIN departments d, then WHERE d.id IS NULL" },
  { id: 24, lessonId:  8, question: "departments LEFT JOIN employees — departments with zero employees will:", options: ["Be excluded","Appear with NULL employee values","Cause an error","Automatically show 0 as count"], answer: "Appear with NULL employee values" },

  // ── Lesson 9: Multiple JOINs
  { id: 25, lessonId:  9, question: "A self-join requires:", options: ["A special SELF keyword","The same table with two different aliases","A recursive WITH clause","A subquery instead of a JOIN"], answer: "The same table with two different aliases" },
  { id: 26, lessonId:  9, question: "To get employee + manager name from the employees table:", options: ["JOIN employees ON id = manager_id","LEFT JOIN employees m ON e.manager_id = m.id","SELF JOIN on manager_id","JOIN managers ON manager_id"], answer: "LEFT JOIN employees m ON e.manager_id = m.id" },
  { id: 27, lessonId:  9, question: "Chaining three JOINs:", options: ["Replaces each previous JOIN","Adds each new table to the growing result","Requires a subquery for each JOIN","Must always use the same ON condition"], answer: "Adds each new table to the growing result" },

  // ── Lesson 10: Subqueries WHERE
  { id: 28, lessonId: 10, question: "WHERE id IN (subquery) returns rows where:", options: ["id equals every subquery value","id matches at least one subquery value","The subquery returns exactly one row","id is greater than the subquery result"], answer: "id matches at least one subquery value" },
  { id: 29, lessonId: 10, question: "If a NOT IN subquery returns any NULL values, the result will be:", options: ["Normal — NULLs are ignored","No rows returned","All rows returned","An error"], answer: "No rows returned" },
  { id: 30, lessonId: 10, question: "EXISTS checks whether:", options: ["A column is not NULL","The subquery returns at least one row","The count exceeds zero","A value is in a list"], answer: "The subquery returns at least one row" },

  // ── Lesson 11: Derived tables
  { id: 31, lessonId: 11, question: "A subquery in the FROM clause is called:", options: ["A virtual table","A derived table","A common table","A subselect"], answer: "A derived table" },
  { id: 32, lessonId: 11, question: "Using a subquery in FROM lets you:", options: ["Aggregate on top of aggregated results","Join without an ON clause","Replace the WHERE clause","Use the same table twice automatically"], answer: "Aggregate on top of aggregated results" },
  { id: 33, lessonId: 11, question: "A subquery used in FROM must always:", options: ["Start with SELECT *","Have only one column","Have an alias","Use GROUP BY"], answer: "Have an alias" },

  // ── Lesson 12: CASE
  { id: 34, lessonId: 12, question: "CASE...END in SQL is:", options: ["A control flow statement","An expression that returns a value","A type of JOIN","A function"], answer: "An expression that returns a value" },
  { id: 35, lessonId: 12, question: "COALESCE(a, b, c) returns:", options: ["The sum","The first non-NULL value","NULL if any value is NULL","The last value"], answer: "The first non-NULL value" },
  { id: 36, lessonId: 12, question: "CASE expressions can be used in:", options: ["SELECT only","SELECT and WHERE only","SELECT, ORDER BY, GROUP BY, and HAVING","Only inside aggregate functions"], answer: "SELECT, ORDER BY, GROUP BY, and HAVING" },

  // ── Lesson 13: CTEs
  { id: 37, lessonId: 13, question: "A CTE is introduced with the keyword:", options: ["DEFINE","DECLARE","WITH","CREATE TEMP"], answer: "WITH" },
  { id: 38, lessonId: 13, question: "Multiple CTEs in one WITH clause are separated by:", options: ["Semicolons","AND","Commas","OR"], answer: "Commas" },
  { id: 39, lessonId: 13, question: "CTEs are primarily valued because they:", options: ["Are faster than subqueries","Can be indexed","Make complex queries more readable","Work differently from subqueries"], answer: "Make complex queries more readable" },

  // ── Lesson 14: Window Functions
  { id: 40, lessonId: 14, question: "The key difference between RANK() and DENSE_RANK() is:", options: ["RANK is faster","DENSE_RANK skips numbers after ties","RANK skips numbers after ties (1,1,3…)","No difference"], answer: "RANK skips numbers after ties (1,1,3…)" },
  { id: 41, lessonId: 14, question: "PARTITION BY in a window function:", options: ["Filters rows from the result","Groups rows like GROUP BY does","Resets the window calculation per partition group","Sorts rows within the window"], answer: "Resets the window calculation per partition group" },
  { id: 42, lessonId: 14, question: "LAG(salary) OVER(ORDER BY salary) returns:", options: ["The next row's salary","The previous row's salary in the ordered set","The maximum salary","The running total"], answer: "The previous row's salary in the ordered set" },

  // ── Lesson 15: String & Date
  { id: 43, lessonId: 15, question: "SUBSTR('Hello World', 7, 5) returns:", options: ["'Hello'","'World'","'Hello '","' Worl'"], answer: "'World'" },
  { id: 44, lessonId: 15, question: "In SQLite, to extract the year from a date column:", options: ["YEAR(date_col)","EXTRACT(YEAR FROM date_col)","strftime('%Y', date_col)","date_col.year"], answer: "strftime('%Y', date_col)" },
  { id: 45, lessonId: 15, question: "LENGTH('SQL') returns:", options: ["2","3","4","0"], answer: "3" },
];
