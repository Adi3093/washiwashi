// Data Menu
const MENU_ITEMS = [
  { id: 'makizushi', name: 'Makizushi', price: 25000, desc: 'Rolled Sushi, formed with bamboo mat (Makisu).' },
  { id: 'nigirizushi', name: 'Nigirizushi', price: 25000, desc: 'Hand pressed sushi, pressed with sushi rice.' },
  { id: 'gunkanmaki', name: 'Gunkanmaki', price: 25000, desc: 'Oval shaped sushi, wrapped with nori and covered with various toppings.' },
  { id: 'chirashizushi', name: 'Chirashizushi', price: 50000, desc: 'A bowl of sushi rice plues wide group of ingredients.' },
  { id: 'oshizuzhi', name: 'Oshizushi', price: 100000, desc: 'Rectangular shaped sushi known as pressed or box sushi.' },
  { id: 'inarizhushi', name: 'Inarizhushi', price: 35000, desc: 'Pouch of fried tofu filled with sushi rice.' },
  { id: 'mojito', name: 'Blue Sky Mojito', price: 15000, desc: 'Mojito with sweet Mint flavor and Blue Hawaii syrup.' },
  { id: 'lemontea', name: 'Lemon Tea', price: 10000, desc: 'fresh tea with fresh squeezed lemon.' },
  { id: 'matcha', name: 'Matcha Macchiato', price: 20000, desc: 'Matcha milk with macchiato cream.' },
  { id: 'choco', name: 'Choco Macchiato', price: 20000, desc: 'chocolate milk with macchiato cream and chocochip.' },
  { id: 'grape', name: 'Blackcurrant', price: 20000, desc: 'fresh grape flavored drink' }
];

// Helpers 
const IDR = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];

function formatIDR(v){ return IDR.format(v); }

//  Event click button tambahkan 
document.body.addEventListener('click', e => {
  const btn = e.target.closest('button.add');
  if(!btn) return;
  addToCart(btn.dataset.id);
  Ordered();
});
//  menu filter 
const filterButtons = document.querySelectorAll('.filter-btn');
const menuCards = document.querySelectorAll('.menu-grid .card');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // penghapusan
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    menuCards.forEach(card => {
      if (filter === "all" || card.dataset.category === filter) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  });
});

// const menuGrid = $('#menuGrid');
// MENU_ITEMS.forEach(item => {
//   const card = document.createElement('article');
//   card.className = 'card';
//   card.innerHTML = `
//     <h4>${item.name}</h4>
//     <p>${item.desc}</p>
//     <div class="price">${formatIDR(item.price)}</div>
//     <button class="add" data-id="${item.id}" aria-label="Tambah ${item.name} ke keranjang">+ Tambahkan</button>
//   `;
//   menuGrid.appendChild(card);
// });

//  Cart State 
const state = {
  items: /** @type {Record<string, {id:string, name:string, price:number, qty:number}>} */ ({})
};

function addToCart(id){
  const base = MENU_ITEMS.find(x => x.id === id);
  if(!base) return;
  if(!state.items[id]){ 
    state.items[id] = { id: base.id, name: base.name, price: base.price, qty:1};
    console.log('tombol tambah menu diklik');
  } else {
    state.items[id].qty++  ;  

  }
  renderCart();
  playCartSound();
}

function removeFromCart(id){
  delete state.items[id];
  renderCart();
}

function incQty(id){
  const it = state.items[id]; if(!it) return;
  it.qty++; renderCart();
}
function decQty(id){
  const it = state.items[id]; if(!it) return;
  it.qty--; if(it.qty <= 0) delete state.items[id];
  renderCart();
}

