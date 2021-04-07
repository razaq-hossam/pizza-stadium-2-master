import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Family } from 'src/app/models/family';
import { ApiService } from 'src/app/api.service';
import { DataService } from 'src/app/data.service';
import { ToastrService } from 'ngx-toastr';
import { CommunicationService } from 'src/app/communication.service';
import { ThaiProduct } from 'src/app/models/thaiProduct';

@Component({
  selector: 'app-suggestions',
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.css']
})
export class SuggestionsComponent implements OnInit {
  menu;
  FamilyList: Family[];
  MenuFamilyList: Family[];
  selectedFamily;
  selectedMenuFamily;
  productList = [];
  selectdPrice = 0;
  activatedType = 'p';
  cart = {
    menu:{id:null, price:0, picture:null, name:null, alias:null},
    qty:1, suppPrice:0, selectedSize:null, selectedComposition:[], selectedSupplements:[], selectedOptions:[]
  };
  setQty = {menu_id:0, cart_index:0};
  chunckSize = 3;
  selectedProduct;
  
  @Input() city;
  @Input() zone;

  @Input() nav_open = 0;
  @Output() nav_openChange = new EventEmitter<number>();

  /* @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.chunckSize = window.innerWidth<960 ? 1 : 3;
  } */

  // Dump data for Nouilles, I didnt found them in the API
  nouillesList: ThaiProduct[] = [
    {name: 'Nouilles Végétarienne', picture: 'assets/images/thai/Nouilles_Legumes.png'},
    {name: 'Nouilles Boeuf', picture: 'assets/images/thai/Nouilles_Boeuf.png'},
    {name: "Nouilles Crevette", picture: 'assets/images/thai/nouilles_crevettes.png'}
  ];
  
  constructor(private communicationService: CommunicationService, private apiService: ApiService, private dataService: DataService, private toastr: ToastrService) {
    this.apiService.getFamilies(this.user.id).subscribe((FamilyList: Family[])=>{
      this.FamilyList = FamilyList;
      console.log(FamilyList);
      this.productList = this.FamilyList.find(e => e.alias === 'desserts').menu_list;
    });
    
    this.apiService.getMenus().subscribe((MenuFamilyList: Family[])=>{
      this.MenuFamilyList = MenuFamilyList;
    });
  }
  
  ngOnInit(): void {
    this.communicationService.message.subscribe(message => {
      this.nav_open = message;
    });
    this.chunckSize = window.innerWidth<960 ? 1 : 3;
  }

  get asset_url() {
    return this.dataService.asset_url;
  }

  addToFavorite(event, menu_id, is_add=1) {
    if(this.user.id) {
      this.toastr.success('Le produit est bien ajouté aux favoris.');
    } else {
      this.toastr.info('Vous devez se connecter pour pouvoir ajouter les produits aux favoris.')
    }
  }
  
  onChangeSize(size, mi, menu_id) {
    this.selectdPrice = size;
    //(<HTMLInputElement>document.getElementById("pick"+menu_id)).innerHTML = this.selectedFamily.menu_list[mi].priceArr2[size].price;
  }
  
  addToCart(menu) {
    console.log(menu);
    this.cart.menu.name = menu.name;
    this.cart.menu.alias = menu.alias;
    this.cart.menu.picture = menu.picture;
    this.cart.selectedSize = this.selectdPrice;
    let priceList = menu.priceArr2;
    console.log(priceList);
    this.cart.menu.price = priceList[this.cart.selectedSize].price;
    this.cart.menu.id = menu.id;
    this.cart.qty = 1;
    
    let cartStorage = [];
    if (localStorage && localStorage.getItem('cart')) {
      cartStorage = JSON.parse(localStorage.getItem('cart'));

      let item = cartStorage.find(i => 
        i.menu.id === this.cart.menu.id && i.selectedSize === this.cart.selectedSize
        && i.selectedComposition.length === this.cart.selectedComposition.length
        && i.selectedSupplements.length === this.cart.selectedSupplements.length
        && i.selectedOptions.length === this.cart.selectedOptions.length);
          
      console.log(item);

      if (item) {
        let index = cartStorage.indexOf(item);
        cartStorage[index] = this.cart;
        this.setQty.cart_index = index;
      } else {
        cartStorage.push(this.cart);
        this.setQty.cart_index = this.lastIndex(cartStorage);
      }
      localStorage.setItem('cart', JSON.stringify(cartStorage));
      // return true;
    } else {
      localStorage.setItem('cart', JSON.stringify([]));
      cartStorage = JSON.parse(localStorage.getItem('cart'));            
      cartStorage.push(this.cart);
      this.setQty.cart_index = this.lastIndex(cartStorage);
      localStorage.setItem('cart', JSON.stringify(cartStorage));
      // return true;
    }
    this.cartList = cartStorage;

    this.setQty.menu_id = menu.id;
    
    this.toastr.success("le produit a été bien ajouté au panier!", 'Bravo!')
  }

  lastIndex(array) {
    return array.length - 1;
  }

  decrement(i) {
    if(this.cart.qty>1){
      let cartList = this.cartList;
      cartList[i].qty -= 1;
      this.updateStorage(cartList);
      this.toastr.success("la quantité a été mise à jour!", cartList[i].qty+' '+cartList[i].menu.name)
      
    }
  }
  increment(i) {
    let cartList = this.cartList;
    console.log(cartList);
    cartList[i].qty += 1;
    this.updateStorage(cartList);
    this.toastr.success("la quantité a été mise à jour!", cartList[i].qty+' '+cartList[i].menu.name)
    
  }

  updateStorage(cartList) {
    let cartStorage = [];
    if (localStorage && localStorage.getItem('cart')) {
      cartStorage = JSON.parse(localStorage.getItem('cart'));
      localStorage.setItem('cart', JSON.stringify(cartList));
    }
  }

  set cartList(cartList) {
    this.dataService.cartList = cartList;
  }
  get cartList() {
    return this.dataService.cartList;
  }

  set user(user) {
    this.dataService.user = user;
  }
  get user() {
    return this.dataService.user;
  }

  chunk(array, size) {
    var R = [];
    for (var i = 0; i < array.length; i += size)
      R.push(array.slice(i, i + size));
    return R;
  }

  showPopup(menu) {
    this.nav_open = 1;
    this.selectedProduct = menu;
  }
  
}
