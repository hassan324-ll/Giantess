import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBox, faLink, faPencilAlt, faTag, faTrash } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs/operators';
import { BrandService } from '../../../../services/brand.service';
import { CategoryService } from '../../../../services/category.service';
import { MenuCatalogService } from '../../../../services/menu-catalog.service';
import { Brand } from '../../../../interfaces/brand';
import { Category } from '../../../../interfaces/category';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, LoadingSpinner, ConfirmDialog],
  templateUrl: './category-management.html',
  styleUrls: ['./category-management.css']
})
export class CategoryManagement {
  faPencilAlt = faPencilAlt;
  faTrash = faTrash;
  faBox = faBox;
  faLink = faLink;
  faTag = faTag;

  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  selectedBrandSlug = signal<string | null>(null);
  isLoading = signal(true);
  formLoading = signal(false);
  modalOpen = signal(false);
  confirmOpen = signal(false);
  activeCategoryId?: number;
  activeCategorySlug?: string;
  errorMessage = signal('');
  successMessage = signal('');
  confirmationTarget = signal<Category | null>(null);

  categoryForm: FormGroup;

  constructor(
    private categoryService: CategoryService,
    private brandService: BrandService,
    private menuCatalogService: MenuCatalogService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      brand_id: [null, [Validators.required]]
    });

    this.loadBrands();
  }

  loadBrands(): void {
    this.brandService.getBrands().subscribe({
      next: (items) => {
        this.brands.set(items);
        if (items.length && !this.selectedBrandSlug()) {
          this.selectedBrandSlug.set(items[0].slug);
          this.loadCategories(items[0].slug);
        }
      },
      error: (error) => this.errorMessage.set(error.message)
    });
  }

  loadCategories(brandSlug?: string): void {
    const selectedBrand = brandSlug ?? this.selectedBrandSlug();
    if (!selectedBrand) {
      this.categories.set([]);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.categoryService.getCategories(selectedBrand).subscribe({
      next: (items) => {
        const brandsById = new Map(this.brands().map((brand) => [brand.id, brand]));
        this.categories.set(items.map((category) => ({
          ...category,
          brand: category.brand ?? brandsById.get(category.brand_id)
        })));
      },
      error: (error) => this.errorMessage.set(error.message),
      complete: () => this.isLoading.set(false)
    });
  }

  onBrandFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedBrandSlug.set(value);
    this.loadCategories(value);
  }

  showCreateForm(): void {
    this.resetForm();
    this.activeCategoryId = undefined;
    this.activeCategorySlug = undefined;
    this.modalOpen.set(true);
  }

  showEditForm(category: Category): void {
    this.categoryForm.patchValue({
      name: category.name,
      slug: category.slug,
      brand_id: category.brand_id
    });
    this.activeCategoryId = category.id;
    this.activeCategorySlug = category.slug;
    this.modalOpen.set(true);
  }

  submitCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.formLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = this.categoryForm.value;
    const request = this.activeCategoryId
      ? this.categoryService.updateCategory(this.activeCategorySlug ?? this.activeCategoryId, payload)
      : this.categoryService.createCategory(payload);

    request.pipe(finalize(() => this.formLoading.set(false))).subscribe({
      next: () => {
        this.successMessage.set(this.activeCategoryId ? 'Category updated successfully.' : 'Category created successfully.');
        this.menuCatalogService.invalidateCatalog();
        this.modalOpen.set(false);
        this.loadCategories();
      },
      error: (error) => this.errorMessage.set(error.message)
    });
  }

  confirmDelete(category: Category): void {
    this.confirmationTarget.set(category);
    this.confirmOpen.set(true);
  }

  deleteCategory(): void {
    const target = this.confirmationTarget();
    if (!target) {
      return;
    }

    this.categoryService.deleteCategory(target.slug).subscribe({
      next: () => {
        this.successMessage.set('Category deleted successfully.');
        this.menuCatalogService.invalidateCatalog();
        this.confirmOpen.set(false);
        this.loadCategories();
      },
      error: (error) => this.errorMessage.set(error.message)
    });
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.confirmOpen.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.categoryForm.reset({ name: '', slug: '', brand_id: null });
    this.activeCategoryId = undefined;
    this.activeCategorySlug = undefined;
  }
}
