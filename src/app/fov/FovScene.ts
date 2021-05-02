import Phaser from 'phaser';
import FovPipeline from '../pipelines/FovPipeline';
const Mrpas = require("mrpas").Mrpas;

export default class FovScene extends Phaser.Scene {
    private sprite : Phaser.GameObjects.Sprite;
    private grid : Phaser.GameObjects.Grid;
    public frame : number = 0;
    public mode : number = 0;
    public spriteScale : number = 1;
    public color : Array<number> = [];
    public mincolor : Array<number> = [];
    public maxcolor : Array<number> = [];
    public showGrid : boolean = false;
    public swimming : boolean = false;
    constructor() {
      super({ key: 'new' });
    }
    private position = [5,5];
    private walls = [
      0,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  0,
      -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
      -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
      -1,  -1,  5,   15,  15,  15,   7,  -1,  -1,
      -1,  -1,  14,  -1,  -1,  -1,  14,  -1,  -1,
      -1,  -1,  14,  -1,  -1,  -1,  14,  -1,  -1,
      -1,  -1,  9,  15,  -1,  15,  8,  -1,  -1,
      -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
      0,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  0,
    ]
    private wallSprites = {};

    preload() {
      this.load.setBaseURL('');
      const frameSize = { frameHeight: 64, frameWidth: 64 };

      this.load.spritesheet('Terrain', 'assets/spritesheets/terrain.webp', frameSize);
      this.load.spritesheet('Walls', 'assets/spritesheets/walls.webp', frameSize);
      this.load.spritesheet('Decor', 'assets/spritesheets/decor.webp', frameSize);
      this.load.spritesheet('Creatures', 'assets/spritesheets/creatures.webp', frameSize);
      this.input.on('pointerup',(e) => {
        if (e.leftButtonReleased()) {
          let pos = this.input.mousePointer.position;
          this.position = [Math.floor(pos.x/64), Math.floor(pos.y/64)];
          this.scene.restart();
        }
      });
    }

