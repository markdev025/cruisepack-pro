// CruisePack Pro Web Edition (hybrid dashboard, category grid, custom excursions, photo upload, thumbnails)

const app = document.getElementById("app");
const tabs = document.querySelectorAll("nav button");
const sections = document.querySelectorAll(".tab");
const darkToggle = document.getElementById("darkToggle");

let male = { items: [], carry: [] };
let female = { items: [], carry: [] };
let allowanceKg = 23;

const W = {
    tshirt: 0.18, shorts: 0.25, trousers: 0.45, dress: 0.30,
    evening_dress: 0.45, formal_shirt: 0.30, suit_jacket: 0.90,
    underwear: 0.04, socks: 0.04, shoes: 0.90, heels: 0.70,
    swimwear: 0.15, toiletries: 0.60, suncream: 0.20,
    meds: 0.15, cables: 0.08, passport: 0.02, docs: 0.03,
    electronics: 0.90, rain_jacket: 0.30, light_layer: 0.35,
    hat: 0.12, water_shoes: 0.40, towel: 0.35, bug_spray: 0.15,
    sleepwear: 0.20, hotel_outfit: 0.35, makeup_bag: 0.50,
    hair_tools: 0.60
};

let categories = {
    Essentials: [
        ["Underwear (Male)", "underwear", 9, "male", null],
        ["Socks (Male)", "socks", 9, "male", null],
        ["Underwear (Female)", "underwear", 10, "female", null],
        ["Makeup bag (Female)", "makeup_bag", 1, "female", null],
        ["Hair tools (Female)", "hair_tools", 1, "female", null],
        ["Toiletries (Shared)", "toiletries", 1, "shared", null]
    ],
    "Cruise Nights": [
        ["T-shirts (Male)", "tshirt", 7, "male", null],
        ["Shorts (Male)", "shorts", 3, "male", null],
        ["Trousers (Male)", "trousers", 2, "male", null],
        ["Formal shirts (Male)", "formal_shirt", 2, "male", null],
        ["Suit jacket (Male)", "suit_jacket", 1, "male", null],
        ["Dresses (Female)", "dress", 5, "female", null],
        ["Tops (Female)", "tshirt", 7, "female", null],
        ["Shorts/Skirts (Female)", "shorts", 3, "female", null],
        ["Evening dresses (Female)", "evening_dress", 2, "female", null]
    ],
    "Hotel Stay": [
        ["Hotel sleepwear (Male)", "sleepwear", 1, "male", null],
        ["Hotel evening outfit (Male)", "hotel_outfit", 1, "male", null],
        ["Hotel sleepwear (Female)", "sleepwear", 1, "female", null],
        ["Hotel evening outfit (Female)", "hotel_outfit", 1, "female", null]
    ],
    Excursions: [
        ["Water shoes (Both)", "water_shoes", 1, "both", null],
        ["Beach towel (Both)", "towel", 1, "both", null],
        ["Bug spray (Both)", "bug_spray", 1, "both", null]
    ],
    Weather: [
        ["Light rain jacket (Both)", "rain_jacket", 1, "both", null],
        ["Light evening layer (Both)", "light_layer", 1, "both", null],
        ["Sun hat (Both)", "hat", 1, "both", null]
    ],
    "Shared Items": [
        ["Suncream (Shared)", "suncream", 1, "shared", null],
        ["Medication pack (Shared)", "meds", 1, "shared", null],
        ["Charging cables (Shared)", "cables", 1, "shared", null]
    ],
    "Carry-on": [
        ["Passport (Both)", "passport", 1, "carry", null],
        ["Travel documents (Both)", "docs", 1, "carry", null],
        ["Electronics (Both)", "electronics", 1, "carry", null],
        ["Medication (Both)", "meds", 1, "carry", null]
    ]
};

let customExcursions = {};

function switchTab(tabName) {
    sections.forEach(sec => sec.classList.remove("active"));
    document.getElementById(`tab-${tabName}`).classList.add("active");
}

tabs.forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// Default tab: dashboard
switchTab("dashboard");

function applyDarkModeFromStorage() {
    const stored = localStorage.getItem("cruisepack_dark");
    if (stored === "dark") app.classList.add("dark");
    else app.classList.remove("dark");
}
applyDarkModeFromStorage();

