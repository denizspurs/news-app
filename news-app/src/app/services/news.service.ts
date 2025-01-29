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
  pageSize = 24;

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
    let searchQuery = '';
    
    switch(category) {
      case 'business':
        searchQuery = 'türkiye (ekonomi OR finans OR borsa OR dolar OR euro OR altın OR kripto OR bitcoin OR bist OR merkez bankası)';
        break;
      case 'entertainment':
        searchQuery = 'türkiye (magazin OR sinema OR dizi OR film OR müzik OR konser OR festival OR sanat OR eğlence OR televizyon)';
        break;
      case 'general':
        searchQuery = 'türkiye (gündem OR siyaset OR politika OR meclis OR seçim OR hükümet OR belediye OR valilik OR bakanlık)';
        break;
      case 'health':
        searchQuery = 'türkiye (sağlık OR hastane OR doktor OR ilaç OR tedavi OR hastalık OR aşı OR sağlık bakanlığı OR pandemi OR tıp)';
        break;
      case 'science':
        searchQuery = 'türkiye (bilim OR uzay OR nasa OR araştırma OR keşif OR teknoloji OR yapay zeka OR robot OR bilimsel OR tübitak)';
        break;
      case 'sports':
        searchQuery = 'türkiye (spor OR futbol OR basketbol OR voleybol OR fenerbahçe OR galatasaray OR beşiktaş OR trabzonspor OR süper lig OR milli takım)';
        break;
      case 'technology':
        searchQuery = 'türkiye (teknoloji OR yazılım OR bilgisayar OR mobil OR android OR iphone OR samsung OR yapay zeka OR siber güvenlik OR dijital)';
        break;
      default:
        searchQuery = 'türkiye gündem';
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
