import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private url = 'https://5450.openfoodfacts.org/api/v0/product/';
  private localUrl = 'http://localhost:8000/api/product';
  constructor(private httpClient: HttpClient) { }

  getProductFromBase(barcode): Observable<ProductFromBarcode>{
    console.log(`${this.url}` + barcode);
    return this.httpClient.get<ProductFromBarcode>(`${this.url}` + barcode);
  }
  getProducts(){
    return this.httpClient.get<Product[]>(this.localUrl);
  }
  addProduct(product: Product){
    return this.httpClient.post<Product>(this.localUrl, product);
  }
  updateProduct(product: Product){
    return this.httpClient.patch<Product>(this.localUrl+'/'+product.id, product);
  }
  deleteProduct(product: Product){
    return this.httpClient.delete<Product>(this.localUrl+'/'+product.id);
  }
}

export class ProductFromBarcode{
  product: any
}

export class Product{
  id?: number
  product_name: string
  quantity: number
  weight: string
  category: string
  exp_date: Date
  place: string
  comments: string
}
