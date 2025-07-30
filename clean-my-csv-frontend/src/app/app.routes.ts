import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { UploadComponent } from './upload/upload.component';
import { PricingComponent } from './pricing/pricing.component';
import { AccountComponent } from './account/account.component';
import { SuccessComponent } from './success/success.component';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'upload', component: UploadComponent },
    { path: 'pricing', component: PricingComponent },
    { path: 'account', component: AccountComponent },
    { path: 'success', component: SuccessComponent },
];
