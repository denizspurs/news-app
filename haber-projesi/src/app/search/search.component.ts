import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NewsService, NewsArticle } from '../services/news.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  searchQuery: string = '';
  news: NewsArticle[] = [];
  currentPage = 1;
  totalPages = 0;
  totalResults = 0;
  pageSize: number;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService
  ) {
    this.pageSize = this.newsService.pageSize;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      if (this.searchQuery) {
        this.loadSearchResults();
      }
    });
  }

  loadSearchResults() {
    this.loading = true;
    this.newsService.searchNews(this.searchQuery, this.currentPage).subscribe({
      next: (response) => {
        this.news = response.articles;
        this.totalResults = response.totalResults;
        this.totalPages = Math.ceil(response.totalResults / this.pageSize);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Arama sonuçları yüklenirken bir hata oluştu.';
        this.loading = false;
        console.error('Arama hatası:', error);
      }
    });
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadSearchResults();
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
