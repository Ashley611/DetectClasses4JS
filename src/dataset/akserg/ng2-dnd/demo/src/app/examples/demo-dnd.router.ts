import { Routes, Route } from '@angular/router';

import { SimpleDemoComponent, DndSimpleComponent } from './dnd/simple';
import { ZoneComponent } from './dnd/zone/zone.component';
import { CustomDataComponent } from './dnd/custom-data/custom-data.component';
import { CustomFunctionComponent } from './dnd/custom-function/custom-function.component';
import { ShoppingBasketComponent } from './dnd/shopping-basket/shopping-basket.component';

import { SimpleComponent } from './sortable/simple/simple.component';
import { MultiComponent } from './sortable/multi/multi.component';
import { RecycleMultiComponent } from './sortable/recycle-multi/recycle-multi.component';
import { EmbeddedComponent} from './sortable/embedded/embedded.component';
import { SimpleSortableCopyComponent } from './sortable/simple-sortable-copy/simple-sortable-copy.component';

export const dndComponents = [SimpleDemoComponent, SimpleComponent, ZoneComponent, CustomDataComponent, CustomFunctionComponent, ShoppingBasketComponent];
export const sortableComponents = [SimpleComponent, MultiComponent, RecycleMultiComponent, EmbeddedComponent, SimpleSortableCopyComponent];

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'dnd-simple' },

    { path: 'dnd-simple', component: SimpleDemoComponent },
    { path: 'dnd-zone', component: ZoneComponent },
    { path: 'dnd-custom-data', component: CustomDataComponent },
    { path: 'dnd-custom-function', component: CustomFunctionComponent },
    { path: 'dnd-shopping-basket', component: ShoppingBasketComponent },

    { path: 'sortable-simple', component: SimpleComponent },
    { path: 'sortable-recycle-multi', component: RecycleMultiComponent },
    { path: 'sortable-simple-copy', component: SimpleSortableCopyComponent },
    { path: 'sortable-multi', component: MultiComponent },
    { path: 'sortable-embedded', component: EmbeddedComponent }
];
