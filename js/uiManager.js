export class UIManager {
    constructor() {
        this.score = 0;
        this.health = 100;

        // Get all UI elements from the HTML
        this.scoreDisplay = document.getElementById('score-display');
        this.healthDisplay = document.getElementById('health-display');
        this.weaponDisplay = document.getElementById('weapon-display'); // New element
        this.crosshair = document.getElementById('crosshair');

        this.updateScoreDisplay();
        this.updateHealthDisplay();
    }

    updateWeaponDisplay(weaponName) {
        if (this.weaponDisplay) {
            this.weaponDisplay.textContent = `Weapon: ${weaponName}`;
        }
    }

    addScore(amount) {
        this.score += amount;
        this.updateScoreDisplay();
    }

    getScore() {
        return this.score;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.updateHealthDisplay();
    }

    getHealth() {
        return this.health;
    }

    updateScoreDisplay() {
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = `Score: ${Math.floor(this.score)}`;
        }
    }

    updateHealthDisplay() {
        if (this.healthDisplay) {
            this.healthDisplay.textContent = `Health: ${Math.floor(this.health)}`;
            if (this.health < 25) {
                this.healthDisplay.style.color = 'red';
            } else if (this.health < 50) {
                this.healthDisplay.style.color = 'orange';
            } else {
                this.healthDisplay.style.color = 'white';
            }
        }
    }

    addMessage(text, duration = 3000) {
        console.log(`Game Message: ${text}`);
    }
}