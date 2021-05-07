
import Phaser from 'phaser';
import OutlinePipeline from '../../../../LandOfTheRair/client/src/app/pipelines/OutlinePipeline';
import * as functions from '../../../../LandOfTheRair/shared/functions';
import * as interfaces from '../../../../LandOfTheRair/shared/interfaces';

export default class NewScene extends Phaser.Scene {
    private sprite : Phaser.GameObjects.Sprite;
    private grid : Phaser.GameObjects.Grid;
    public frame : number = 0;
    public mode : number = 0;
    public spriteScale : number = 1;
    public color : Array<number> = [];
    public showGrid : boolean = false;
    public swimming : boolean = false;
    public wallText : Phaser.GameObjects.Text;
    constructor() {
      super({ key: 'new' });
    }

    preload() {
      this.load.setBaseURL('');
      const frameSize = { frameHeight: 64, frameWidth: 64 };

      this.load.spritesheet('Terrain', 'assets/spritesheets/terrain.webp', frameSize);
      this.load.spritesheet('Walls', 'assets/spritesheets/walls.webp', frameSize);
      this.load.spritesheet('Decor', 'assets/spritesheets/decor.webp', frameSize);
      this.load.spritesheet('Swimming', 'assets/spritesheets/swimming.webp', frameSize);
      this.load.spritesheet('Creatures', 'assets/spritesheets/creatures.webp', frameSize);
      this.load.spritesheet('Items', 'assets/spritesheets/items.webp', frameSize);
      this.load.spritesheet('Effects', 'assets/spritesheets/effects.webp', frameSize);
    }

    create() {
      this.grid = this.add.grid(9 * 32, 9 * 32, 9 * 64, 9 * 64, 64, 64, 0x057605);
      this.sprite = this.add.sprite(this.renderer.width/2, this.renderer.height/2, 'Creatures', 0);
      this.sprite.setPipeline('OutlinePipeline');
      this.wallText = this.add.text(16,16,'');
    }

    update() {
      this.sprite.setScale(this.spriteScale);
      this.sprite.setFrame(this.frame);
      let dirText = '';
      if (this.sprite.texture.key === 'Walls') {
        this.directions.forEach((dir)=>{
          if (functions.doesWallConnect(this.frame, dir)) {
            dirText += functions.directionToSymbol(dir) + ' ';
          }
        });
      }
      this.wallText.setText(dirText);
      OutlinePipeline.setOutlineColor(this.sprite, this.color);
      OutlinePipeline.setSwimming(this.sprite, this.swimming);
      this.grid.visible = this.showGrid;
    }

    setTexture(texture: string) {
      this.sprite.setTexture(texture);
    }

    directions = functions.directionList()
  }