darkToggle.addEventListener("click", () => {
    app.classList.toggle("dark");
    localStorage.setItem("cruisepack_dark", app.classList.contains("dark") ? "dark" : "light");
});

// Trip presets
const cruisePreset = document.getElementById("cruisePreset");
const airlinePreset = document.getElementById("airlinePreset");
const allowanceInput = document.getElementById("allowanceKg");
const allowanceDisplay = document.getElementById("allowanceDisplay");

cruisePreset.addEventListener("change", () => {
    const v = cruisePreset.value;
    const tripName = document.getElementById("tripName");
    const cruiseLine = document.getElementById("cruiseLine");
    const ship = document.getElementById("ship");
    const departPort = document.getElementById("departPort");
    const departDate = document.getElementById("departDate");

    if (v === "prima") {
        tripName.value = "NCL Prima – Orlando 6 Sept";
        cruiseLine.value = "Norwegian Cruise Line";
        ship.value = "Prima";
        departPort.value = "Orlando (Port Canaveral)";
        departDate.value = "6 September";
    } else if (v === "epic") {
        tripName.value = "NCL Epic – Mediterranean";
        cruiseLine.value = "Norwegian Cruise Line";
        ship.value = "Epic";
        departPort.value = "Barcelona";
        departDate.value = "June";
    } else if (v === "msc_virtuosa") {
        tripName.value = "MSC Virtuosa – Northern Europe";
        cruiseLine.value = "MSC Cruises";
        ship.value = "Virtuosa";
        departPort.value = "Southampton";
        departDate.value = "July";
    } else if (v === "icon") {
        tripName.value = "Icon of the Seas – Caribbean";
        cruiseLine.value = "Royal Caribbean";
        ship.value = "Icon of the Seas";
        departPort.value = "Miami";
        departDate.value = "Winter";
    } else if (v === "iona") {
        tripName.value = "P&O Iona – Norwegian Fjords";
        cruiseLine.value = "P&O Cruises";
        ship.value = "Iona";
        departPort.value = "Southampton";
        departDate.value = "May";
    }
    updateDashboardTripDetails();
});

airlinePreset.addEventListener("change", () => {
    const v = airlinePreset.value;
    if (v === "ba" || v === "virgin") allowanceInput.value = "23";
    else if (v === "tui") allowanceInput.value = "20";
    else if (v === "jet2") allowanceInput.value = "22";
    updateAllowance();
});

allowanceInput.addEventListener("input", updateAllowance);

function updateAllowance() {
    const val = parseFloat(allowanceInput.value) || 23;
    allowanceKg = val;
    allowanceDisplay.textContent = `${val} kg`;
    updateDashboard();
    updateDashboardTripDetails();
}

// Categories + items
const categoryList = document.getElementById("categoryList");
const itemsArea = document.getElementById("itemsArea");
const newCategoryName = document.getElementById("newCategoryName");
const addCategoryBtn = document.getElementById("addCategoryBtn");

function renderCategories() {
    categoryList.innerHTML = "";
    Object.keys(categories).forEach(cat => {
        const wrapper = document.createElement("div");
        wrapper.className = "cat-row";

        const btn = document.createElement("button");
        btn.className = "cat-btn";
        btn.textContent = cat;
        btn.addEventListener("click", () => renderItemsForCategory(cat));

        const del = document.createElement("button");
        del.className = "cat-del";
        del.textContent = "Remove";
        del.addEventListener("click", () => {
            delete categories[cat];
            renderCategories();
            itemsArea.innerHTML = "";
        });

        wrapper.appendChild(btn);
        wrapper.appendChild(del);
        categoryList.appendChild(wrapper);
    });
}
renderCategories();

