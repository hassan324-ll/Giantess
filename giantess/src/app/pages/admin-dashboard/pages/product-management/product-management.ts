import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faAlignLeft,
  faBox,
  faBoxesStacked,
  faDollarSign,
  faHashtag,
  faImage,
  faLink,
  faMagnifyingGlass,
  faMicrochip,
  faPencilAlt,
  faTag,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { firstValueFrom, forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { BrandService } from '../../../../services/brand.service';
import { CategoryService } from '../../../../services/category.service';
import { ModelService } from '../../../../services/model.service';
import { MenuCatalogService } from '../../../../services/menu-catalog.service';
import { ProductService } from '../../../../services/product.service';
import { Brand } from '../../../../interfaces/brand';
import { Product } from '../../../../interfaces/product';
import { Category } from '../../../../interfaces/category';
import { DeviceModel } from '../../../../interfaces/device-model';
import { Pagination } from '../../../../interfaces/pagination';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

type BulkProductRecord = {
  name: string;
  description: string;
  price?: number;
  part_number: string;
  device_model?: string;
  sku?: string;
  stock_count?: number;
  image_filename?: string;
};

type ResolvedBulkProductRecord = {
  record: BulkProductRecord;
  rowNumber: number;
  deviceModelId: number;
};

type BulkPackageContents = {
  spreadsheet: File;
  images: File[];
  ignoredFiles: number;
};

type ZipEntry = {
  name: string;
  compressionMethod: number;
  compressedSize: number;
  localHeaderOffset: number;
  isDirectory: boolean;
};

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, LoadingSpinner, ConfirmDialog],
  templateUrl: './product-management.html',
  styleUrls: ['./product-management.css']
})
export class ProductManagement {
  faPencilAlt = faPencilAlt;
  faTrash = faTrash;
  faAlignLeft = faAlignLeft;
  faBox = faBox;
  faBoxesStacked = faBoxesStacked;
  faDollarSign = faDollarSign;
  faHashtag = faHashtag;
  faImage = faImage;
  faLink = faLink;
  faMagnifyingGlass = faMagnifyingGlass;
  faMicrochip = faMicrochip;
  faTag = faTag;

  products = signal<Product[]>([]);
  brands = signal<Brand[]>([]);
  categories = signal<Category[]>([]);
  deviceModels = signal<DeviceModel[]>([]);
  selectedBrandSlug = signal<string | null>(null);
  selectedCategorySlug = signal<string | null>(null);
  selectedDeviceModelId = signal<number | null>(null);
  selectedDeviceModelSlug = signal<string | null>(null);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(true);
  formLoading = signal(false);
  modalOpen = signal(false);
  confirmOpen = signal(false);
  activeProductId?: number | string;
  errorMessage = signal('');
  successMessage = signal('');
  confirmationTarget = signal<Product | null>(null);
  searchTerm = signal('');
  imagePreviews = signal<string[]>([]);
  selectedImageFiles = signal<File[]>([]);
  bulkImportOpen = signal(false);
  bulkImportError = signal('');
  bulkImportSuccess = signal('');
  bulkImportLoading = signal(false);
  bulkImportProgress = signal('');
  bulkImportSummary = signal('');
  bulkDeleteLoading = signal(false);
  selectionMode = signal(false);
  selectedProductIds = signal<Set<number>>(new Set());
  bulkPackageFile: File | null = null;
  bulkCsvFile: File | null = null;
  bulkImageFiles: File[] = [];

  productForm: FormGroup;

