import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBoxesStacked,
  faImage,
  faLink,
  faMicrochip,
  faPencilAlt,
  faTag,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { firstValueFrom, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { BrandService } from '../../../../services/brand.service';
import { CategoryService } from '../../../../services/category.service';
import { MenuCatalogService } from '../../../../services/menu-catalog.service';
import { ModelService } from '../../../../services/model.service';
import { Brand } from '../../../../interfaces/brand';
import { Category } from '../../../../interfaces/category';
import { DeviceModel } from '../../../../interfaces/device-model';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-model-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, LoadingSpinner, ConfirmDialog],
  templateUrl: './model-management.html',
  styleUrls: ['./model-management.css']
})
export class ModelManagement {
  private readonly maxImageSizeBytes = 2048 * 1024;
  readonly pageSize = 10;

  faPencilAlt = faPencilAlt;
  faTrash = faTrash;
  faBoxesStacked = faBoxesStacked;
  faImage = faImage;
  faLink = faLink;
  faMicrochip = faMicrochip;
  faTag = faTag;

  brands = signal<Brand[]>([]);
  models = signal<DeviceModel[]>([]);
  currentPage = signal(1);
  categories = signal<Category[]>([]);
  selectedBrandSlug = signal<string | null>(null);
  selectedCategorySlug = signal<string | null>(null);
  isLoading = signal(true);
  formLoading = signal(false);
  modalOpen = signal(false);
  bulkImportOpen = signal(false);
  confirmOpen = signal(false);
  activeModelId?: number;
  activeModelSlug?: string;
  errorMessage = signal('');
  successMessage = signal('');
  bulkImportError = signal('');
  bulkImportSuccess = signal('');
  bulkImportLoading = signal(false);
  bulkImportProgress = signal('');
  confirmationTarget = signal<DeviceModel | null>(null);
  imagePreview = signal<string | null>(null);
  bulkCsvFile: File | null = null;
  bulkImageFiles: File[] = [];
  totalPages = computed(() => Math.max(1, Math.ceil(this.models().length / this.pageSize)));
  paginatedModels = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return this.models().slice(startIndex, startIndex + this.pageSize);
  });
  pageStart = computed(() => (this.models().length ? (this.currentPage() - 1) * this.pageSize + 1 : 0));
  pageEnd = computed(() => Math.min(this.currentPage() * this.pageSize, this.models().length));

  modelForm: FormGroup;

  constructor(
    private modelService: ModelService,
    private brandService: BrandService,
    private categoryService: CategoryService,
    private menuCatalogService: MenuCatalogService,
    private fb: FormBuilder
  ) {
    this.modelForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      category_id: [null, [Validators.required]],
      image: [null]
    });

    this.loadModelMetadata();
  }

  loadModelMetadata(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.brandService
      .getBrands()
      .pipe(
        catchError((error) => {
          this.errorMessage.set(error.message);
          return of([]);
        })
      )
      .subscribe((brands) => {
        this.brands.set(brands);
        this.selectedBrandSlug.set(brands[0]?.slug ?? null);
        this.loadCategoriesForSelectedBrand();
      });
  }

  loadCategoriesForSelectedBrand(): void {
    const selectedBrandSlug = this.selectedBrandSlug();

    if (!selectedBrandSlug) {
      this.categories.set([]);
      this.models.set([]);
      this.resetPagination();
      this.selectedCategorySlug.set(null);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.categoryService
      .getCategories(selectedBrandSlug)
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.selectedCategorySlug.set(categories[0]?.slug ?? null);
          this.loadModelsForSelectedCategory();
        },
        error: (error) => {
          this.categories.set([]);
          this.models.set([]);
          this.resetPagination();
          this.selectedCategorySlug.set(null);
          this.isLoading.set(false);
          this.errorMessage.set(error.message);
        }
      });
  }

  loadModelsForSelectedCategory(): void {
    const selectedCategory = this.categories().find((category) => category.slug === this.selectedCategorySlug());

    if (!selectedCategory) {
      this.models.set([]);
      this.resetPagination();
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.modelService
      .getModels(selectedCategory.slug)
      .pipe(
        map((models) =>
          models.map((model) => ({
            ...model,
            category_id: model.category_id ?? selectedCategory.id,
            category: model.category ?? selectedCategory
          }))
        ),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (models) => {
          this.models.set(this.sortModelsBySequence(models));
          this.ensureCurrentPageInRange();
        },
        error: (error) => this.errorMessage.set(error.message)
      });
  }

  private sortModelsBySequence(models: DeviceModel[]): DeviceModel[] {
    return [...models].sort((first, second) => first.id - second.id);
  }

  onBrandFilterChange(event: Event): void {
    this.selectedBrandSlug.set((event.target as HTMLSelectElement).value);
    this.selectedCategorySlug.set(null);
    this.models.set([]);
    this.resetPagination();
    this.loadCategoriesForSelectedBrand();
  }

  onCategoryFilterChange(event: Event): void {
    this.selectedCategorySlug.set((event.target as HTMLSelectElement).value);
    this.resetPagination();
    this.loadModelsForSelectedCategory();
  }

  changePage(page: number): void {
    const targetPage = Math.min(Math.max(page, 1), this.totalPages());
    this.currentPage.set(targetPage);
  }

  private resetPagination(): void {
    this.currentPage.set(1);
  }

  private ensureCurrentPageInRange(): void {
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }

  getCategoryName(model: DeviceModel): string {
    if (model.category?.name) {
      return model.category.name;
    }

    const category = this.categories().find((item) => item.id === Number(model.category_id));
    return category?.name ?? 'Unassigned';
  }

  showCreateForm(): void {
    this.resetForm();
    const selectedCategory = this.categories().find((category) => category.slug === this.selectedCategorySlug());
    this.modelForm.patchValue({ category_id: selectedCategory?.id ?? null });
    this.activeModelId = undefined;
    this.activeModelSlug = undefined;
    this.imagePreview.set(null);
    this.modalOpen.set(true);
  }

  showBulkImport(): void {
    this.resetBulkImport();
    this.bulkImportOpen.set(true);
  }

  async onBulkCsvSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    this.bulkCsvFile = input.files?.[0] ?? null;
  }

  onBulkImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.bulkImageFiles = input.files ? Array.from(input.files) : [];
  }

  private resetBulkImport(): void {
    this.bulkCsvFile = null;
    this.bulkImageFiles = [];
    this.bulkImportError.set('');
    this.bulkImportSuccess.set('');
    this.bulkImportLoading.set(false);
    this.bulkImportProgress.set('');
  }

  private parseBulkCsv(file: File): Promise<Array<{ name: string; slug: string; image_filename: string }>> {
    return file.text().then((text) => {
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length < 2) {
        throw new Error('CSV must include a header row and at least one data row.');
      }

      const headers = lines[0].split(',').map((column) => column.trim().toLowerCase());
      const nameIndex = headers.indexOf('name');
      const slugIndex = headers.indexOf('slug');
      const imageIndex = headers.indexOf('image_filename');

      if (nameIndex === -1 || slugIndex === -1) {
        throw new Error('CSV header must contain name and slug columns. image_filename is optional.');
      }

      return lines.slice(1).map((line, rowIndex) => {
        const cells = line.split(',').map((cell) => cell.trim());
        const name = cells[nameIndex] ?? '';
        const slug = cells[slugIndex] ?? '';
        const image_filename = imageIndex !== -1 ? cells[imageIndex] ?? '' : '';

        if (!name || !slug) {
          throw new Error(`CSV row ${rowIndex + 2} is missing name or slug.`);
        }

        return { name, slug, image_filename };
      });
    });
  }

  private async createModelFromRecord(record: { name: string; slug: string; image_filename: string }, categoryId: number, imageMap: Map<string, File>): Promise<void> {
    const payload = new FormData();
    payload.append('name', record.name);
    payload.append('slug', record.slug);
    payload.append('category_id', categoryId.toString());

    const normalizedImageName = record.image_filename.trim().toLowerCase();
    const imageFile = imageMap.get(normalizedImageName);

    if (imageFile) {
      payload.append('image', imageFile);
    }

    await firstValueFrom(this.modelService.createModel(payload));
  }

  async submitBulkImport(event?: Event): Promise<void> {
    event?.preventDefault();
    event?.stopPropagation();
    this.bulkImportError.set('');
    this.bulkImportSuccess.set('');
    this.bulkImportProgress.set('');

    if (!this.bulkCsvFile) {
      this.bulkImportError.set('Please upload a CSV file.');
      return;
    }

    const selectedCategory = this.categories().find((category) => category.slug === this.selectedCategorySlug());
    if (!selectedCategory) {
      this.bulkImportError.set('Please choose a category before importing.');
      return;
    }

    let records;
    try {
      records = await this.parseBulkCsv(this.bulkCsvFile);
    } catch (error: any) {
      this.bulkImportError.set(error?.message || 'Unable to parse CSV file.');
      return;
    }

    if (!records.length) {
      this.bulkImportError.set('No valid rows found in the CSV file.');
      return;
    }

    const imageMap = new Map<string, File>();
    this.bulkImageFiles.forEach((file) => imageMap.set(file.name.toLowerCase(), file));

    const missingImages = records
      .filter((record) => record.image_filename.trim().length > 0)
      .filter((record) => !imageMap.has(record.image_filename.trim().toLowerCase()))
      .map((record) => record.image_filename.trim());

    if (missingImages.length) {
      this.bulkImportError.set(
        `Missing image files for: ${[...new Set(missingImages)].join(', ')}. Make sure filenames exactly match the CSV column values.`
      );
      return;
    }

    this.bulkImportLoading.set(true);

    try {
      for (let index = 0; index < records.length; index += 1) {
        this.bulkImportProgress.set(`Uploading ${index + 1} of ${records.length}...`);
        await this.createModelFromRecord(records[index], selectedCategory.id, imageMap);
      }

      this.bulkImportSuccess.set(`${records.length} device models imported successfully.`);
      this.menuCatalogService.invalidateCatalog();
      this.bulkImportOpen.set(false);
      this.loadModelsForSelectedCategory();
    } catch (error: any) {
      this.bulkImportError.set(error?.message || 'Import failed during upload.');
    } finally {
      this.bulkImportLoading.set(false);
      this.bulkImportProgress.set('');
    }
  }

  showEditForm(model: DeviceModel): void {
    this.modelForm.patchValue({
      name: model.name,
      slug: model.slug,
      category_id: model.category_id,
      image: null
    });
    this.imagePreview.set(model.image_url || model.image || null);
    this.activeModelId = model.id;
    this.activeModelSlug = model.slug;
    this.modalOpen.set(true);
  }

  async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.modelForm.patchValue({ image: null });
      return;
    }

    this.errorMessage.set('');

    try {
      const image = file.size > this.maxImageSizeBytes ? await this.compressImage(file) : file;

      if (image.size > this.maxImageSizeBytes) {
        this.modelForm.patchValue({ image: null });
        input.value = '';
        this.imagePreview.set(null);
        this.errorMessage.set('Please choose an image smaller than 2 MB.');
        return;
      }

      this.modelForm.patchValue({ image });
      this.previewImage(image);
    } catch {
      this.modelForm.patchValue({ image: null });
      input.value = '';
      this.imagePreview.set(null);
      this.errorMessage.set('This image could not be processed. Please choose a smaller JPG or PNG file.');
    }
  }

  private previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  private compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const maxDimension = 1400;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext('2d');
        if (!context) {
          reject();
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject();
              return;
            }

            const compressedFile = new File([blob], this.getCompressedFileName(file.name), {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          0.82
        );
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject();
      };

      image.src = objectUrl;
    });
  }

  private getCompressedFileName(fileName: string): string {
    return fileName.replace(/\.[^.]+$/, '') + '.jpg';
  }

  submitModel(): void {
    if (this.modelForm.invalid) {
      this.modelForm.markAllAsTouched();
      return;
    }

    this.formLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const values = this.modelForm.value;
    const payload = new FormData();
    payload.append('name', values.name);
    payload.append('slug', values.slug);
    payload.append('category_id', values.category_id.toString());
    if (values.image) {
      payload.append('image', values.image);
    }

    const request = this.activeModelId
      ? this.modelService.updateModel(this.activeModelSlug ?? this.activeModelId, payload)
      : this.modelService.createModel(payload);

    request.pipe(finalize(() => this.formLoading.set(false))).subscribe({
      next: () => {
        this.menuCatalogService.invalidateCatalog();
        this.successMessage.set(this.activeModelId ? 'Device model updated successfully.' : 'Device model created successfully.');
        this.modalOpen.set(false);
        const savedCategory = this.categories().find((category) => category.id === Number(values.category_id));
        this.selectedCategorySlug.set(savedCategory?.slug ?? this.selectedCategorySlug());
        this.loadModelsForSelectedCategory();
      },
      error: (error) => this.errorMessage.set(error.message)
    });
  }

  confirmDelete(model: DeviceModel): void {
    this.confirmationTarget.set(model);
    this.confirmOpen.set(true);
  }

  deleteModel(): void {
    const target = this.confirmationTarget();
    if (!target) {
      return;
    }

    this.modelService.deleteModel(target.slug).subscribe({
      next: () => {
        this.menuCatalogService.invalidateCatalog();
        this.successMessage.set('Device model deleted successfully.');
        this.confirmOpen.set(false);
        this.loadModelsForSelectedCategory();
      },
      error: (error) => this.errorMessage.set(error.message)
    });
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.confirmOpen.set(false);
    this.resetForm();
  }

  closeBulkImport(): void {
    this.bulkImportOpen.set(false);
    this.resetBulkImport();
  }

  resetForm(): void {
    this.modelForm.reset({ name: '', slug: '', category_id: null, image: null });
    this.activeModelId = undefined;
    this.activeModelSlug = undefined;
    this.imagePreview.set(null);
  }
}
