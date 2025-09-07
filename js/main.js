// js/main.js
import { SceneManager } from './sceneManager.js';
import { PlayerController } from './playerController.js';
import { Shooter } from './shooter.js';
import { EnemyManager } from './enemyManager.js';
import { UIManager } from './uiManager.js';
import { GameLoop } from './gameLoop.js';

class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.playerController = null;
        this.shooter = null;
        this.enemyManager = null;
        this.uiManager = null;
        this.gameLoop = null;
        this.isPaused = true; // Game starts paused

        this.init();
    }

    init() {
        const canvas = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87ceeb); // Sky blue background
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        this.sceneManager = new SceneManager(this.scene);
        this.sceneManager.createWorld();

        this.uiManager = new UIManager();

        const collidables = this.sceneManager.getCollidableObjects();

        this.playerController = new PlayerController(this.camera, this.renderer.domElement, this.scene, collidables);
        this.shooter = new Shooter(this.camera, this.scene, this.enemyManager, this.uiManager);
        this.enemyManager = new EnemyManager(this.scene, this.uiManager);
        this.shooter.setEnemyManager(this.enemyManager);

        
        this.gameLoop = new GameLoop(this.render.bind(this), this.update.bind(this));

        window.addEventListener('resize', this.onWindowResize.bind(this));
        document.getElementById('start-game-button').addEventListener('click', this.startGame.bind(this));

        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('start-game-button').style.display = 'block';
        document.querySelector('#loading-screen p').textContent = 'Ready!';
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    startGame() {
        document.getElementById('loading-screen').style.display = 'none';
        this.playerController.enableControls();
        this.isPaused = false;
        this.gameLoop.start();
        this.enemyManager.spawnInitialEnemies(5);
    } 

    update(deltaTime) {
        if (this.isPaused) return;

        this.playerController.update(deltaTime);
        const playerPosition = this.playerController.yawObject.position;
        this.enemyManager.update(deltaTime, playerPosition);
        this.shooter.update(deltaTime);

        if (this.uiManager.getHealth() <= 0) {
            this.gameOver();
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    gameOver() {
        this.isPaused = true;
        this.playerController.disableControls();
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('start-game-button').style.display = 'none';
        document.querySelector('#loading-screen p').textContent = `Game Over! Score: ${this.uiManager.getScore()}`;
    }
}

window.addEventListener('load', () => new Game());