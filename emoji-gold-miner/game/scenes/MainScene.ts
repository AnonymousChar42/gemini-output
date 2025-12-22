import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';
import { GAME_WIDTH, GAME_HEIGHT, HookState, ITEM_TYPES, HOOK_SPEED, SWING_SPEED, SWING_LIMIT } from '../Constants';

export class MainScene extends Phaser.Scene {
  // Explicitly declare properties that might be missing from type definitions in some environments
  declare cameras: Phaser.Cameras.Scene2D.CameraManager;
  declare add: Phaser.GameObjects.GameObjectFactory;
  declare physics: Phaser.Physics.Arcade.ArcadePhysics;
  declare input: Phaser.Input.InputPlugin;
  declare time: Phaser.Time.Clock;
  declare tweens: Phaser.Tweens.TweenManager;

  private miner!: Phaser.GameObjects.Text;
  private hook!: Phaser.GameObjects.Text;
  private ropeGraphics!: Phaser.GameObjects.Graphics;
  private items!: Phaser.Physics.Arcade.Group;
  
  // Game State
  private hookState: HookState = HookState.SWINGING;
  private hookAngle: number = 0;
  private hookDirection: number = 1; // 1 = right, -1 = left
  private caughtItem: Phaser.GameObjects.Text | null = null;
  private currentLevel: number = 1;
  private score: number = 0;
  private targetScore: number = 650;
  private timeLeft: number = 30;
  private timerEvent!: Phaser.Time.TimerEvent;
  private isGameActive: boolean = false;

  constructor() {
    super('MainScene');
  }

  create(data: { level: number, score: number, target: number }) {
    this.currentLevel = data.level || 1;
    this.score = data.score || 0;
    // Reduced difficulty formula: Base 350 + (Level * 300). Level 1 = 650.
    this.targetScore = data.target || 350 + (this.currentLevel * 300);
    this.timeLeft = 30; // Set to 30 seconds
    this.isGameActive = true;
    
    // Reset state
    this.hookState = HookState.SWINGING;
    this.caughtItem = null;
    this.hookAngle = 0;

    // Background
    this.cameras.main.setBackgroundColor('#5D4037'); // Dirt color

    // Setup Graphics for the rope
    this.ropeGraphics = this.add.graphics();

    // Miner (Visual only)
    this.miner = this.add.text(GAME_WIDTH / 2, 40, '🤠', { fontSize: '48px' }).setOrigin(0.5);

    // Hook
    this.hook = this.add.text(GAME_WIDTH / 2, 80, '⚓', { fontSize: '32px' }).setOrigin(0.5);
    this.physics.add.existing(this.hook);
    const hookBody = this.hook.body as Phaser.Physics.Arcade.Body;
    hookBody.setCircle(15);
    hookBody.setAllowGravity(false);

    // Items Group
    this.items = this.physics.add.group();
    this.spawnItems();

    // Inputs
    this.input.keyboard?.on('keydown-SPACE', this.launchHook, this);
    this.input.keyboard?.on('keydown-DOWN', this.launchHook, this);
    this.input.on('pointerdown', this.launchHook, this);

    // Timer
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // Notify React of initial state
    EventBus.emit(GameEvents.SCORE_CHANGE, { score: this.score, target: this.targetScore });
    EventBus.emit(GameEvents.TIME_CHANGE, this.timeLeft);
    EventBus.emit(GameEvents.LEVEL_CHANGE, this.currentLevel);
  }

  spawnItems() {
    const numItems = 8 + this.currentLevel * 2;
    for (let i = 0; i < numItems; i++) {
      const typeDef = Phaser.Math.RND.pick(ITEM_TYPES);
      
      // Random position strictly below the miner area
      const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
      const y = Phaser.Math.Between(200, GAME_HEIGHT - 50);

      // Create Text object as Sprite
      const item = this.add.text(x, y, typeDef.icon, { fontSize: typeDef.radius * 2 + 'px' });
      item.setOrigin(0.5);
      
      // Enable physics
      this.physics.add.existing(item);
      const body = item.body as Phaser.Physics.Arcade.Body;
      body.setCircle(typeDef.radius);
      body.setImmovable(true);

      // Store data on the object
      item.setData('value', typeDef.value);
      item.setData('weight', typeDef.weight);
      item.setData('type', typeDef.type);

      this.items.add(item);
    }
  }

  updateTimer() {
    if (!this.isGameActive) return;

    this.timeLeft--;
    EventBus.emit(GameEvents.TIME_CHANGE, this.timeLeft);

    if (this.timeLeft <= 0) {
      this.checkEndCondition();
    }
  }

  checkEndCondition() {
    this.isGameActive = false;
    this.timerEvent.remove();
    if (this.score >= this.targetScore) {
      EventBus.emit(GameEvents.LEVEL_COMPLETE, { score: this.score, level: this.currentLevel });
    } else {
      EventBus.emit(GameEvents.GAME_OVER, { score: this.score });
    }
  }

