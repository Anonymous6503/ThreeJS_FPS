
export class GameLoop {
    constructor(renderCallback, updateCallback) {
        this.renderCallback = renderCallback; 
        this.updateCallback = updateCallback; 
        this.lastFrameTime = 0;
        this.animationFrameId = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    loop(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;

        // Update game state
        this.updateCallback(deltaTime);

        // Render the scene
        this.renderCallback();

        // Request next frame
        this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
    }
}