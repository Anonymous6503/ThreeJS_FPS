export class PlayerController {
    constructor(camera, domElement, scene, collidables) {
        this.camera = camera;
        this.domElement = domElement;
        this.scene = scene;
        this.collidables = collidables;

        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.movementSpeed = 80.0;
        this.lookSensitivity = 0.002;
        
        this.touchLookId = -1;
        this.lastTouchLook = { x: 0, y: 0 };

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.isPointerLocked = false;

        this.playerBox = new THREE.Box3();
        
        this.pitchObject = new THREE.Object3D();
        this.pitchObject.add(this.camera);
        this.pitchObject.rotation.order = 'YXZ';

        this.yawObject = new THREE.Object3D();
        this.yawObject.position.y = 1.6;
        this.yawObject.add(this.pitchObject);
        this.scene.add(this.yawObject);

        this.addEventListeners();
    }

    addEventListeners() {
        // Desktop
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
        
        // Touch
        this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), false);
        this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this), false);
        this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this), false);
        
        // Buttons
        this.setupMoveButton('move-forward', 'moveForward');
        this.setupMoveButton('move-backward', 'moveBackward');
        this.setupMoveButton('move-left', 'moveLeft');
        this.setupMoveButton('move-right', 'moveRight');
    }

    setupMoveButton(buttonId, stateKey) {
        const button = document.getElementById(buttonId);
        button.addEventListener('touchstart', (e) => { e.preventDefault(); this[stateKey] = true; });
        button.addEventListener('touchend', (e) => { e.preventDefault(); this[stateKey] = false; });
    }

    onTouchStart(event) {
        if (event.target === this.domElement && this.touchLookId === -1) {
            const touch = event.changedTouches[0];
            this.touchLookId = touch.identifier;
            this.lastTouchLook.x = touch.clientX;
            this.lastTouchLook.y = touch.clientY;
        }
    }

    onTouchMove(event) {
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            if (touch.identifier === this.touchLookId) {
                const deltaX = touch.clientX - this.lastTouchLook.x;
                const deltaY = touch.clientY - this.lastTouchLook.y;
                this.lastTouchLook.x = touch.clientX;
                this.lastTouchLook.y = touch.clientY;
                this.handleLook(deltaX, deltaY);
            }
        }
    }

    onTouchEnd(event) {
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            if (touch.identifier === this.touchLookId) {
                this.touchLookId = -1;
            }
        }
    }

    handleLook(movementX, movementY) {
        this.yawObject.rotation.y -= movementX * this.lookSensitivity;
        this.pitchObject.rotation.x -= movementY * this.lookSensitivity;
        this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
    }

    enableControls() { this.domElement.requestPointerLock(); }
    disableControls() { document.exitPointerLock(); }
    onPointerLockChange() { this.isPointerLocked = (document.pointerLockElement === this.domElement); }
    onMouseMove(event) { if (!this.isPointerLocked) return; this.handleLook(event.movementX || 0, event.movementY || 0); }
    
    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW': this.moveForward = true; break;
            case 'KeyA': this.moveLeft = true; break;
            case 'KeyS': this.moveBackward = true; break;
            case 'KeyD': this.moveRight = true; break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW': this.moveForward = false; break;
            case 'KeyA': this.moveLeft = false; break;
            case 'KeyS': this.moveBackward = false; break;
            case 'KeyD': this.moveRight = false; break;
        }
    }

    update(deltaTime) {

        // Stop all movement if pointer lock is lost on desktop, but allow mobile movement
        if (!this.isPointerLocked && !('ontouchstart' in window)) {
            return;
        }
        
        this.velocity.x -= this.velocity.x * 10.0 * deltaTime;
        this.velocity.z -= this.velocity.z * 10.0 * deltaTime;

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();

        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * this.movementSpeed * deltaTime;
        if (this.moveLeft || this.moveRight) this.velocity.x += this.direction.x * this.movementSpeed * deltaTime;

        const oldPosition = this.yawObject.position.clone();
        const moveX = this.velocity.x * deltaTime;
        const moveZ = this.velocity.z * deltaTime;

        this.yawObject.translateX(moveX);
        this.updatePlayerBox();
        if (this.checkCollisions()) {
            this.yawObject.position.x = oldPosition.x;
        }

        this.yawObject.translateZ(moveZ);
        this.updatePlayerBox();
        if (this.checkCollisions()) {
            this.yawObject.position.z = oldPosition.z;
        }
    }

    updatePlayerBox() {
        this.playerBox.setFromCenterAndSize(
            this.yawObject.position,
            new THREE.Vector3(0.5, 1.6, 0.5)
        );
    }

    checkCollisions() {
        for (let i = 0; i < this.collidables.length; i++) {
            if (this.playerBox.intersectsBox(this.collidables[i])) {
                return true;
            }
        }
        return false;
    }
}