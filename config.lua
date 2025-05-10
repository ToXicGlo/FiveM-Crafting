Config = {}

Config.Options = {
    standardXp = 5, -- Default XP gain for crafting if not specified in the recipe
    nextLevel = 50, -- XP required for the next level (This is being calculated in the js for what level the player is)
    maxLevel = 20, -- Max level for crafting
    useNotification = true, -- Use notification system
}

Config.Recipes = {
    ["WEAPON_KNIFE"] = {
        label = "Knife",
        category = "weapons",
        rarity = "epic",
        ingredients = {
            { item = "iron", count = 5 },
            { item = "wood", count = 2 }
        },
        xpGain = 5,
        requiredLevel = 10,
        craftingTime = 15000, -- in ms
    },
    ["WEAPON_MICROSMG"] = {
        label = "Micro SMG",
        category = "weapons",
        rarity = "legendary",
        ingredients = {
            { item = "iron", count = 15 },
            { item = "wood", count = 5 },
            { item = "plastic", count = 3 }
        },
        xpGain = 15,
        requiredLevel = 20,
        craftingTime = 10000, -- in ms
    },
    ["medikit"] = {
        label = "Medkit",
        category = "healing",
        rarity = "rare",
        ingredients = {
            { item = "bandage", count = 5 },
            { item = "painkiller", count = 2 }
        },
        xpGain = 5,
        requiredLevel = 12,
        craftingTime = 5000, -- in ms
    },
    ["9mm_ammo"] = {
        label = "9mm Ammo",
        category = "weapons",
        rarity = "rare",
        ingredients = {
            { item = "iron", count = 3 },
            { item = "gunpowder", count = 1 }
        },
        xpGain = 0,
        requiredLevel = 5,
        craftingTime = 8000, -- in ms
    },
    ["coke_pooch"] = {
        label = "Coke Pooch",
        category = "drugs",
        rarity = "uncommon",
        ingredients = {
            { item = "coke", count = 5 },
            { item = "plastic", count = 1 }
        },
        xpGain = 2,
        requiredLevel = 5,
        craftingTime = 8000, -- in ms
    },
    ["repairkit"] = {
        label = "Repair Kit",
        category = "tools",
        rarity = "common",
        ingredients = {
            { item = "iron", count = 10 },
            { item = "screwdriver", count = 1 }
        },
        xpGain = 5,
        requiredLevel = 2,
        craftingTime = 8000, -- in ms
    },
    ["meth_pooch"] = {
        label = "Bagged Meth",
        category = "drugs",
        rarity = "uncommon",
        ingredients = {
            { item = "meth", count = 5 },
            { item = "plastic", count = 1 }
        },
        xpGain = 2,
        requiredLevel = 10,
        craftingTime = 8000, -- in ms
    },
    ["hash_baggy"] = {
        label = "Bagged Hash",
        category = "drugs",
        rarity = "uncommon",
        ingredients = {
            { item = "hash", count = 5 },
            { item = "plastic", count = 1 }
        },
        xpGain = 2,
        requiredLevel = 0,
        craftingTime = 5000, -- in ms
    },
}
