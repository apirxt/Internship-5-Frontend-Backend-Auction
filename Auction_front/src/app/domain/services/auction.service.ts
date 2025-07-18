import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auction } from '../../models/auction.model';
import { MetaAuctionType } from '../../models/meta-auction-type.model';
import { MetaCategory } from '../../models/meta-category.model';
import { MetaUser } from '../../models/meta-user.model';
import { MetaCriteriaType } from '../../models/meta-criteria-type.model';
import { MetaMoneyType } from '../../models/meta-money-type.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuctionService {
  private baseUrl = 'https://localhost:7087/api/Auction';
  private metaAuctionTypeUrl = 'https://localhost:7087/api/MetaAuctionType';
  private metaCategoryUrl = 'https://localhost:7087/api/MetaCategory';
  private metaCriteriaTypeUrl = 'https://localhost:7087/api/MetaCriteriaType';
  private metaMoneyTypeUrl = 'https://localhost:7087/api/MetaMoneyType';

  constructor(private http: HttpClient) { }

  // Auction methods
  getAll(): Observable<Auction[]> {
    return this.http.get<Auction[]>(`${this.baseUrl}/All`);
  }

  getById(id: number): Observable<Auction> {
    return this.http.get<Auction>(`${this.baseUrl}/${id}`);
  }

  create(auction: Auction): Observable<Auction> {
    return this.http.post<Auction>(`${this.baseUrl}`, auction);
  }

  update(id: number, auction: Auction): Observable<Auction> {
    return this.http.put<Auction>(`${this.baseUrl}/${id}`, auction);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // Meta Auction Type methods
  getAllMetaAuctionTypes(): Observable<MetaAuctionType[]> {
    return this.http.get<MetaAuctionType[]>(`${this.metaAuctionTypeUrl}`);
  }

  // Meta Category methods
  getAllMetaCategories(): Observable<MetaCategory[]> {
    return this.http.get<MetaCategory[]>(`${this.metaCategoryUrl}`);
  }

  // Meta User methods
  getAllMetaUsers(): Observable<MetaUser[]> {
    return this.http.get<MetaUser[]>('https://localhost:7087/api/MetaUser');
  }

  // Meta Criteria Type methods
  getAllMetaCriteriaTypes(): Observable<MetaCriteriaType[]> {
    return this.http.get<MetaCriteriaType[]>(`${this.metaCriteriaTypeUrl}`);
  }

  // Meta Money Type methods
  getAllMetaMoneyTypes(): Observable<MetaMoneyType[]> {
    return this.http.get<MetaMoneyType[]>(`${this.metaMoneyTypeUrl}`);
  }
}