function renderItemsForCategory(cat) {
    itemsArea.innerHTML = "";
    const items = categories[cat] || [];
    items.forEach(([label, key, qty, who, photo]) => {
        const id = `${cat}-${label}`.replace(/\s+/g, "_");
        const wrapper = document.createElement("label");

        const main = document.createElement("div");
        main.className = "item-main";

        const line = document.createElement("span");
        line.innerHTML = `
            <input type="checkbox" id="${id}">
            ${label} (${qty} × ${W[key].toFixed(2)} kg)
        `;
        main.appendChild(line);

        if (photo) {
            const img = document.createElement("img");
            img.src = photo;
            img.className = "thumb";
            main.appendChild(img);
        }

        const cb = line.querySelector("input");
        cb.addEventListener("change", () => toggleItem(label, key, qty, who, cb.checked, photo));

        const delBtn = document.createElement("button");
        delBtn.className = "item-del";
        delBtn.textContent = "Remove";
        delBtn.addEventListener("click", () => {
            categories[cat] = categories[cat].filter(i => i[0] !== label);
            renderItemsForCategory(cat);
        });

        wrapper.appendChild(main);
        wrapper.appendChild(delBtn);
        itemsArea.appendChild(wrapper);
    });
}

addCategoryBtn.addEventListener("click", () => {
    const name = newCategoryName.value.trim();
    if (!name) return;
    if (!categories[name]) categories[name] = [];
    newCategoryName.value = "";
    renderCategories();
});

// Add item
const itemCategoryName = document.getElementById("itemCategoryName");
const itemLabel = document.getElementById("itemLabel");
const itemKey = document.getElementById("itemKey");
const itemQty = document.getElementById("itemQty");
const itemWho = document.getElementById("itemWho");
const itemPhotoFile = document.getElementById("itemPhotoFile");
const addItemBtn = document.getElementById("addItemBtn");

addItemBtn.addEventListener("click", () => {
    const cat = itemCategoryName.value.trim();
    const label = itemLabel.value.trim();
    const key = itemKey.value.trim();
    const qty = parseInt(itemQty.value, 10) || 1;
    const who = itemWho.value;
    const file = itemPhotoFile.files[0];

    if (!cat || !label || !key) return;
    if (!W[key]) {
        alert("Unknown weight key. Use one of: " + Object.keys(W).join(", "));
        return;
    }

    const addItemToCategories = (photoDataUrl) => {
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push([label, key, qty, who, photoDataUrl || null]);

        itemCategoryName.value = "";
        itemLabel.value = "";
        itemKey.value = "";
        itemQty.value = "1";
        itemPhotoFile.value = "";

        renderCategories();
        renderItemsForCategory(cat);
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            addItemToCategories(reader.result);
        };
        reader.readAsDataURL(file);
    } else {
        addItemToCategories(null);
    }
});

// Item logic
function toggleItem(label, key, qty, who, checked, photo) {
    const weight = W[key];

    if (who === "male") {
        if (checked) male.items.push({ label, weight, qty, photo });
        else male.items = male.items.filter(i => i.label !== label);
    } else if (who === "female") {
        if (checked) female.items.push({ label, weight, qty, photo });
        else female.items = female.items.filter(i => i.label !== label);
    } else if (who === "both") {
        if (checked) {
            male.items.push({ label, weight, qty, photo });
            female.items.push({ label, weight, qty, photo });
        } else {
            male.items = male.items.filter(i => i.label !== label);
            female.items = female.items.filter(i => i.label !== label);
        }
    } else if (who === "shared") {
        if (checked) {
            const m = male.items.reduce((a, b) => a + b.weight * b.qty, 0);
            const f = female.items.reduce((a, b) => a + b.weight * b.qty, 0);
            if (m <= f) male.items.push({ label, weight, qty, photo });
            else female.items.push({ label, weight, qty, photo });
        } else {
            male.items = male.items.filter(i => i.label !== label);
            female.items = female.items.filter(i => i.label !== label);
        }
    } else if (who === "carry") {
        if (checked) {
            male.carry.push({ label, weight, qty, photo });
            female.carry.push({ label, weight, qty, photo });
        } else {
            male.carry = male.carry.filter(i => i.label !== label);
            female.carry = female.carry.filter(i => i.label !== label);
        }
    }

    updateDashboard();
}

// Excursion templates
const excursionTemplate = document.getElementById("excursionTemplate");
const applyExcursion = document.getElementById("applyExcursion");
const newExcName = document.getElementById("newExcName");
const newExcItemKey = document.getElementById("newExcItemKey");
const addExcTemplate = document.getElementById("addExcTemplate");
const customExcList = document.getElementById("customExcList");

