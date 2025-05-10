RegisterCommand("openCrafting", function()
    local recipes = Config.Recipes
    local recipeCount = 0

    for _ in pairs(recipes) do
        recipeCount = recipeCount + 1
    end

    SendNUIMessage({
        action = "open",
        recipes = recipes,
        recipeCount = recipeCount,
        options = Config.Options,
    })

    SetNuiFocus(true, true)
end)

RegisterNUICallback("close", function(data, cb)
    SetNuiFocus(false, false)
    cb("ok")
end)

RegisterNUICallback("craftItem", function(data, cb)
    TriggerServerEvent("tx_crafting:craftItem", data.item)
    cb("ok")
end)

RegisterNUICallback("getXP", function(data, cb)
    TriggerServerEvent("tx_crafting:getXP")
    cb("ok")
end)

RegisterNetEvent("tx_crafting:sendXPToNUI")
AddEventHandler("tx_crafting:sendXPToNUI", function(xp)
    SendNUIMessage({
        action = "receiveXP",
        xp = xp
    })
end)

RegisterNetEvent("tx_crafting:levelUp")
AddEventHandler("tx_crafting:levelUp", function(newLevel)
    SendNUIMessage({
        action = "notify",
        message = "Congratulations! You reached level " .. newLevel,
    })
end)

RegisterNetEvent("tx_crafting:craftingComplete")
AddEventHandler("tx_crafting:craftingComplete", function(item)
    SendNUIMessage({
        action = "notify",
        message = "Crafting of " .. item .. " is complete!",
    })
end)


