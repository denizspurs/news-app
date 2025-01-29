import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export type NewsCategory = 'business' | 'entertainment' | 'general' | 'health' | 'science' | 'sports' | 'technology';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiKey = '11271d0b33a34a6ab37aa066650bdffb';
  private apiUrl = 'https://newsapi.org/v2';
  pageSize = 12;

  constructor(private http: HttpClient) { }

  private getFullUrl(endpoint: string, params: any): string {
    const queryParams = new URLSearchParams({
      ...params,
      apiKey: this.apiKey
    }).toString();
    
    return `${this.apiUrl}${endpoint}?${queryParams}`;
  }

  getLatestNews(page: number = 1) {
    const params = {
      q: 'türkiye',
      language: 'tr',
      pageSize: this.pageSize.toString(),
      page: page.toString(),
      sortBy: 'publishedAt'
    };

    return this.http.get<NewsResponse>(this.getFullUrl('/everything', params));
  }

  getCategoryNews(category: NewsCategory | string, page: number = 1): Observable<NewsResponse> {
    let searchQuery = 'türkiye';
    if (category !== 'all') {
      searchQuery += ` ${category}`;
    }
    
    const params = {
      q: searchQuery,
      language: 'tr',
      pageSize: this.pageSize.toString(),
      page: page.toString(),
      sortBy: 'publishedAt'
    };

    return this.http.get<NewsResponse>(this.getFullUrl('/everything', params));
  }

  searchNews(query: string, page: number = 1): Observable<NewsResponse> {
    const params = {
      q: query,
      language: 'tr',
      pageSize: this.pageSize.toString(),
      page: page.toString(),
      sortBy: 'publishedAt'
    };

    return this.http.get<NewsResponse>(this.getFullUrl('/everything', params));
  }
}
