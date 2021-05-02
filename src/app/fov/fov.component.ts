import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';
import FovPipeline from '../pipelines/OutlinePipeline';
import FovScene from './FovScene';
@Component({
  selector: 'app-game',
  templateUrl: './fov.component.html'
})
export class FovComponent implements OnInit {
  phaserGame: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;

  constructor() {

    this.config = {
      type: Phaser.WEBGL,
      backgroundColor: '#fff',
      scene: [ FovScene ],
      parent: document.querySelectorAll('.map')[0] as HTMLElement,
      scale: {
        mode: Phaser.Scale.NONE,
        width: 9 * 64,
        height: 9 * 64
      },
      banner: false,
      pixelArt: true,
      pipeline: {FovPipeline} as any
    };
  }

  ngOnInit() {
    this.phaserGame = new Phaser.Game(this.config);
  }

  ngAfterViewChecked() {
    this.load();
  }

  public load() {
  }
}