function totals(){
  const subtotal = Object.values(state.items).reduce((s,it) => s + it.price * it.qty, 0);
  const tax = Math.round(subtotal * 0.10);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

// Render Cart 
const cartList = $('#cartItems');
const subtotalEl = $('#subtotal');
const taxEl = $('#tax');
const totalEl = $('#total');
const cartCount = $('#cartCount');
const payBtn = $('#payBtn');

function renderCart(){
  // items
  cartList.innerHTML = '';
  const items = Object.values(state.items);
  if(items.length === 0){
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = '<span class="item-title">Keranjang kosong.</span><span class="item-meta">Ayo pilih menunya dulu~</span>';
    cartList.appendChild(li);
  } else {
    for(const it of items){
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <div>
          <div class="item-title">${it.name}</div>
          <div class="item-meta">${formatIDR(it.price)} &times; ${it.qty} = <strong>${formatIDR(it.price * it.qty)}</strong></div>
        </div>
        <div style="display:flex;align-items:center;gap:.35rem">
          <div class="qty" aria-label="Ubah jumlah ${it.name}">
            <button aria-label="Kurangi" data-act="dec" data-id="${it.id}">−</button>
            <span aria-live="polite">${it.qty}</span>
            <button aria-label="Tambah" data-act="inc" data-id="${it.id}">+</button>
          </div>
          <button class="remove" data-act="rm" data-id="${it.id}" aria-label="Hapus ${it.name}">Hapus</button>
        </div>
      `;
      cartList.appendChild(li);
    }
  }

  // totals
  const { subtotal, tax, total } = totals();
  subtotalEl.textContent = formatIDR(subtotal);
  taxEl.textContent = formatIDR(tax);
  totalEl.textContent = formatIDR(total);

  // count + pay state
  const count = items.reduce((s,it) => s + it.qty, 0);
  cartCount.textContent = String(count);
  floatingCartCount.textContent = String(count);
  payBtn.disabled = count === 0;
}

//  Events 
// menuGrid.addEventListener('click', e => {
//   const btn = e.target.closest('button.add');
//   if(!btn) return;
//   addToCart(btn.dataset.id);
//   openCart(); // hint user to view cart
// });

cartList.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if(!btn) return;
  const id = btn.dataset.id;
  const act = btn.dataset.act;
  if(act === 'inc') incQty(id);
  else if(act === 'dec') decQty(id);
  else if(act === 'rm') removeFromCart(id);
});

//  Cart open/close (mobile) 
const cart = $('#cart');
const cartToggle = $('.cart-toggle');
const cartClose = $('.cart-close');

function openCart(){
  cart.classList.add('open');
  cartToggle.setAttribute('aria-expanded', 'true');
}
function closeCart(){
  cart.classList.remove('open');
  cartToggle.setAttribute('aria-expanded', 'false');
}

cartToggle.addEventListener('click', () => {
  cart.classList.toggle('open');
  const expanded = cart.classList.contains('open');
  cartToggle.setAttribute('aria-expanded', String(expanded));
});
cartClose.addEventListener('click', closeCart);

//  Pay Modal 
const payModal = $('#payModal');
const closeModalBtn = $('#closeModal');

function showModal(){
  payModal.setAttribute('aria-hidden', 'false');
  // Basic focus trap
  closeModalBtn.focus();
  document.body.style.overflow = 'hidden';
}
function hideModal(){
  payModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

payBtn.addEventListener('click', () => {
  if(payBtn.disabled) return;
  showModal();
  // Reset cart on success
  state.items = {};
  renderCart();
  openCart();
  playBuySound();
});

$('.modal-backdrop').addEventListener('click', hideModal);
closeModalBtn.addEventListener('click', hideModal);
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && payModal.getAttribute('aria-hidden') === 'false'){
    hideModal();
  }
});

//  testimonial 
const testimonialForm = document.getElementById("testimonialForm");
const testimonialList = document.getElementById("testimonial-list");
const ratingStars = document.querySelectorAll(".rating span");
const ratingInput = document.getElementById("rating");

ratingStars.forEach(star => {
  star.addEventListener("click", () => {
    const value = star.getAttribute("data-value");
    ratingInput.value = value;

    ratingStars.forEach(s => s.classList.remove("selected"));

    ratingStars.forEach(s => {
      if (s.getAttribute("data-value") <= value) {
        s.classList.add("selected");
      }
    });
  });
});

testimonialForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("message").value.trim();
  const rating = ratingInput.value;

  if (name && message && rating) {
    let starsHtml = "";
    for (let i = 1; i <= 5; i++) {
      starsHtml += i <= rating ? "★" : "☆";
    }

    const newCard = document.createElement("article");
    newCard.classList.add("testimonial-card");
    newCard.innerHTML = `
    <p>"${message}"</p>
    <div class="stars">${starsHtml}</div>
    <h4>- ${name}</h4>
    `;

    testimonialList.appendChild(newCard);
    testimonialForm.reset();
    ratingInput.value = "";
    ratingStars.forEach(s => s.classList.remove("selected "))
  }
});

//  floating cart 
const floatingCart = document.getElementById("floatingCart");
const floatingCartCount = document.getElementById("floatingCartCount");
const headerCart = document.querySelector(".cart-toggle");
const headerCartCount = document.querySelector("cartCount");

function updatefloatingCartCount(count) {
  floatingCartCount.textContent = count;
  headerCartCount.textContent = count;
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      floatingCart.style.display = "none";
      console.log("ini belum")
    } else {
      floatingCart.style.display = "block";
      console.log("ini sudah lewat")
    }
  });
});

observer.observe(headerCart);

floatingCart.addEventListener("click",() => {
  console.log("btn ini klik");
  openCart();
});


//  Footer Year 
$('#year').textContent = new Date().getFullYear();

// Initial render
renderCart();

// adding & buy sound
const cartSound = document.getElementById("cartSound")
const buySound = document.getElementById("buySound")

function playCartSound() {
  cartSound.currentTime = 0;
  cartSound.play();
}
function playBuySound(){
  buySound.currentTime = 0;
  buySound.play();
}


window.addToCart() = addToCart();