  launchHook() {
    if (this.hookState === HookState.SWINGING && this.isGameActive) {
      this.hookState = HookState.SHOOTING;
      
      // Calculate velocity vector based on current angle
      // Angle is in degrees, need radians. Phaser rotation 0 is East. 
      // Our angle 0 is South (90 degrees in Phaser math).
      // Let's standard math it: Angle 0 is straight down.
      const rad = Phaser.Math.DegToRad(this.hookAngle + 90);
      const dirX = Math.cos(rad);
      const dirY = Math.sin(rad);
      
      this.hook.setData('dirX', dirX);
      this.hook.setData('dirY', dirY);
    }
  }

  update() {
    if (!this.isGameActive) return;

    // Draw line from miner to hook
    this.ropeGraphics.clear();
    this.ropeGraphics.lineStyle(4, 0x000000); // Black rope
    this.ropeGraphics.beginPath();
    this.ropeGraphics.moveTo(GAME_WIDTH / 2, 60); // Anchor point
    this.ropeGraphics.lineTo(this.hook.x, this.hook.y);
    this.ropeGraphics.strokePath();

    if (this.hookState === HookState.SWINGING) {
      this.updateSwing();
    } else if (this.hookState === HookState.SHOOTING) {
      this.updateShooting();
    } else if (this.hookState === HookState.RETRACTING) {
      this.updateRetracting();
    }
  }

  updateSwing() {
    // Oscillate angle
    this.hookAngle += SWING_SPEED * this.hookDirection;
    if (this.hookAngle > SWING_LIMIT) {
      this.hookAngle = SWING_LIMIT;
      this.hookDirection = -1;
    } else if (this.hookAngle < -SWING_LIMIT) {
      this.hookAngle = -SWING_LIMIT;
      this.hookDirection = 1;
    }

    // Position hook relative to anchor to look like it's swinging
    const rad = Phaser.Math.DegToRad(this.hookAngle + 90);
    this.hook.setRotation(rad - Math.PI / 2); // Rotate the emoji itself
    
    // Keep it near origin but allow it to rotate visually
    this.hook.x = GAME_WIDTH / 2 + Math.cos(rad) * 30;
    this.hook.y = 60 + Math.sin(rad) * 30;
  }

  updateShooting() {
    const dirX = this.hook.getData('dirX');
    const dirY = this.hook.getData('dirY');

    this.hook.x += dirX * HOOK_SPEED;
    this.hook.y += dirY * HOOK_SPEED;

    // Bounds check
    if (this.hook.x < 0 || this.hook.x > GAME_WIDTH || this.hook.y > GAME_HEIGHT) {
      this.hookState = HookState.RETRACTING;
    }

    // Collision check
    this.physics.overlap(this.hook, this.items, (hook, item) => {
      // Only catch one item
      if (this.hookState === HookState.SHOOTING && !this.caughtItem) {
        this.hookState = HookState.RETRACTING;
        this.caughtItem = item as Phaser.GameObjects.Text;
        // Stop item from processing physics while being dragged
        const body = this.caughtItem.body as Phaser.Physics.Arcade.Body;
        body.enable = false;
      }
    });
  }

  updateRetracting() {
    const anchorX = GAME_WIDTH / 2;
    const anchorY = 60;
    
    let speed = HOOK_SPEED * 2; // Fast retraction if empty

    if (this.caughtItem) {
      const weight = this.caughtItem.getData('weight');
      speed = HOOK_SPEED / (weight / 10); // Heavier = slower
      
      // Update item position to follow hook
      this.caughtItem.x = this.hook.x;
      this.caughtItem.y = this.hook.y + 10;
      this.caughtItem.setRotation(this.hook.rotation);
    }

    // Move towards anchor
    const dist = Phaser.Math.Distance.Between(this.hook.x, this.hook.y, anchorX, anchorY);
    
    if (dist < speed) {
      // Reached home
      this.hook.x = anchorX;
      this.hook.y = anchorY + 30;
      this.hookState = HookState.SWINGING;
      
      if (this.caughtItem) {
        const value = this.caughtItem.getData('value');
        this.score += value;
        
        // Float Score Text
        const text = this.add.text(anchorX, anchorY, `+${value}`, { fontSize: '24px', color: '#FFFF00', stroke: '#000', strokeThickness: 4 });
        this.tweens.add({
          targets: text,
          y: anchorY - 50,
          alpha: 0,
          duration: 1000,
          onComplete: () => text.destroy()
        });

        EventBus.emit(GameEvents.SCORE_CHANGE, { score: this.score, target: this.targetScore });
        this.caughtItem.destroy();
        this.caughtItem = null;

        // Check if all items are cleared
        if (this.items.countActive(true) === 0) {
           this.checkEndCondition();
        }
      }
    } else {
      // Move manually towards point
      const angleToAnchor = Phaser.Math.Angle.Between(this.hook.x, this.hook.y, anchorX, anchorY);
      this.hook.x += Math.cos(angleToAnchor) * speed;
      this.hook.y += Math.sin(angleToAnchor) * speed;
    }
  }
}