import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';
import OutlinePipeline from '../pipelines/OutlinePipeline';
import tinycolor from 'node_modules/tinycolor2/dist/tinycolor-min.js';
import NewScene from './NewScene';
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  phaserGame: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;

  constructor() {
    
    this.config = {
      type: Phaser.WEBGL,
      backgroundColor: '#fff',
      scene: [ NewScene ],
      parent: document.querySelectorAll('.map')[0] as HTMLElement,
      scale: {
        mode: Phaser.Scale.NONE,
        width: 9 * 64,
        height: 9 * 64
      },
      banner: false,
      pixelArt: true,
      pipeline: {OutlinePipeline} as any
    };
  }

  ngOnInit() {
    this.phaserGame = new Phaser.Game(this.config);
    const spriteBox = document.querySelector("#spriteId") as HTMLInputElement;
    const colorBox = document.querySelector("#color") as HTMLInputElement;
    const colorAlphaBox = document.querySelector("#color_alpha") as HTMLInputElement;
    const textureBox = document.querySelector("#textureId") as HTMLSelectElement;
    const gridBox = document.querySelector("#grid") as HTMLInputElement;
    const spriteScaleBox = document.querySelector("#sprite_scale") as HTMLInputElement;
    const swimmingBox = document.querySelector("#swimming") as HTMLInputElement;
    const self = this;
    spriteBox.addEventListener("change",()=>self.load());
    spriteBox.addEventListener("keyup",()=>self.load());
    colorBox.addEventListener("change",()=>self.load());
    colorBox.addEventListener("keyup",()=>self.load());
    colorAlphaBox.addEventListener("change",()=>self.load());
    colorAlphaBox.addEventListener("keyup",()=>self.load());
    textureBox.addEventListener("change",()=>self.load());
    gridBox.addEventListener("click",()=>self.load());
    swimmingBox.addEventListener("click",()=>self.load());
    spriteScaleBox.addEventListener("change",()=>self.load());
    spriteScaleBox.addEventListener("keyup",()=>self.load());
  }

  ngAfterViewChecked() {
    this.load();
  }

  public load() {
    const spriteBox = document.querySelector("#spriteId") as HTMLInputElement;
    const colorBox = document.querySelector("#color") as HTMLInputElement;
    const textureBox = document.querySelector("#textureId") as HTMLSelectElement;
    const colorAlphaBox = document.querySelector("#color_alpha") as HTMLInputElement;
    const gridBox = document.querySelector("#grid") as HTMLInputElement;
    const spriteScaleBox = document.querySelector("#sprite_scale") as HTMLInputElement;
    const swimmingBox = document.querySelector("#swimming") as HTMLInputElement;
    var scene = this.phaserGame.scene.scenes[0] as NewScene;
    if(!scene) return;
    var color = tinycolor(colorBox.value);

    scene.frame = +spriteBox.value;
    scene.color = [color._r/255,color._g/255,color._b/255,+colorAlphaBox.value];
    scene.showGrid = gridBox.checked;
    scene.setTexture(textureBox.value);
    scene.spriteScale = +spriteScaleBox.value;
    scene.swimming = swimmingBox.checked;
    scene.update();
  }
}
