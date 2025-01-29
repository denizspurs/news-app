import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NewsService, NewsArticle, NewsCategory } from '../services/news.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  categoryId: NewsCategory = 'general';
  news: NewsArticle[] = [];
  currentPage = 1;
  totalPages = 0;
  totalResults = 0;
  pageSize: number;
  loading = false;
  error = '';
  categoryNames: { [key: string]: string } = {
    business: 'İş',
    entertainment: 'Eğlence',
    general: 'Genel',
    health: 'Sağlık',
    science: 'Bilim',
    sports: 'Spor',
    technology: 'Teknoloji'
  };

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService
  ) {
    this.pageSize = this.newsService.pageSize;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.categoryId = params['id'] as NewsCategory;
        this.currentPage = 1;
        this.loadCategoryNews();
      }
    });
  }

  loadCategoryNews() {
    this.loading = true;
    this.error = '';
    
    this.newsService.getCategoryNews(this.categoryId, this.currentPage).subscribe({
      next: (response) => {
        console.log('API Response:', response); // Debug için
        this.news = response.articles;
        this.totalResults = response.totalResults;
        this.totalPages = Math.ceil(response.totalResults / this.pageSize);
        this.loading = false;
      },
      error: (error) => {
        console.error('Kategori haberleri yüklenirken hata:', error);
        this.error = 'Haberler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        this.loading = false;
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

  getCategoryName(): string {
    return this.categoryNames[this.categoryId] || this.categoryId;
  }
}
