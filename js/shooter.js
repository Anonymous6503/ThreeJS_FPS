function createPistolModel() {
    const pistolGroup = new THREE.Group();
    const gunMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6 });

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.1), gunMaterial);
    grip.position.set(0, -0.1, 0);
    pistolGroup.add(grip);

    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.4), gunMaterial);
    slide.position.set(0, 0.1, -0.1);
    pistolGroup.add(slide);

    return pistolGroup;
}

function createRifleModel() {
    const rifleGroup = new THREE.Group();
    const gunMaterial = new THREE.MeshStandardMaterial({ color: 0x545454, roughness: 0.7 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.9), gunMaterial);
    rifleGroup.add(body);

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.3), gunMaterial);
    stock.position.set(0, -0.05, 0.5);
    rifleGroup.add(stock);

    const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.2), gunMaterial);
    magazine.position.set(0, -0.15, -0.1);
    rifleGroup.add(magazine);

    return rifleGroup;
}

export class Shooter {
    constructor(camera, scene, enemyManager, uiManager) {
        this.camera = camera;
        this.scene = scene;
        this.enemyManager = enemyManager;
        this.uiManager = uiManager;
        this.raycaster = new THREE.Raycaster();
        this.lastShotTime = 0;
        this.isFiring = false; 

        // Gun configurations
        this.guns = {
            pistol: {
                name: 'Pistol',
                fireRate: 0.4,
                damage: 15,
                sound: new Audio('sounds/pistol_shot.mp3'),
                model: createPistolModel()
            },
            rifle: {
                name: 'Rifle',
                fireRate: 0.15,
                damage: 35,
                sound: new Audio('sounds/rifle_shot.mp3'),
                model: createRifleModel()
            }
        };

        // Container for the gun model, attached to the camera
        this.weaponModelContainer = new THREE.Group();
        this.weaponModelContainer.position.set(0.25, -0.3, -0.7);
        this.camera.add(this.weaponModelContainer);

        // Muzzle flash
        this.muzzleFlash = new THREE.PointLight(0xffa500, 50, 10);
        this.muzzleFlash.visible = false;
        this.weaponModelContainer.add(this.muzzleFlash);

        // Set initial weapon
        this.currentGun = null;
        this.switchWeapon('pistol');

        // --- EVENT LISTENERS ---
        // Desktop
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        // Mobile
        const fireButton = document.getElementById('fire-button');
        fireButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.onMouseDown(e); // Reuse the same logic
        });
        fireButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.onMouseUp(e); // Reuse the same logic
        });

        document.addEventListener('keydown', (event) => {
            if (event.code === 'Digit1') this.switchWeapon('pistol');
            if (event.code === 'Digit2') this.switchWeapon('rifle');
        });
    }

    onMouseDown(event) {
        // For mobile, don't trigger fire if the touch is for looking
        if (event.target && event.target.id !== 'fire-button' && event.type === 'touchstart') return;
        
        if (!document.pointerLockElement && window.innerWidth > 1024) return; // Pointer lock check for desktop
        
        this.isFiring = true;

        // Pistol is semi-automatic, so it only fires once on mousedown
        if (this.currentGun.name === 'Pistol') {
            this.fire();
        }
    }

    onMouseUp(event) {
        this.isFiring = false;
    }

    update(deltaTime) {
        if (this.isFiring && this.currentGun.name === 'Rifle') {
            this.fire();
        }
    }

    fire() {
        if (!this.currentGun) return;

        const currentTime = performance.now() / 1000;
        if (currentTime - this.lastShotTime < this.currentGun.fireRate) {
            return; 
        }
        this.lastShotTime = currentTime;

        // Muzzle Flash
        this.muzzleFlash.visible = true;
        setTimeout(() => { this.muzzleFlash.visible = false; }, 60);

        // Raycasting
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const enemies = this.enemyManager ? this.enemyManager.getEnemies() : [];
        const enemyMeshes = enemies.map(enemy => enemy.mesh);
        const intersects = this.raycaster.intersectObjects(enemyMeshes, true);

        let hitPoint;
        if (intersects.length > 0) {
            hitPoint = intersects[0].point;
            const hitEnemy = enemies.find(e => e.mesh === intersects[0].object);
            if (hitEnemy) {
                hitEnemy.takeDamage(this.currentGun.damage);
                this.uiManager.addScore(10);
                if (hitEnemy.health <= 0) {
                    this.enemyManager.removeEnemy(hitEnemy.id);
                    this.uiManager.addScore(50);
                }
            }
        } else {
            hitPoint = new THREE.Vector3();
            this.raycaster.ray.at(100, hitPoint);
        }

        this.createTracer(hitPoint);
    }
    
    switchWeapon(gunName) {
        if (this.currentGun && this.currentGun.name === this.guns[gunName].name) return;
        
        this.currentGun = this.guns[gunName];

        // Swap models
        if (this.weaponModelContainer.children.length > 1) {
             this.weaponModelContainer.remove(this.weaponModelContainer.children[1]); 
        }
        this.weaponModelContainer.add(this.currentGun.model);

        // Update UI
        this.uiManager.updateWeaponDisplay(this.currentGun.name);
    }

    setEnemyManager(enemyManager) {
        this.enemyManager = enemyManager;
    }

    createTracer(endPoint) {
        const startPoint = this.weaponModelContainer.position.clone();
        this.camera.localToWorld(startPoint);

        const tracerGeometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
        const tracerMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 });
        const tracer = new THREE.Line(tracerGeometry, tracerMaterial);
        this.scene.add(tracer);

        setTimeout(() => {
            this.scene.remove(tracer);
            tracerGeometry.dispose();
            tracerMaterial.dispose();
        }, 100);
    }
}