import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ItemService } from '../services/item.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent implements OnInit, OnDestroy {
  items: any[] = [];
  private subscription!: Subscription;
  
  // Variables de paginación
  currentPage: number = 1;
  itemsPerPage: number = 6;
  paginatedItems: any[] = [];
  
  // Variables para el modal de eliminación
  showDeleteModal: boolean = false;
  currentItem: any = null;

  constructor(
    private apiService: ApiService,
    private itemService: ItemService
  ) {}

  ngOnInit() {
    this.loadItems();
    this.subscription = this.itemService.itemCreated$.subscribe(() => {
      this.loadItems();
    });
  }

  loadItems() {
    this.apiService.getItems().subscribe({
      next: (data) => {
        this.items = data.map(item => ({
          ...item,
          editDescription: item.description
        }));
        this.updatePagination();
      },
      error: (err) => console.error('Error al cargar items:', err)
    });
  }

  // Métodos de paginación
  get totalPages(): number {
    return Math.ceil(this.items.length / this.itemsPerPage);
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedItems = this.items.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Métodos de edición
  toggleEdit(item: any): void {
    if (this.isEditing(item.id)) {
      this.cancelEdit(item);
    } else {
      this.editingItemId = item.id;
      item.editDescription = item.description;
    }
  }

  isEditing(itemId: number): boolean {
    return this.editingItemId === itemId;
  }

  saveEdit(item: any): void {
    if (item.editDescription.trim() === '') {
      alert('La descripción no puede estar vacía');
      return;
    }

    if (item.editDescription !== item.description) {
      const updatedItem = {
        description: item.editDescription,
        date: item.date,
        hour: item.hour
      };

      this.apiService.updateItem(item.id, updatedItem).subscribe({
        next: () => {
          console.log('Item actualizado exitosamente');
          item.description = item.editDescription;
          this.editingItemId = null;
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('No se pudo actualizar el item');
        }
      });
    } else {
      this.editingItemId = null;
    }
  }

  cancelEdit(item: any): void {
    item.editDescription = item.description;
    this.editingItemId = null;
  }

  // Métodos de eliminación
  openDeleteModal(item: any): void {
    this.currentItem = item;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.currentItem = null;
  }

  confirmDelete(): void {
    if (this.currentItem) {
      this.apiService.deleteItem(this.currentItem.id).subscribe({
        next: () => {
          console.log('Item eliminado exitosamente');
          this.closeDeleteModal();
          this.loadItems();
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('No se pudo eliminar el item');
          this.closeDeleteModal();
        }
      });
    }
  }

  formatHour(hourString: string): string {
    const [hours, minutes] = hourString.split(':');
    return `${hours}:${minutes}`;
  }

  editingItemId: number | null = null;

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}