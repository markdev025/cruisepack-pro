// Basic state

let tripData = {
    cruiseLine: "",
    ship: "",
    departDate: "",
    allowanceKg: 23,
    categories: []
};

let templates = [];

// Cruise icons

const cruiseIcons = {
    ncl: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Norwegian_Cruise_Line_logo.svg/256px-Norwegian_Cruise_Line_logo.svg.png",
    msc: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/MSC_Cruises_logo.svg/256px-MSC_Cruises_logo.svg.png",
    royal: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/Royal_Caribbean_International_logo.svg/256px-Royal_Caribbean_International_logo.svg.png",
    po: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7f/P%26O_Cruises_logo.svg/256px-P%26O_Cruises_logo.svg.png",
    celebrity: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4f/Celebrity_Cruises_logo.svg/256px-Celebrity_Cruises_logo.svg.png"
};

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

// Tab switching

document.querySelectorAll(".nav-tab").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const target = btn.dataset.tab;
        document.querySelectorAll(".tab").forEach(section => {
            section.classList.remove("tab-active");
        });
        document.getElementById(target).classList.add("tab-active");
    });
});

// Theme toggle

const themeBtn = document.getElementById("themeToggleBtn");
themeBtn.addEventListener("click", () => {
    if (document.body.classList.contains("theme-dark")) {
        document.body.classList.remove("theme-dark");
    } else {
        document.body.classList.add("theme-dark");
    }
});

// Dashboard update

