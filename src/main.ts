/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

function setRealViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setRealViewportHeight();
window.addEventListener('resize', setRealViewportHeight);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
