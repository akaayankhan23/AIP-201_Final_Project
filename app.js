/* Save as app.js */
/* Shared products data + functions for multi-page site */

const productsData = [
  { id: "p1", title: "Men's Casual Shirt", price: 899, oldPrice: 1299, category: "men", rating: 4.4, img: "https://images.unsplash.com/photo-1520975628386-8bdb0d0f6a4b?auto=format&fit=crop&w=1000&q=60", desc: "Comfort cotton shirt. Regular fit. Multiple sizes." },
  { id: "p2", title: "Women Floral Dress", price: 1499, oldPrice: 1999, category: "women", rating: 4.6, img: "https://images.unsplash.com/photo-1495121605193-b116b5b09d6b?auto=format&fit=crop&w=1000&q=60", desc: "Summer floral dress with soft fabric." },
  { id: "p3", title: "Stylish Backpack", price: 1299, oldPrice: 1899, category: "accessory", rating: 4.2, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=60", desc: "Durable backpack for daily use." },
  { id: "p4", title: "Men's Denim Jacket", price: 2199, oldPrice: 2899, category: "men", rating: 4.7, img: "https://images.unsplash.com/photo-1538570797048-6f2b16ac9c7c?auto=format&fit=crop&w=1000&q=60", desc: "Classic denim jacket — winter ready." },
  { id: "p5", title: "Women Casual Tee", price: 699, oldPrice: 999, category: "women", rating: 4.1, img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1000&q=60", desc: "Soft jersey t-shirt, everyday essential." },
  { id: "p6", title: "Sunglasses", price: 499, oldPrice: 799, category: "accessory", rating: 4.0, img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=60", desc: "UV protection sunglasses." }
];

/* Helpers */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const qsId = id => document.getElementById(id);

/* CART */
const CART_KEY = 'rangrej_cart_v2';
function getCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); }

function addToCart(id, qty = 1){
  const cart = getCart();
  const it = cart.find(x=>x.id===id);
  if(it) it.qty += qty;
  else cart.push({ id, qty });
  saveCart(cart);
  toast('Added to cart');
}

function updateQty(id, delta){
  const cart = getCart();
  const it = cart.find(x=>x.id===id);
  if(!it) return;
  it.qty += delta;
  if(it.qty < 1) it.qty = 1;
  saveCart(cart);
  renderCartPage();
}

function removeFromCart(id){
  let cart = getCart();
  cart = cart.filter(x=>x.id!==id);
  saveCart(cart);
  renderCartPage();
}

function clearCart(){ localStorage.removeItem(CART_KEY); renderCartPage(); }

/* small toast */
function toast(msg){
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style,{position:'fixed',right:'22px',bottom:'22px',background:'rgba(255,111,97,0.12)',color:'#fff',padding:'10px 14px',borderRadius:'10px',backdropFilter:'blur(4px)',zIndex:999});
  document.body.appendChild(t);
  setTimeout(()=>{ t.style.opacity = '0'; t.style.transform='translateY(10px)'; },1400);
  setTimeout(()=>t.remove(),2200);
}

/* UI updates */
function updateCartCount(){
  const count = getCart().reduce((s,i)=>s + i.qty, 0);
  $$('body [id="cart-count"]').forEach(el => el.textContent = count);
}

/* Render functions (per page) */
function renderPopular(){
  const el = qsId('popular-list');
  if(!el) return;
  el.innerHTML = productsData.slice(0,4).map(cardForProduct).join('');
  // animate items
  el.querySelectorAll('.card').forEach((c,i)=> c.style.setProperty('--i', i));
}

function cardForProduct(p){
  return `
    <div class="card product">
      <img src="${p.img}" alt="${p.title}" loading="lazy" />
      <div class="title">${p.title}</div>
      <div class="meta">Rating: ${p.rating} ★</div>
      <div class="price-row">
        <div class="price">₹${p.price}</div>
        <div class="old-price muted">₹${p.oldPrice}</div>
      </div>
      <div style="margin-top:auto;display:flex;gap:8px;align-items:center">
        <a class="btn" href="product.html?id=${p.id}">View</a>
        <button class="btn btn-ghost" onclick="addToCart('${p.id}')">Add</button>
      </div>
    </div>
  `;
}

