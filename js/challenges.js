/* =============================================================
   SQL TRAINER — INTERVIEW CHALLENGES
   Two realistic schemas (E-commerce, HR Analytics) with 12
   interview-level problems covering window functions, CTEs,
   correlated subqueries, self-joins, and set operations.
   ============================================================= */

// ── E-commerce Schema ──────────────────────────────────────────────────────────
const SCHEMA_ECOMMERCE = `
CREATE TABLE products (
  id       INTEGER PRIMARY KEY,
  name     TEXT    NOT NULL,
  category TEXT    NOT NULL,
  price    REAL    NOT NULL,
  stock    INTEGER NOT NULL
);

CREATE TABLE customers (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  country     TEXT NOT NULL,
  joined_date TEXT NOT NULL
);

CREATE TABLE orders (
  id           INTEGER PRIMARY KEY,
  customer_id  INTEGER NOT NULL REFERENCES customers(id),
  order_date   TEXT    NOT NULL,
  status       TEXT    NOT NULL,   -- 'completed' | 'pending' | 'cancelled'
  total_amount REAL    NOT NULL
);

CREATE TABLE order_items (
  id         INTEGER PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL,
  unit_price REAL    NOT NULL
);

INSERT INTO products VALUES
  (1,  'Laptop Pro 15"',      'Electronics', 1299.99, 45),
  (2,  'Wireless Headphones', 'Electronics',  149.99, 120),
  (3,  'USB-C Hub 7-in-1',    'Electronics',   49.99, 200),
  (4,  'Mechanical Keyboard', 'Electronics',  129.99,  85),
  (5,  '4K Monitor 27"',      'Electronics',  449.99,  30),
  (6,  'Ergonomic Chair',     'Furniture',    299.99,  20),
  (7,  'Standing Desk',       'Furniture',    599.99,  15),
  (8,  'Bookshelf 5-Tier',    'Furniture',    179.99,  25),
  (9,  'Notebook Set (5pk)',  'Stationery',    14.99, 500),
  (10, 'Ballpoint Pens 20pk', 'Stationery',    9.99,  800);

INSERT INTO customers VALUES
  (1,  'Alice Johnson',    'alice@email.com',    'USA',         '2023-01-15'),
  (2,  'Bob Smith',        'bob@email.com',      'UK',          '2023-03-22'),
  (3,  'Carlos Rivera',    'carlos@email.com',   'Mexico',      '2023-05-10'),
  (4,  'Diana Chen',       'diana@email.com',    'Canada',      '2023-06-01'),
  (5,  'Erik Andersen',    'erik@email.com',     'Denmark',     '2023-07-14'),
  (6,  'Fatima Al-Hassan', 'fatima@email.com',   'UAE',         '2023-08-20'),
  (7,  'George Taylor',    'george@email.com',   'USA',         '2023-09-05'),
  (8,  'Hannah Lee',       'hannah@email.com',   'South Korea', '2023-10-18'),
  (9,  'Ivan Petrov',      'ivan@email.com',     'Russia',      '2023-11-02'),
  (10, 'Julia Santos',     'julia@email.com',    'Brazil',      '2023-12-10'),
  (11, 'Kevin O''Brien',   'kevin@email.com',    'Ireland',     '2024-01-05'),
  (12, 'Laura Martinez',   'laura@email.com',    'Spain',       '2024-01-20');

INSERT INTO orders VALUES
  (1,  1,  '2024-01-05', 'completed', 1349.98),
  (2,  2,  '2024-01-08', 'completed',  149.99),
  (3,  3,  '2024-01-12', 'completed',  299.99),
  (4,  4,  '2024-01-15', 'completed',  449.99),
  (5,  5,  '2024-01-18', 'completed',  129.99),
  (6,  6,  '2024-01-22', 'completed',  599.99),
  (7,  7,  '2024-01-28', 'completed',   49.99),
  (8,  11, '2024-01-30', 'completed',  179.99),
  (9,  1,  '2024-02-03', 'completed',  129.99),
  (10, 2,  '2024-02-07', 'completed',  449.99),
  (11, 4,  '2024-02-10', 'completed',  299.99),
  (12, 6,  '2024-02-14', 'completed',  149.99),
  (13, 8,  '2024-02-19', 'completed', 1299.99),
  (14, 9,  '2024-02-23', 'cancelled',  179.99),
  (15, 10, '2024-02-27', 'completed',   49.99),
  (16, 4,  '2024-02-15', 'completed',   54.95),
  (17, 1,  '2024-03-02', 'completed', 1449.98),
  (18, 2,  '2024-03-09', 'completed',  599.99),
  (19, 3,  '2024-03-15', 'completed',  129.99),
  (20, 7,  '2024-03-10', 'completed',   44.97),
  (21, 11, '2024-03-20', 'completed',  449.99),
  (22, 12, '2024-03-25', 'completed',  299.99);

INSERT INTO order_items VALUES
  (1,  1,  1, 1, 1299.99),
  (2,  1,  3, 1,   49.99),
  (3,  2,  2, 1,  149.99),
  (4,  3,  6, 1,  299.99),
  (5,  4,  5, 1,  449.99),
  (6,  5,  4, 1,  129.99),
  (7,  6,  7, 1,  599.99),
  (8,  7,  3, 1,   49.99),
  (9,  8,  8, 1,  179.99),
  (10, 9,  4, 1,  129.99),
  (11, 10, 5, 1,  449.99),
  (12, 11, 6, 1,  299.99),
  (13, 12, 2, 1,  149.99),
  (14, 13, 1, 1, 1299.99),
  (15, 14, 8, 1,  179.99),
  (16, 15, 3, 1,   49.99),
  (17, 16, 9, 2,   14.99),
  (18, 16,10, 1,    9.99),
  (19, 17, 1, 1, 1299.99),
  (20, 17, 3, 3,   49.99),
  (21, 18, 7, 1,  599.99),
  (22, 19, 4, 1,  129.99),
  (23, 20, 9, 3,   14.99),
  (24, 20,10, 1,    9.99),
  (25, 21, 5, 1,  449.99),
  (26, 22, 6, 1,  299.99);
`;

