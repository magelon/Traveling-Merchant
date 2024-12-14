class TravelingMerchant {
    constructor() {
        this.money = 100;
        this.inventory = {};
        this.currentTown = 'Pazzio';
        this.day = 1;
        this.holoHappiness = 100;
        this.lastFed = 0;
        this.DAILY_FOOD_COST = 5;
        this.DAILY_INN_COST = 8;
        this.HOLO_HAPPINESS_DECAY = 5;
        
        // Start auto-save
        this.startAutoSave();
        
        this.initializeUI();
    }

    startAutoSave() {
        // Auto-save every 3 minutes (180000 milliseconds)
        this.autoSaveInterval = setInterval(() => {
            this.saveGame(true);  // true means it's an auto-save
        }, 180000);
    }

    initializeUI() {
        this.updateStatus();
        this.updateTownGoods();
        this.updateInventory();
        this.updateConnectedTowns();
    }

    getPriceMultiplier(town, item) {
        const seed = this.day + town + item;
        const random = Math.abs(Math.sin(seed.length * this.day));
        let baseMultiplier = 0.5 + (random * 1.0);

        // Holo's wisdom affects prices when she's happy
        if (this.holoHappiness > 60) {
            if (baseMultiplier > 1) {
                // Better selling prices when Holo is happy
                baseMultiplier += 0.2;
            } else {
                // Better buying prices when Holo is happy
                baseMultiplier -= 0.2;
            }
        }
        
        return baseMultiplier;
    }

    getItemPrice(town, item, isBuying = true) {
        // Check if the item exists in current town
        if (TOWNS[town]['goods'][item]) {
            const basePrice = TOWNS[town]['goods'][item]['base_price'];
            const multiplier = this.getPriceMultiplier(town, item);
            if (isBuying) {
                return Math.round(basePrice * multiplier * 1.1); // 10% markup when buying
            }
            return Math.round(basePrice * multiplier);
        } else {
            // If item is not sold in this town, use average price from all towns
            let totalPrice = 0;
            let count = 0;
            Object.values(TOWNS).forEach(townData => {
                if (townData.goods[item]) {
                    totalPrice += townData.goods[item].base_price;
                    count++;
                }
            });
            const averagePrice = count > 0 ? totalPrice / count : 20; // default to 20 if item not found
            const multiplier = this.getPriceMultiplier(town, item);
            return Math.round(averagePrice * multiplier);
        }
    }

    updateStatus() {
        // Lawrence's status
        document.getElementById('day').textContent = this.day;
        document.getElementById('current-town').textContent = this.currentTown;
        document.getElementById('money').textContent = this.money;
        document.getElementById('reputation').textContent = this.getReputation();
        document.getElementById('expenses').textContent = this.DAILY_FOOD_COST + this.DAILY_INN_COST;

        // Holo's status
        const holoStatus = this.getHoloMood();
        document.getElementById('holo-status').textContent = holoStatus;
        document.getElementById('last-fed').textContent = 
            this.lastFed === 0 ? 'Never' : `Day ${this.lastFed}`;
        document.getElementById('wisdom-bonus').textContent = 
            this.holoHappiness > 60 ? 'Active (+20% better prices)' : 'None';
    }

    getReputation() {
        if (this.money > 1000) return "Master Merchant";
        if (this.money > 500) return "Skilled Trader";
        if (this.money > 250) return "Merchant";
        return `Novice (Daily expenses: ${this.DAILY_FOOD_COST + this.DAILY_INN_COST} gold)`;
    }

    updateTownGoods() {
        const goodsList = document.getElementById('town-goods');
        goodsList.innerHTML = '';
        
        Object.entries(TOWNS[this.currentTown]['goods']).forEach(([item, data]) => {
            const basePrice = data.base_price;
            const currentPrice = this.getItemPrice(this.currentTown, item);
            const priceColor = currentPrice > basePrice ? 'red' : 'green';
            
            const goodItem = document.createElement('div');
            goodItem.className = 'good-item';
            goodItem.innerHTML = `
                <span style="color: ${priceColor}">
                    ${item} - Base: ${basePrice} - Market: ${currentPrice} gold ${currentPrice > basePrice ? '↑' : '↓'}
                </span>
                <button onclick="game.buy('${item}', 1)">Buy</button>
            `;
            goodsList.appendChild(goodItem);
        });
    }

    updateInventory() {
        const inventoryList = document.getElementById('player-inventory');
        inventoryList.innerHTML = '';
        
        console.log('Current inventory:', this.inventory);
        
        Object.entries(this.inventory).forEach(([item, data]) => {
            if (data.quantity > 0) {
                const sellPrice = this.getItemPrice(this.currentTown, item, false);
                const isProfitable = sellPrice > data.buyPrice;
                
                const goodItem = document.createElement('div');
                goodItem.className = 'good-item';
                goodItem.innerHTML = `
                    <span style="${isProfitable ? 'color: green;' : ''}">
                        ${item} (${data.quantity}) - Bought: ${data.buyPrice} - Sell: ${sellPrice} gold ${isProfitable ? '↑' : ''}
                    </span>
                    <button onclick="game.sell('${item}', 1)">Sell</button>
                `;
                inventoryList.appendChild(goodItem);
            }
        });
        
        if (inventoryList.children.length === 0) {
            inventoryList.innerHTML = '<div class="message">Empty</div>';
        }
    }

    updateConnectedTowns() {
        const townsList = document.getElementById('connected-towns');
        townsList.innerHTML = '';
        
        console.log('Current town:', this.currentTown);
        console.log('Available connections:', TOWNS[this.currentTown]['connections']);
        
        TOWNS[this.currentTown]['connections'].forEach(town => {
            const button = document.createElement('button');
            button.textContent = town;
            button.onclick = () => this.travel(town);
            townsList.appendChild(button);
        });
    }

    logMessage(message) {
        const messageLog = document.getElementById('message-log');
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = message;
        messageLog.insertBefore(messageElement, messageLog.firstChild);
    }

    buy(item, quantity) {
        const price = this.getItemPrice(this.currentTown, item);
        const totalCost = price * quantity;

        if (totalCost > this.money) {
            this.logMessage("Not enough money!");
            return;
        }

        this.money -= totalCost;
        this.inventory[item] = {
            quantity: (this.inventory[item]?.quantity || 0) + quantity,
            buyPrice: price
        };
        
        this.logMessage(`Bought ${quantity} ${item} for ${totalCost} gold`);
        this.updateStatus();
        this.updateInventory();
    }

    sell(item, quantity) {
        if (!this.inventory[item] || this.inventory[item].quantity < quantity) {
            this.logMessage("Not enough items!");
            return;
        }

        const sellPrice = this.getItemPrice(this.currentTown, item, false);
        const totalPrice = sellPrice * quantity;

        console.log(`Selling ${quantity} ${item}`);
        console.log(`Buy price was: ${this.inventory[item].buyPrice}`);
        console.log(`Selling price: ${sellPrice}`);
        console.log(`Total price: ${totalPrice}`);
        console.log(`Current money: ${this.money}`);

        this.money += totalPrice;
        this.inventory[item].quantity -= quantity;
        
        if (this.inventory[item].quantity <= 0) {
            delete this.inventory[item];
        }

        console.log(`New money total: ${this.money}`);
        
        this.logMessage(`Sold ${quantity} ${item} for ${totalPrice} gold`);
        this.updateStatus();
        this.updateInventory();
    }

    travel(destination) {
        if (!TOWNS[this.currentTown]['connections'].includes(destination)) {
            this.logMessage("You can't travel there directly!");
            return;
        }

        // Calculate daily expenses
        const foodCost = this.DAILY_FOOD_COST;
        const innCost = this.DAILY_INN_COST;
        const totalDailyCost = foodCost + innCost;

        if (this.money < totalDailyCost) {
            this.logMessage("Not enough money for food and lodging!");
            return;
        }

        const currentInventory = {...this.inventory};
        this.currentTown = destination;
        this.day += 1;
        this.inventory = currentInventory;

        // Pay daily expenses
        this.money -= totalDailyCost;
        this.logMessage(`Paid ${foodCost} gold for food and ${innCost} gold for lodging`);

        // Holo gets hungrier each day, but more slowly
        this.holoHappiness = Math.max(0, this.holoHappiness - this.HOLO_HAPPINESS_DECAY);
        
        // Extra food cost if Holo is unhappy (stress eating!)
        if (this.holoHappiness < 30) {
            const extraFood = Math.round(this.DAILY_FOOD_COST * 0.5);
            if (this.money >= extraFood) {
                this.money -= extraFood;
                this.logMessage(`Holo stress-ate extra food costing ${extraFood} gold...`);
            } else {
                this.holoHappiness = Math.max(0, this.holoHappiness - 10);
                this.logMessage("Holo is very unhappy about the lack of food!");
            }
        }

        if (this.holoHappiness < 30) {
            this.logMessage("'Lawrence, I'm hungry...' Holo's tail swishes in irritation.");
        }

        this.logMessage(`Traveled to ${destination}`);
        this.updateStatus();
        this.updateTownGoods();
        this.updateInventory();
        this.updateConnectedTowns();
    }

    getHoloMood() {
        if (this.holoHappiness > 85) return "very happy";
        if (this.holoHappiness > 65) return "happy";
        if (this.holoHappiness > 45) return "neutral";
        if (this.holoHappiness > 25) return "annoyed";
        return "angry";
    }

    feedHolo() {
        if (!this.inventory['apples'] || this.inventory['apples'].quantity < 1) {
            this.logMessage("You don't have any apples to give to Holo!");
            return;
        }

        this.inventory['apples'].quantity -= 1;
        if (this.inventory['apples'].quantity <= 0) {
            delete this.inventory['apples'];
        }

        this.holoHappiness = Math.min(100, this.holoHappiness + 20);
        this.lastFed = this.day;
        this.logMessage("Holo happily munches on the apple! 'Thank you, Lawrence!'");
        this.updateStatus();
        this.updateInventory();
    }

    saveGame(isAutoSave = false) {
        const gameState = {
            money: this.money,
            inventory: this.inventory,
            currentTown: this.currentTown,
            day: this.day,
            holoHappiness: this.holoHappiness,
            lastFed: this.lastFed
        };
        
        localStorage.setItem('merchantGameSave', JSON.stringify(gameState));
        if (!isAutoSave) {
            this.logMessage("Game saved successfully!");
        } else {
            this.logMessage("Auto-saved game...");
        }
    }

    loadGame() {
        const savedGame = localStorage.getItem('merchantGameSave');
        if (!savedGame) {
            this.logMessage("No saved game found!");
            return;
        }

        try {
            // Clear existing auto-save interval
            clearInterval(this.autoSaveInterval);
            
            const gameState = JSON.parse(savedGame);
            this.money = gameState.money;
            this.inventory = gameState.inventory;
            this.currentTown = gameState.currentTown;
            this.day = gameState.day;
            this.holoHappiness = gameState.holoHappiness;
            this.lastFed = gameState.lastFed;

            // Restart auto-save
            this.startAutoSave();

            this.logMessage("Game loaded successfully!");
            this.initializeUI();
        } catch (error) {
            this.logMessage("Error loading saved game!");
            console.error(error);
        }
    }

    restartGame() {
        if (confirm("Are you sure you want to restart? All progress will be lost!")) {
            // Clear the auto-save interval
            clearInterval(this.autoSaveInterval);
            
            this.money = 100;
            this.inventory = {};
            this.currentTown = 'Pazzio';
            this.day = 1;
            this.holoHappiness = 100;
            this.lastFed = 0;

            // Restart auto-save
            this.startAutoSave();

            this.logMessage("Game restarted!");
            this.initializeUI();
        }
    }
}

const game = new TravelingMerchant(); 