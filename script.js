// ------------------------------
// SAFE STATE INITIALISATION
// ------------------------------

let tripData = {
    cruiseLine: "",
    ship: "",
    departDate: "",
    allowanceKg: 23,
    categories: []
};

let templates = [];

// ------------------------------
// CRUISE ICONS
// ------------------------------

const cruiseIcons = {
    ncl: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Norwegian_Cruise_Line_logo.svg/256px-Norwegian_Cruise_Line_logo.svg.png",
    msc: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/MSC_Cruises_logo.svg/256px-MSC_Cruises_logo.svg.png",
    royal: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/Royal_Caribbean_International_logo.svg/256px-Royal_Caribbean_International_logo.svg.png",
    po: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7f/P%26O_Cruises_logo.svg/256px-P%26O_Cruises_logo.svg.png",
    celebrity: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4f/Celebrity_Cruises_logo.svg/256px-Celebrity_Cruises_logo.svg.png"
};

// ------------------------------
// PRESETS
// ------------------------------

const presets = {
    ncl: { cruiseLine: "NCL", ship: "Norwegian Prima", allowanceKg: 23 },
    msc: { cruiseLine: "MSC", ship: "MSC Euribia", allowanceKg: 25 },
    royal: { cruiseLine: "Royal Caribbean", ship: "Icon of the Seas", allowanceKg: 25 },
    po: { cruiseLine: "P&O", ship: "Iona", allowanceKg: 23 },
    celebrity: { cruiseLine: "Celebrity", ship: "Celebrity Ascent", allowanceKg: 25 },

    ba: { cruiseLine: "British Airways", ship: "Flight BA", allowanceKg: 23 },
    virgin: { cruiseLine: "Virgin Atlantic", ship: "Flight VS", allowanceKg: 23 },
    jet2: { cruiseLine: "Jet2", ship: "Flight LS", allowanceKg: 22 },
    tui: { cruiseLine: "TUI", ship: "Flight TOM", allowanceKg: 20 }
};

// ------------------------------
// SAFE DOM ACCESS
// ------------------------------

function safeGet(id) {
    return document.getElementById(id);
}

// ------------------------------
// DASHBOARD UPDATE (iPad‑SAFE)
// ------------------------------

function updateDashboard() {
    try {
        safeGet("dashCruiseLine").textContent = tripData.cruiseLine || "Not set";
        safeGet("dashShip").textContent = tripData.ship || "Not set";
        safeGet("dashDepartDate").textContent = tripData.departDate || "Not set";
        safeGet("dashAllowance").textContent = tripData.allowanceKg + " kg";

        // Trip Summary Banner
        safeGet("tsbCruiseName").textContent =
            tripData.cruiseLine ? tripData.cruiseLine : "Cruise not set";

        safeGet("tsbShipName").textContent =
            tripData.ship ? "Ship: " + tripData.ship : "Ship not set";

        safeGet("tsbSailDate").textContent =
            tripData.departDate ? "Sailing: " + tripData.departDate : "Sailing date not set";

        // iPad‑SAFE DATE PARSING
        let countdownText = "";
        if (tripData.departDate) {
            const sail = new Date(tripData.departDate);

            if (!isNaN(sail.getTime())) {
                const today = new Date();
                const diff = Math.ceil((sail - today) / (1000 * 60 * 60 * 24));

                countdownText =
                    diff > 0
                        ? diff + " days until departure"
                        : diff === 0
                            ? "Sailing today!"
                            : "This cruise has already sailed";
            }
        }
        safeGet("tsbCountdown").textContent = countdownText;

        // Cruise icon
        const key = (tripData.cruiseLine || "").toLowerCase();
        safeGet("cliIcon").src = cruiseIcons[key] || "";

        // Weight stats
        const checkedWeight = calculateTotalWeight("checked");
        const carryWeight = calculateTotalWeight("carry");
        const packedItems = countPackedItems();

        safeGet("dashCheckedWeight").textContent = checkedWeight.toFixed(1) + " kg";
        safeGet("dashCarryWeight").textContent = carryWeight.toFixed(1) + " kg";
        safeGet("dashPackedItems").textContent = packedItems;
        safeGet("dashAllowanceKg").textContent = tripData.allowanceKg + " kg";

        const remaining = tripData.allowanceKg - checkedWeight;
        safeGet("dashRemainingKg").textContent = remaining.toFixed(1) + " kg";

        // Weight ring
        const percent = Math.min(100, Math.round((checkedWeight / tripData.allowanceKg) * 100));
        safeGet("wrValue").textContent = percent + "%";

        const offset = 314 - (314 * percent / 100);
        document.querySelector(".ring-progress").style.strokeDashoffset = offset;

    } catch (err) {
        console.log("Dashboard failed safely:", err);
    }
}

