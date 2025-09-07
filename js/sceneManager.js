export class SceneManager {
    constructor(scene) {
        this.scene = scene;
        this.collidableObjects = []; 
    }

    createWorld() {
        this.createFloor();
        this.createLights();

        // Walls
        this.addWall(new THREE.Vector3(0, 2.5, -25), new THREE.Vector3(50, 5, 0.5)); // Back
        this.addWall(new THREE.Vector3(0, 2.5, 25), new THREE.Vector3(50, 5, 0.5));  // Front
        this.addWall(new THREE.Vector3(-25, 2.5, 0), new THREE.Vector3(0.5, 5, 50)); // Left
        this.addWall(new THREE.Vector3(25, 2.5, 0), new THREE.Vector3(0.5, 5, 50));  // Right

        // Obstacles
        this.addWall(new THREE.Vector3(10, 1, -10), new THREE.Vector3(2, 2, 2), 0xff0000); 
        this.addWall(new THREE.Vector3(-15, 1, 5), new THREE.Vector3(2, 2, 2), 0xff0000);
    }

    addWall(position, size, color = 0xcccccc) {
        const wallGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const wallMaterial = new THREE.MeshLambertMaterial({ color: color });
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.copy(position);
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.scene.add(wall);

        // Create a bounding box and add it to the collidable objects list, this helps in detecting collision
        const wallBBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        wallBBox.setFromObject(wall);
        this.collidableObjects.push(wallBBox);
    }

    createFloor() {
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    createLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(15, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);
    }

    getCollidableObjects() {
        return this.collidableObjects;
    }
}