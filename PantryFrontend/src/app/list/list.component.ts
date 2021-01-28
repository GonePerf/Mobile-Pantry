import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { ApiService, Product, ProductFromBarcode} from '../api.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})

export class ListComponent implements OnInit {

  product: ProductFromBarcode;
  normalProduct: Product;
  searchFrase = null;
  normalProducts: Observable<Product[]>;
  normalProductList: Product[];
  constructor(public actionSheetController: ActionSheetController, private alertController: AlertController, private api: ApiService) { }

  ngOnInit() {
    this.normalProducts = this.api.getProducts();
    this.normalProducts.subscribe(data => {
      this.normalProductList = this.sortByDate(data);
    });

  }

  getProductFromBarcode(barcode){
    return this.api.getProductFromBase(barcode).subscribe(data => this.product = data, error => console.log(error));
  }
  async onDeleteProduct(product: Product, quantity?: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Wykorzystać '+product.product_name+'?',
      cssClass: 'delete_product',
      buttons: [{
        text: 'Potwierdź',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          if(product.quantity > 1){

            if(quantity){
              if(quantity > product.quantity){
                this.errorAlert("Nie ma tylu "+product.product_name);
                return;
              }
              else{
                product.quantity = product.quantity - quantity;
                if(product.quantity == 0){
                  this.api.deleteProduct(product).subscribe(data => this.succesAlert('Wykorzystałeś wszystkie '+product.product_name), err => console.log(err));
                  return;
                }
                else{
                  this.api.updateProduct(product).subscribe(data => this.succesAlert('Wziąłeś '+quantity+' '+product.product_name), err => console.log(err));
                }
              }
            }else {
              product.quantity --;
              this.api.updateProduct(product).subscribe(data => this.succesAlert('Wziąłeś 1 '+product.product_name), err => console.log(err));
            }
            
          }else{
            this.api.deleteProduct(product).subscribe(data => this.succesAlert('Wykorzystałeś wszystkie '+product.product_name), err => console.log(err));
            this.ngOnInit();
          }
          
          
        }
      },
      ]
    });
    await actionSheet.present();
  }
  

  showProduct(){
    console.log(this.product.product.product_name+"  "+this.product.product.quantity);
  }

  async onAddingProduct(name?: string, quantity?: string) {
    const alert = await this.alertController.create({
      cssClass: 'add_product',
      header: 'Dodawanie produktu',
      inputs: [
        {
          name: 'product_name',
          type: 'text',
          value: name,
          placeholder: 'Nazwa'
        },
        {
          name: 'weight',
          type: 'text',
          value: quantity,
          placeholder: 'Waga'
        },
        {
          name: 'category',
          type: 'text',
          placeholder: 'Kategoria'
        },
        {
          name: 'place',
          type: 'text',
          placeholder: 'Miejsce przechowywania'
        },
        {
          name: 'comments',
          type: 'text',
          placeholder: 'Uwagi'
        },
        {
          placeholder: "Termin ważności",
          name: 'exp_date',
          type: 'date'
        },
        {
          placeholder: "Ilość",
          name: 'quantity',
          type: 'number',
          min: 1
        }
      ],
      buttons: [
        {
          text: 'Anuluj',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Cancel');
          }
        },
        {
          text: 'Skanuj kod',
          handler: () => {
            console.log('cancel');
            this.setProductCode();
          }
        },
        {
          text: 'Dodaj',
          handler: (data) => {
            this.normalProduct = new Product;
            if(name == undefined && quantity == undefined){
              this.normalProduct.product_name = data.product_name;
              this.normalProduct.category = data.category;
              this.normalProduct.quantity = data.quantity;
              this.normalProduct.weight = data.weight;
              this.normalProduct.exp_date = data.exp_date;
              this.normalProduct.comments = data.comments;
              this.normalProduct.place = data.place;
              
              return this.api.addProduct(this.normalProduct).subscribe(data => this.succesAlert('Produkt dodany pomyślnie'), err => console.log(err));

            }else{
              this.normalProduct.product_name = name;
              this.normalProduct.category = data.category;
              this.normalProduct.quantity = data.quantity;
              this.normalProduct.weight = quantity;
              this.normalProduct.exp_date = data.exp_date;
              this.normalProduct.comments = data.comments;
              this.normalProduct.place = data.place;
              return this.api.addProduct(this.normalProduct).subscribe(data => this.succesAlert('Produkt dodany pomyślnie'), err => console.log(err));
            }
            
            
            
          }
        }
      ]
    });

    await alert.present();
  }



  async setProductQuantity(product: Product) {
    const alert = await this.alertController.create({
      cssClass: 'add_product',
      header: 'Wykorzystujesz '+product.product_name,
      subHeader: 'Podaj ilość (MAX: '+ product.quantity+')',
      inputs: [
        {
          name: 'quantity',
          type: 'number',
          placeholder: 'Ilość'
        }
        
      ],
      buttons: [
        {
          text: 'Anuluj',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Cancel');
          }
        },
        {
          text: 'Wykorzystaj',
          handler: (data) => {
            if(data.quantity){
              if(data.quantity > product.quantity){
                this.errorAlert("Nie ma tylu "+product.product_name);
              }else{
                this.onDeleteProduct(product, data.quantity);
              }
              
            }else{
              this.errorAlert('Nie podano ilości!');
            }
            
          }
        }
      ]
    });

    await alert.present();
  }

  async setProductCode() {
    const alert = await this.alertController.create({
      cssClass: 'add_product',
      header: 'Dodawanie produktu',
      inputs: [
        {
          name: 'code',
          type: 'number',
          placeholder: 'Kod'
        }
        
      ],
      buttons: [
        {
          text: 'Anuluj',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Cancel');
          }
        },
        {
          text: 'Skanuj ponownie',
          handler: () => {
            console.log('cancel');
          }
        },
        {
          text: 'Dodaj',
          handler: (data) => {
            this.getProductFromBarcode(data.code);
            setTimeout(()=> {
              if(this.product.product == undefined){
                this.errorAlert("Tego produktu nie ma w bazie danych :/");
              }else{
                this.onAddingProduct(this.product.product.product_name, this.product.product.quantity);
              }
            }, 2000);
            
          }
        }
      ]
    });

    await alert.present();
  }


  /// Filtrowanie produktów

  filterByName(product: Product){
    if(!this.searchFrase){
      return true;
    }else if(product.product_name.toLowerCase().startsWith(this.searchFrase.toLowerCase()) || product.category.toLowerCase().startsWith(this.searchFrase.toLowerCase())){
      return true;
    }
    else{
      return false;
    }
  }

  //// Sortowanie według dat

  sortByDate(data: Product[]){
    data.sort(this.compare);
    return data;
  }
  compare(a: Product, b: Product) {
    let x = new Date(a.exp_date);
    let y = new Date(b.exp_date);
    if (x.getTime() < y.getTime()){
      return -1;
    }
    else if (x.getTime() > y.getTime()){
      return 1;
    }
    else{
      return 0;
    }
  }
  
  /// Funkcja - Jeśli zbliża się termin ważności data wyświetla się na czerwono
  compareDate(date: Date){
    let x = new Date();
    let y = new Date(date);
    x.setTime(x.getTime() + (5 * 24 * 3600 * 1000));
    if(y < x){
      return true;
    }
    else {
      return false;
    }
  }

  countDaysToExp(product: Product){
    let x = new Date();
    let y = new Date(product.exp_date);
    return parseInt(((y.getTime() - x.getTime()) / (1000 * 3600 * 24)).toString());
  }


  /// ALERTY

  async infoProductAlert(product: Product) {
    const alert = await this.alertController.create({
      cssClass: 'info-product',
      header: product.product_name,
      subHeader: 'Kat: '+product.category,
      message: '<div>Pozostało: <b>'+product.quantity+'</b> <br>Waga/jednostka: <b>'+product.weight+'</b><br>Miejsce: <b>'+product.place+'</b><br> Data ważności:<br> <b>'+product.exp_date+'</b><br> Uwagi: '+product.comments+'</div>',
      buttons: ['OK']
    });

    await alert.present();
  }

  async succesAlert(message) {
    const alert = await this.alertController.create({
      header: 'Sukces',
      message: message,
      buttons: [
        {
          text: 'Okay',
          handler: () => {
            this.ngOnInit();
          }
        }
      ]
    });

    await alert.present();
  }
  async errorAlert(message) {
    const alert = await this.alertController.create({
      header: 'Błąd',
      message: message,
      buttons: [
        {
          text: 'Okay',
          handler: () => {
            this.ngOnInit();
          }
        }
      ]
    });

    await alert.present();
  }

  

  addProduct(){
    this.onAddingProduct();
  }
  deleteProduct(product){
    this.onDeleteProduct(product);
  }
  deleteProductWithQuantity(product){
    this.setProductQuantity(product);
  }
}
