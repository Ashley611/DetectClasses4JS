import {Component} from '@angular/core';

declare var require: any;

@Component({
    template: `
<dnd-simple></dnd-simple>
<div class="row">
    <div class="col-sm-12">
        <div class="card border-dark mb-3">
            <div class="card-header">The source code</div>
            <div class="card-body text-dark" style="background: #f5f2f0;">
                <prism-block [code]="tsCode" language="ts"></prism-block>
            </div>
        </div>
    </div>
</div>`
})
export class SimpleDemoComponent {
    
    tsCode: string = require('!!raw-loader!./simple.component');
}

export { DndSimpleComponent } from './simple.component';