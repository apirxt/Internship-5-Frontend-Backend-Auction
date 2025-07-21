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
  private baseUrl = 'http://localhost:5186/api/Auction';
  private metaAuctionTypeUrl = 'http://localhost:5186/api/MetaAuctionType';
  private metaCategoryUrl = 'http://localhost:5186/api/MetaCategory';
  private metaCriteriaTypeUrl = 'http://localhost:5186/api/MetaCriteriaType';
  private metaMoneyTypeUrl = 'http://localhost:5186/api/MetaMoneyType';

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
    return this.http.get<MetaUser[]>('http://localhost:5186/api/MetaUser');
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