function updateDashboard() {
    document.getElementById("dashCruiseLine").textContent = tripData.cruiseLine || "Not set";
    document.getElementById("dashShip").textContent = tripData.ship || "Not set";
    document.getElementById("dashDepartDate").textContent = tripData.departDate || "Not set";
    document.getElementById("dashAllowance").textContent = tripData.allowanceKg + " kg";

    // Trip Summary Banner
    document.getElementById("tsbCruiseName").textContent =
        tripData.cruiseLine ? tripData.cruiseLine : "Cruise not set";

    document.getElementById("tsbShipName").textContent =
        tripData.ship ? "Ship: " + tripData.ship : "Ship not set";

    document.getElementById("tsbSailDate").textContent =
        tripData.departDate ? "Sailing: " + tripData.departDate : "Sailing date not set";

    if (tripData.departDate) {
        const today = new Date();
        const sail = new Date(tripData.departDate);
        const diff = Math.ceil((sail - today) / (1000 * 60 * 60 * 24));

        document.getElementById("tsbCountdown").textContent =
            diff > 0
                ? diff + " days until departure"
                : diff === 0
                    ? "Sailing today!"
                    : "This cruise has already sailed";
    } else {
        document.getElementById("tsbCountdown").textContent = "";
    }

    // Cruise icon
    const key = tripData.cruiseLine.toLowerCase();
    const icon = cruiseIcons[key];
    document.getElementById("cliIcon").src = icon || "";

    // Weight stats
    const checkedWeight = calculateTotalWeight("checked");
    const carryWeight = calculateTotalWeight("carry");
    const packedItems = countPackedItems();

    document.getElementById("dashCheckedWeight").textContent = checkedWeight.toFixed(1) + " kg";
    document.getElementById("dashCarryWeight").textContent = carryWeight.toFixed(1) + " kg";
    document.getElementById("dashPackedItems").textContent = packedItems;
    document.getElementById("dashAllowanceKg").textContent = tripData.allowanceKg + " kg";

    const remaining = tripData.allowanceKg - checkedWeight;
    document.getElementById("dashRemainingKg").textContent = remaining.toFixed(1) + " kg";

    // Weight ring
    const percent = Math.min(100, Math.round((checkedWeight / tripData.allowanceKg) * 100));
    document.getElementById("wrValue").textContent = percent + "%";
    const offset = 314 - (314 * percent / 100);
    document.querySelector(".ring-progress").style.strokeDashoffset = offset;
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

// Dashboard buttons

document.getElementById("editTripBtn").addEventListener("click", () => {
    const cruise = prompt("Cruise line:", tripData.cruiseLine);
    const ship = prompt("Ship:", tripData.ship);
    const date = prompt("Sailing date (YYYY-MM-DD):", tripData.departDate);
    const allowance = prompt("Checked allowance (kg):", tripData.allowanceKg);

    if (cruise !== null) tripData.cruiseLine = cruise;
    if (ship !== null) tripData.ship = ship;
    if (date !== null) tripData.departDate = date;
    if (allowance !== null) tripData.allowanceKg = parseFloat(allowance) || tripData.allowanceKg;

    updateDashboard();
});

document.getElementById("newTripBtn").addEventListener("click", () => {
    if (!confirm("Start a new trip? This will clear all categories and items.")) return;

    tripData = {
        cruiseLine: "",
        ship: "",
        departDate: "",
        allowanceKg: 23,
        categories: []
    };

    renderCategories();
    updateDashboard();
});

document.getElementById("openPackingListBtn").addEventListener("click", () => {
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    document.querySelector('[data-tab="tab-packing"]').classList.add("active");

    document.querySelectorAll(".tab").forEach(section => section.classList.remove("tab-active"));
    document.getElementById("tab-packing").classList.add("tab-active");
});

document.getElementById("saveTripBtn").addEventListener("click", () => {
    localStorage.setItem("cruisepack_trip", JSON.stringify(tripData));
    alert("Trip saved.");
});

document.getElementById("loadTripBtn").addEventListener("click", () => {
    const saved = localStorage.getItem("cruisepack_trip");
    if (!saved) {
        alert("No saved trip found.");
        return;
    }

    tripData = JSON.parse(saved);
    renderCategories();
    updateDashboard();
    alert("Trip loaded.");
});

// Presets

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

// Packing workspace

const categoryGrid = document.getElementById("categoryGrid");

document.getElementById("addCategoryBtn").addEventListener("click", () => {
    const name = prompt("Category name:");
    if (!name) return;
    tripData.categories.push({
        id: Date.now(),
        name,
        items: []
    });
    renderCategories();
});

document.getElementById("addItemBtn").addEventListener("click", () => {
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

function renderCategories() {
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
}

// Templates (simple list)

const templateList = document.getElementById("templateList");

document.getElementById("saveTemplateBtn").addEventListener("click", () => {
    const name = prompt("Template name:");
    if (!name) return;
    templates.push({
        id: Date.now(),
        name,
        data: JSON.parse(JSON.stringify(tripData))
    });
    renderTemplates();
});

document.getElementById("loadTemplateBtn").addEventListener("click", () => {
    const name = prompt("Template name to load:");
    const t = templates.find(tmp => tmp.name.toLowerCase() === name?.toLowerCase());
    if (!t) {
        alert("Template not found.");
        return;
    }
    tripData = JSON.parse(JSON.stringify(t.data));
    renderCategories();
    updateDashboard();
});

document.getElementById("deleteTemplateBtn").addEventListener("click", () => {
    const name = prompt("Template name to delete:");
    const idx = templates.findIndex(tmp => tmp.name.toLowerCase() === name?.toLowerCase());
    if (idx === -1) {
        alert("Template not found.");
        return;
    }
    templates.splice(idx, 1);
    renderTemplates();
});

function renderTemplates() {
    templateList.innerHTML = "";
    templates.forEach(t => {
        const li = document.createElement("li");
        li.textContent = t.name;
        templateList.appendChild(li);
    });
}

// Export

document.getElementById("exportTripJsonBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(tripData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trip.json";
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById("importTripJsonInput").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            tripData = JSON.parse(reader.result);
            renderCategories();
            updateDashboard();
        } catch {
            alert("Invalid JSON file.");
        }
    };
    reader.readAsText(file);
});

// Simple PDF export placeholder

document.getElementById("exportPdfBtn").addEventListener("click", () => {
    alert("PDF export not implemented in this build.");
});

// Init

renderCategories();
updateDashboard();
renderTemplates();