applyExcursion.addEventListener("click", () => {
    const v = excursionTemplate.value;
    if (!v) return;

    if (v === "beach") {
        categories.Excursions.push(["Extra swimwear (Both)", "swimwear", 1, "both", null]);
    } else if (v === "snorkel") {
        categories.Excursions.push(["Snorkel set (Both)", "water_shoes", 1, "both", null]);
    } else if (v === "city") {
        categories.Excursions.push(["Comfortable shoes (Both)", "shoes", 1, "both", null]);
    } else if (v === "rainforest") {
        categories.Excursions.push(["Rain jacket (Both)", "rain_jacket", 1, "both", null]);
    } else if (v === "waterpark") {
        categories.Excursions.push(["Water shoes (Both)", "water_shoes", 1, "both", null]);
    } else if (v === "formal") {
        categories["Cruise Nights"].push(["Extra formal outfit (Female)", "evening_dress", 1, "female", null]);
    } else if (v === "seaday") {
        categories["Cruise Nights"].push(["Lounge wear (Both)", "light_layer", 1, "both", null]);
    } else if (v.startsWith("custom_")) {
        const name = v.replace("custom_", "");
        const itemKey = customExcursions[name];
        if (itemKey && W[itemKey]) {
            categories.Excursions.push([`${name} (Custom)`, itemKey, 1, "both", null]);
        }
    }

    renderCategories();
    alert("Excursion template applied. Choose category to see added items.");
});

addExcTemplate.addEventListener("click", () => {
    const name = newExcName.value.trim();
    const key = newExcItemKey.value.trim();
    if (!name || !key) return;
    if (!W[key]) {
        alert("Unknown weight key. Use one of: " + Object.keys(W).join(", "));
        return;
    }
    customExcursions[name] = key;
    newExcName.value = "";
    newExcItemKey.value = "";
    renderExcursionTemplates();
});

function renderExcursionTemplates() {
    const sel = document.getElementById("excursionTemplate");
    sel.innerHTML = `
        <option value="">Choose template…</option>
        <option value="beach">Beach Day</option>
        <option value="snorkel">Snorkelling</option>
        <option value="city">City Walk</option>
        <option value="rainforest">Rainforest Hike</option>
        <option value="waterpark">Waterpark</option>
        <option value="formal">Formal Night</option>
        <option value="seaday">Sea Day Relax</option>
    `;
    customExcList.innerHTML = "";
    Object.keys(customExcursions).forEach(name => {
        const opt = document.createElement("option");
        opt.value = "custom_" + name;
        opt.textContent = name;
        sel.appendChild(opt);

        const row = document.createElement("div");
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.className = "item-del";
        removeBtn.addEventListener("click", () => {
            delete customExcursions[name];
            renderExcursionTemplates();
        });

        row.textContent = `${name} → ${customExcursions[name]} `;
        row.appendChild(removeBtn);
        customExcList.appendChild(row);
    });
}
renderExcursionTemplates();

// Dashboard elements
const maleCheckedEl = document.getElementById("maleChecked");
const femaleCheckedEl = document.getElementById("femaleChecked");
const maleCarryEl = document.getElementById("maleCarry");
const femaleCarryEl = document.getElementById("femaleCarry");
const maleStatusEl = document.getElementById("maleStatus");
const femaleStatusEl = document.getElementById("femaleStatus");
const autoBalanceBtn = document.getElementById("autoBalance");
const maleMeter = document.getElementById("maleMeter");
const femaleMeter = document.getElementById("femaleMeter");
const maleMeterLabel = document.getElementById("maleMeterLabel");
const femaleMeterLabel = document.getElementById("femaleMeterLabel");

const dashCruiseLine = document.getElementById("dashCruiseLine");
const dashShip = document.getElementById("dashShip");
const dashSailing = document.getElementById("dashSailing");
const dashDepartPort = document.getElementById("dashDepartPort");
const dashAllowance = document.getElementById("dashAllowance");
const dashPackedCount = document.getElementById("dashPackedCount");
const dashRemainingCount = document.getElementById("dashRemainingCount");
const dashThumbs = document.getElementById("dashThumbs");
const goPackingBtn = document.getElementById("goPacking");

goPackingBtn.addEventListener("click", () => switchTab("packing"));

