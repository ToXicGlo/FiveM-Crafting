Config = {}

Config.Recipes = {
    ["WEAPON_KNIFE"] = {
        label = "Knife",
        category = "weapons",
        rarity = "epic",
        xpGain = 0,
        requiredLevel = 5,
        ingredients = {
            { item = "iron", count = 5 },
            { item = "wood", count = 2 }
        },
        craftingTime = 15000, -- in ms
        animation = "amb@prop_human_parking_meter@male@base"
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
        xpGain = 0,
        requiredLevel = 20,
        craftingTime = 10000, -- in ms
        animation = "amb@prop_human_parking_meter@male@base"
    },
    ["medikit"] = {
        label = "Medkit",
        category = "healing",
        rarity = "rare",
        ingredients = {
            { item = "bandage", count = 5 },
            { item = "painkiller", count = 2 }
        },
        xpGain = 0,
        requiredLevel = 15,
        craftingTime = 5000, -- in ms
        animation = "amb@prop_human_parking_meter@male@base"
    },
    ["9mm_ammo"] = {
        label = "9mm Ammo",
        category = "weapons",
        rarity = "rare",
        xpGain = 0,
        requiredLevel = 10,
        ingredients = {
            { item = "iron", count = 3 },
            { item = "gunpowder", count = 1 }
        },
        craftingTime = 8000, -- in ms
        animation = "amb@prop_human_parking_meter@male@base"
    },
    ["coke_pooch"] = {
        label = "Coke Pooch",
        category = "drugs",
        rarity = "uncommon",
        xpGain = 0,
        ingredients = {
            { item = "coke", count = 5 },
            { item = "plastic", count = 1 }
        },
        craftingTime = 8000, -- in ms
        animation = "amb@prop_human_parking_meter@male@base"
    },
    ["repairkit"] = {
        label = "Repair Kit",
        category = "tools",
        rarity = "common",
        xpGain = 5,
        ingredients = {
            { item = "iron", count = 10 },
            { item = "screwdriver", count = 1 }
        },
        craftingTime = 8000, -- in ms
        animation = "amb@prop_human_parking_meter@male@base"
    },
    ["meth_pooch"] = {
        label = "Bagged Meth",
        category = "drugs",
        rarity = "uncommon",
        xpGain = 0,
        ingredients = {
            { item = "meth", count = 5 },
            { item = "plastic", count = 1 }
        },
        craftingTime = 8000, -- in ms
        animation = "amb@prop_human_parking_meter@male@base"
    },
    ["hash_baggy"] = {
        label = "Bagged Hash",
        category = "drugs",
        rarity = "uncommon",
        xpGain = 0,
        ingredients = {
            { item = "hash", count = 5 },
            { item = "plastic", count = 1 }
        },
        craftingTime = 8000, -- in ms
        animation = "amb@prop_human_parking_meter@male@base"
    },
}
