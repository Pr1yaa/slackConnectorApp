import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { InstallComponent } from './install.component';
import { CallbackComponent } from './callback.component';
import { ComposeComponent } from './compose.component';
import { ScheduledListComponent } from './scheduled-list.component';
import { AppRoutes } from './app.routes';

@NgModule({
  declarations: [AppComponent, InstallComponent, CallbackComponent, ComposeComponent, ScheduledListComponent],
  imports: [BrowserModule, HttpClientModule, FormsModule, RouterModule.forRoot(AppRoutes)],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
