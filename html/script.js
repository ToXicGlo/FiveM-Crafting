// Global variables
let allRecipes = {};
let selectedItemKey = null;
let activeCrafts = [];
let maxConcurrentCrafts = 3;
let previousXP = 0;
const craftIntervals = {};

// Event listeners
window.addEventListener("message", function(event) {
    const data = event.data;

    if (data.action === "open") {
        allRecipes = data.recipes;
        document.body.classList.remove("hidden");
        document.querySelector("#recipeCount").innerText = `${data.recipeCount} CRAFTABLE ITEMS`;
        renderRecipeList();
        fetch(`https://${GetParentResourceName()}/getXP`, { method: "POST" });
    }

    if (data.action === "receiveXP") {
        updateXPDisplay(data.xp);
    }
});

document.getElementById('categoryFilter').addEventListener('change', function() {
    const category = this.value;
    renderRecipeList(category);
});

// XP display functions
function updateXPDisplay(xp) {
    const nextLevelXP = 50;
    const level = Math.floor(xp / nextLevelXP);
    const currentXP = xp % nextLevelXP;

    document.querySelector(".xp-bar-text").innerText = `Level ${level}`;
    document.querySelector(".xp-bar-count").innerText = `${currentXP} / ${nextLevelXP} XP`;

    const bar = document.querySelector(".xp-bar-fill");
    if (bar) {
        const width = (currentXP / nextLevelXP) * 100;
        bar.style.setProperty("width", `${width}%`, "important");
    } else {
        console.error("XP bar element not found!");
    }

    previousXP = xp;
}

document.getElementById('categoryFilter').addEventListener('change', function() {
    const category = this.value;
    renderRecipeList(category, document.getElementById('itemSearch').value);
});

document.getElementById('itemSearch').addEventListener('input', function() {
    const searchQuery = this.value.toLowerCase();
    renderRecipeList(document.getElementById('categoryFilter').value, searchQuery);
});


function renderRecipeList(category = 'all', searchQuery = '') {
    const container = document.getElementById("recipeList");
    container.innerHTML = "";

    Object.entries(allRecipes).forEach(([key, recipe]) => {
        if (category !== 'all' && recipe.category !== category) return;

        if (recipe.label.toLowerCase().includes(searchQuery)) {
            const rarity = recipe.rarity || 'common';
            const rarityLabel = rarity.toUpperCase();

            const el = document.createElement("div");
            el.className = "flex items-center justify-between bg-gray-800 px-4 py-3 rounded-lg hover:bg-gray-700 transition cursor-pointer shadow-md animated-item";
            el.onclick = () => selectRecipe(key);

            el.innerHTML = `
                <div class="flex items-center gap-4">
                    <img src="images/${key}.png" class="w-12 h-12 rounded object-cover" alt="${recipe.label}" />
                    <div>
                        <div class="text-lg font-bold text-lime-300">${recipe.label}</div>
                    </div>
                </div>
                <div class="text-sm px-3 py-1 rounded rarity-${rarity}">${rarityLabel}</div>
            `;

            container.appendChild(el);
        }
    });
}


function selectRecipe(key) {
    selectedItemKey = key;
    const recipe = allRecipes[key];
    const rarity = recipe.rarity || 'common';

    const selectedItem = document.getElementById("selectedItem");
    selectedItem.style.display = "block ";
    selectedItem.classList.remove("animated-item");
    void selectedItem.offsetWidth; // Force reflow
    selectedItem.classList.add("animated-item");

    document.getElementById("itemImage").src = `images/${key}.png`;
    document.getElementById("itemDescription").innerText = `Craft a ${recipe.label} using ${recipe.ingredients.length} resources.`;

    const tag = document.getElementById("itemTag");
    tag.innerText = rarity.toUpperCase();
    tag.className = `text-sm font-bold rarity-${rarity}`;

    document.getElementById("itemName").innerText = recipe.label;

    const craftingTime = recipe.craftingTime || 35000;
    const timeInSeconds = Math.floor(craftingTime / 1000);

    const reqContainer = document.getElementById("itemRequirements");
    reqContainer.innerHTML = `
        ${recipe.ingredients.map(i => `
            <span class="bg-gray-700 px-2 py-1 rounded">${i.count}x ${i.item}</span>
        `).join("")}
        <span class="bg-gray-700 px-2 py-1 rounded flex items-center gap-1 text-sm">
            <i class="fas fa-clock"></i> ${timeInSeconds}s
        </span>
    `;
}