function calculateTotalWeight(type) {
    let total = 0;
    tripData.categories.forEach(cat => {
        cat.items.forEach(item => {
            if (item.bagType === type && item.packed) {
                total += item.weight || 0;
            }
        });
    });
    return total;
}

function countPackedItems() {
    let count = 0;
    tripData.categories.forEach(cat => {
        cat.items.forEach(item => {
            if (item.packed) count++;
        });
    });
    return count;
}

// ------------------------------
// SAFE CATEGORY RENDERING
// ------------------------------

const categoryGrid = safeGet("categoryGrid");

function renderCategories() {
    try {
        categoryGrid.innerHTML = "";
        tripData.categories.forEach(cat => {
            const card = document.createElement("div");
            card.className = "category-card";

            const header = document.createElement("div");
            header.className = "category-header";

            const title = document.createElement("div");
            title.className = "category-title";
            title.textContent = cat.name;

            const count = document.createElement("div");
            count.textContent = cat.items.length + " items";

            header.appendChild(title);
            header.appendChild(count);

            const itemsDiv = document.createElement("div");
            itemsDiv.className = "category-items";

            cat.items.forEach(item => {
                const row = document.createElement("div");
                row.className = "item-row";
                row.textContent = item.label + " (" + item.weight + " kg)";
                row.addEventListener("click", () => {
                    item.packed = !item.packed;
                    row.style.opacity = item.packed ? "0.6" : "1";
                    updateDashboard();
                });
                itemsDiv.appendChild(row);
            });

            card.appendChild(header);
            card.appendChild(itemsDiv);
            categoryGrid.appendChild(card);
        });
    } catch (err) {
        console.log("Category render failed safely:", err);
    }
}

// ------------------------------
// SAFE TEMPLATE RENDERING
// ------------------------------

const templateList = safeGet("templateList");

function renderTemplates() {
    try {
        templateList.innerHTML = "";
        templates.forEach(t => {
            const li = document.createElement("li");
            li.textContent = t.name;
            templateList.appendChild(li);
        });
    } catch (err) {
        console.log("Template render failed safely:", err);
    }
}

// ------------------------------
// SAFE BUTTON HANDLERS
// ------------------------------

document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const p = presets[btn.dataset.preset];
        if (!p) return;
        tripData.cruiseLine = p.cruiseLine;
        tripData.ship = p.ship;
        tripData.allowanceKg = p.allowanceKg;
        updateDashboard();
    });
});

safeGet("addCategoryBtn").addEventListener("click", () => {
    const name = prompt("Category name:");
    if (!name) return;
    tripData.categories.push({
        id: Date.now(),
        name,
        items: []
    });
    renderCategories();
});

safeGet("addItemBtn").addEventListener("click", () => {
    if (tripData.categories.length === 0) {
        alert("Add a category first.");
        return;
    }
    const catName = prompt("Category to add item to:");
    const cat = tripData.categories.find(c => c.name.toLowerCase() === catName?.toLowerCase());
    if (!cat) {
        alert("Category not found.");
        return;
    }
    const label = prompt("Item name:");
    const weight = parseFloat(prompt("Weight (kg):") || "0");
    const bagType = prompt("Bag type (checked/carry):", "checked");

    cat.items.push({
        id: Date.now(),
        label,
        weight,
        bagType: bagType === "carry" ? "carry" : "checked",
        packed: false
    });
    renderCategories();
    updateDashboard();
});

// ------------------------------
// SAFE INIT
// ------------------------------

document.addEventListener("DOMContentLoaded", () => {
    try {
        renderCategories();
        updateDashboard();
        renderTemplates();
    } catch (err) {
        console.log("Initialisation failed safely:", err);
    }
});
