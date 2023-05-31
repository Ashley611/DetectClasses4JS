import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

/* Import prism core */
import 'prismjs/prism';

/* Import the language you need to highlight */
import 'prismjs/components/prism-typescript';

import { routes } from './app.router';
import { DndModule } from 'ng2-dnd';

import { SharedModule } from './shared';
import { DemoDndModule } from './examples';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    SharedModule,
    RouterModule.forRoot(routes),
    DndModule.forRoot(),
    DemoDndModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