// ── HR Analytics Schema ────────────────────────────────────────────────────────
const SCHEMA_HR = `
CREATE TABLE departments (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  location TEXT NOT NULL,
  budget   REAL NOT NULL
);

CREATE TABLE employees (
  id            INTEGER PRIMARY KEY,
  name          TEXT    NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  manager_id    INTEGER REFERENCES employees(id),
  hire_date     TEXT    NOT NULL,
  title         TEXT    NOT NULL
);

CREATE TABLE salaries (
  id          INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  amount      REAL    NOT NULL,
  from_date   TEXT    NOT NULL,
  to_date     TEXT            -- NULL means current salary
);

CREATE TABLE performance_reviews (
  id          INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  review_year INTEGER NOT NULL,
  score       INTEGER NOT NULL,  -- 1 (lowest) to 5 (highest)
  reviewer_id INTEGER NOT NULL REFERENCES employees(id)
);

INSERT INTO departments VALUES
  (1, 'Engineering',     'San Francisco', 2000000),
  (2, 'Product',         'New York',      1500000),
  (3, 'Sales',           'Chicago',       1200000),
  (4, 'Marketing',       'Austin',         800000),
  (5, 'Human Resources', 'Boston',         600000);

INSERT INTO employees VALUES
  (1,  'Alice Morgan',    1, NULL, '2019-03-01', 'CTO'),
  (2,  'Bob Chen',        1,    1, '2020-06-15', 'Senior Engineer'),
  (3,  'Carol Davis',     1,    1, '2021-01-10', 'Engineer'),
  (4,  'David Kim',       1,    2, '2022-08-22', 'Junior Engineer'),
  (5,  'Eva Rossi',       2, NULL, '2018-11-05', 'VP Product'),
  (6,  'Frank Liu',       2,    5, '2020-02-28', 'Product Manager'),
  (7,  'Grace Park',      2,    5, '2021-07-19', 'Product Manager'),
  (8,  'Henry Brown',     3, NULL, '2017-04-12', 'VP Sales'),
  (9,  'Iris Johnson',    3,    8, '2019-09-30', 'Sales Manager'),
  (10, 'Jack Wilson',     3,    9, '2021-03-15', 'Sales Representative'),
  (11, 'Karen Martinez',  4, NULL, '2020-05-20', 'Marketing Director'),
  (12, 'Leo Thompson',    4,   11, '2022-01-10', 'Marketing Analyst'),
  (13, 'Mia Anderson',    5, NULL, '2019-08-14', 'HR Director'),
  (14, 'Noah Garcia',     5,   13, '2021-11-25', 'HR Specialist'),
  (15, 'Olivia White',    1,    2, '2023-02-01', 'Engineer');

INSERT INTO salaries VALUES
  (1,  1,  180000, '2019-03-01', '2021-12-31'),
  (2,  1,  195000, '2022-01-01', '2023-12-31'),
  (3,  1,  210000, '2024-01-01', NULL),
  (4,  2,  120000, '2020-06-15', '2022-12-31'),
  (5,  2,  145000, '2023-01-01', '2023-12-31'),
  (6,  2,  160000, '2024-01-01', NULL),
  (7,  3,  110000, '2021-01-10', '2022-12-31'),
  (8,  3,  130000, '2023-01-01', '2023-12-31'),
  (9,  3,  145000, '2024-01-01', NULL),
  (10, 4,  130000, '2022-08-22', '2023-12-31'),
  (11, 4,  175000, '2024-01-01', NULL),
  (12, 5,  160000, '2018-11-05', '2021-12-31'),
  (13, 5,  180000, '2022-01-01', '2023-12-31'),
  (14, 5,  195000, '2024-01-01', NULL),
  (15, 6,  115000, '2020-02-28', '2022-12-31'),
  (16, 6,  130000, '2023-01-01', '2023-12-31'),
  (17, 6,  140000, '2024-01-01', NULL),
  (18, 7,  115000, '2021-07-19', '2023-12-31'),
  (19, 7,  138000, '2024-01-01', NULL),
  (20, 8,  155000, '2017-04-12', '2021-12-31'),
  (21, 8,  170000, '2022-01-01', '2023-12-31'),
  (22, 8,  185000, '2024-01-01', NULL),
  (23, 9,   85000, '2019-09-30', '2022-12-31'),
  (24, 9,  100000, '2023-01-01', '2023-12-31'),
  (25, 9,  110000, '2024-01-01', NULL),
  (26, 10,  90000, '2021-03-15', '2022-12-31'),
  (27, 10, 110000, '2023-01-01', '2023-12-31'),
  (28, 10, 125000, '2024-01-01', NULL),
  (29, 11, 125000, '2020-05-20', '2022-12-31'),
  (30, 11, 140000, '2023-01-01', '2023-12-31'),
  (31, 11, 155000, '2024-01-01', NULL),
  (32, 12,  70000, '2022-01-10', '2023-12-31'),
  (33, 12,  85000, '2024-01-01', NULL),
  (34, 13, 105000, '2019-08-14', '2022-12-31'),
  (35, 13, 118000, '2023-01-01', '2023-12-31'),
  (36, 13, 130000, '2024-01-01', NULL),
  (37, 14,  60000, '2021-11-25', '2023-12-31'),
  (38, 14,  75000, '2024-01-01', NULL),
  (39, 15, 120000, '2023-02-01', '2023-12-31'),
  (40, 15, 140000, '2024-01-01', NULL);

INSERT INTO performance_reviews VALUES
  (1,  1,  2021, 4, 5), (2,  1,  2022, 5, 5), (3,  1,  2023, 5, 5), (4,  1,  2024, 4, 5),
  (5,  2,  2021, 3, 1), (6,  2,  2022, 4, 1), (7,  2,  2023, 4, 1), (8,  2,  2024, 5, 1),
  (9,  3,  2021, 3, 1), (10, 3,  2022, 3, 1), (11, 3,  2023, 3, 1), (12, 3,  2024, 4, 1),
  (13, 4,  2022, 4, 2), (14, 4,  2023, 4, 2), (15, 4,  2024, 5, 2),
  (16, 5,  2021, 5, 1), (17, 5,  2022, 4, 1), (18, 5,  2023, 5, 1), (19, 5,  2024, 5, 1),
  (20, 6,  2021, 3, 5), (21, 6,  2022, 3, 5), (22, 6,  2023, 3, 5), (23, 6,  2024, 4, 5),
  (24, 7,  2021, 3, 5), (25, 7,  2022, 4, 5), (26, 7,  2023, 4, 5), (27, 7,  2024, 5, 5),
  (28, 8,  2021, 3, 1), (29, 8,  2022, 4, 1), (30, 8,  2023, 3, 1), (31, 8,  2024, 4, 1),
  (32, 9,  2021, 4, 8), (33, 9,  2022, 4, 8), (34, 9,  2023, 5, 8), (35, 9,  2024, 5, 8),
  (36, 10, 2021, 3, 8), (37, 10, 2022, 4, 8), (38, 10, 2023, 4, 8), (39, 10, 2024, 5, 8),
  (40, 11, 2021, 4, 1), (41, 11, 2022, 4, 1), (42, 11, 2023, 4, 1), (43, 11, 2024, 5, 1),
  (44, 12, 2022, 3,11), (45, 12, 2023, 3,11), (46, 12, 2024, 4,11),
  (47, 13, 2021, 4, 1), (48, 13, 2022, 3, 1), (49, 13, 2023, 4, 1), (50, 13, 2024, 4, 1),
  (51, 14, 2021, 3,13), (52, 14, 2022, 3,13), (53, 14, 2023, 3,13), (54, 14, 2024, 4,13),
  (55, 15, 2023, 4, 2), (56, 15, 2024, 5, 2);
`;