function updateDashboardTripDetails() {
    dashCruiseLine.textContent = document.getElementById("cruiseLine").value || "–";
    dashShip.textContent = document.getElementById("ship").value || "–";
    dashSailing.textContent = document.getElementById("departDate").value || "–";
    dashDepartPort.textContent = document.getElementById("departPort").value || "–";
    dashAllowance.textContent = `${allowanceKg} kg`;
}

function updateDashboard() {
    const mChecked = male.items.reduce((a, b) => a + b.weight * b.qty, 0);
    const fChecked = female.items.reduce((a, b) => a + b.weight * b.qty, 0);
    const mCarry = male.carry.reduce((a, b) => a + b.weight * b.qty, 0);
    const fCarry = female.carry.reduce((a, b) => a + b.weight * b.qty, 0);

    maleCheckedEl.textContent = mChecked.toFixed(2) + " kg";
    femaleCheckedEl.textContent = fChecked.toFixed(2) + " kg";
    maleCarryEl.textContent = mCarry.toFixed(2) + " kg";
    femaleCarryEl.textContent = fCarry.toFixed(2) + " kg";

    maleStatusEl.textContent =
        mChecked > allowanceKg ? `Over by ${(mChecked - allowanceKg).toFixed(2)} kg` :
        `${(allowanceKg - mChecked).toFixed(2)} kg remaining`;

    femaleStatusEl.textContent =
        fChecked > allowanceKg ? `Over by ${(fChecked - allowanceKg).toFixed(2)} kg` :
        `${(allowanceKg - fChecked).toFixed(2)} kg remaining`;

    const mPct = Math.min(100, (mChecked / allowanceKg) * 100);
    const fPct = Math.min(100, (fChecked / allowanceKg) * 100);

    maleMeter.style.width = mPct + "%";
    femaleMeter.style.width = fPct + "%";

    maleMeterLabel.textContent = `${mChecked.toFixed(2)} kg / ${allowanceKg} kg`;
    femaleMeterLabel.textContent = `${fChecked.toFixed(2)} kg / ${allowanceKg} kg`;

    const packedCount =
        male.items.length + female.items.length + male.carry.length + female.carry.length;
    dashPackedCount.textContent = packedCount;

    let totalDefinedItems = 0;
    Object.values(categories).forEach(arr => totalDefinedItems += arr.length);
    dashRemainingCount.textContent = Math.max(0, totalDefinedItems - packedCount);

    dashThumbs.innerHTML = "";
    const allItems = [...male.items, ...female.items, ...male.carry, ...female.carry];
    const seen = new Set();
    allItems.forEach(i => {
        if (i.photo && !seen.has(i.photo)) {
            seen.add(i.photo);
            const img = document.createElement("img");
            img.src = i.photo;
            img.className = "thumb";
            dashThumbs.appendChild(img);
        }
    });

    updateDashboardTripDetails();
}
updateDashboard();

// Auto-balance
autoBalanceBtn.addEventListener("click", () => {
    const all = [...male.items, ...female.items];
    male.items = [];
    female.items = [];
    all.sort((a, b) => (b.weight * b.qty) - (a.weight * a.qty));
    all.forEach(item => {
        const m = male.items.reduce((a, b) => a + b.weight * b.qty, 0);
        const f = female.items.reduce((a, b) => a + b.weight * b.qty, 0);
        if (m <= f) male.items.push(item);
        else female.items.push(item);
    });
    updateDashboard();
    alert("Auto‑balanced between travellers.");
});

// Weather
const weatherApiKeyInput = document.getElementById("weatherApiKey");
const weatherOutput = document.getElementById("weatherOutput");
const fetchWeatherBtn = document.getElementById("fetchWeather");

fetchWeatherBtn.addEventListener("click", async () => {
    const key = weatherApiKeyInput.value.trim();
    const city = document.getElementById("departPort").value || "Orlando";
    if (!key) {
        weatherOutput.textContent = "Enter OpenWeather API key.";
        return;
    }
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${key}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.main) {
            const temp = data.main.temp;
            const rain = data.rain ? JSON.stringify(data.rain) : "No rain data";
            weatherOutput.textContent =
                `Weather for ${city}:\nTemp: ${temp} °C\nRain: ${rain}`;
        } else {
            weatherOutput.textContent = "Could not fetch weather.";
        }
    } catch (e) {
        weatherOutput.textContent = "Error fetching weather.";
    }
});

