
import symlinkDir from 'symlink-dir';
import { existsSync } from 'fs';

console.info('[Sandbox] Symlinking to LandOfTheRair Repos...');

function linkTo(name) {
  if(existsSync(`../${name}`)) {

    console.info(`[Sandbox] Found ${name} repo, creating a symlink to it.`);

    symlinkDir(`../${name}`, `src/linked/${name}`);

  } else {
    console.error(`[Sandbox] No ${name} repo found. It needs to be next to the Sandbox folder`);
    process.abort();
  }
}

linkTo('LandOfTheRair');
linkTo('Content');
linkTo('Assets');
