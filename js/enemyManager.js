class Enemy {
    constructor(id, scene, position) {
        this.id = id;
        this.scene = scene;
        this.health = 100;
        this.speed = 1;
        this.mesh = this.createMesh(position);
        this.mesh.name = `enemy-${this.id}`;
        this.scene.add(this.mesh);
    }

    createMesh(position) {
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    takeDamage(amount) {
        this.health -= amount;
        this.mesh.material.color.setHex(0xff0000); 
        setTimeout(() => {
            this.mesh.material.color.setHex(0x0000ff);
        }, 100);
    }

    update(deltaTime, playerPosition) {
        const direction = new THREE.Vector3().subVectors(playerPosition, this.mesh.position).normalize();
        this.mesh.position.addScaledVector(direction, this.speed * deltaTime);

        this.mesh.lookAt(playerPosition);
    }

    destroy() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

export class EnemyManager {
    constructor(scene, uiManager) {
        this.scene = scene;
        this.uiManager = uiManager;
        this.enemies = [];
        this.nextEnemyId = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 5;
        this.maxEnemies = 10;
    }

    spawnEnemy() {
        if (this.enemies.length >= this.maxEnemies) return;

        const x = Math.random() * 40 - 20; // -20 to 20
        const z = Math.random() * 40 - 20; // -20 to 20
        const y = 0.75; 

        const position = new THREE.Vector3(x, y, z);
        const enemy = new Enemy(this.nextEnemyId++, this.scene, position);
        this.enemies.push(enemy);
    }

    spawnInitialEnemies(count) {
        for(let i = 0; i < count; i++) {
            this.spawnEnemy();
        }
    }

    removeEnemy(id) {
        const index = this.enemies.findIndex(enemy => enemy.id === id);
        if (index !== -1) {
            this.enemies[index].destroy();
            this.enemies.splice(index, 1);
            this.uiManager.addMessage('Enemy Eliminated!');
        }
    }

    getEnemies() {
        return this.enemies;
    }

    update(deltaTime, playerPosition) {
        // Update all active enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, playerPosition);

            const distanceToPlayer = enemy.mesh.position.distanceTo(playerPosition);
            if (distanceToPlayer < 0.5) { 
                this.uiManager.takeDamage(0.05);
                
            }
        });

        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }
    }
}