/* Products page: filter & render */
function renderProductsPage(list = productsData){
  const grid = qsId('product-grid');
  if(!grid) return;
  grid.innerHTML = list.map((p, idx) => {
    // add --i for stagger animation
    return `<div style="--i:${idx}" class="product-wrapper">${cardForProduct(p)}</div>`;
  }).join('');
  // stagger reveal
  document.querySelectorAll('.product-wrapper').forEach((el, i)=>{
    el.style.animation = `popIn .45s forwards ${i*0.06}s`;
  });
}

function applyFilters(){
  const qEl = qsId('searchInput');
  const q = qEl ? qEl.value.toLowerCase().trim() : '';
  const sort = qsId('sortSelect') ? qsId('sortSelect').value : 'default';
  const category = qsId('categorySelect') ? qsId('categorySelect').value : 'all';
  let list = productsData.filter(p => {
    const matchQ = p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    const matchC = (category === 'all' || p.category === category);
    return matchQ && matchC;
  });
  if(sort === 'price-asc') list.sort((a,b)=>a.price-b.price);
  if(sort === 'price-desc') list.sort((a,b)=>b.price-a.price);
  renderProductsPage(list);
}

/* Product detail page */
function getQueryParam(name){
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
function renderProductDetail(){
  const wrapper = qsId('detail-wrapper');
  if(!wrapper) return;
  const id = getQueryParam('id');
  const p = productsData.find(x=>x.id === id);
  if(!p){
    wrapper.innerHTML = `<div class="card"><p>Product not found. <a href="products.html" class="btn btn-ghost">See All</a></p></div>`;
    return;
  }
  wrapper.innerHTML = `
    <div class="detail-image card">
      <img src="${p.img}" alt="${p.title}" />
    </div>
    <div class="detail-info card">
      <h2>${p.title}</h2>
      <div class="meta">Category: ${p.category} • Rating: ${p.rating} ★</div>
      <div class="price-row">
        <div class="price">₹${p.price}</div>
        <div class="old-price muted">₹${p.oldPrice}</div>
      </div>
      <p style="margin-top:12px">${p.desc}</p>
      <div style="margin-top:14px;display:flex;gap:8px;">
        <button class="btn" onclick="addToCart('${p.id}', 1)">Add to Cart</button>
        <button class="btn btn-ghost" onclick="window.location='cart.html'">Go to Cart</button>
      </div>
    </div>
  `;
}

/* Cart page rendering */
function renderCartPage(){
  const wrapper = qsId('cart-wrapper');
  if(!wrapper) return;
  const cart = getCart();
  if(cart.length === 0){
    wrapper.innerHTML = `<div class="card"><p>Your cart is empty. <a class="btn btn-ghost" href="products.html">Shop now</a></p></div>`;
    updateCartCount();
    return;
  }
  let html = '<div class="card"><table><thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr></thead><tbody>';
  let grand = 0;
  cart.forEach(ci=>{
    const p = productsData.find(x=>x.id===ci.id);
    const total = p.price * ci.qty;
    grand += total;
    html += `<tr>
      <td style="display:flex;gap:10px;align-items:center">
        <img src="${p.img}" style="width:64px;height:64px;object-fit:cover;border-radius:8px" />
        <div>
          <div style="font-weight:700">${p.title}</div>
          <div class="muted">₹${p.price} each</div>
        </div>
      </td>
      <td>₹${p.price}</td>
      <td>
        <button class="btn btn-ghost" onclick="updateQty('${p.id}', -1)">-</button>
        <span style="padding:0 8px">${ci.qty}</span>
        <button class="btn btn-ghost" onclick="updateQty('${p.id}', 1)">+</button>
      </td>
      <td>₹${total}</td>
      <td><button class="btn btn-ghost" onclick="removeFromCart('${p.id}')">Remove</button></td>
    </tr>`;
  });
  html += `</tbody></table>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
      <div><strong>Grand Total: ₹${grand}</strong></div>
      <div>
        <button class="btn" onclick="checkout()">Checkout</button>
        <button class="btn btn-ghost" onclick="clearCart()">Clear</button>
      </div>
    </div>
  </div>`;
  wrapper.innerHTML = html;
  updateCartCount();
}

/* Checkout (demo) */
function checkout(){
  const cart = getCart();
  if(cart.length === 0) return toast('Cart empty');
  localStorage.removeItem(CART_KEY);
  renderCartPage();
  toast('Order placed! (Demo)');
  setTimeout(()=> window.location = 'index.html', 800);
}

/* login demo */
function login(e){
  e.preventDefault();
  const email = qsId('email') ? qsId('email').value : null;
  if(!email) return toast('Enter email');
  localStorage.setItem('rangrej_user', JSON.stringify({ email }));
  toast('Logged in as ' + email);
  window.location = 'index.html';
}

/* Init per page */
function init(){
  qsId('year') && (qsId('year').textContent = new Date().getFullYear());
  updateCartCount();

  // attach search enter to go products
  const s = qsId('searchInput');
  if(s){
    s.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ window.location = 'products.html'; }});
  }

  const page = document.body.getAttribute('data-page') || 'home';
  if(page === 'home'){ renderPopular(); }
  if(page === 'products'){ renderProductsPage(); }
  if(page === 'product'){ renderProductDetail(); }
  if(page === 'cart'){ renderCartPage(); }

  // attach applyFilters on selects if present
  if(qsId('sortSelect')) qsId('sortSelect').addEventListener('change', applyFilters);
  if(qsId('categorySelect')) qsId('categorySelect').addEventListener('change', applyFilters);

  // make product cards clickable via delegation (optional)
  document.addEventListener('click', (ev)=>{
    const t = ev.target;
    if(t.matches('.hamburger')){ /* mobile menu toggling later */ }
  });
}

