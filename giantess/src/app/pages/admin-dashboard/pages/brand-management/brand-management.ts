import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBox, faImage, faLink, faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs/operators';
import { BrandService } from '../../../../services/brand.service';
import { MenuCatalogService } from '../../../../services/menu-catalog.service';
import { Brand } from '../../../../interfaces/brand';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-brand-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, LoadingSpinner, ConfirmDialog],
  templateUrl: './brand-management.html',
  styleUrls: ['./brand-management.css']
})
export class BrandManagement {
  faPencilAlt = faPencilAlt;
  faTrash = faTrash;
  faBox = faBox;
  faImage = faImage;
  faLink = faLink;

  brands = signal<Brand[]>([]);
  isLoading = signal(true);
  formLoading = signal(false);
  modalOpen = signal(false);
  confirmOpen = signal(false);
  activeBrandId?: number;
  activeBrandSlug?: string;
  errorMessage = signal('');
  successMessage = signal('');
  readonly fallbackBrandImage =
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%2296%22 viewBox=%220 0 160 96%22%3E%3Crect width=%22160%22 height=%2296%22 rx=%2212%22 fill=%22%23eef2f7%22/%3E%3Crect x=%2220%22 y=%2222%22 width=%22120%22 height=%2252%22 rx=%228%22 fill=%22%23dbe4ef%22/%3E%3Cpath d=%22M46 58h68%22 stroke=%22%238ca0b6%22 stroke-width=%227%22 stroke-linecap=%22round%22/%3E%3Cpath d=%22M55 40h50%22 stroke=%22%238ca0b6%22 stroke-width=%227%22 stroke-linecap=%22round%22/%3E%3C/svg%3E';
  failedImageUrls = signal<Set<string>>(new Set());

  brandForm: FormGroup;
  confirmationTarget = signal<Brand | null>(null);

  constructor(
    private brandService: BrandService,
    private menuCatalogService: MenuCatalogService,
    private fb: FormBuilder
  ) {
    this.brandForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      image: [null]
    });

    this.loadBrands();
  }

  loadBrands(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.brandService.getBrands().subscribe({
      next: (items) => {
        this.failedImageUrls.set(new Set());
        this.brands.set(items);
      },
      error: (error) => this.errorMessage.set(error.message),
      complete: () => this.isLoading.set(false)
    });
  }

  showCreateForm(): void {
    this.resetForm();
    this.activeBrandId = undefined;
    this.modalOpen.set(true);
  }

  showEditForm(brand: Brand): void {
    this.brandForm.patchValue({
      name: brand.name,
      slug: brand.slug,
      image: null
    });

    this.activeBrandId = brand.id;
    this.activeBrandSlug = brand.slug;
    this.modalOpen.set(true);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.brandForm.patchValue({ image: file });
  }

  getBrandImageUrl(brand: Brand): string {
    const imageUrl = brand.image_url?.trim();

    if (!imageUrl) {
      return this.fallbackBrandImage;
    }

    if (this.failedImageUrls().has(imageUrl)) {
      return this.fallbackBrandImage;
    }

    return imageUrl;
  }

  useFallbackImage(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src !== this.fallbackBrandImage) {
      this.failedImageUrls.update((failedUrls) => new Set(failedUrls).add(image.src));
      image.src = this.fallbackBrandImage;
    }
  }

  submitBrand(): void {
    if (this.brandForm.invalid) {
      this.brandForm.markAllAsTouched();
      return;
    }

    this.formLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formData = new FormData();
    formData.append('name', this.brandForm.value.name);
    formData.append('slug', this.brandForm.value.slug);
    if (this.brandForm.value.image) {
      formData.append('image', this.brandForm.value.image);
    }

    const request = this.activeBrandId
      ? this.brandService.updateBrand(this.activeBrandSlug ?? this.activeBrandId, formData)
      : this.brandService.createBrand(formData);

    request.pipe(finalize(() => this.formLoading.set(false))).subscribe({
      next: () => {
        this.successMessage.set(this.activeBrandId ? 'Brand updated successfully.' : 'Brand created successfully.');
        this.menuCatalogService.invalidateCatalog();
        this.modalOpen.set(false);
        this.loadBrands();
      },
      error: (error) => this.errorMessage.set(error.message)
    });
  }

  confirmDelete(brand: Brand): void {
    this.confirmationTarget.set(brand);
    this.confirmOpen.set(true);
  }

  deleteBrand(): void {
    const target = this.confirmationTarget();
    if (!target) {
      return;
    }

    this.brandService.deleteBrand(target.slug).subscribe({
      next: () => {
        this.successMessage.set('Brand deleted successfully.');
        this.menuCatalogService.invalidateCatalog();
        this.confirmOpen.set(false);
        this.loadBrands();
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
    this.brandForm.reset({ name: '', slug: '', image: null });
    this.activeBrandId = undefined;
    this.activeBrandSlug = undefined;
  }
}
