/* ============================================================
   CruisePack Pro — Full Logic Layer
   Modern dashboard, modal system, sub-items, templates, export
   ============================================================ */

/* ------------------------------------------------------------
   GLOBAL STATE
------------------------------------------------------------ */

let tripData = {
    cruiseLine: "",
    ship: "",
    departDate: "",
    allowanceKg: 50,
    categories: []
};

let templates = [];
let activeCategoryKey = null;
let activeItemKey = null;
let activeSubItemIndex = null;

/* ------------------------------------------------------------
   TAB SWITCHING
------------------------------------------------------------ */

document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const target = tab.dataset.tab;
        document.querySelectorAll(".tab").forEach(section => {
            section.classList.remove("tab-active");
        });
        document.getElementById(target).classList.add("tab-active");
    });
});

/* ------------------------------------------------------------
   THEME TOGGLE (light/dark)
------------------------------------------------------------ */

const themeToggleBtn = document.getElementById("themeToggleBtn");
themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("theme-dark");
});

/* ------------------------------------------------------------
   DASHBOARD UPDATE
------------------------------------------------------------ */

function updateDashboard() {
    document.getElementById("dashCruiseLine").textContent = tripData.cruiseLine || "";
    document.getElementById("dashShip").textContent = tripData.ship || "";
    document.getElementById("dashDepartDate").textContent = tripData.departDate || "";
    document.getElementById("dashAllowance").textContent = tripData.allowanceKg + " kg checked";

    let checkedWeight = 0;
    let carryWeight = 0;
    let packedCount = 0;

    tripData.categories.forEach(cat => {
        cat.items.forEach(item => {
            item.subItems.forEach(sub => {
                if (sub.packed) {
                    packedCount++;
                    if (sub.weightOverride) {
                        checkedWeight += sub.weightOverride;
                    }
                }
            });
        });
    });

    document.getElementById("dashCheckedWeight").textContent = checkedWeight.toFixed(1) + " kg";
    document.getElementById("dashCarryWeight").textContent = carryWeight.toFixed(1) + " kg";
    document.getElementById("dashPackedItems").textContent = packedCount;
    document.getElementById("dashAllowanceKg").textContent = tripData.allowanceKg + " kg";
    document.getElementById("dashRemainingKg").textContent = (tripData.allowanceKg - checkedWeight).toFixed(1) + " kg";
}

/* ------------------------------------------------------------
   CATEGORY + ITEM RENDERING
------------------------------------------------------------ */

function renderCategories() {
    const grid = document.getElementById("categoryGrid");
    grid.innerHTML = "";

    tripData.categories.forEach(cat => {
        const card = document.createElement("div");
        card.className = "category-card";

        const header = document.createElement("div");
        header.className = "category-card-header";

        const title = document.createElement("div");
        title.className = "category-card-title";
        title.textContent = cat.label;

        header.appendChild(title);
        card.appendChild(header);

        const items = document.createElement("div");
        items.className = "category-card-items";

        cat.items.forEach(item => {
            const btn = document.createElement("button");
            btn.className = "item-btn";
            btn.textContent = item.label;
            btn.addEventListener("click", () => openItemModal(cat.key, item.key));
            items.appendChild(btn);
        });

        card.appendChild(items);
        grid.appendChild(card);
    });
}

/* ------------------------------------------------------------
   ADD CATEGORY
------------------------------------------------------------ */

document.getElementById("addCategoryBtn").addEventListener("click", () => {
    const label = prompt("Category name:");
    if (!label) return;

    const key = "cat_" + Date.now();

    tripData.categories.push({
        label,
        key,
        items: []
    });

    renderCategories();
});

/* ------------------------------------------------------------
   ADD ITEM
------------------------------------------------------------ */

document.getElementById("addItemBtn").addEventListener("click", () => {
    if (tripData.categories.length === 0) {
        alert("Add a category first.");
        return;
    }

    const catLabel = prompt("Which category? (type exact name)");
    const cat = tripData.categories.find(c => c.label === catLabel);
    if (!cat) {
        alert("Category not found.");
        return;
    }

    const label = prompt("Item name:");
    if (!label) return;

    const key = "item_" + Date.now();

    cat.items.push({
        label,
        key,
        qty: 1,
        who: "",
        subItems: [
            {
                name: label,
                description: "",
                photos: [],
                weightOverride: null,
                packed: false
            }
        ]
    });

    renderCategories();
});

/* ------------------------------------------------------------
   ITEM MODAL
------------------------------------------------------------ */

const itemModalOverlay = document.getElementById("itemModalOverlay");
const itemModal = document.getElementById("itemModal");
const closeItemModalBtn = document.getElementById("closeItemModalBtn");

closeItemModalBtn.addEventListener("click", closeItemModal);

