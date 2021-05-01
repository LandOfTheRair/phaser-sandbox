import imagemin from 'imagemin';
import webp from 'imagemin-webp';
import symlinkDir from 'symlink-dir';
import { exec } from 'child_process';
import { existsSync } from 'fs';

console.info('[Client] Downloading assets (sfx, bgm, spritesheets, icons, items, npcs)...');

import dl from 'download-github-repo';

const compressImages = async () => {
  await imagemin([
    `./src/assets/spritesheets/*.png`
  ], {
    destination: `./src/assets/spritesheets/`,
    plugins: [
      webp({
        lossless:true
      })
    ]
  });

  console.log('[Client] Done compressing images.');

};

if(existsSync('../Content')) {

  console.info('[Client] Found Content repo, creating a symlink to it.');

  symlinkDir('../Content', 'src/assets/content');

  dl('LandOfTheRair/Assets', 'src/assets', () => {
    compressImages();
  });

} else {
  console.info('[Client] No Content repo, downloading a simple non-git copy of it.');

  dl('LandOfTheRair/Assets', 'src/assets', () => {
    compressImages();

    dl('LandOfTheRair/Content', 'src/assets/content', () => {
      exec('cd src/assets/content && npm install --unsafe-perm', () => {
      });
    });
  });
}
