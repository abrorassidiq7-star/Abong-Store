/* === Data Produk (10 item, bisa diedit sesuai kebutuhan) === */
const PRODUCTS = [
  { id:"p2", name:"Tramadol 50mg 1 Box",  price:125000, image:"https://botplusweb.farmaceuticos.com/Documentos/AEMPS/Fotos/108180/full/63910_materialas.jpg" },
  { id:"p9", name:"Kondom Sutra isi 3",  price:14000, image:"https://cf.shopee.co.id/file/420445beb2121d893b9fb2bc7ac4e5c6"},
];

/* === Elemen DOM === */
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const emptyState  = document.getElementById("emptyState");
const cartItems   = document.getElementById("cartItems");
const cartTotal   = document.getElementById("cartTotal");
const clearCartBtn= document.getElementById("clearCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");
const themeToggle = document.getElementById("themeToggle");

/* === State === */
const state = {
  query: "",
  cart: load("bongs_cart", []),
  theme: load("bongs_theme", "auto")
};

/* === Init === */
renderProducts(PRODUCTS);
applySearch();
updateCartUI();
applyThemeOnLoad();

/* === Event Listeners === */
searchInput.addEventListener("input", e=>{
  state.query = e.target.value.toLowerCase();
  applySearch();
});
clearCartBtn.addEventListener("click", ()=>{
  state.cart = []; save("bongs_cart", state.cart); updateCartUI();
});
checkoutBtn.addEventListener("click", ()=>{
  if(state.cart.length===0){ alert("Keranjang masih kosong."); return; }
  alert("Terima kasih! Pesanan Anda diproses (demo) 🙌");
  state.cart = []; save("bongs_cart", state.cart); updateCartUI();
});
themeToggle.addEventListener("change", ()=>{
  const dark = themeToggle.checked;
  document.body.classList.toggle("dark", dark);
  save("bongs_theme", dark?"dark":"light");
});

/* === Fungsi Produk === */
function renderProducts(list){
  productGrid.innerHTML = "";
  list.forEach(p=>{
    const card=document.createElement("article");
    card.className="card";
    card.innerHTML=`
      <div class="thumb"><img src="${p.image}" alt="${p.name}" /></div>
      <div class="content">
        <h3>${p.name}</h3>
        <p class="price">${formatIDR(p.price)}</p>
        <div class="actions">
          <button class="primary" data-add="${p.id}">Tambah ke Keranjang</button>
        </div>
      </div>`;
    productGrid.appendChild(card);
  });
  productGrid.querySelectorAll("[data-add]").forEach(btn=>{
    btn.addEventListener("click", ()=> addToCart(btn.dataset.add));
  });
}
function applySearch(){
  const f=PRODUCTS.filter(p=>p.name.toLowerCase().includes(state.query));
  renderProducts(f); emptyState.hidden=f.length!==0;
}

/* === Fungsi Keranjang === */
function addToCart(id){
  const p=PRODUCTS.find(x=>x.id===id);
  const item=state.cart.find(x=>x.id===id);
  if(item) item.qty++; else state.cart.push({...p, qty:1});
  save("bongs_cart",state.cart); updateCartUI();
}
function removeFromCart(id){
  state.cart=state.cart.filter(x=>x.id!==id);
  save("bongs_cart",state.cart); updateCartUI();
}
function changeQty(id,delta){
  const it=state.cart.find(x=>x.id===id);
  if(!it)return; it.qty=Math.max(1,it.qty+delta);
  save("bongs_cart",state.cart); updateCartUI();
}
function updateCartUI(){
  cartItems.innerHTML="";
  if(state.cart.length===0){
    cartItems.innerHTML="<p class='empty'>Keranjang kosong.</p>";
  } else {
    state.cart.forEach(it=>{
      const el=document.createElement("div");
      el.className="cart-item";
      el.innerHTML=`
        <img src="${it.image}" alt="${it.name}" />
        <div>
          <h4>${it.name}</h4>
          <div class="qty">
            <button data-dec="${it.id}">−</button>
            <span>${it.qty}</span>
            <button data-inc="${it.id}">+</button>
          </div>
          <small>${formatIDR(it.price)} / item</small>
        </div>
        <button class="remove" data-remove="${it.id}">Hapus</button>`;
      cartItems.appendChild(el);
    });
    cartItems.querySelectorAll("[data-dec]").forEach(b=>b.onclick=()=>changeQty(b.dataset.dec,-1));
    cartItems.querySelectorAll("[data-inc]").forEach(b=>b.onclick=()=>changeQty(b.dataset.inc,1));
    cartItems.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>removeFromCart(b.dataset.remove));
  }
  const total=state.cart.reduce((a,c)=>a+c.price*c.qty,0);
  cartTotal.textContent=formatIDR(total);
}

/* === Theme === */
function applyThemeOnLoad(){
  const pref=state.theme;
  const dark=pref==="dark"||(pref==="auto"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.body.classList.toggle("dark",dark);
  themeToggle.checked=dark;
}

/* === Utils === */
function save(k,v){localStorage.setItem(k,JSON.stringify(v));}
function load(k,f){try{return JSON.parse(localStorage.getItem(k))??f;}catch{return f;}}
function formatIDR(n){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);}
function placeholder(t){
  const bg="EEF2FF",fg="1F2937";
  const svg=encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
    <rect width='100%' height='100%' fill='#${bg}'/>
    <text x='200' y='150' font-size='28' font-family='sans-serif' fill='#${fg}' text-anchor='middle' dominant-baseline='middle'>${t}</text>
  </svg>`);
  return`data:image/svg+xml;utf8,${svg}`;
}
