import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NewsService, NewsArticle } from '../services/news.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid mt-4">
      <div class="row">
        <!-- Sol Taraftaki Kategori Filtreleri -->
        <div class="col-md-3">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Kategoriler</h5>
            </div>
            <div class="list-group list-group-flush">
              <button 
                *ngFor="let category of categories" 
                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                [class.active]="selectedCategory === category.id"
                (click)="selectCategory(category.id)">
                {{ category.name }}
                <span class="badge bg-primary rounded-pill" *ngIf="category.count">{{ category.count }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Sağ Taraftaki Haberler -->
        <div class="col-md-9">
          <!-- Yükleniyor Göstergesi -->
          <div *ngIf="loading" class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Yükleniyor...</span>
            </div>
          </div>

          <!-- Hata Mesajı -->
          <div *ngIf="error" class="alert alert-danger">
            {{ error }}
          </div>

          <!-- Haberler -->
          <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            <div *ngFor="let article of news" class="col">
              <div class="card h-100 shadow-sm">
                <img [src]="article.urlToImage || 'assets/placeholder.jpg'" 
                     class="card-img-top" 
                     [alt]="article.title"
                     style="height: 200px; object-fit: cover;">
                <div class="card-body">
                  <h5 class="card-title">{{ article.title }}</h5>
                  <p class="card-text text-muted mb-2">
                    <small>{{ formatDate(article.publishedAt) }}</small>
                  </p>
                  <p class="card-text">{{ article.description }}</p>
                </div>
                <div class="card-footer bg-transparent border-top-0">
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">{{ article.source.name }}</small>
                    <a [href]="article.url" target="_blank" class="btn btn-primary btn-sm">Devamını Oku</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sonuç Yok Mesajı -->
          <div *ngIf="!loading && !error && news.length === 0" class="alert alert-info mt-3">
            Bu kategoride henüz haber bulunmuyor.
          </div>
        </div>

        <!-- Sayfalama -->
        <div class="container mt-4">
          <div class="row">
            <div class="col-12">
              <nav *ngIf="totalPages > 1" class="mt-4">
                <div class="text-center mb-3 text-muted">
                  <small>
                    Toplam sonuç: {{ totalResults }}, Sayfa başına haber: {{ pageSize }}, Sayfa: {{ currentPage }}
                  </small>
                </div>
                <ul class="pagination justify-content-center">
                  <li class="page-item" [class.disabled]="currentPage === 1">
                    <button class="page-link" (click)="onPageChange(currentPage - 1)">Önceki</button>
                  </li>
                  
                  <li class="page-item" *ngIf="currentPage > 3">
                    <button class="page-link" (click)="onPageChange(1)">1</button>
                  </li>
                  
                  <li class="page-item disabled" *ngIf="currentPage > 4">
                    <span class="page-link">...</span>
                  </li>
                  
                  <li class="page-item" *ngFor="let page of getPageNumbers()">
                    <button class="page-link" 
                            [class.active]="page === currentPage"
                            (click)="onPageChange(page)">
                      {{ page }}
                    </button>
                  </li>
                  
                  <li class="page-item disabled" *ngIf="currentPage < totalPages - 3">
                    <span class="page-link">...</span>
                  </li>
                  
                  <li class="page-item" *ngIf="currentPage < totalPages - 2">
                    <button class="page-link" (click)="onPageChange(totalPages)">{{ totalPages }}</button>
                  </li>

                  <li class="page-item" [class.disabled]="currentPage === totalPages">
                    <button class="page-link" (click)="onPageChange(currentPage + 1)">Sonraki</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .list-group-item {
      cursor: pointer;
      transition: all 0.2s;
      color: var(--text-primary);
    }
    .list-group-item:hover {
      background-color: var(--primary);
      color: white;
      opacity: 0.8;
    }
    .list-group-item.active {
      background: var(--primary-gradient);
      border-color: transparent;
      color: white;
    }
    .card-header {
      border-bottom: none;
    }
  `]
})
export class CategoriesComponent implements OnInit {
  categories = [
    { id: 'all', name: 'Tüm Haberler', count: 0 },
    { id: 'general', name: 'Genel', count: 0 },
    { id: 'business', name: 'Ekonomi', count: 0 },
    { id: 'sports', name: 'Spor', count: 0 },
    { id: 'technology', name: 'Teknoloji', count: 0 },
    { id: 'science', name: 'Bilim', count: 0 },
    { id: 'health', name: 'Sağlık', count: 0 },
    { id: 'entertainment', name: 'Eğlence', count: 0 }
  ];

  selectedCategory: string = 'all';
  news: NewsArticle[] = [];
  loading = false;
  error = '';
  currentPage = 1;
  totalPages = 0;
  totalResults = 0;
  pageSize: number;

  constructor(private newsService: NewsService) {
    this.pageSize = this.newsService.pageSize;
  }

  ngOnInit() {
    this.loadCategoryNews();
  }

  selectCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.currentPage = 1;
    this.loadCategoryNews();
  }

  loadCategoryNews() {
    this.loading = true;
    this.error = '';
    
    this.newsService.getCategoryNews(this.selectedCategory, this.currentPage).subscribe({
      next: (response) => {
        this.news = response.articles;
        this.totalResults = response.totalResults;
        this.totalPages = Math.ceil(response.totalResults / this.pageSize);
        this.loading = false;
        
        // Kategori sayılarını güncelle
        this.updateCategoryCounts();
      },
      error: (error) => {
        console.error('Kategori haberleri yüklenirken hata:', error);
        this.error = 'Haberler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        this.loading = false;
      }
    });
  }

  updateCategoryCounts() {
    // Her kategori için haber sayısını al
    this.categories.forEach(category => {
      if (category.id !== 'all') {
        this.newsService.getCategoryNews(category.id, 1).subscribe(response => {
          category.count = response.totalResults;
        });
      }
    });
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadCategoryNews();
      window.scrollTo(0, 0);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 