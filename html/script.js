// Global variables
let allRecipes = {};
let selectedItemKey = null;
let activeCrafts = [];
let maxConcurrentCrafts = 3;
let previousXP = 0;
let playerLevel = 0;
let nextLevelXP = 0;
let maxLevel = 0;
let useNotification = true;
const craftIntervals = {};

// Event listeners
window.addEventListener("message", (event) => {
    const data = event.data;

    switch (data.action) {
        case "open":
            handleOpenAction(data);
            break;
        case "receiveXP":
            updateXPDisplay(data.xp);
            break;
    }
});

document.getElementById('categoryFilter').addEventListener('change', () => {
    const category = document.getElementById('categoryFilter').value;
    const searchQuery = document.getElementById('itemSearch').value.toLowerCase();
    renderRecipeList(category, searchQuery);
});

document.getElementById('itemSearch').addEventListener('input', () => {
    const searchQuery = document.getElementById('itemSearch').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    renderRecipeList(category, searchQuery);
});


// Handle "open" action
function handleOpenAction(data) {
    allRecipes = data.recipes;
    nextLevelXP = data.options.nextLevel;
    maxLevel = data.options.maxLevel;
    useNotification = data.options.useNotification;

    document.body.classList.remove("hidden");
    document.querySelector("#recipeCount").innerText = `${data.recipeCount} CRAFTABLE ITEMS`;

    renderRecipeList();
    fetch(`https://${GetParentResourceName()}/getXP`, { method: "POST" });
}


// Render the recipe list
function renderRecipeList(category = 'all', searchQuery = '') {
    const container = document.getElementById("recipeList");
    container.innerHTML = "";

    Object.entries(allRecipes).forEach(([key, recipe]) => {
        if (category !== 'all' && recipe.category !== category) return;
        if (!recipe.label.toLowerCase().includes(searchQuery)) return;

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
    });
}

// Select a recipe
function selectRecipe(key) {
    selectedItemKey = key;
    const recipe = allRecipes[key];
    const rarity = recipe.rarity || 'common';

    const selectedItem = document.getElementById("selectedItem");
    selectedItem.style.display = "block";
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

    updateCraftButton(recipe.requiredLevel);
}

// Update the craft button based on the player's level
function updateCraftButton(requiredLevel) {
    const craftButton = document.querySelector("button[onclick='startCraft()']");
    if (!craftButton) return;

    if (requiredLevel > playerLevel) {
        craftButton.disabled = true;
        craftButton.innerText = `Requires Level ${requiredLevel}`;
    } else {
        craftButton.disabled = false;
        craftButton.innerText = "Craft";
    }
}



// Start crafting an item
function startCraft() {
    if (!selectedItemKey) return;

    if (activeCrafts.length >= maxConcurrentCrafts) {
        showNotification(`You can't craft more than ${maxConcurrentCrafts} items at a time!`, 5000, "red");
        return;
    }

    const recipe = allRecipes[selectedItemKey];
    const timeMs = recipe.craftingTime || 35000;
    const id = Date.now();
    const craft = { id, key: selectedItemKey, label: recipe.label, time: timeMs, remaining: Math.floor(timeMs / 1000) };
    activeCrafts.push(craft);
    renderCraftingTimers();

    const interval = setInterval(() => {
        craft.remaining--;

        const timerText = document.getElementById(`craft-timer-${craft.id}`);
        if (timerText) timerText.innerText = formatTime(craft.remaining);

        const progressBar = document.getElementById(`progress-bar-${craft.id}`);
        if (progressBar) {
            const progress = Math.min(((timeMs - craft.remaining * 1000) / timeMs) * 100, 100);
            progressBar.style.width = `${progress}%`;
        }

        if (craft.remaining <= 0) {
            clearInterval(interval);
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

// Complete crafting an item
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

            showNotification(`Crafting Complete!`, 5000, "green");
            playCraftCompleteSound();
            fetch(`https://${GetParentResourceName()}/getXP`, { method: "POST" });
        }, 400);
    }
}


// Cancel crafting an item
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

// Crafting timers
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

// Update XP display
function updateXPDisplay(xp) {
    playerLevel = Math.floor(xp / nextLevelXP);
    const currentXP = xp % nextLevelXP;

    if (playerLevel >= maxLevel) {
        document.querySelector(".xp-bar-text").innerText = `Level ${maxLevel}`;
        document.querySelector(".xp-bar-count").innerText = `Max Level Reached`;
        document.querySelector(".xp-bar-fill").style.width = "100%";
        return;
    }

    document.querySelector(".xp-bar-text").innerText = `Level ${playerLevel}`;
    document.querySelector(".xp-bar-count").innerText = `${currentXP} / ${nextLevelXP} XP`;
    document.querySelector(".xp-bar-fill").style.width = `${(currentXP / nextLevelXP) * 100}%`;
}

// Utility functions
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Play crafting complete sound
function playCraftCompleteSound() {
    const sound = document.getElementById("craftCompleteSound");
    if (sound && sound.src) {
        sound.play().catch(err => console.error("Error playing the sound:", err));
    } else {
        console.error("Audio source is not defined correctly.");
    }
}

// Close the UI
function closeUI() {
    fetch(`https://${GetParentResourceName()}/close`, { method: "POST" });
    document.body.classList.add("hidden");
    activeCrafts = [];
    renderCraftingTimers();
    document.getElementById("selectedItem").style.display = "none";
    selectedItemKey = null;
}

// Show notification
function showNotification(message, duration = 3000, color = "green") {
    if (!useNotification) return;

    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notificationMessage");

    notificationMessage.innerText = message;

    notification.classList.remove("bg-green-500", "bg-red-500", "bg-blue-500");
    notification.classList.add(`bg-${color}-500`);

    notification.classList.remove("hidden", "fade-out");
    notification.classList.add("notification-fade-in");

    setTimeout(() => notification.classList.add("fade-out"), duration - 500);
    setTimeout(() => notification.classList.add("hidden"), duration);
}