// Trip save/load
const newTripBtn = document.getElementById("newTrip");
const saveTripBtn = document.getElementById("saveTrip");
const loadTripBtn = document.getElementById("loadTrip");
const packingPreview = document.getElementById("packingPreview");

newTripBtn.addEventListener("click", () => {
    male = { items: [], carry: [] };
    female = { items: [], carry: [] };
    updateDashboard();
    packingPreview.textContent = "";
    alert("New trip started.");
});

saveTripBtn.addEventListener("click", () => {
    const trip = {
        tripName: document.getElementById("tripName").value,
        cruiseLine: document.getElementById("cruiseLine").value,
        ship: document.getElementById("ship").value,
        departPort: document.getElementById("departPort").value,
        departDate: document.getElementById("departDate").value,
        allowanceKg,
        male,
        female,
        categories,
        customExcursions
    };
    localStorage.setItem("cruisepack_trip", JSON.stringify(trip));
    alert("Trip saved.");
});

loadTripBtn.addEventListener("click", () => {
    const trip = JSON.parse(localStorage.getItem("cruisepack_trip"));
    if (!trip) {
        alert("No saved trip.");
        return;
    }
    document.getElementById("tripName").value = trip.tripName;
    document.getElementById("cruiseLine").value = trip.cruiseLine;
    document.getElementById("ship").value = trip.ship;
    document.getElementById("departPort").value = trip.departPort;
    document.getElementById("departDate").value = trip.departDate;
    allowanceKg = trip.allowanceKg || 23;
    allowanceInput.value = allowanceKg;
    male = trip.male;
    female = trip.female;
    categories = trip.categories || categories;
    customExcursions = trip.customExcursions || {};
    renderCategories();
    renderExcursionTemplates();
    updateAllowance();
    updateDashboard();
    alert("Trip loaded.");
});

// PDF export
const exportPdfBtn = document.getElementById("exportPdf");

function buildPackingPreview() {
    let out = "";
    out += `Trip: ${document.getElementById("tripName").value}\n`;
    out += `Cruise line: ${document.getElementById("cruiseLine").value}\n`;
    out += `Ship: ${document.getElementById("ship").value}\n`;
    out += `Departure: ${document.getElementById("departPort").value} on ${document.getElementById("departDate").value}\n`;
    out += `Allowance per bag: ${allowanceKg} kg\n\n`;

    out += "Male checked:\n";
    male.items.forEach(i => {
        out += `  - ${i.label} (${i.qty} × ${i.weight.toFixed(2)} kg)`;
        if (i.photo) out += " [photo]";
        out += "\n";
    });
    out += "\nMale carry‑on:\n";
    male.carry.forEach(i => {
        out += `  - ${i.label} (${i.qty} × ${i.weight.toFixed(2)} kg)`;
        if (i.photo) out += " [photo]";
        out += "\n";
    });

    out += "\nFemale checked:\n";
    female.items.forEach(i => {
        out += `  - ${i.label} (${i.qty} × ${i.weight.toFixed(2)} kg)`;
        if (i.photo) out += " [photo]";
        out += "\n";
    });
    out += "\nFemale carry‑on:\n";
    female.carry.forEach(i => {
        out += `  - ${i.label} (${i.qty} × ${i.weight.toFixed(2)} kg)`;
        if (i.photo) out += " [photo]";
        out += "\n";
    });

    packingPreview.textContent = out;
    return out;
}

exportPdfBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const text = buildPackingPreview();
    const lines = doc.splitTextToSize(text, 180);
    let y = 10;
    lines.forEach(line => {
        doc.text(line, 10, y);
        y += 6;
    });

    // Simple thumbnail embedding: first few photos
    const allItems = [...male.items, ...female.items, ...male.carry, ...female.carry];
    let imgY = y + 10;
    allItems.forEach(i => {
        if (i.photo) {
            try {
                doc.addImage(i.photo, "JPEG", 10, imgY, 30, 30);
                imgY += 35;
            } catch (e) {
                // ignore image errors
            }
        }
    });

    doc.save("CruisePackPro_PackingList.pdf");
});

// Service worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
}