// ── Schema metadata for the schema modal ──────────────────────────────────────
const CHALLENGE_SCHEMA_INFO = {
  ecommerce: {
    label: 'E-commerce',
    color: '#3b82f6',
    tables: [
      { name: 'customers',   columns: ['id PK', 'name', 'email', 'country', 'joined_date'] },
      { name: 'orders',      columns: ['id PK', 'customer_id → customers', 'order_date', 'status', 'total_amount'] },
      { name: 'order_items', columns: ['id PK', 'order_id → orders', 'product_id → products', 'quantity', 'unit_price'] },
      { name: 'products',    columns: ['id PK', 'name', 'category', 'price', 'stock'] },
    ],
    summary: '12 customers · 22 orders · 26 order items · 10 products',
  },
  hr: {
    label: 'HR Analytics',
    color: '#10b981',
    tables: [
      { name: 'departments',         columns: ['id PK', 'name', 'location', 'budget'] },
      { name: 'employees',           columns: ['id PK', 'name', 'department_id → departments', 'manager_id → employees', 'hire_date', 'title'] },
      { name: 'salaries',            columns: ['id PK', 'employee_id → employees', 'amount', 'from_date', 'to_date (NULL = current)'] },
      { name: 'performance_reviews', columns: ['id PK', 'employee_id → employees', 'review_year', 'score (1–5)', 'reviewer_id → employees'] },
    ],
    summary: '5 departments · 15 employees · 40 salary records · 56 performance reviews',
  },
};

