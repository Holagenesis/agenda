// services/item.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private itemCreatedSource = new BehaviorSubject<boolean>(false);
  itemCreated$ = this.itemCreatedSource.asObservable();

  notifyItemCreated() {
    this.itemCreatedSource.next(true);
  }
}