function openItemModal(catKey, itemKey) {
    activeCategoryKey = catKey;
    activeItemKey = itemKey;

    const cat = tripData.categories.find(c => c.key === catKey);
    const item = cat.items.find(i => i.key === itemKey);

    document.getElementById("modalItemTitle").textContent = item.label;

    renderSubItemTabs(item);
    openSubItem(0);

    itemModalOverlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeItemModal() {
    itemModalOverlay.classList.add("hidden");
    document.body.style.overflow = "";
}

/* ------------------------------------------------------------
   SUB-ITEM TABS
------------------------------------------------------------ */

function renderSubItemTabs(item) {
    const tabs = document.getElementById("subItemTabs");
    tabs.innerHTML = "";

    item.subItems.forEach((sub, index) => {
        const btn = document.createElement("button");
        btn.className = "subitem-tab";
        btn.textContent = sub.name;
        btn.dataset.index = index;

        btn.addEventListener("click", () => openSubItem(index));

        tabs.appendChild(btn);
    });

    const addBtn = document.createElement("button");
    addBtn.className = "subitem-tab add-tab";
    addBtn.textContent = "+ Add new";
    addBtn.addEventListener("click", () => addSubItem(item));
    tabs.appendChild(addBtn);
}

/* ------------------------------------------------------------
   ADD SUB-ITEM
------------------------------------------------------------ */

function addSubItem(item) {
    const name = prompt("Sub-item name:");
    if (!name) return;

    item.subItems.push({
        name,
        description: "",
        photos: [],
        weightOverride: null,
        packed: false
    });

    renderSubItemTabs(item);
    openSubItem(item.subItems.length - 1);
}

/* ------------------------------------------------------------
   OPEN SUB-ITEM
------------------------------------------------------------ */

function openSubItem(index) {
    activeSubItemIndex = index;

    const cat = tripData.categories.find(c => c.key === activeCategoryKey);
    const item = cat.items.find(i => i.key === activeItemKey);
    const sub = item.subItems[index];

    const content = document.getElementById("subItemContent");
    content.innerHTML = "";

    const left = document.createElement("div");
    left.className = "subitem-photos";

    const mainPhoto = document.createElement("img");
    mainPhoto.className = "subitem-main-photo";
    mainPhoto.src = sub.photos[0] || "";
    mainPhoto.addEventListener("click", () => openPhotoViewer(0));

    left.appendChild(mainPhoto);

    const thumbs = document.createElement("div");
    thumbs.className = "subitem-thumbnails";

    sub.photos.forEach((p, idx) => {
        const t = document.createElement("img");
        t.className = "subitem-thumbnail";
        t.src = p;
        t.addEventListener("click", () => openPhotoViewer(idx));
        thumbs.appendChild(t);
    });

    const addThumb = document.createElement("div");
    addThumb.className = "subitem-thumbnail add-thumb";
    addThumb.textContent = "+";
    addThumb.addEventListener("click", () => addPhotoToSubItem(sub));
    thumbs.appendChild(addThumb);

    left.appendChild(thumbs);

    const right = document.createElement("div");
    right.className = "subitem-details";

    const title = document.createElement("h3");
    title.textContent = sub.name;
    right.appendChild(title);

    const desc = document.createElement("textarea");
    desc.className = "subitem-description";
    desc.value = sub.description;
    desc.addEventListener("input", () => {
        sub.description = desc.value;
    });
    right.appendChild(desc);

    const weightField = document.createElement("div");
    weightField.className = "subitem-field";
    weightField.innerHTML = `
        <label>Weight (kg):</label>
        <input type="number" step="0.1" value="${sub.weightOverride || ""}">
    `;
    const weightInput = weightField.querySelector("input");
    weightInput.addEventListener("input", () => {
        sub.weightOverride = parseFloat(weightInput.value) || null;
        updateDashboard();
    });
    right.appendChild(weightField);

    const packedField = document.createElement("div");
    packedField.className = "subitem-field";
    packedField.innerHTML = `
        <label>Packed:</label>
        <input type="checkbox" ${sub.packed ? "checked" : ""}>
    `;
    const packedInput = packedField.querySelector("input");
    packedInput.addEventListener("change", () => {
        sub.packed = packedInput.checked;
        updateDashboard();
    });
    right.appendChild(packedField);

    const actions = document.createElement("div");
    actions.className = "subitem-actions";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "subitem-delete-btn";
    deleteBtn.textContent = "Delete sub-item";
    deleteBtn.addEventListener("click", () => {
        if (confirm("Delete this sub-item?")) {
            item.subItems.splice(index, 1);
            renderSubItemTabs(item);
            openSubItem(0);
        }
    });

    actions.appendChild(deleteBtn);
    right.appendChild(actions);

    content.appendChild(left);
    content.appendChild(right);
}

/* ------------------------------------------------------------
   ADD PHOTO TO SUB-ITEM
------------------------------------------------------------ */

function addPhotoToSubItem(sub) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.addEventListener("change", () => {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            sub.photos.push(reader.result);
            openSubItem(activeSubItemIndex);
        };
        reader.readAsDataURL(file);
    });

    input.click();
}

/* ------------------------------------------------------------
   FULL-SCREEN PHOTO VIEWER
------------------------------------------------------------ */