const CHALLENGE_SCHEMAS = {
  ecommerce: SCHEMA_ECOMMERCE,
  hr: SCHEMA_HR,
};

// ── Challenges ─────────────────────────────────────────────────────────────────
const CHALLENGES = [

  // ── E-commerce ─────────────────────────────────────────────────────────────

  {
    id: 'ec1',
    schema: 'ecommerce',
    title: 'Top Customers by Revenue',
    difficulty: 'medium',
    company_hint: 'Amazon / Shopify',
    tags: ['GROUP BY', 'SUM', 'ORDER BY', 'LIMIT', 'JOIN'],
    description: `
      <h2>Top Customers by Revenue</h2>
      <p><strong>Scenario:</strong> You're a data analyst at an e-commerce company.
      The marketing team is launching a VIP loyalty program and needs to identify
      the highest-spending customers to offer them early access.</p>
      <p><strong>Task:</strong> Return the <strong>top 5 customers</strong> ranked by
      total amount spent on <strong>completed orders only</strong>.
      Show their name and total spend, sorted from highest to lowest.</p>
      <p><strong>Expected columns:</strong> <code>name</code>, <code>total_spent</code></p>
      <p><em>Tip: Round total_spent to 2 decimal places.</em></p>
    `,
    hint: 'JOIN customers to orders, filter WHERE status = \'completed\', GROUP BY customer, SUM the total_amount, then ORDER BY and LIMIT.',
    solution: `
SELECT c.name,
       ROUND(SUM(o.total_amount), 2) AS total_spent
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'completed'
GROUP BY c.id, c.name
ORDER BY total_spent DESC
LIMIT 5;`,
  },

  {
    id: 'ec2',
    schema: 'ecommerce',
    title: 'Monthly Revenue Breakdown',
    difficulty: 'medium',
    company_hint: 'Stripe / Shopify',
    tags: ['strftime', 'GROUP BY', 'SUM', 'COUNT'],
    description: `
      <h2>Monthly Revenue Breakdown</h2>
      <p><strong>Scenario:</strong> Your finance team needs a monthly revenue report
      for Q1 2024 to present at the board meeting. They want to see revenue and
      order volume side-by-side.</p>
      <p><strong>Task:</strong> For each month in the dataset, return the month,
      total revenue from <strong>completed orders</strong>, and the number of
      completed orders. Sort by month ascending.</p>
      <p><strong>Expected columns:</strong> <code>month</code>, <code>revenue</code>, <code>order_count</code></p>
      <p><em>Tip: Use <code>strftime('%Y-%m', order_date)</code> to extract the month.
      Round revenue to 2 decimal places.</em></p>
    `,
    hint: 'Use strftime(\'%Y-%m\', order_date) AS month, then GROUP BY month. Filter completed orders. COUNT(*) gives order_count.',
    solution: `
SELECT strftime('%Y-%m', order_date) AS month,
       ROUND(SUM(total_amount), 2)   AS revenue,
       COUNT(*)                      AS order_count
FROM orders
WHERE status = 'completed'
GROUP BY month
ORDER BY month;`,
  },

  {
    id: 'ec3',
    schema: 'ecommerce',
    title: 'Lost Customers (Jan → Feb)',
    difficulty: 'hard',
    company_hint: 'Meta / HubSpot',
    tags: ['NOT EXISTS', 'subquery', 'set difference', 'strftime'],
    description: `
      <h2>Lost Customers (Jan → Feb)</h2>
      <p><strong>Scenario:</strong> The retention team wants to run a win-back campaign.
      They need a list of customers who placed a <strong>completed order in January 2024</strong>
      but did <strong>not</strong> place any completed order in <strong>February 2024</strong>.
      These are customers who churned after their first purchase month.</p>
      <p><strong>Task:</strong> Return the names of customers who ordered (completed) in
      January 2024 but not in February 2024, sorted alphabetically.</p>
      <p><strong>Expected columns:</strong> <code>name</code></p>
    `,
    hint: 'Use a NOT EXISTS (or NOT IN) subquery: find customers with a completed Jan order where no completed Feb order exists for the same customer.',
    solution: `
SELECT DISTINCT c.name
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE strftime('%Y-%m', o.order_date) = '2024-01'
  AND o.status = 'completed'
  AND c.id NOT IN (
    SELECT DISTINCT customer_id
    FROM orders
    WHERE strftime('%Y-%m', order_date) = '2024-02'
      AND status = 'completed'
  )
ORDER BY c.name;`,
  },

  {
    id: 'ec4',
    schema: 'ecommerce',
    title: 'Running Total of Daily Revenue',
    difficulty: 'hard',
    company_hint: 'Google / Stripe',
    tags: ['SUM() OVER', 'window function', 'GROUP BY', 'ORDER BY'],
    description: `
      <h2>Running Total of Daily Revenue</h2>
      <p><strong>Scenario:</strong> The CEO wants a cumulative revenue chart for Q1 2024
      to visualize growth momentum. Your job is to produce the data behind that chart.</p>
      <p><strong>Task:</strong> For each day that had at least one completed order,
      return the date, the revenue for that day, and the running (cumulative) total
      revenue up to and including that day. Sort by date ascending.</p>
      <p><strong>Expected columns:</strong> <code>order_date</code>, <code>daily_revenue</code>, <code>running_total</code></p>
      <p><em>Tip: Use <code>SUM(SUM(...)) OVER (ORDER BY ...)</code> — a window function
      applied to an already-aggregated column.</em></p>
    `,
    hint: 'First GROUP BY order_date to get daily totals. Then apply SUM(...) OVER (ORDER BY order_date) as a window function on top of that aggregated value.',
    solution: `
SELECT order_date,
       ROUND(SUM(total_amount), 2)                                     AS daily_revenue,
       ROUND(SUM(SUM(total_amount)) OVER (ORDER BY order_date), 2)     AS running_total
FROM orders
WHERE status = 'completed'
GROUP BY order_date
ORDER BY order_date;`,
  },

  {
    id: 'ec5',
    schema: 'ecommerce',
    title: 'Top-Selling Product per Category',
    difficulty: 'hard',
    company_hint: 'Amazon / eBay',
    tags: ['RANK() OVER', 'PARTITION BY', 'CTE', 'JOIN'],
    description: `
      <h2>Top-Selling Product per Category</h2>
      <p><strong>Scenario:</strong> The merchandising team wants to feature one
      "best-seller" product per category on the homepage. Best-seller is defined
      as the product with the <strong>highest total revenue</strong> (quantity × unit_price)
      across all <strong>completed orders</strong>.</p>
      <p><strong>Task:</strong> For each product category, return the category name,
      the best-selling product name, and its total revenue. One row per category.</p>
      <p><strong>Expected columns:</strong> <code>category</code>, <code>product_name</code>, <code>revenue</code></p>
      <p><em>Tip: Use a CTE to compute revenue per product, then apply
      <code>RANK() OVER (PARTITION BY category ORDER BY revenue DESC)</code>
      to pick the winner in each category.</em></p>
    `,
    hint: 'Step 1: JOIN order_items → orders → products, filter completed, GROUP BY product to get revenue. Step 2: RANK() OVER (PARTITION BY category ORDER BY revenue DESC). Step 3: WHERE rank = 1.',
    solution: `
WITH product_revenue AS (
  SELECT p.category,
         p.name                             AS product_name,
         ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
  FROM order_items oi
  JOIN orders  o ON o.id  = oi.order_id
  JOIN products p ON p.id = oi.product_id
  WHERE o.status = 'completed'
  GROUP BY p.id, p.name, p.category
),
ranked AS (
  SELECT *,
         RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rnk
  FROM product_revenue
)
SELECT category, product_name, revenue
FROM ranked
WHERE rnk = 1
ORDER BY category;`,
  },

  {
    id: 'ec6',
    schema: 'ecommerce',
    title: 'Month-over-Month Revenue Change',
    difficulty: 'very-hard',
    company_hint: 'Stripe / Shopify',
    tags: ['LAG()', 'CTE', 'window function', 'arithmetic'],
    description: `
      <h2>Month-over-Month Revenue Change</h2>
      <p><strong>Scenario:</strong> The VP of Finance asks: "Are we growing or
      shrinking month over month?" They want to see the percentage change in
      revenue from the previous month for each month in the dataset.</p>
      <p><strong>Task:</strong> For each month (except the first), return the month,
      its revenue, the previous month's revenue, and the percentage change
      rounded to 2 decimal places. Sort by month ascending.</p>
      <p><strong>Expected columns:</strong>
      <code>month</code>, <code>revenue</code>, <code>prev_revenue</code>, <code>pct_change</code></p>
      <p><em>Tip: Use a CTE to compute monthly revenue, then apply
      <code>LAG(revenue) OVER (ORDER BY month)</code> to access the previous row.
      Percentage change = <code>(revenue - prev) * 100.0 / prev</code>.</em></p>
    `,
    hint: 'CTE 1: monthly revenue with strftime + GROUP BY. CTE 2: add LAG(revenue) OVER (ORDER BY month). Final SELECT: filter WHERE prev_revenue IS NOT NULL and compute the pct_change.',
    solution: `
WITH monthly AS (
  SELECT strftime('%Y-%m', order_date)  AS month,
         ROUND(SUM(total_amount), 2)    AS revenue
  FROM orders
  WHERE status = 'completed'
  GROUP BY month
),
with_lag AS (
  SELECT month,
         revenue,
         LAG(revenue) OVER (ORDER BY month) AS prev_revenue
  FROM monthly
)
SELECT month,
       revenue,
       prev_revenue,
       ROUND((revenue - prev_revenue) * 100.0 / prev_revenue, 2) AS pct_change
FROM with_lag
WHERE prev_revenue IS NOT NULL
ORDER BY month;`,
  },

  // ── HR Analytics ───────────────────────────────────────────────────────────

  {
    id: 'hr1',
    schema: 'hr',
    title: 'Department Headcount & Average Salary',
    difficulty: 'medium',
    company_hint: 'LinkedIn / Workday',
    tags: ['GROUP BY', 'COUNT', 'AVG', 'JOIN', 'ROUND'],
    description: `
      <h2>Department Headcount & Average Salary</h2>
      <p><strong>Scenario:</strong> HR is preparing a workforce report for the
      executive team. They need a department-by-department breakdown of headcount
      and average <strong>current</strong> salary (i.e., the salary record where
      <code>to_date IS NULL</code>).</p>
      <p><strong>Task:</strong> Return each department's name, number of employees,
      and average current salary. Sort by average salary descending.</p>
      <p><strong>Expected columns:</strong> <code>department</code>, <code>headcount</code>, <code>avg_salary</code></p>
      <p><em>Tip: Round avg_salary to 2 decimal places. Join employees to salaries
      filtering to current salaries only.</em></p>
    `,
    hint: 'JOIN departments → employees → salaries (WHERE to_date IS NULL). GROUP BY department. COUNT(e.id) and ROUND(AVG(s.amount), 2).',
    solution: `
SELECT d.name                       AS department,
       COUNT(e.id)                  AS headcount,
       ROUND(AVG(s.amount), 2)      AS avg_salary
FROM departments d
JOIN employees e ON e.department_id = d.id
JOIN salaries  s ON s.employee_id   = e.id AND s.to_date IS NULL
GROUP BY d.id, d.name
ORDER BY avg_salary DESC;`,
  },

  {
    id: 'hr2',
    schema: 'hr',
    title: 'Employees Above Department Average',
    difficulty: 'hard',
    company_hint: 'Google / Meta',
    tags: ['correlated subquery', 'AVG', 'JOIN', 'WHERE'],
    description: `
      <h2>Employees Above Department Average</h2>
      <p><strong>Scenario:</strong> The compensation team is conducting an equity
      review. They want to identify employees whose <strong>current salary</strong>
      is above the average current salary for their own department — these may be
      candidates for a salary adjustment review.</p>
      <p><strong>Task:</strong> Return each qualifying employee's name, department,
      and current salary. Sort by department name, then salary descending.</p>
      <p><strong>Expected columns:</strong> <code>name</code>, <code>department</code>, <code>salary</code></p>
    `,
    hint: 'Use a correlated subquery in the WHERE clause: WHERE s.amount > (SELECT AVG(s2.amount) FROM employees e2 JOIN salaries s2 ... WHERE e2.department_id = e.department_id AND s2.to_date IS NULL).',
    solution: `
SELECT e.name,
       d.name   AS department,
       s.amount AS salary
FROM employees   e
JOIN departments d ON d.id = e.department_id
JOIN salaries    s ON s.employee_id = e.id AND s.to_date IS NULL
WHERE s.amount > (
  SELECT AVG(s2.amount)
  FROM employees e2
  JOIN salaries  s2 ON s2.employee_id = e2.id AND s2.to_date IS NULL
  WHERE e2.department_id = e.department_id
)
ORDER BY d.name, s.amount DESC;`,
  },

  {
    id: 'hr3',
    schema: 'hr',
    title: 'Employees Earning More Than Their Manager',
    difficulty: 'hard',
    company_hint: 'Amazon / Microsoft',
    tags: ['self-join', 'JOIN', 'WHERE', 'comparison'],
    description: `
      <h2>Employees Earning More Than Their Manager</h2>
      <p><strong>Scenario:</strong> A classic interview question — and a real
      compensation anomaly to detect. Some individual contributors can earn more
      than their direct manager due to specialized skills or market adjustments.</p>
      <p><strong>Task:</strong> Find all employees whose <strong>current salary</strong>
      is strictly greater than their direct manager's current salary. Return the
      employee's name, manager's name, employee salary, and manager salary.
      Sort by employee name.</p>
      <p><strong>Expected columns:</strong>
      <code>employee</code>, <code>manager</code>, <code>employee_salary</code>, <code>manager_salary</code></p>
    `,
    hint: 'Self-join the employees table: JOIN employees manager ON manager.id = employee.manager_id. Then JOIN salaries twice — once for the employee, once for the manager. Compare amounts.',
    solution: `
SELECT e.name   AS employee,
       m.name   AS manager,
       se.amount AS employee_salary,
       sm.amount AS manager_salary
FROM employees e
JOIN employees m  ON m.id  = e.manager_id
JOIN salaries  se ON se.employee_id = e.id AND se.to_date IS NULL
JOIN salaries  sm ON sm.employee_id = m.id AND sm.to_date IS NULL
WHERE se.amount > sm.amount
ORDER BY e.name;`,
  },

  {
    id: 'hr4',
    schema: 'hr',
    title: 'Second Highest Salary',
    difficulty: 'hard',
    company_hint: 'LeetCode #176 / Google',
    tags: ['DENSE_RANK()', 'CTE', 'DISTINCT', 'subquery'],
    description: `
      <h2>Second Highest Salary</h2>
      <p><strong>Scenario:</strong> A staple of SQL interviews at every level.
      Find the second highest <strong>distinct</strong> current salary across all employees.
      If there is no second highest salary, return NULL.</p>
      <p><strong>Task:</strong> Return a single row with a single column containing
      the second highest distinct salary from all current salary records.</p>
      <p><strong>Expected columns:</strong> <code>second_highest_salary</code></p>
      <p><em>Tip: Two valid approaches — (1) use <code>DENSE_RANK()</code> in a CTE,
      or (2) use a subquery with <code>MAX(amount) WHERE amount &lt; (SELECT MAX(amount)...)</code>.</em></p>
    `,
    hint: 'CTE approach: SELECT DISTINCT amount, DENSE_RANK() OVER (ORDER BY amount DESC) AS rnk FROM salaries WHERE to_date IS NULL — then SELECT amount WHERE rnk = 2.',
    solution: `
WITH ranked AS (
  SELECT DISTINCT amount,
         DENSE_RANK() OVER (ORDER BY amount DESC) AS rnk
  FROM salaries
  WHERE to_date IS NULL
)
SELECT amount AS second_highest_salary
FROM ranked
WHERE rnk = 2;`,
  },

  {
    id: 'hr5',
    schema: 'hr',
    title: 'Salary Growth: First vs Current',
    difficulty: 'hard',
    company_hint: 'Workday / Rippling',
    tags: ['ROW_NUMBER()', 'CTE', 'PARTITION BY', 'arithmetic'],
    description: `
      <h2>Salary Growth: First vs Current</h2>
      <p><strong>Scenario:</strong> The People Analytics team wants to measure
      salary growth for each employee — from their starting salary when they
      joined to their current salary. This helps identify who has grown the most.</p>
      <p><strong>Task:</strong> For each employee, return their name, starting salary
      (earliest <code>from_date</code>), current salary (<code>to_date IS NULL</code>),
      and the percentage increase rounded to 1 decimal place.
      Sort by percentage increase descending.</p>
      <p><strong>Expected columns:</strong>
      <code>name</code>, <code>starting_salary</code>, <code>current_salary</code>, <code>pct_increase</code></p>
      <p><em>Tip: Use <code>ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY from_date ASC)</code>
      in a CTE to identify each employee's first salary record.</em></p>
    `,
    hint: 'CTE 1: ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY from_date ASC) to find first salary. CTE 2 or filter: to_date IS NULL for current salary. Join both to employees.',
    solution: `
WITH first_salary AS (
  SELECT employee_id,
         amount,
         ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY from_date ASC) AS rn
  FROM salaries
),
current_salary AS (
  SELECT employee_id, amount
  FROM salaries
  WHERE to_date IS NULL
)
SELECT e.name,
       f.amount                                                AS starting_salary,
       c.amount                                                AS current_salary,
       ROUND((c.amount - f.amount) * 100.0 / f.amount, 1)     AS pct_increase
FROM employees e
JOIN first_salary  f ON f.employee_id = e.id AND f.rn = 1
JOIN current_salary c ON c.employee_id = e.id
ORDER BY pct_increase DESC;`,
  },

  {
    id: 'hr6',
    schema: 'hr',
    title: 'Top Performer per Department (Tenured Only)',
    difficulty: 'very-hard',
    company_hint: 'Google / Stripe',
    tags: ['CTE', 'RANK() OVER', 'PARTITION BY', 'julianday', 'JOIN'],
    description: `
      <h2>Top Performer per Department (Tenured Only)</h2>
      <p><strong>Scenario:</strong> The annual performance bonus pool is reserved for
      "tenured top performers" — employees who have been with the company for
      <strong>at least 2 years</strong> as of 2023-12-31, and who received the
      <strong>highest performance score in 2023</strong> within their department.</p>
      <p><strong>Task:</strong> For each department, return the department name,
      the name of the top-scoring tenured employee(s) in 2023, and their score.
      Sort by department name. If two employees tie for the top score, include both.</p>
      <p><strong>Expected columns:</strong> <code>department</code>, <code>employee</code>, <code>score</code></p>
      <p><em>Tip: Step 1 — CTE for tenured employees using
      <code>julianday('2023-12-31') - julianday(hire_date) &gt;= 730</code>.
      Step 2 — <code>RANK() OVER (PARTITION BY department_id ORDER BY score DESC)</code>
      applied to 2023 reviews of tenured employees. Step 3 — filter rank = 1.</em></p>
    `,
    hint: 'CTE 1: tenured employees (julianday diff >= 730). CTE 2: JOIN tenured to performance_reviews WHERE review_year = 2023, then RANK() OVER (PARTITION BY department_id ORDER BY score DESC). CTE 3: filter rnk = 1. Final: JOIN to departments.',
    solution: `
WITH tenured AS (
  SELECT id, name, department_id
  FROM employees
  WHERE julianday('2023-12-31') - julianday(hire_date) >= 730
),
ranked_reviews AS (
  SELECT t.department_id,
         t.name  AS employee_name,
         pr.score,
         RANK() OVER (PARTITION BY t.department_id ORDER BY pr.score DESC) AS rnk
  FROM performance_reviews pr
  JOIN tenured t ON t.id = pr.employee_id
  WHERE pr.review_year = 2023
)
SELECT d.name  AS department,
       rr.employee_name AS employee,
       rr.score
FROM ranked_reviews rr
JOIN departments d ON d.id = rr.department_id
WHERE rr.rnk = 1
ORDER BY d.name;`,
  },

];
