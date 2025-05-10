local Proxy = module("vrp","lib/Proxy")
vRP = Proxy.getInterface("vRP")

RegisterServerEvent("tx_crafting:craftItem")
AddEventHandler("tx_crafting:craftItem", function(itemKey)
    local src = source
    local user_id = vRP.getUserId({src})
    if not user_id then 
        return 
    end

    if not Config.Recipes[itemKey] then
        print("Invalid itemKey received: " .. tostring(itemKey))
        return
    end

    local item = itemKey
    local xpGain = Config.Recipes[item].xpGain or Config.Options.standardXp

    exports.oxmysql:execute('SELECT xp FROM tx_crafting WHERE identifier = @identifier', {
        ['@identifier'] = user_id
    }, function(result)
        local xp = result[1] and result[1].xp or 0
        local playerLevel = math.floor(xp / Config.Options.nextLevel)
        
        if playerLevel >= Config.Options.maxLevel then
            print("Player " .. tostring(user_id) .. " has reached max level and cannot gain more XP.")
            return
        end

        exports.oxmysql:execute(
            'INSERT INTO tx_crafting (identifier, xp) VALUES (@identifier, @xp) ON DUPLICATE KEY UPDATE xp = xp + @xp',
            { ['@identifier'] = user_id, ['@xp'] = xpGain }
        )
        TriggerClientEvent("tx_crafting:craftingComplete", src, item)
        print("Player " .. tostring(user_id) .. " crafted item " .. item .. " and gained " .. tostring(xpGain) .. " XP.")
    end)
end)


RegisterNetEvent("tx_crafting:getXP")
AddEventHandler("tx_crafting:getXP", function()
    local src = source
    local user_id = vRP.getUserId({src})
    if not user_id then return end

    exports.oxmysql:execute('SELECT xp FROM tx_crafting WHERE identifier = @identifier', {
        ['@identifier'] = user_id
    }, function(result)
        local xp = result[1] and result[1].xp or 0
        TriggerClientEvent("tx_crafting:sendXPToNUI", src, xp)
    end)
end)


