
import Phaser from 'phaser';
import OutlinePipeline from '../pipelines/OutlinePipeline';

export default class NewScene extends Phaser.Scene {
    private sprite : Phaser.GameObjects.Sprite;
    private grid : Phaser.GameObjects.Grid;
    public frame : number = 0;
    public mode : number = 0;
    public spriteScale : number = 1;
    public color : Array<number> = [];
    public showGrid : boolean = false;
    public swimming : boolean = false;
    constructor() {
      super({ key: 'new' });
    }
  
    preload() {
      this.load.setBaseURL('');
      const frameSize = { frameHeight: 64, frameWidth: 64 };
  
      this.load.spritesheet('Terrain', 'assets/spritesheets/terrain.png', frameSize);
      this.load.spritesheet('Walls', 'assets/spritesheets/walls.png', frameSize);
      this.load.spritesheet('Decor', 'assets/spritesheets/decor.png', frameSize);
      this.load.spritesheet('Swimming', 'assets/spritesheets/swimming.png', frameSize);
      this.load.spritesheet('Creatures', 'assets/spritesheets/creatures.png', frameSize);
      this.load.spritesheet('Items', 'assets/spritesheets/items.png', frameSize);
      this.load.spritesheet('Effects', 'assets/spritesheets/effects.png', frameSize);
    }
  
    create() {
      this.grid = this.add.grid(9 * 32, 9 * 32, 9 * 64, 9 * 64, 64, 64, 0x057605);
      this.sprite = this.add.sprite(this.renderer.width/2, this.renderer.height/2, 'Creatures', 0);
      this.sprite.setPipeline('OutlinePipeline');
    }
  
    update() {
      this.sprite.setScale(this.spriteScale);
      this.sprite.setFrame(this.frame);
      OutlinePipeline.setOutlineColor(this.sprite, this.color);
      OutlinePipeline.setSwimming(this.sprite, this.swimming);
      this.grid.visible = this.showGrid;
    }
  
    setTexture(texture: string) {
      this.sprite.setTexture(texture);
    }
  }