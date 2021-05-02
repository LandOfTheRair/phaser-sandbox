import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameComponent } from './game/game.component';
import { FovComponent } from './fov/fov.component';


const routes: Routes = [
  { path: '', component: GameComponent },
  { path: 'fov', component: FovComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
