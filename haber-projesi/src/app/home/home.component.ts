import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NewsService, NewsArticle } from '../services/news.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mt-4">
      <!-- Slider -->
      <div *ngIf="!loading && !error && sliderNews.length > 0" class="mb-5">
        <div id="newsCarousel" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-indicators">
            <button *ngFor="let item of sliderNews; let i = index" 
                    type="button" 
                    [attr.data-bs-target]="'#newsCarousel'" 
                    [attr.data-bs-slide-to]="i" 
                    [class.active]="i === 0"
                    [attr.aria-current]="i === 0">
            </button>
          </div>
          <div class="carousel-inner">
            <div *ngFor="let article of sliderNews; let i = index" 
                 class="carousel-item" 
                 [class.active]="i === 0">
              <img [src]="article.urlToImage || 'assets/placeholder.jpg'" 
                   class="d-block w-100" 
                   [alt]="article.title"
                   style="height: 500px; object-fit: cover;">
              <div class="carousel-caption">
                <div class="bg-dark bg-opacity-50 p-3 rounded">
                  <h3>{{ article.title }}</h3>
                  <p>{{ article.description }}</p>
                  <a [href]="article.url" target="_blank" class="btn btn-primary">Devamını Oku</a>
                </div>
              </div>
            </div>
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#newsCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Önceki</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#newsCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Sonraki</span>
          </button>
        </div>
      </div>

      <h2 class="mb-4">Son Haberler</h2>
      
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
      <div *ngIf="!loading && !error && listNews.length > 0" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div *ngFor="let article of listNews" class="col">
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
        Henüz haber bulunmuyor.
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
  `,
  styles: [`
    .pagination .page-link {
      color: var(--primary);
      background-color: var(--background-card);
      border-color: var(--border-color);
    }
    
    .pagination .page-item.active .page-link {
      background-color: var(--primary);
      border-color: var(--primary);
      color: white;
    }
    
    .pagination .page-item.disabled .page-link {
      color: var(--text-muted);
      background-color: var(--background-card);
      border-color: var(--border-color);
    }
  `]
})
export class HomeComponent implements OnInit {
  news: NewsArticle[] = [];
  sliderNews: NewsArticle[] = [];
  listNews: NewsArticle[] = [];
  currentPage = 1;
  totalPages = 0;
  totalResults = 0;
  pageSize: number;
  loading = true;
  error: string | null = null;

  constructor(private newsService: NewsService) {
    this.pageSize = this.newsService.pageSize;
  }

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.loading = true;
    this.error = null;
    console.log('Haberler yükleniyor... Sayfa:', this.currentPage);

    this.newsService.getLatestNews(this.currentPage)
      .pipe(
        catchError(error => {
          console.error('Haber yükleme hatası:', error);
          if (error.status === 429) {
            this.error = 'API istek limiti aşıldı. Lütfen biraz bekleyin.';
          } else if (error.status === 401) {
            this.error = 'API anahtarı geçersiz. Lütfen kontrol edin.';
          } else {
            this.error = 'Haberler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
          }
          return of({ status: 'error', totalResults: 0, articles: [] });
        }),
        finalize(() => {
          this.loading = false;
          console.log('Yükleme tamamlandı');
        })
      )
      .subscribe(response => {
        console.log('API yanıtı:', response);
        this.news = response.articles;
        this.sliderNews = this.news.slice(0, 3);
        this.listNews = this.news.slice(3);
        this.totalResults = response.totalResults;
        this.totalPages = Math.ceil(response.totalResults / this.pageSize);
      });
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadNews();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
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
