# Product Inventory & Analytics Dashboard

## Project Overview
A browser-based college project that manages a product inventory and shows live analytics. Built with HTML5, CSS3 and vanilla JavaScript only. No frameworks, backend or external APIs.

## Features
- Starts with Laptop ($800), Mouse ($25), Monitor ($150), Keyboard ($75), Headphones ($120)
- Add products with a form (name + price) and delete them from the table
- Input validation with clear error messages
- Automatic category: Budget, Standard or Premium
- Analytics: total products, inventory value, average price, discount, tax, final total
- Affordable products list (price under $200)
- Formatted report list
- Case-insensitive name search (does not change the inventory)
- Table, analytics, affordable list and report refresh after every add or delete

## Technologies
HTML5, CSS3, JavaScript (ES6). Currency formatting uses `Intl.NumberFormat`.

## Folder Structure
```
product-inventory-dashboard/
├── index.html
├── style.css
├── script.js
└── README.md
```

## How to Run
- Double-click `index.html` to open it in a browser, or
- In VS Code, right-click `index.html` and choose **Open with Live Server**.

## Category Thresholds
| Category | Price |
|----------|-------|
| Budget   | below $100 |
| Standard | $100 to $499.99 |
| Premium  | $500 and above |

## Calculation Formulas
All results are rounded to cents. Discount is applied **before** tax.
- Inventory value = sum of all prices
- Average price = inventory value / number of products (0 if empty)
- Discount = inventory value x 5%
- Tax = (inventory value - discount) x 10%
- Final total = (inventory value - discount) + tax

Example with the starting data: value $1,170.00, discount $58.50, tax $111.15, final total $1,222.65.

Analytics, the affordable list and the report always use the full inventory, even while a search is active.

## Main JavaScript Concepts
- `const` for fixed values (rates, limits), `let` for changing state
- `Number()` converts form text to numbers; `Number.isFinite()` rejects NaN/Infinity
- `if...else if...else` in `validateProduct()`
- `switch(true)` in `getCategory()`
- `for` loop with `continue` (skip bad entries) and `break` (stop at the result limit of 50) in `findProducts()`
- Regular functions (`formatMoney`, `validateProduct`) and arrow functions (`getAffordable`, `buildReport`, `calculateStats`)
- Parameters, return values and local scope inside every function
- `forEach()` renders table rows and list items, `filter()` finds affordable products and deletes items, `map()` builds report lines, `reduce()` sums prices
- Safe DOM: `createElement` and `textContent` only (no `innerHTML`)

## Validation Rules
- Name cannot be blank (spaces are trimmed; max 50 characters)
- Price cannot be blank
- Price must be a valid number
- Price must be greater than 0 (zero and negative values are rejected)
- Price cannot exceed $1,000,000
- Decimals are allowed and rounded to 2 places (19.999 becomes $20.00)

## Testing Checklist
- [ ] Page opens with 5 products and correct analytics
- [ ] Add "Tablet" at 299.99: category Standard, all sections update
- [ ] Add prices 99.99 (Budget), 100 (Standard), 499.99 (Standard), 500 (Premium)
- [ ] Blank name, blank price, "abc", 0 and -5 show errors and add nothing
- [ ] Delete a product: table, analytics, affordable list and report update
- [ ] Delete all products: empty messages and zero analytics appear
- [ ] Search "mo" shows Mouse and Monitor; "zzz" shows "No products match your search."
- [ ] Clearing the search shows everything again
- [ ] Layout works on a narrow screen and buttons work with the keyboard

## Limitations
- Data is stored in memory only, so a page refresh resets the inventory
- No editing of existing products
- Duplicate product names are allowed
- Single currency (USD)

## Future Enhancements
- Save data with `localStorage`
- Edit products and sort the table
- Filter by category
- Export the report as CSV