// Start crafting
function startCraft() {
    if (!selectedItemKey) return;

    if (activeCrafts.length >= maxConcurrentCrafts) {
        showCraftLimitNotification();
        return;
    }

    const recipe = allRecipes[selectedItemKey];
    const timeMs = recipe.craftingTime || 35000;
    const id = Date.now();
    const craft = { id, key: selectedItemKey, label: recipe.label, time: timeMs, remaining: Math.floor(timeMs / 1000) };
    activeCrafts.push(craft);
    renderCraftingTimers();

    let interval = setInterval(() => {
        craft.remaining--;

        const timerText = document.getElementById(`craft-timer-${craft.id}`);
        if (timerText) timerText.innerText = formatTime(craft.remaining);

        const progressBar = document.getElementById(`progress-bar-${craft.id}`);
        if (progressBar) {
            const progress = Math.min(((timeMs - craft.remaining * 1000) / timeMs) * 100, 100);
            progressBar.style.width = `${progress}%`;
        }

        if (craft.remaining <= 0) {
            clearInterval(interval);  // Clear the interval when crafting is done
            completeCraft(craft.id);
            fetch(`https://${GetParentResourceName()}/craftItem`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item: selectedItemKey }),
            });
        }
    }, 1000);

    craftIntervals[craft.id] = interval;
}


function playCraftCompleteSound() {
    const sound = document.getElementById("craftCompleteSound");
    if (sound && sound.src) {
        sound.play().catch(err => {
            console.error("Error playing the sound: ", err);
        });
    } else {
        console.error("Audio source is not defined correctly.");
    }
}

function completeCraft(id) {
    const element = document.querySelector(`[data-id="${id}"]`);
    if (element) {
        element.classList.add("fade-out");

        setTimeout(() => {
            element.remove();
            activeCrafts = activeCrafts.filter(c => c.id !== id);

            if (activeCrafts.length === 0) {
                document.getElementById("craftingTimerContainer").classList.add("hidden");
            }

            playCraftCompleteSound();
            fetch(`https://${GetParentResourceName()}/getXP`, { method: "POST" });
        }, 400);
    }
}


function cancelCraft(id) {
    if (craftIntervals[id]) {
        clearInterval(craftIntervals[id]);
        delete craftIntervals[id];
    }
    activeCrafts = activeCrafts.filter(craft => craft.id !== id);

    const element = document.querySelector(`[data-id="${id}"]`);
    if (element) {
        element.remove();
    }

    if (activeCrafts.length === 0) {
        document.getElementById("craftingTimerContainer").classList.add("hidden");
    }
}



function renderCraftingTimers() {
    const container = document.getElementById("craftingTimerRow");
    const wrapper = document.getElementById("craftingTimerContainer");

    if (activeCrafts.length === 0) {
        wrapper.classList.add("hidden");
        return;
    }

    wrapper.classList.remove("hidden");

    const existingIds = Array.from(container.children).map(child => Number(child.dataset.id));

    activeCrafts.forEach(craft => {
        if (existingIds.includes(craft.id)) return;

        const block = document.createElement("div");
        block.dataset.id = craft.id;
        block.className = "bg-gray-800 rounded-lg p-3 flex flex-col items-center w-36 shadow animated-item";

        const progressBarId = `progress-bar-${craft.id}`;

        block.innerHTML = `
            <img src="images/${craft.key}.png" class="w-10 h-10 rounded mb-2" />
            <div class="text-sm font-semibold text-center">${craft.label}</div>
            <div class="w-full h-2 bg-gray-700 rounded overflow-hidden mt-2">
                <div id="${progressBarId}" class="progress-bar h-full bg-green-500 rounded" style="width: 0%"></div>
            </div>
            <!-- Timer display -->
            <div id="craft-timer-${craft.id}" class="text-sm text-gray-300 mt-2">${formatTime(craft.remaining)}</div>
            <button onclick="cancelCraft(${craft.id})" class="mt-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs hover:bg-red-600">Cancel</button>
        `;

        container.appendChild(block);

        const startTime = Date.now();
        const craftDuration = craft.time;
        const offset = 1000;

        const updateProgress = () => {
            const elapsedTime = Date.now() - startTime + offset;
            const progress = Math.min((elapsedTime / craftDuration) * 100, 100);
            const progressBar = document.getElementById(progressBarId);

            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }

            if (elapsedTime < craftDuration) {
                requestAnimationFrame(updateProgress);
            } else {
                clearInterval(interval);
                delete craftIntervals[craft.id];

                const element = document.querySelector(`[data-id="${craft.id}"]`);
                if (element) {
                    element.classList.add("fade-out");

                    setTimeout(() => {
                        element.remove();
                        activeCrafts = activeCrafts.filter(c => c.id !== craft.id);

                        if (activeCrafts.length === 0) {
                            document.getElementById("craftingTimerContainer").classList.add("hidden");
                        }

                        fetch(`https://${GetParentResourceName()}/getXP`, { method: "POST" });
                    }, 400);
                }
            }
        };
        requestAnimationFrame(updateProgress);
    });
}

// Utility functions
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function closeUI() {
    fetch(`https://${GetParentResourceName()}/close`, { method: "POST" });
    document.body.classList.add("hidden");
    activeCrafts = [];
    renderCraftingTimers();
    document.getElementById("selectedItem").style.display = "none";
    selectedItemKey = null;
}