const photoViewerOverlay = document.getElementById("photoViewerOverlay");
const photoViewerImage = document.getElementById("photoViewerImage");
const photoViewerCloseBtn = document.getElementById("photoViewerCloseBtn");

photoViewerCloseBtn.addEventListener("click", closePhotoViewer);
photoViewerOverlay.addEventListener("click", closePhotoViewer);

function openPhotoViewer(index) {
    const cat = tripData.categories.find(c => c.key === activeCategoryKey);
    const item = cat.items.find(i => i.key === activeItemKey);
    const sub = item.subItems[activeSubItemIndex];

    photoViewerImage.src = sub.photos[index];
    photoViewerOverlay.classList.remove("hidden");
}

function closePhotoViewer() {
    photoViewerOverlay.classList.add("hidden");
}

/* ------------------------------------------------------------
   TEMPLATE SYSTEM
------------------------------------------------------------ */

document.getElementById("saveTemplateBtn").addEventListener("click", () => {
    const name = prompt("Template name:");
    if (!name) return;

    templates.push({
        name,
        data: JSON.parse(JSON.stringify(tripData))
    });

    renderTemplateList();
});

document.getElementById("loadTemplateBtn").addEventListener("click", () => {
    const selected = document.querySelector("#templateList li.selected");
    if (!selected) {
        alert("Select a template first.");
        return;
    }

    const name = selected.textContent;
    const tpl = templates.find(t => t.name === name);

    tripData = JSON.parse(JSON.stringify(tpl.data));
    renderCategories();
    updateDashboard();
});

document.getElementById("deleteTemplateBtn").addEventListener("click", () => {
    const selected = document.querySelector("#templateList li.selected");
    if (!selected) {
        alert("Select a template first.");
        return;
    }

    const name = selected.textContent;
    templates = templates.filter(t => t.name !== name);

    renderTemplateList();
});

function renderTemplateList() {
    const list = document.getElementById("templateList");
    list.innerHTML = "";

    templates.forEach(t => {
        const li = document.createElement("li");
        li.textContent = t.name;

        li.addEventListener("click", () => {
            document.querySelectorAll("#templateList li").forEach(x => x.classList.remove("selected"));
            li.classList.add("selected");
        });

        list.appendChild(li);
    });
}

/* ------------------------------------------------------------
   EXPORT / IMPORT TRIP JSON
------------------------------------------------------------ */

document.getElementById("exportTripJsonBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(tripData)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "trip.json";
    a.click();

    URL.revokeObjectURL(url);
});

document.getElementById("importTripJsonInput").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        tripData = JSON.parse(reader.result);
        renderCategories();
        updateDashboard();
    };
    reader.readAsText(file);
});

/* ------------------------------------------------------------
   EXPORT PDF (hook only)
------------------------------------------------------------ */

document.getElementById("exportPdfBtn").addEventListener("click", () => {
    alert("PDF export hook — integrate jsPDF or your preferred library.");
});

/* ------------------------------------------------------------
   GLOBAL SEARCH
------------------------------------------------------------ */

document.getElementById("globalSearchInput").addEventListener("input", function () {
    const q = this.value.toLowerCase();

    document.querySelectorAll(".item-btn").forEach(btn => {
        const match = btn.textContent.toLowerCase().includes(q);
        btn.style.display = match ? "" : "none";
    });
});

/* ------------------------------------------------------------
   DASHBOARD BUTTONS
------------------------------------------------------------ */

// Edit trip details
document.getElementById("editTripBtn").addEventListener("click", () => {
    const cruise = prompt("Cruise line:", tripData.cruiseLine);
    const ship = prompt("Ship:", tripData.ship);
    const date = prompt("Sailing date:", tripData.departDate);
    const allowance = prompt("Checked allowance (kg):", tripData.allowanceKg);

    if (cruise !== null) tripData.cruiseLine = cruise;
    if (ship !== null) tripData.ship = ship;
    if (date !== null) tripData.departDate = date;
    if (allowance !== null) tripData.allowanceKg = parseFloat(allowance) || tripData.allowanceKg;

    updateDashboard();
});

// New trip (reset everything)
document.getElementById("newTripBtn").addEventListener("click", () => {
    if (!confirm("Start a new trip? This will clear all categories and items.")) return;

    tripData = {
        cruiseLine: "",
        ship: "",
        departDate: "",
        allowanceKg: 50,
        categories: []
    };

    renderCategories();
    updateDashboard();
});

// Open packing list tab
document.getElementById("openPackingListBtn").addEventListener("click", () => {
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    document.querySelector('[data-tab="tab-packing"]').classList.add("active");

    document.querySelectorAll(".tab").forEach(section => section.classList.remove("tab-active"));
    document.getElementById("tab-packing").classList.add("tab-active");
});

// Save trip to localStorage
document.getElementById("saveTripBtn").addEventListener("click", () => {
    localStorage.setItem("cruisepack_trip", JSON.stringify(tripData));
    alert("Trip saved.");
});

// Load trip from localStorage
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


/* ------------------------------------------------------------
   INITIAL RENDER
------------------------------------------------------------ */

renderCategories();
updateDashboard();
renderTemplateList();