    create() {
      this.grid = this.add.grid(9 * 32, 9 * 32, 9 * 64, 9 * 64, 64, 64, 0x057605);
      this.sprite = this.add.sprite(this.position[0]*64+31, this.position[1]*64+31, 'Creatures', 0);
      this.wallSprites = {};
      const fov = new Mrpas(12, 12, (x, y) => {
        return !this.isWall(x,y);
      }) as any;
      const visibleWalls = {};
      fov.compute(
        this.position[0],
        this.position[1],
        Infinity,
        (x: number, y: number): boolean => {
          return this.get(this.wallSprites, x, y).visible;
        },
        (x: number, y: number): void => {
          const obj = this.get(this.wallSprites, x, y);
          obj.visible = true;
          if (this.isWall(x,y)) {
            if(!visibleWalls[x]) {
              visibleWalls[x] = {}
            }
            visibleWalls[x][y] = true;
          }
        }
      );
      Object.keys(visibleWalls).forEach(xp => {
        Object.keys(visibleWalls[xp]).forEach(yp => {
          const x = +xp;
          const y = +yp;
          let q1 = false;
          let q2 = false;
          let q3 = false;
          let q4 = false;
          if (this.isHidden(this.wallSprites, x-1, y)) {
            q1 = true;
            q3 = true;
          }
          if (this.isHidden(this.wallSprites, x+1, y)) {
            q2 = true;
            q4 = true;
          }
          if (this.isHidden(this.wallSprites, x, y-1)) {
            q1 = true;
            q2 = true;
          }
          if (this.isHidden(this.wallSprites, x, y+1)) {
            q3 = true;
            q4 = true;
          }
          if (this.isHidden(this.wallSprites, x-1, y-1)) {
            q1 = true;
          }
          if (this.isHidden(this.wallSprites, x+1, y-1)) {
            q2 = true;
          }
          if (this.isHidden(this.wallSprites, x-1, y+1)) {
            q3 = true;
          }
          if (this.isHidden(this.wallSprites, x+1, y+1)) {
            q4 = true;
          }
          if(q1) {
            this.add.rectangle(x*64+15,y*64+15,32,32,0,1);
          }
          if(q2) {
            this.add.rectangle(x*64+47,y*64+15,32,32,0,1);
          }
          if(q3) {
            this.add.rectangle(x*64+15,y*64+47,32,32,0,1);
          }
          if(q4) {
            this.add.rectangle(x*64+47,y*64+47,32,32,0,1);
          }
        })
      })
      for (let x = 0; x< 9;x++){
        for (let y = 0; y< 9;y++){
          const cX = x*64+31;
          const cY = y*64+31;

          const wallData = this.getMapData(x,y);
          const isWall =wallData !== -1;
          const data = this.get(this.wallSprites, x, y);
          const visible = data.visible;
          let wall:Phaser.GameObjects.Sprite = undefined;
          if (isWall) {
            if(visible){
              //this.add.rectangle(cX,cY,64,64,0x0,0.8);
            }
            wall = this.add.sprite(cX, cY, 'Walls', wallData);
          }
          const sight = this.add.circle(cX,cY,5, 0xFFFFFF,0.5);
          const shadow = this.add.rectangle(cX,cY,64,64,0x0,1);
          sight.visible = visible;
          shadow.visible = !visible;
          this.set(this.wallSprites, x, y, {sight, shadow, wall, visible});
        }
      }
      Object.keys(visibleWalls).forEach(xp => {
        Object.keys(visibleWalls[xp]).forEach(yp => {
          const x = +xp;
          const y = +yp;
          const data = this.get(this.wallSprites, x, y);
          let q1 = false;
          let q2 = false;
          let q3 = false;
          let q4 = false;
          if (this.isHidden(this.wallSprites, x-1, y)) {
            var s = data.wall as Phaser.GameObjects.Sprite;
            s.setCrop(0,32,32,64);
            q1 = true;
            q3 = true;
          }
          if (this.isHidden(this.wallSprites, x+1, y)) {
            var s = data.wall as Phaser.GameObjects.Sprite;
            s.setCrop(0,0,32,64);
            q2 = true;
            q4 = true;
          }
          if (this.isHidden(this.wallSprites, x, y-1)) {
            var s = data.wall as Phaser.GameObjects.Sprite;
            s.setCrop(0,32,64,32);
            q1 = true;
            q2 = true;
          }
          if (this.isHidden(this.wallSprites, x, y+1)) {
            var s = data.wall as Phaser.GameObjects.Sprite;
            s.setCrop(0,0,64,32);
            q3 = true;
            q4 = true;
          }
          if (this.isHidden(this.wallSprites, x-1, y-1)) {
            q1 = true;
          }
          if (this.isHidden(this.wallSprites, x+1, y-1)) {
            q2 = true;
          }
          if (this.isHidden(this.wallSprites, x-1, y+1)) {
            q3 = true;
          }
          if (this.isHidden(this.wallSprites, x+1, y+1)) {
            q4 = true;
          }
          if(q1) {
           // this.add.rectangle(x*64+15,y*64+15,32,32,0,1);
          }
          if(q2) {
            //this.add.rectangle(x*64+47,y*64+15,32,32,0,1);
          }
          if(q3) {
            //this.add.rectangle(x*64+15,y*64+47,32,32,0,1);
          }
          if(q4) {
            //this.add.rectangle(x*64+47,y*64+47,32,32,0,1);
          }
        })
      })
    }
    private drawLine(x1,y1,x2,y2) {
      this.add.line(0,0,this.t(x1),this.t(y1),this.t(x2),this.t(y2),0xffff00,1)
      .setOrigin(0,0);
    }
    private t(x){
      return x*64+31;
    }

    private isWall(x, y) {
      return this.getMapData(x,y) !== -1
    }
    private isHidden(wallSprites, x, y) {
      const obj = this.get(wallSprites, x, y);
      if(obj.visible === true) return false;
      return true;
    }

    private set(map:any, x:number, y:number, value:any) {
      if(!map) map = {};
      if(!map[x]) map[x] = {};
      map[x][y] = value;
    }

    private get(map:any, x:number, y:number) {
      if(!map) map = {};
      if(!map[x]) map[x] = {};
      if(!map[x][y]) map[x][y] = {};
      return map[x][y];
    }

    private getMapData(x:number, y:number): number{
      if (x<0) return -1;
      if (x>8) return -1;
      if (y<0) return -1;
      if (y>8) return -1;
      return this.walls[x+y*9];
    }

    update() {
    }
  }
