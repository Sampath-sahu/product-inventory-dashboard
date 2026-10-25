// Product Inventory & Analytics Dashboard
// Vanilla JavaScript only. Sections: constants, state, logic, rendering, events.

// ===== Constants (const: values that never change) =====
const TAX_RATE = 0.10;          // 10% tax
const DISCOUNT_RATE = 0.05;     // 5% discount
const AFFORDABLE_LIMIT = 200;   // "affordable" means price < $200
const MAX_PRICE = 1000000;      // upper limit to keep numbers sensible
const MAX_RESULTS = 50;         // search stops after this many matches
const moneyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// ===== State (let: values that change) =====
let inventory = [
  { id: 1, name: "Laptop", price: 800 },
  { id: 2, name: "Mouse", price: 25 },
  { id: 3, name: "Monitor", price: 150 },
  { id: 4, name: "Keyboard", price: 75 },
  { id: 5, name: "Headphones", price: 120 }
];
let nextId = 6;
let searchTerm = "";

// ===== Logic (no DOM access, easy to test) =====

// Regular function: formats a number as USD.
function formatMoney(value) {
  return moneyFormatter.format(value);
}

// Rounds to 2 decimals (cents) to avoid floating-point errors like 0.1 + 0.2.
function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

// Assigns a category with switch(true): the first matching case wins.
function getCategory(price) {
  switch (true) {
    case price < 100:
      return "Budget";
    case price < 500:
      return "Standard";   // $100 to $499.99
    default:
      return "Premium";    // $500 and above
  }
}

// Validates form input with if...else. Returns { valid, error } or { valid, name, price }.
function validateProduct(rawName, rawPrice) {
  const name = rawName.trim();
  const priceText = rawPrice.trim();
  const price = roundCents(Number(priceText)); // Number("abc") is NaN

  if (name === "") {
    return { valid: false, error: "Product name cannot be blank." };
  } else if (priceText === "") {
    return { valid: false, error: "Enter a price." };
  } else if (!Number.isFinite(price)) {
    return { valid: false, error: "Price must be a valid number, e.g. 49.99." };
  } else if (price <= 0) {
    return { valid: false, error: "Price must be at least $0.01 (no zero or negative prices)." };
  } else if (price > MAX_PRICE) {
    return { valid: false, error: "Price cannot be more than " + formatMoney(MAX_PRICE) + "." };
  } else {
    return { valid: true, name: name, price: price };
  }
}

// Search with a for loop. Returns a NEW array; the original inventory is never changed.
function findProducts(items, term) {
  const query = term.trim().toLowerCase();
  const results = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item || typeof item.name !== "string" || item.name === "") {
      continue;                          // continue: skip bad or missing entries
    }
    if (query === "" || item.name.toLowerCase().includes(query)) {
      results.push(item);
    }
    if (results.length === MAX_RESULTS) {
      break;                             // break: stop early once the result limit is reached
    }
  }
  return results;
}

// Arrow functions with parameters and return values.
const getAffordable = (items) => items.filter((p) => p.price < AFFORDABLE_LIMIT);
const buildReport = (items) => items.map((p) => p.name.toUpperCase() + ": " + formatMoney(p.price));

// Discount is applied FIRST, then tax is charged on the discounted amount.
const calculateStats = (items) => {
  const count = items.length;
  const total = roundCents(items.reduce((sum, p) => sum + p.price, 0));
  const average = count > 0 ? roundCents(total / count) : 0;
  const discount = roundCents(total * DISCOUNT_RATE);
  const afterDiscount = roundCents(total - discount);
  const tax = roundCents(afterDiscount * TAX_RATE);
  const finalTotal = roundCents(afterDiscount + tax);
  return { count, total, average, discount, tax, finalTotal };
};

// ===== Rendering (safe DOM: createElement + textContent only) =====
const byId = (id) => document.getElementById(id);

function addCell(row, text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  row.appendChild(cell);
}

function renderTable() {
  const body = byId("inventory-body");
  body.textContent = "";
  const visible = findProducts(inventory, searchTerm);

  if (visible.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "empty";
    cell.textContent = inventory.length === 0
      ? "Inventory is empty. Add a product above."
      : "No products match your search.";
    row.appendChild(cell);
    body.appendChild(row);
    return;
  }

  visible.forEach((product) => {
    const row = document.createElement("tr");
    addCell(row, product.name);
    addCell(row, formatMoney(product.price));
    addCell(row, getCategory(product.price));

    const actionCell = document.createElement("td");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "delete";
    button.textContent = "Delete";
    button.setAttribute("aria-label", "Delete " + product.name);
    button.addEventListener("click", () => deleteProduct(product.id));
    actionCell.appendChild(button);
    row.appendChild(actionCell);
    body.appendChild(row);
  });
}

function renderStats() {
  const s = calculateStats(inventory);
  byId("stat-count").textContent = s.count;
  byId("stat-total").textContent = formatMoney(s.total);
  byId("stat-average").textContent = formatMoney(s.average);
  byId("stat-discount").textContent = formatMoney(s.discount);
  byId("stat-tax").textContent = formatMoney(s.tax);
  byId("stat-final").textContent = formatMoney(s.finalTotal);
}

// Fills a <ul> with text lines, or one message if the list is empty.
function renderList(listId, lines, emptyText) {
  const list = byId(listId);
  list.textContent = "";
  const entries = lines.length > 0 ? lines : [emptyText];
  entries.forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    list.appendChild(li);
  });
}

// Called after every add or delete so the whole page stays in sync.
function renderAll() {
  renderTable();
  renderStats();
  renderList("affordable-list",
    getAffordable(inventory).map((p) => p.name + " (" + formatMoney(p.price) + ")"),
    "No affordable products.");
  renderList("report-list", buildReport(inventory), "No products to report.");
}

function showMessage(text, type) {
  const message = byId("message");
  message.textContent = text;
  message.className = type;
}

// ===== Actions =====
function deleteProduct(id) {
  const removed = inventory.find((p) => p.id === id);
  inventory = inventory.filter((p) => p.id !== id);
  showMessage(removed ? removed.name + " deleted." : "", "success");
  renderAll();
}

function handleSubmit(event) {
  event.preventDefault();                       // stop the page from reloading
  const result = validateProduct(byId("product-name").value, byId("product-price").value);

  if (!result.valid) {
    showMessage(result.error, "error");
    return;
  }
  inventory.push({ id: nextId++, name: result.name, price: result.price });
  showMessage(result.name + " added as " + getCategory(result.price) + ".", "success");
  byId("product-form").reset();
  byId("search").value = "";                    // clear search so the new item is visible
  searchTerm = "";
  byId("product-name").focus();
  renderAll();
}

function init() {
  byId("product-form").addEventListener("submit", handleSubmit);
  byId("search").addEventListener("input", (event) => {
    searchTerm = event.target.value;
    renderTable();
  });
  renderAll();
}

// Run in the browser; export functions when loaded by Node (for testing only).
if (typeof document !== "undefined") {
  init();
}
if (typeof module !== "undefined") {
  module.exports = { getCategory, validateProduct, findProducts, calculateStats, getAffordable, buildReport, formatMoney };
}
