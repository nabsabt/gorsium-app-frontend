import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './@Component/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App {
  constructor() {
    alert(
      ' Mivel az oldal tartalmát jelenleg a Render Dashboard ingyenes verzió tölti be, így első megnyitáskor körülbelül 30 mp-et kell várni a média tartalmak betöltésére.'
    );
  }
  protected readonly title = signal('gorsium-app-frontend');
}