window.addEventListener('load', init);
window.addToCart = addToCart;
window.updateQty = updateQty;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.checkout = checkout;
window.login = login;
/* Quick View modal - paste at end of app.js */

/* create modal container once */
(function(){
  const qv = document.createElement('div');
  qv.className = 'qv-backdrop';
  qv.id = 'qv-backdrop';
  qv.innerHTML = `<div class="qv-modal" role="dialog" aria-modal="true">
    <div class="qv-left"><img id="qv-img" src="" alt="product" /></div>
    <div class="qv-right">
      <div class="qv-title" id="qv-title"></div>
      <div class="meta muted" id="qv-meta"></div>
      <div class="qv-price" id="qv-price"></div>
      <p id="qv-desc" style="margin-top:12px;color:#3b4652"></p>
      <div class="qv-actions">
        <button class="btn" id="qv-add">Add to Cart</button>
        <a class="btn btn-ghost" id="qv-view" href="#">Open Product Page</a>
      </div>
      <button id="qv-close" class="btn btn-ghost small" style="margin-top:12px">Close</button>
    </div>
  </div>`;
  document.body.appendChild(qv);

  // close on backdrop click
  qv.addEventListener('click', (e)=>{
    if(e.target === qv) closeQuickView();
  });

  document.getElementById('qv-close').addEventListener('click', closeQuickView);
})();

function openQuickView(id){
  const p = productsData.find(x=>x.id === id);
  if(!p) return;
  document.getElementById('qv-img').src = p.img;
  document.getElementById('qv-title').textContent = p.title;
  document.getElementById('qv-meta').textContent = `Category: ${p.category} • Rating: ${p.rating} ★`;
  document.getElementById('qv-price').textContent = `₹${p.price}  `;
  document.getElementById('qv-desc').textContent = p.desc;
  const view = document.getElementById('qv-view');
  view.href = `product.html?id=${p.id}`;
  // add to cart handler
  const addBtn = document.getElementById('qv-add');
  addBtn.onclick = ()=>{ addToCart(p.id,1); closeQuickView(); };

  const backdrop = document.getElementById('qv-backdrop');
  backdrop.classList.add('show');
}

function closeQuickView(){
  const backdrop = document.getElementById('qv-backdrop');
  backdrop.classList.remove('show');
}

/* expose to global so product card inline onclick can call it */
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;