  constructor(
    private productService: ProductService,
    private brandService: BrandService,
    private categoryService: CategoryService,
    private modelService: ModelService,
    private menuCatalogService: MenuCatalogService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      part_number: ['', Validators.required],
      stock_count: ['0', Validators.required],
      device_model_id: [null, Validators.required],
      images: [[] as File[]]
    });

    this.loadBrands();
  }

  loadBrands(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.brandService
      .getBrands()
      .pipe(catchError((error) => {
        this.errorMessage.set(error.message);
        return of([] as Brand[]);
      }))
      .subscribe((brands) => {
        this.brands.set(brands);
        const firstBrand = brands[0];
        this.selectedBrandSlug.set(firstBrand?.slug ?? null);

        if (firstBrand?.slug) {
          this.loadCategories(firstBrand.slug);
          return;
        }

        this.categories.set([]);
        this.deviceModels.set([]);
        this.selectedCategorySlug.set(null);
        this.selectedDeviceModelId.set(null);
        this.products.set([]);
        this.pagination.set(null);
        this.isLoading.set(false);
      });
  }

  loadCategories(brandSlug: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.categoryService
      .getCategories(brandSlug)
      .pipe(catchError(() => of([] as Category[])))
      .subscribe((categories) => {
        this.categories.set(categories);
        const firstCategory = categories[0];
        this.selectedCategorySlug.set(firstCategory?.slug ?? null);

        if (firstCategory?.slug) {
          this.loadModels(firstCategory.slug);
          return;
        }

        this.deviceModels.set([]);
        this.selectedDeviceModelId.set(null);
        this.products.set([]);
        this.pagination.set(null);
        this.isLoading.set(false);
      });
  }

  loadModels(categorySlug: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.modelService
      .getModels(categorySlug)
      .pipe(catchError(() => of([] as DeviceModel[])))
      .subscribe((models) => {
        this.deviceModels.set(models);
        const firstModel = models[0];
        this.selectedDeviceModelId.set(firstModel?.id ?? null);
        this.selectedDeviceModelSlug.set(firstModel?.slug ?? null);

        if (firstModel?.id) {
          this.loadProducts(1);
          return;
        }

        this.products.set([]);
        this.pagination.set(null);
        this.isLoading.set(false);
      });
  }

  loadProducts(page = 1): void {
    const deviceModelId = this.selectedDeviceModelId();
    const deviceModelSlug = this.selectedDeviceModelSlug();
    const identifier = deviceModelSlug ?? deviceModelId;

    if (identifier === null || identifier === undefined) {
      this.products.set([]);
      this.pagination.set(null);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.productService.getProducts(identifier, page, this.searchTerm()).pipe(
      catchError((error) => {
        const message = error?.message?.toString() ?? '';

        if (message.includes('No query results for model')) {
          return of({ data: [], meta: null });
        }

        throw error;
      })
    )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.products.set(response.data);
          this.pagination.set(response.meta);
          this.clearProductSelection();
        },
        error: (error) => {
          this.errorMessage.set(error?.message?.toString() ?? 'Unable to load products.');
        }
      });
  }

  onBrandFilterChange(event: Event): void {
    const brandSlug = (event.target as HTMLSelectElement).value || null;
    if (!brandSlug || brandSlug === this.selectedBrandSlug()) {
      return;
    }

    this.selectedBrandSlug.set(brandSlug);
    this.selectedCategorySlug.set(null);
    this.selectedDeviceModelId.set(null);
    this.categories.set([]);
    this.deviceModels.set([]);
    this.products.set([]);
    this.pagination.set(null);
    this.loadCategories(brandSlug);
  }

  onCategoryFilterChange(event: Event): void {
    const categorySlug = (event.target as HTMLSelectElement).value || null;
    if (!categorySlug || categorySlug === this.selectedCategorySlug()) {
      return;
    }

    this.selectedCategorySlug.set(categorySlug);
    this.selectedDeviceModelId.set(null);
    this.deviceModels.set([]);
    this.products.set([]);
    this.pagination.set(null);
    this.loadModels(categorySlug);
  }

  onModelFilterChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    const selectedModel = this.deviceModels().find((model) => model.id === value) ?? null;
    this.selectedDeviceModelId.set(selectedModel?.id ?? null);
    this.selectedDeviceModelSlug.set(selectedModel?.slug ?? null);
    this.loadProducts(1);
  }

  searchProducts(): void {
    this.loadProducts(1);
  }

  formatProductPrice(price: Product['price']): string {
    const numericPrice = typeof price === 'number' ? price : Number.parseFloat(price);
    return Number.isFinite(numericPrice) ? `$${numericPrice.toFixed(2)}` : '$0.00';
  }

  getProductModelName(product: Product): string {
    return product.device_model?.name || this.deviceModels().find((model) => model.id === product.device_model_id)?.name || 'Unknown';
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private normalizeImportKey(value: string): string {
    const text = value
      .toLowerCase()
      .replace(/[\(\[\{ï¼ˆ][^\)\]\}ï¼‰]*[\)\]\}ï¼‰]/g, '')
      .replace(/[^a-z0-9\u4e00-\u9fff_ ]+/g, ' ')
      .trim();
    return text.replace(/\s+/g, ' ');
  }

  openCreate(): void {
    this.resetForm();
    this.productForm.patchValue({ device_model_id: this.selectedDeviceModelId() });
    this.activeProductId = undefined;
    this.imagePreviews.set([]);
    this.modalOpen.set(true);
  }

  openEdit(product: Product): void {
    this.activeProductId = product.slug;
    this.imagePreviews.set(this.getProductImages(product));
    this.productForm.patchValue({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      part_number: product.part_number,
      stock_count: Number(product.stock_count ?? 0) > 0 ? '10' : '0',
      device_model_id: product.device_model_id,
      images: []
    });
    this.modalOpen.set(true);
  }

  getProductImages(product: Product): string[] {
    const imageValues = [
      ...(product.image_urls ?? []),
      ...(product.images ?? []),
      ...(product.product_images ?? []),
      ...(product.gallery ?? []),
      ...(product.media ?? []),
      product.image_url,
      product.image,
    ];

    return imageValues
      .map((image) => {
        if (!image) {
          return '';
        }

        return typeof image === 'string' ? image : image.image_url ?? image.url ?? image.path ?? '';
      })
      .map((image) => image.trim())
      .filter((image, index, images) => image.length > 0 && images.indexOf(image) === index);
  }

  getProductPrimaryImage(product: Product): string {
    return this.getProductImages(product)[0] ?? '';
  }

  getStockStatusLabel(stockCount: number | string | null | undefined): string {
    const stock = Number(stockCount ?? 0);
    return Number.isFinite(stock) && stock > 0 ? 'In stock' : 'Not in stock';
  }

  getStockStatusClass(stockCount: number | string | null | undefined): string {
    const stock = Number(stockCount ?? 0);
    const baseClass = 'inline-flex min-h-[46px] w-full items-center justify-center rounded-[0.65rem] px-3 text-sm font-extrabold';
    return Number.isFinite(stock) && stock > 0
      ? `${baseClass} bg-emerald-100 text-emerald-700`
      : `${baseClass} bg-rose-100 text-rose-700`;
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    this.selectedImageFiles.set(files);
    this.productForm.patchValue({ images: files });

    if (!files.length) {
      this.imagePreviews.set([]);
      return;
    }

    Promise.all(files.map((file) => this.readImagePreview(file))).then((previews) => {
      this.imagePreviews.set(previews);
    });
  }

  async submitProduct(): Promise<void> {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.formLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const values = this.productForm.value;
    const deviceModelId = Number(values.device_model_id);

    try {
      const duplicate = await this.findDuplicateProduct(
        deviceModelId,
        values.part_number,
        undefined,
        this.activeProductId
      );

      if (duplicate) {
        const modelName = this.getDeviceModelName(deviceModelId);
        this.errorMessage.set(
          `SKU "${values.part_number.trim()}" is already assigned to ${modelName}. ` +
          'Use a different SKU, or assign this product to another model.'
        );
        this.formLoading.set(false);
        return;
      }
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Unable to check for an existing product.');
      this.formLoading.set(false);
      return;
    }

    const submittedStockCount = this.toStockCount(values.stock_count);
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('slug', values.slug);
    formData.append('description', values.description);
    formData.append('price', values.price.toString());
    formData.append('part_number', values.part_number);
    formData.append('stock_count', submittedStockCount.toString());
    formData.append('device_model_id', deviceModelId.toString());

    const rawImages = Array.isArray(values.images) ? values.images as File[] : [];
    let images: File[];
    try {
      images = await this.compressImageFiles(rawImages);
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Unable to optimize selected images.');
      this.formLoading.set(false);
      return;
    }
    images.forEach((image, index) => {
      if (index === 0) {
        formData.append('image', image);
      }

      formData.append('images[]', image);
    });

    if (images.length > 1) {
      formData.append('replace_images', '1');
    }

    const request = this.activeProductId
      ? this.productService.updateProduct(this.activeProductId, formData)
      : this.productService.createProduct(formData);

    request.pipe(finalize(() => this.formLoading.set(false))).subscribe({
      next: (savedProduct) => {
        const displayProduct = {
          ...savedProduct,
          stock_count: submittedStockCount
        };

        this.successMessage.set(this.activeProductId ? 'Product updated successfully.' : 'Product created successfully.');
        this.menuCatalogService.invalidateCatalog();
        this.modalOpen.set(false);
        this.showSavedProductInList(displayProduct);
      },
      error: error => this.errorMessage.set(error.message)
    });
  }

  confirmDelete(product: Product): void {
    this.confirmationTarget.set(product);
    this.confirmOpen.set(true);
  }

  confirmBulkDelete(): void {
    if (!this.selectedProductIds().size) {
      return;
    }

    this.confirmationTarget.set(null);
    this.confirmOpen.set(true);
  }

  get deleteConfirmTitle(): string {
    return this.confirmationTarget() ? 'Delete product' : 'Delete selected products';
  }

  get deleteConfirmMessage(): string {
    const count = this.selectedProductIds().size;
    return this.confirmationTarget()
      ? 'Are you sure you want to permanently delete this product?'
      : `Are you sure you want to permanently delete ${count} selected product${count === 1 ? '' : 's'}?`;
  }

  deleteProduct(): void {
    const target = this.confirmationTarget();
    const selectedProducts = this.products().filter((product) => this.selectedProductIds().has(product.id));
    if (!target && !selectedProducts.length) {
      this.confirmOpen.set(false);
      return;
    }

    this.bulkDeleteLoading.set(true);
    const request: Observable<unknown> = target
      ? this.productService.deleteProduct(target.slug)
      : forkJoin(selectedProducts.map((product) => this.productService.deleteProduct(product.slug)));

    request.pipe(finalize(() => this.bulkDeleteLoading.set(false))).subscribe({
      next: () => {
        this.successMessage.set(target ? 'Product deleted successfully.' : `${selectedProducts.length} products deleted successfully.`);
        this.menuCatalogService.invalidateCatalog();
        this.confirmOpen.set(false);
        this.confirmationTarget.set(null);
        this.clearProductSelection();
        this.loadProducts(this.pagination()?.current_page ?? 1);
      },
      error: (error: any) => this.errorMessage.set(error.message)
    });
  }

  changePage(page: number): void {
    this.loadProducts(page);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.confirmOpen.set(false);
    this.confirmationTarget.set(null);
    this.resetForm();
  }

  clearProductSelection(): void {
    this.selectedProductIds.set(new Set());
  }

  toggleSelectionMode(): void {
    this.selectionMode.update((isActive) => {
      const nextState = !isActive;
      if (!nextState) {
        this.clearProductSelection();
      }
      return nextState;
    });
  }

  isProductSelected(productId: number): boolean {
    return this.selectedProductIds().has(productId);
  }

  toggleProductSelection(productId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedProductIds.update((selectedIds) => {
      const nextSelectedIds = new Set(selectedIds);
      if (checked) {
        nextSelectedIds.add(productId);
      } else {
        nextSelectedIds.delete(productId);
      }
      return nextSelectedIds;
    });
  }

  areAllVisibleProductsSelected(): boolean {
    const products = this.products();
    return products.length > 0 && products.every((product) => this.selectedProductIds().has(product.id));
  }

  toggleAllVisibleProducts(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedProductIds.update((selectedIds) => {
      const nextSelectedIds = new Set(selectedIds);
      this.products().forEach((product) => {
        if (checked) {
          nextSelectedIds.add(product.id);
        } else {
          nextSelectedIds.delete(product.id);
        }
      });
      return nextSelectedIds;
    });
  }

  resetForm(): void {
    this.productForm.reset({
      name: '',
      slug: '',
      description: '',
      price: 0,
      part_number: '',
      stock_count: '0',
      device_model_id: null,
      images: []
    });
    this.activeProductId = undefined;
    this.imagePreviews.set([]);
    this.selectedImageFiles.set([]);
  }

  removeImage(index: number): void {
    const currentFiles = this.selectedImageFiles();
    const currentPreviews = this.imagePreviews();

    const updatedFiles = currentFiles.filter((_, i) => i !== index);
    const updatedPreviews = currentPreviews.filter((_, i) => i !== index);

    this.selectedImageFiles.set(updatedFiles);
    this.imagePreviews.set(updatedPreviews);
    this.productForm.patchValue({ images: updatedFiles });
  }

  clearAllImages(): void {
    this.selectedImageFiles.set([]);
    this.imagePreviews.set([]);
    this.productForm.patchValue({ images: [] });
  }

  private readImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Unable to preview selected image.'));
      reader.readAsDataURL(file);
    });
  }

  private showSavedProductInList(savedProduct: Product): void {
    const savedModel = this.deviceModels().find((model) => model.id === savedProduct.device_model_id) ?? null;
    const staysInSelectedModel = savedProduct.device_model_id === this.selectedDeviceModelId();
    const wasEditing = Boolean(this.activeProductId);

    this.selectedDeviceModelId.set(savedProduct.device_model_id);
    this.selectedDeviceModelSlug.set(savedModel?.slug ?? savedProduct.device_model?.slug ?? this.selectedDeviceModelSlug());

    if (staysInSelectedModel) {
      this.patchSavedProductIntoCurrentPage(savedProduct, wasEditing);
      this.clearProductSelection();
      return;
    }

    this.loadProducts(1);
  }

  private toStockCount(value: number | string | null | undefined): number {
    return Number(value ?? 0) > 0 ? 10 : 0;
  }

  private patchSavedProductIntoCurrentPage(savedProduct: Product, wasEditing: boolean): void {
    const products = this.products();
    const existingIndex = products.findIndex((product) => product.id === savedProduct.id || product.slug === savedProduct.slug);

    if (existingIndex >= 0) {
      const nextProducts = [...products];
      nextProducts[existingIndex] = savedProduct;
      this.products.set(nextProducts);
      return;
    }

    if (wasEditing) {
      this.products.set(products.filter((product) => product.id !== savedProduct.id && product.slug !== savedProduct.slug));
      return;
    }

    const pageLimit = this.pagination()?.per_page ?? (products.length || 10);
    this.products.set([savedProduct, ...products].slice(0, pageLimit));

    const pageData = this.pagination();
    if (pageData) {
      this.pagination.set({
        ...pageData,
        total: pageData.total + 1,
        last_page: Math.max(pageData.last_page, Math.ceil((pageData.total + 1) / pageData.per_page)),
      });
    }
  }

  private async compressImageFiles(files: File[]): Promise<File[]> {
    return Promise.all(files.map((file) => this.compressImageFile(file)));
  }

  private async compressImageFile(file: File): Promise<File> {
    const canResize = file.type.startsWith('image/') && file.type !== 'image/gif' && typeof document !== 'undefined';
    const shouldResizeBySize = file.size > 650 * 1024;

    if (!canResize || !shouldResizeBySize) {
      return file;
    }

    const image = await this.loadImageElement(file);
    const maxDimension = 1400;
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));

    if (scale >= 1 && file.size <= 650 * 1024) {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext('2d');
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, 0.82));

    if (!blob || blob.size >= file.size) {
      return file;
    }

    const extension = outputType === 'image/png' ? 'png' : 'jpg';
    const name = file.name.replace(/\.[^.]+$/, `.${extension}`);
    return new File([blob], name, { type: outputType, lastModified: Date.now() });
  }

  private loadImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Unable to optimize selected image.'));
      };
      image.src = objectUrl;
    });
  }

  showBulkImport(): void {
    this.resetBulkImport();
    this.bulkImportOpen.set(true);
  }

  private resetBulkImport(): void {
    this.bulkPackageFile = null;
    this.bulkCsvFile = null;
    this.bulkImageFiles = [];
    this.bulkImportError.set('');
    this.bulkImportSuccess.set('');
    this.bulkImportLoading.set(false);
    this.bulkImportProgress.set('');
    this.bulkImportSummary.set('');
  }

  closeBulkImport(): void {
    this.bulkImportOpen.set(false);
    this.resetBulkImport();
  }

  onBulkCsvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.bulkCsvFile = input.files?.[0] ?? null;
    this.bulkPackageFile = null;
    this.updateBulkImportSummary();
  }

  onBulkImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.bulkImageFiles = Array.from(input.files ?? []);
    this.bulkPackageFile = null;
    this.updateBulkImportSummary();
  }

  onBulkPackageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.bulkPackageFile = input.files?.[0] ?? null;
    this.bulkCsvFile = null;
    this.bulkImageFiles = [];
    this.bulkImportError.set('');
    this.bulkImportSuccess.set('');
    this.updateBulkImportSummary();
  }

  private updateBulkImportSummary(): void {
    if (this.bulkPackageFile) {
      this.bulkImportSummary.set(`Package ready: ${this.bulkPackageFile.name}. It should contain one CSV/Excel file and all product images.`);
      return;
    }

    if (this.bulkCsvFile || this.bulkImageFiles.length) {
      const spreadsheet = this.bulkCsvFile?.name ?? 'no spreadsheet selected';
      this.bulkImportSummary.set(`${spreadsheet}; ${this.bulkImageFiles.length} image file${this.bulkImageFiles.length === 1 ? '' : 's'} selected.`);
      return;
    }

    this.bulkImportSummary.set('');
  }

  private async parseBulkFile(file: File): Promise<BulkProductRecord[]> {
    return new Promise((resolve, reject) => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const csv = e.target?.result as string;
            const records = this.parseCsvContent(csv);
            resolve(records);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read CSV file'));
        reader.readAsText(file);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, raw: false, defval: '' });
            const records = this.parseTableData(rows as string[][]);
            resolve(records);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read Excel file'));
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Unsupported file format. Please upload a CSV or Excel file (.csv, .xlsx, .xls)'));
      }
    });
  }

  private async extractBulkPackage(file: File): Promise<BulkPackageContents> {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      throw new Error('Package must be a .zip file containing one CSV/Excel file and product images.');
    }

    const archive = await file.arrayBuffer();
    const entries = this.readZipEntries(archive).filter((entry) => !entry.isDirectory);
    const spreadsheetEntries = entries.filter((entry) => this.isSpreadsheetFile(entry.name));
    const imageEntries = entries.filter((entry) => this.isImageFile(entry.name));

    if (!spreadsheetEntries.length) {
      throw new Error('No CSV or Excel file found inside the ZIP package.');
    }

    if (spreadsheetEntries.length > 1) {
      throw new Error('The ZIP package should contain only one CSV or Excel file.');
    }

    const spreadsheet = await this.extractZipFile(archive, spreadsheetEntries[0]);
    const images = await Promise.all(imageEntries.map((entry) => this.extractZipFile(archive, entry)));

    return {
      spreadsheet,
      images,
      ignoredFiles: entries.length - spreadsheetEntries.length - imageEntries.length
    };
  }

  private readZipEntries(archive: ArrayBuffer): ZipEntry[] {
    const view = new DataView(archive);
    const bytes = new Uint8Array(archive);
    const decoder = new TextDecoder();
    const minEndOfCentralDirectorySize = 22;
    const endSearchStart = Math.max(0, bytes.length - 0xffff - minEndOfCentralDirectorySize);
    let endOfCentralDirectoryOffset = -1;

    for (let offset = bytes.length - minEndOfCentralDirectorySize; offset >= endSearchStart; offset -= 1) {
      if (view.getUint32(offset, true) === 0x06054b50) {
        endOfCentralDirectoryOffset = offset;
        break;
      }
    }

    if (endOfCentralDirectoryOffset < 0) {
      throw new Error('Unable to read ZIP package. Please create a standard .zip file.');
    }

    const entryCount = view.getUint16(endOfCentralDirectoryOffset + 10, true);
    const centralDirectoryOffset = view.getUint32(endOfCentralDirectoryOffset + 16, true);
    const entries: ZipEntry[] = [];
    let offset = centralDirectoryOffset;

    for (let index = 0; index < entryCount; index += 1) {
      if (view.getUint32(offset, true) !== 0x02014b50) {
        throw new Error('ZIP package is damaged or not supported.');
      }

      const compressionMethod = view.getUint16(offset + 10, true);
      const compressedSize = view.getUint32(offset + 20, true);
      const fileNameLength = view.getUint16(offset + 28, true);
      const extraFieldLength = view.getUint16(offset + 30, true);
      const fileCommentLength = view.getUint16(offset + 32, true);
      const localHeaderOffset = view.getUint32(offset + 42, true);
      const nameBytes = bytes.slice(offset + 46, offset + 46 + fileNameLength);
      const name = decoder.decode(nameBytes);

      entries.push({
        name,
        compressionMethod,
        compressedSize,
        localHeaderOffset,
        isDirectory: name.endsWith('/')
      });

      offset += 46 + fileNameLength + extraFieldLength + fileCommentLength;
    }

    return entries;
  }

  private async extractZipFile(archive: ArrayBuffer, entry: ZipEntry): Promise<File> {
    const view = new DataView(archive);
    const bytes = new Uint8Array(archive);

    if (view.getUint32(entry.localHeaderOffset, true) !== 0x04034b50) {
      throw new Error(`Unable to read ${entry.name} from ZIP package.`);
    }

    const fileNameLength = view.getUint16(entry.localHeaderOffset + 26, true);
    const extraFieldLength = view.getUint16(entry.localHeaderOffset + 28, true);
    const dataOffset = entry.localHeaderOffset + 30 + fileNameLength + extraFieldLength;
    const compressedBytes = bytes.slice(dataOffset, dataOffset + entry.compressedSize);
    let blob: Blob;

    if (entry.compressionMethod === 0) {
      blob = new Blob([compressedBytes]);
    } else if (entry.compressionMethod === 8) {
      const DecompressionStreamConstructor = (globalThis as any).DecompressionStream;
      if (!DecompressionStreamConstructor) {
        throw new Error('This browser cannot extract compressed ZIP files. Please use the latest Chrome or Edge, or upload the CSV/Excel and images separately.');
      }

      const stream = new Blob([compressedBytes]).stream().pipeThrough(new DecompressionStreamConstructor('deflate-raw'));
      blob = await new Response(stream).blob();
    } else {
      throw new Error(`Unsupported ZIP compression for ${entry.name}. Please create a normal ZIP archive.`);
    }

    return new File([blob], this.getBaseName(entry.name), { lastModified: Date.now() });
  }

  private isSpreadsheetFile(fileName: string): boolean {
    return /\.(csv|xlsx|xls)$/i.test(fileName);
  }

  private isImageFile(fileName: string): boolean {
    return /\.(jpe?g|png|webp|gif)$/i.test(fileName);
  }

  private getBaseName(path: string): string {
    return path.split(/[\\/]/).pop() ?? path;
  }

  private getFileStem(fileName: string): string {
    return this.getBaseName(fileName).replace(/\.[^.]+$/, '').toLowerCase();
  }

  private parseCsvContent(csv: string): BulkProductRecord[] {
    const parseCsvLine = (line: string, delimiter: string): string[] => {
      const result: string[] = [];
      let field = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            field += '"';
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
          continue;
        }

        if (char === delimiter && !inQuotes) {
          result.push(field);
          field = '';
          continue;
        }

        field += char;
      }

      result.push(field);
      return result.map((value) => value.trim());
    };

    const rows = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const headerLine = rows.find((line) => line.trim().length > 0) ?? '';
    const delimiter = this.detectCsvDelimiter(headerLine);
    const parsedRows = rows.map((line) => parseCsvLine(line, delimiter)).filter((row) => row.some((cell) => cell.trim().length > 0));
    return this.parseTableData(parsedRows);
  }

  private detectCsvDelimiter(headerLine: string): string {
    const candidates = [',', '\t', ';'];
    const countOutsideQuotes = (delimiter: string): number => {
      let count = 0;
      let inQuotes = false;

      for (let i = 0; i < headerLine.length; i += 1) {
        const char = headerLine[i];
        const nextChar = headerLine[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
          continue;
        }

        if (char === delimiter && !inQuotes) {
          count += 1;
        }
      }

      return count;
    };

    return candidates
      .map((delimiter) => ({ delimiter, count: countOutsideQuotes(delimiter) }))
      .sort((a, b) => b.count - a.count)[0].delimiter;
  }

  private parseTableData(rows: string[][]): BulkProductRecord[] {
    const normalizeHeader = (header: string): string => {
      const text = header
        .toLowerCase()
        .replace(/[\(\[\{（][^\)\]\}）]*[\)\]\}）]/g, '')
        .replace(/[^a-z0-9\u4e00-\u9fff_ ]+/g, ' ')
        .trim();
      return text.replace(/\s+/g, ' ');
    };

    const mapHeader = (header: string): string => {
      const normalized = this.normalizeImportKey(header);
      const isChineseHeader = {
        name: normalized.includes('\u4ea7\u54c1\u540d\u79f0'),
        description: normalized.includes('\u4ea7\u54c1\u4ecb\u7ecd'),
        price: normalized.includes('\u4ea7\u54c1\u4ef7\u683c'),
        deviceModel: normalized.includes('\u7cfb\u5217\u4ea7\u54c1'),
        partNumber: normalized.includes('\u4ea7\u54c1\u578b\u53f7') || normalized.includes('\u4ea7\u54c1\u4ee3\u7801')
      };
      if (!normalized) {
        return '';
      }

      if (isChineseHeader.name) {
        return 'name';
      }
      if (isChineseHeader.description) {
        return 'description';
      }
      if (isChineseHeader.price) {
        return 'price';
      }
      if (isChineseHeader.deviceModel) {
        return 'device_model';
      }
      if (isChineseHeader.partNumber) {
        return 'part_number';
      }

      if (normalized.includes('产品名称') || normalized.includes('product name') || normalized.includes('title')) {
        return 'name';
      }
      if (normalized.includes('产品介绍') || normalized.includes('product description') || normalized.includes('product introduction')) {
        return 'description';
      }
      if (normalized.includes('产品价格') || normalized.includes('product price') || normalized === 'price') {
        return 'price';
      }
      if (
        normalized.includes('产品型号') ||
        normalized.includes('产品代码') ||
        normalized.includes('device model') ||
        normalized.includes('model name') ||
        normalized.includes('product model') ||
        normalized.includes('target model') ||
        normalized.includes('compatible model') ||
        normalized === 'model'
      ) {
        return 'device_model';
      }
      if (
        normalized.includes('part number') ||
        normalized.includes('product code') ||
        normalized === 'model' ||
        normalized === 'part_number'
      ) {
        return 'part_number';
      }
      if (normalized.includes('sku')) {
        return 'sku';
      }
      if (
        normalized.includes('inventory') ||
        normalized.includes('availability') ||
        normalized.includes('in stock') ||
        normalized.includes('stock_count')
      ) {
        return 'stock_count';
      }
      if (normalized.includes('图片') || normalized.includes('image')) {
        return 'image_filename';
      }

      return normalized;
    };

    if (rows.length < 2) {
      throw new Error('File must have at least a header row and one data row.');
    }

    const rawHeaders = rows[0].map((header) => header?.toString().trim() ?? '');
    const mappedHeaders = rawHeaders.map((header) => mapHeader(header));

    const records = rows.slice(1).map((values, index) => {
      const record: any = {};
      mappedHeaders.forEach((header, i) => {
        record[header] = values[i] !== undefined ? values[i].toString().trim() : '';
      });

      const hasAnyData = ['name', 'description', 'price', 'part_number', 'device_model', 'sku', 'stock_count', 'image_filename'].some((field) => record[field]);
      if (!hasAnyData) {
        return null;
      }

      const fallbackIdentifier =
        this.slugify(record.name || record.description || record.image_filename || `product-row-${index + 2}`).toUpperCase() ||
        `PRODUCT-ROW-${index + 2}`;
      const partNumber = record.part_number?.trim() || record.sku?.trim() || fallbackIdentifier;
      const name = record.name?.trim() || record.description?.trim() || partNumber;

      let price: number | undefined;
      const rawPrice = record.price?.toString().trim() ?? '';
      if (rawPrice) {
        const parsedPrice = parseFloat(rawPrice.replace(/,/g, ''));
        if (!isNaN(parsedPrice) && parsedPrice >= 0) {
          price = parsedPrice;
        }
      }

      let stockCount: number | undefined;
      if (record.stock_count !== undefined && record.stock_count !== '') {
        const normalizedStock = record.stock_count.toString().trim();
        const numericPart = normalizedStock.match(/\d+/);
        if (numericPart) {
          stockCount = parseInt(numericPart[0], 10);
        } else {
          const availability = normalizedStock.toLowerCase();
          if (availability.includes('in stock') || availability.includes('available')) {
            stockCount = undefined;
          }
        }

        if (stockCount !== undefined && (isNaN(stockCount) || stockCount < 0)) {
          stockCount = undefined;
        }
      }

      return {
        name,
        description: record.description?.trim() || `${name} ${partNumber}`,
        price,
        part_number: partNumber,
        device_model: record.device_model?.trim() || undefined,
        sku: record.sku?.trim() || undefined,
        stock_count: stockCount,
        image_filename: record.image_filename?.trim() || undefined
      };
    }).filter((record) => record !== null) as BulkProductRecord[];

    return records;
  }

  private async getBulkImportModels(): Promise<DeviceModel[]> {
    const brandSlug = this.selectedBrandSlug();
    if (!brandSlug) {
      return this.deviceModels();
    }

    const categories = await firstValueFrom(this.categoryService.getCategories(brandSlug));
    if (!categories.length) {
      return this.deviceModels();
    }

    const modelGroups = await firstValueFrom(forkJoin(categories.map((category) => this.modelService.getModels(category.slug))));
    const modelMap = new Map<number, DeviceModel>();
    modelGroups.flat().forEach((model) => modelMap.set(model.id, model));
    return [...modelMap.values()];
  }

  private buildDeviceModelLookup(models: DeviceModel[]): Map<string, DeviceModel> {
    const lookup = new Map<string, DeviceModel>();
    models.forEach((model) => {
      lookup.set(this.normalizeImportKey(model.name), model);
      lookup.set(this.normalizeImportKey(model.slug), model);
    });
    return lookup;
  }

  private resolveBulkRecordDeviceModelId(record: BulkProductRecord, modelLookup: Map<string, DeviceModel>): number | null {
    if (!record.device_model?.trim()) {
      return this.selectedDeviceModelId();
    }

    return modelLookup.get(this.normalizeImportKey(record.device_model))?.id ?? null;
  }

  private normalizeProductIdentifier(value: string | undefined): string {
    return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private getProductIdentifiers(product: Pick<Product, 'part_number' | 'sku'>): string[] {
    return [product.part_number, product.sku]
      .map((value) => this.normalizeProductIdentifier(value))
      .filter((value, index, values) => value.length > 0 && values.indexOf(value) === index);
  }

  private getRecordIdentifiers(record: Pick<BulkProductRecord, 'part_number' | 'sku'>): string[] {
    return [record.part_number, record.sku]
      .map((value) => this.normalizeProductIdentifier(value))
      .filter((value, index, values) => value.length > 0 && values.indexOf(value) === index);
  }

  private getDeviceModel(deviceModelId: number): DeviceModel | null {
    return this.deviceModels().find((model) => model.id === deviceModelId) ?? null;
  }

  private getDeviceModelName(deviceModelId: number, models: DeviceModel[] = this.deviceModels()): string {
    return models.find((model) => model.id === deviceModelId)?.name ?? `model #${deviceModelId}`;
  }

  private async getProductsForDuplicateCheck(deviceModel: DeviceModel): Promise<Product[]> {
    const identifier = deviceModel.slug || deviceModel.id;

    return firstValueFrom(
      this.productService.getAllProducts(identifier).pipe(
        catchError((error) => {
          const message = error?.message?.toString() ?? '';
          if (message.includes('No query results for model')) {
            return of([] as Product[]);
          }

          throw error;
        })
      )
    );
  }

  private async findDuplicateProduct(
    deviceModelId: number,
    partNumber: string,
    sku?: string,
    excludedProductIdOrSlug?: number | string
  ): Promise<Product | null> {
    const deviceModel = this.getDeviceModel(deviceModelId);
    if (!deviceModel) {
      throw new Error('The selected device model could not be found.');
    }

    const identifiers = new Set(this.getRecordIdentifiers({ part_number: partNumber, sku }));
    const products = await this.getProductsForDuplicateCheck(deviceModel);

    return products.find((product) => {
      const isExcluded =
        excludedProductIdOrSlug !== undefined &&
        (product.id === excludedProductIdOrSlug || product.slug === excludedProductIdOrSlug);

      return !isExcluded && this.getProductIdentifiers(product).some((identifier) => identifiers.has(identifier));
    }) ?? null;
  }

  private async buildBulkImportExistingProductLookup(
    resolvedRecords: ResolvedBulkProductRecord[],
    models: DeviceModel[]
  ): Promise<Map<number, Map<string, Product>>> {
    const targetModelIds = [...new Set(resolvedRecords.map((item) => item.deviceModelId))];
    const targetModels = targetModelIds.map((modelId) => {
      const model = models.find((candidate) => candidate.id === modelId);
      if (!model) {
        throw new Error(`Device model #${modelId} could not be found.`);
      }
      return model;
    });

    const productGroups = await Promise.all(
      targetModels.map(async (model) => ({
        model,
        products: await this.getProductsForDuplicateCheck(model)
      }))
    );

    const existingProductsByModel = new Map<number, Map<string, Product>>();
    productGroups.forEach(({ model, products }) => {
      const productsByIdentifier = new Map<string, Product>();
      products.forEach((product) => {
        this.getProductIdentifiers(product).forEach((identifier) => {
          if (!productsByIdentifier.has(identifier)) {
            productsByIdentifier.set(identifier, product);
          }
        });
      });
      existingProductsByModel.set(model.id, productsByIdentifier);
    });

    return existingProductsByModel;
  }

  private buildBulkImageMap(files: File[]): Map<string, File> {
    const imageMap = new Map<string, File>();

    files.forEach((file) => {
      const lowerName = file.name.toLowerCase();
      const baseName = this.getBaseName(lowerName);
      const stem = this.getFileStem(lowerName);

      [lowerName, baseName, stem].forEach((key) => {
        if (key && !imageMap.has(key)) {
          imageMap.set(key, file);
        }
      });
    });

    return imageMap;
  }

  private getBulkImageCandidates(record: BulkProductRecord): string[] {
    const candidates = [record.image_filename, record.sku, record.part_number]
      .map((value) => value?.trim().toLowerCase())
      .filter((value): value is string => Boolean(value));

    return candidates.flatMap((candidate) => {
      const baseName = this.getBaseName(candidate);
      const stem = this.getFileStem(candidate);
      return [candidate, baseName, stem];
    });
  }

  private findBulkImageFile(record: BulkProductRecord, imageMap: Map<string, File>): File | null {
    for (const candidate of this.getBulkImageCandidates(record)) {
      const image = imageMap.get(candidate);
      if (image) {
        return image;
      }
    }

    return null;
  }

  private async saveProductFromRecord(
    record: BulkProductRecord,
    imageMap: Map<string, File>,
    rowIndex: number,
    importBatchId: number,
    deviceModelId: number,
    existingProduct?: Product
  ): Promise<Product> {
    const formData = new FormData();
    const slugBase = this.slugify(`${record.name} ${record.part_number}`) || 'product';
    formData.append('name', record.name);
    formData.append('slug', existingProduct?.slug || `${slugBase}-${importBatchId}-${rowIndex + 1}`);
    formData.append('description', record.description);
    formData.append('part_number', record.part_number);
    formData.append('device_model_id', deviceModelId.toString());
    formData.append('price', (record.price ?? 0).toString());

    if (record.sku) {
      formData.append('sku', record.sku);
    }

    if (record.stock_count !== undefined) {
      formData.append('stock_count', record.stock_count.toString());
    }

    const imageFile = this.findBulkImageFile(record, imageMap);
    if (imageFile) {
      const compressedImage = await this.compressImageFile(imageFile);
      formData.append('image', compressedImage);
      formData.append('images[]', compressedImage);
    }

    return new Promise((resolve, reject) => {
      const request = existingProduct
        ? this.productService.updateProduct(existingProduct.id, formData)
        : this.productService.createProduct(formData);

      request.subscribe({
        next: (product) => resolve(product),
        error: (error) => reject(error)
      });
    });
  }

  async submitBulkImport(event?: Event): Promise<void> {
    event?.preventDefault();
    event?.stopPropagation();
    this.bulkImportError.set('');
    this.bulkImportSuccess.set('');
    this.bulkImportProgress.set('');

    let spreadsheetFile = this.bulkCsvFile;
    let imageFiles = this.bulkImageFiles;

    if (this.bulkPackageFile) {
      this.bulkImportProgress.set('Reading package...');
      try {
        const packageContents = await this.extractBulkPackage(this.bulkPackageFile);
        spreadsheetFile = packageContents.spreadsheet;
        imageFiles = packageContents.images;
        this.bulkImportSummary.set(
          `Package contains ${spreadsheetFile.name}, ${imageFiles.length} image file${imageFiles.length === 1 ? '' : 's'}${packageContents.ignoredFiles ? `, and ${packageContents.ignoredFiles} ignored file${packageContents.ignoredFiles === 1 ? '' : 's'}` : ''}.`
        );
      } catch (error: any) {
        this.bulkImportError.set(error?.message || 'Unable to read ZIP package.');
        this.bulkImportProgress.set('');
        return;
      }
    }

    if (!spreadsheetFile) {
      this.bulkImportError.set('Please upload a ZIP package or a CSV/Excel file.');
      this.bulkImportProgress.set('');
      return;
    }

    if (!this.selectedDeviceModelId()) {
      this.bulkImportError.set('Please select a device model before importing.');
      return;
    }

    let records;
    try {
      records = await this.parseBulkFile(spreadsheetFile);
    } catch (error: any) {
      this.bulkImportError.set(error?.message || 'Unable to parse file.');
      this.bulkImportProgress.set('');
      return;
    }

    if (!records.length) {
      this.bulkImportError.set('No valid rows found in the uploaded spreadsheet.');
      this.bulkImportProgress.set('');
      return;
    }

    let importModels: DeviceModel[];
    let modelLookup: Map<string, DeviceModel>;
    try {
      importModels = await this.getBulkImportModels();
      modelLookup = this.buildDeviceModelLookup(importModels);
    } catch (error: any) {
      this.bulkImportError.set(error?.message || 'Unable to load device models for import.');
      return;
    }

    const resolvedRecords = records
      .map((record, index) => ({
        record,
        rowNumber: index + 2,
        deviceModelId: this.resolveBulkRecordDeviceModelId(record, modelLookup)
      }));
    const missingModelRows = resolvedRecords.filter((item) => !item.deviceModelId);

    if (missingModelRows.length) {
      const missingModels = missingModelRows
        .slice(0, 8)
        .map((item) => `row ${item.rowNumber}: ${item.record.device_model || 'blank'}`)
        .join(', ');
      this.bulkImportError.set(
        `Could not match device model for ${missingModels}. Use a Model, Device Model, Model Name, or Compatible Model column that matches an existing dashboard model.`
      );
      return;
    }

    let existingProductsByModel: Map<number, Map<string, Product>>;
    try {
      existingProductsByModel = await this.buildBulkImportExistingProductLookup(
        resolvedRecords as ResolvedBulkProductRecord[],
        importModels
      );
    } catch (error: any) {
      this.bulkImportError.set(error?.message || 'Unable to load existing products.');
      return;
    }

    this.bulkImportLoading.set(true);

    try {
      const importBatchId = Date.now();
      const imageMap = this.buildBulkImageMap(imageFiles);
      const savedProductsByModel = new Map<number, Map<string, Product>>();
      let createdCount = 0;
      let updatedCount = 0;
      const failedRows: string[] = [];

      for (let index = 0; index < records.length; index += 1) {
        this.bulkImportProgress.set(`Uploading ${index + 1} of ${records.length}...`);
        const resolvedRecord = resolvedRecords[index] as ResolvedBulkProductRecord;
        const savedIdentifiers = savedProductsByModel.get(resolvedRecord.deviceModelId) ?? new Map<string, Product>();
        const existingProducts = existingProductsByModel.get(resolvedRecord.deviceModelId) ?? new Map<string, Product>();
        const identifiers = this.getRecordIdentifiers(resolvedRecord.record);
        const existingProduct =
          identifiers.map((identifier) => savedIdentifiers.get(identifier) || existingProducts.get(identifier)).find(Boolean);

        try {
          const savedProduct = await this.saveProductFromRecord(
            resolvedRecord.record,
            imageMap,
            index,
            importBatchId,
            resolvedRecord.deviceModelId,
            existingProduct
          );

          if (existingProduct) {
            updatedCount += 1;
          } else {
            createdCount += 1;
          }

          identifiers.forEach((identifier) => savedIdentifiers.set(identifier, savedProduct));
          savedProductsByModel.set(resolvedRecord.deviceModelId, savedIdentifiers);
        } catch (error: any) {
          failedRows.push(`row ${resolvedRecord.rowNumber}: ${error?.message || 'upload failed'}`);
        }
      }

      const successParts = [
        createdCount ? `${createdCount} created` : '',
        updatedCount ? `${updatedCount} updated` : ''
      ].filter(Boolean);
      this.bulkImportSuccess.set(
        successParts.length ? `Import finished: ${successParts.join(', ')}.` : 'Import finished.'
      );
      if (failedRows.length) {
        const preview = failedRows.slice(0, 5).join('; ');
        const remaining = failedRows.length > 5 ? `; and ${failedRows.length - 5} more` : '';
        this.bulkImportError.set(`${failedRows.length} row${failedRows.length === 1 ? '' : 's'} could not be saved: ${preview}${remaining}`);
      }
      this.menuCatalogService.invalidateCatalog();
      if (!failedRows.length) {
        this.bulkImportOpen.set(false);
      }
      this.loadProducts(this.pagination()?.current_page ?? 1);
    } catch (error: any) {
      this.bulkImportError.set(error?.message || 'Import failed during upload.');
    } finally {
      this.bulkImportLoading.set(false);
      this.bulkImportProgress.set('');
    }
  }
}
