import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { NewInvoiceComponent } from '../New Invoice/new-invoice/new-invoice.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: NewInvoiceComponent }, 

    ])],
    exports: [RouterModule]
})
export class DashboardsRoutingModule { }
