// script.js
const API_BASE = ''; // empty = same origin (server serves /api/*). If backend separate, set e.g. 'http://localhost:3000'

// ------------------- CART (persistente) -------------------
const CART_KEY = 'infpro_cart_v2';

function loadCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch(e){ return []; }
}
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function addToCart(product){
  const cart = loadCart();
  const found = cart.find(i=>i.id===product.id);
  if(found) found.qty++;
  else cart.push({...product, qty:1});
  saveCart(cart);
  showToast('Adicionado ao carrinho');
  updateCartUI(); // ADICIONADO: Atualizar a UI do carrinho
}

function removeFromCart(id){
  let cart = loadCart();
  cart = cart.filter(i=>i.id!==id);
  saveCart(cart);
  updateCartUI(); // ADICIONADO: Atualizar a UI do carrinho
}

function updateCartQuantity(id, newQty) {
  const cart = loadCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    if (newQty <= 0) {
      removeFromCart(id);
    } else {
      item.qty = newQty;
      saveCart(cart);
      updateCartUI();
    }
  }
}

function calculateTotals(cart){
  const subtotal = cart.reduce((s,i)=> s + i.price * (i.qty||1), 0);
  const shipping = subtotal > 7000 ? 0 : Math.max(29.9, subtotal * 0.05);
  return { subtotal, shipping, total: subtotal + shipping };
}

// ADICIONADO: Função para atualizar toda a UI do carrinho
function updateCartUI() {
  renderCartItems();
  updateCartButton();
}

// ADICIONADO: Função para atualizar o botão flutuante do carrinho
function updateCartButton() {
  const cart = loadCart();
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartButtons = document.querySelectorAll('.cart-floating');
  
  cartButtons.forEach(button => {
    button.textContent = `🛒 (${totalItems})`;
    button.setAttribute('data-bs-toggle', totalItems > 0 ? 'offcanvas' : '');
    button.setAttribute('data-bs-target', totalItems > 0 ? '#cartOffcanvas' : '');
  });
}

function renderCartItems(){
  const cart = loadCart();
  const container = document.getElementById('cartItems');
  if(!container) return;
  
  container.innerHTML = '';
  
  if(cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-shopping-cart fa-2x text-muted mb-3"></i>
        <p class="text-muted">Seu carrinho está vazio</p>
        <a href="loja.html" class="btn btn-primary mt-2">Continuar Comprando</a>
      </div>
    `;
  } else {
    cart.forEach(item=>{
      const div = document.createElement('div');
      div.className = 'd-flex align-items-center justify-content-between mb-3 p-3 border-bottom';
      div.innerHTML = `
        <div class="d-flex align-items-center flex-grow-1">
          <img src="${item.img}" class="me-3" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
          <div class="flex-grow-1">
            <div class="fw-bold">${item.title}</div>
            <small class="text-muted">R$ ${item.price.toFixed(2)} cada</small>
          </div>
        </div>
        <div class="text-end">
          <div class="d-flex align-items-center mb-2">
            <button class="btn btn-sm btn-outline-secondary" onclick="updateCartQuantity('${item.id}', ${item.qty - 1})">-</button>
            <span class="mx-2">${item.qty}</span>
            <button class="btn btn-sm btn-outline-secondary" onclick="updateCartQuantity('${item.id}', ${item.qty + 1})">+</button>
          </div>
          <div class="fw-bold">R$ ${(item.price * item.qty).toFixed(2)}</div>
          <button class="btn btn-sm btn-link text-danger p-0 mt-1" onclick="removeFromCart('${item.id}')">
            <i class="fas fa-trash"></i> Remover
          </button>
        </div>`;
      container.appendChild(div);
    });
  }
  
  const totals = calculateTotals(cart);
  const subtotalEl = document.getElementById('cartSubtotal');
  const shippingEl = document.getElementById('cartShipping');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('btnCheckout');
  
  if(subtotalEl) subtotalEl.textContent = 'R$ ' + totals.subtotal.toFixed(2);
  if(shippingEl) shippingEl.textContent = totals.shipping === 0 ? 'Grátis' : 'R$ ' + totals.shipping.toFixed(2);
  if(totalEl) totalEl.textContent = 'R$ ' + totals.total.toFixed(2);
  
  // ADICIONADO: Atualizar estado do botão de finalizar compra
  if(checkoutBtn) {
    checkoutBtn.disabled = cart.length === 0;
    if(cart.length === 0) {
      checkoutBtn.innerHTML = 'Carrinho vazio';
      checkoutBtn.classList.remove('btn-success');
      checkoutBtn.classList.add('btn-secondary');
    } else {
      checkoutBtn.innerHTML = 'Finalizar compra';
      checkoutBtn.classList.remove('btn-secondary');
      checkoutBtn.classList.add('btn-success');
    }
  }
}

// ------------------- PRODUCTS (fetch API) -------------------
async function fetchProducts(){
  try{
    // Simulação de produtos - em um caso real, viria da API
    return [
      {
        id: '1',
        title: 'Placa de Vídeo RTX 4070 Ti',
        description: '12GB GDDR6X, Ray Tracing, DLSS 3',
        price: 4599.99,
        img: 'https://images.kabum.com.br/produtos/fotos/164651/aorus-geforce-rtx-3080-ti-xtreme-12g_1622661313_gg.jpg',
        category: 'gpu'
      },
      {
        id: '2',
        title: 'Processador Intel i9-13900K',
        description: '24 núcleos, 32 threads, 5.8GHz',
        price: 3299.99,
        img: 'https://t2.tudocdn.net/630348?w=1920&h=1080',
        category: 'cpu'
      },
      {
        id: '3',
        title: 'Memória RAM 32GB DDR5',
        description: '5600MHz, RGB, 2x16GB',
        price: 899.99,
        img: 'https://a-static.mlcdn.com.br/%7Bw%7Dx%7Bh%7D/memoria-kingston-fury-beast-rgb-de-32-gb-2x16-gb-6800-mt-s-ddr5/nocnocestadosunidos/buybox-cpb0cym392m9/1387a35b9ac1e9fb4e4695d7b0640225.jpeg',
        category: 'ram'
      },
      {
        id: '4',
        title: 'Placa-Mãe Z790',
        description: 'Socket LGA1700, DDR5, PCIe 5.0',
        price: 2199.99,
        img: 'https://cdn.awsli.com.br/600x700/2508/2508057/produto/191518289/d5ca4bf4f2.jpg',
        category: 'mb'
      },
      {
        id: '5',
        title: 'Gabinete Gamer RGB',
        description: 'Mid Tower, Vidro Temperado, 4 Fans',
        price: 599.99,
        img: 'https://a-static.mlcdn.com.br/800x600/gabinete-gamer-husky-dome-950-mid-tower-iluminacao-argb-atx-lateral-e-frontal-em-vidro-10x-cooler-fan-argb-preto-hgn950pt/kabum/609395/9a7fec4945b23a7305eaa570161f19e6.jpeg',
        category: 'case'
      },
      {
        id: '6',
        title: 'Water Cooler 360mm',
        description: 'RGB, 3 Fans, Controladora',
        price: 799.99,
        img: 'https://m.media-amazon.com/images/I/8138rJ8T5SL.jpg',
        category: 'cooler'
      }
    ];
  }catch(e){
    console.error(e);
    return [];
  }
}

async function renderProductsGrid(){
  const grid = document.getElementById('productsGrid');
  if(!grid) return;
  const products = await fetchProducts();
  grid.innerHTML = '';
  products.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', p.category);
    card.innerHTML = `
      <img src="${p.img}" class="w-full rounded mb-3" style="height: 200px; object-fit: cover;" alt="${p.title}">
      <h3 class="text-lg font-semibold mb-1">${p.title}</h3>
      <div class="text-muted mb-2">${p.description || ''}</div>
      <div class="mt-auto">
        <div class="d-flex justify-content-between align-items-center">
           <div class="price fw-bold fs-5">R$ ${p.price.toFixed(2)}</div>
           <div>
             <button class="btn btn-primary add-to-cart-btn" onclick='addToCart(${JSON.stringify(p).replace(/'/g, "\\'")})'>
               <i class="fas fa-cart-plus"></i> Adicionar
             </button>
           </div>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

// ------------------- SEARCH AND FILTER -------------------
function setupSearchAndFilter() {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  
  if (searchInput) {
    searchInput.addEventListener('input', filterProducts);
  }
  
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterProducts);
  }
}

function filterProducts() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const products = document.querySelectorAll('.product-card');
  
  products.forEach(product => {
    const title = product.querySelector('h3').textContent.toLowerCase();
    const productCategory = product.getAttribute('data-category');
    
    const matchesSearch = title.includes(searchTerm);
    const matchesCategory = category === 'all' || productCategory === category;
    
    if (matchesSearch && matchesCategory) {
      product.style.display = 'block';
    } else {
      product.style.display = 'none';
    }
  });
}

// ------------------- REVIEWS -------------------
async function loadReviews(){
  try{
    // Simulação de avaliações - em um caso real, viria da API
    return [
      { name: 'Carlos Silva', rating: 5, text: 'Serviço excelente! Montaram meu PC gamer rapidamente e com muita qualidade.' },
      { name: 'Mariana Oliveira', rating: 5, text: 'Atendimento impecável. Meu notebook estava com problema e resolveram em 2 dias.' },
      { name: 'Roberto Santos', rating: 4, text: 'Boa relação custo-benefício. Fiquei satisfeito com a montagem do PC.' },
      { name: 'Juliana Costa', rating: 5, text: 'Recomendo! Fizeram um orçamento personalizado que cabia no meu bolso.' }
    ];
  }catch(e){ return []; }
}

async function renderReviews(){
  const container = document.getElementById('reviewsGrid');
  if(!container) return;
  const reviews = await loadReviews();
  container.innerHTML = '';
  reviews.forEach(r=>{
    const el = document.createElement('div');
    el.className = 'product-card';
    el.innerHTML = `
      <div class="d-flex justify-content-between align-items-start mb-2">
        <strong>${r.name}</strong>
        <div class="text-warning">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
      </div>
      <p class="mt-2 text-muted">${r.text}</p>`;
    container.appendChild(el);
  });
}

// ------------------- AUTH (login/register) -------------------
async function registerUser(formData){
  try{
    // Simulação de registro - em um caso real, faria uma requisição para a API
    return new Promise((resolve) => {
      setTimeout(() => {
        if (formData.email && formData.password) {
          resolve({ token: 'simulated_token_' + Date.now() });
        } else {
          resolve({ error: 'Preencha todos os campos obrigatórios' });
        }
      }, 1000);
    });
  }catch(e){ return { error: e.message };}
}

async function loginUser(formData){
  try{
    // Simulação de login - em um caso real, faria uma requisição para a API
    return new Promise((resolve) => {
      setTimeout(() => {
        if (formData.email && formData.password) {
          resolve({ token: 'simulated_token_' + Date.now() });
        } else {
          resolve({ error: 'Credenciais inválidas' });
        }
      }, 1000);
    });
  }catch(e){ return { error: e.message };}
}

// ------------------- TOAST NOTIFICATION -------------------
function showToast(message) {
  // Criar elemento toast se não existir
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.left = '50%';
    toastContainer.style.transform = 'translateX(-50%)';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }
  
  const toast = document.createElement('div');
  toast.className = 'bg-success text-white p-3 rounded shadow-lg d-flex align-items-center';
  toast.innerHTML = `
    <i class="fas fa-check-circle me-2"></i>
    <span>${message}</span>
  `;
  toast.style.marginBottom = '10px';
  toast.style.transition = 'all 0.3s ease';
  
  toastContainer.appendChild(toast);
  
  // Remover após 3 segundos
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// No arquivo script.js, substitua a função checkout() atual por esta versão melhorada:

function checkout() {
  const cart = loadCart();
  if (cart.length === 0) {
    showToast('Seu carrinho está vazio!');
    return;
  }
  
  const totals = calculateTotals(cart);
  
  // Simular processo de checkout
  showToast('Processando seu pedido...');
  
  setTimeout(() => {
    // Criar modal de confirmação estilizado
    const confirmationHTML = `
      <div class="modal fade" id="checkoutConfirmation" tabindex="-1" aria-labelledby="checkoutConfirmationLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0">
              <h5 class="modal-title" id="checkoutConfirmationLabel">Compra Finalizada!</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center py-4">
              <div class="confirmation-icon mb-3">
                <i class="fas fa-check-circle" style="font-size: 4rem; color: #10b981;"></i>
              </div>
              <h4 class="mb-3">Obrigado pela sua compra!</h4>
              <p class="text-muted mb-3">Seu pedido foi processado com sucesso e em breve entraremos em contato.</p>
              
              <div class="p-3 mb-3 rounded" style="background-color: #f8f9fa;">
                <h6 class="mb-2">Resumo do Pedido</h6>
                <div class="d-flex justify-content-between small">
                  <span>Itens:</span>
                  <span>${cart.reduce((sum, item) => sum + item.qty, 0)}</span>
                </div>
                <div class="d-flex justify-content-between small">
                  <span>Subtotal:</span>
                  <span>R$ ${totals.subtotal.toFixed(2)}</span>
                </div>
                <div class="d-flex justify-content-between small">
                  <span>Frete:</span>
                  <span>${totals.shipping === 0 ? 'Grátis' : 'R$ ' + totals.shipping.toFixed(2)}</span>
                </div>
                <div class="d-flex justify-content-between fw-bold mt-2 pt-2 border-top">
                  <span>Total:</span>
                  <span>R$ ${totals.total.toFixed(2)}</span>
                </div>
              </div>
              
              <p class="small text-muted">
                <i class="fas fa-info-circle me-1"></i>
                Você receberá um e-mail com os detalhes do pedido em breve.
              </p>
            </div>
            <div class="modal-footer border-0 justify-content-center">
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onclick="completeCheckout()">
                <i class="fas fa-home me-2"></i>Voltar para a Loja
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Adicionar o modal ao body
    document.body.insertAdjacentHTML('beforeend', confirmationHTML);
    
    // Mostrar o modal
    const confirmationModal = new bootstrap.Modal(document.getElementById('checkoutConfirmation'));
    confirmationModal.show();
    
    // Limpar carrinho e atualizar UI quando o modal for fechado
    document.getElementById('checkoutConfirmation').addEventListener('hidden.bs.modal', function() {
      completeCheckout();
    });
    
  }, 2000);
}

// Função auxiliar para completar o checkout
function completeCheckout() {
  localStorage.removeItem(CART_KEY);
  updateCartUI();
  
  // Fechar o offcanvas do carrinho
  const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('cartOffcanvas'));
  if (offcanvas) offcanvas.hide();
  
  // Remover o modal do DOM
  const modal = document.getElementById('checkoutConfirmation');
  if (modal) modal.remove();
}

// hooks for forms
document.addEventListener('submit', async (ev)=>{
  const form = ev.target;
  if(form.id === 'registerForm'){
    ev.preventDefault();
    const fd = Object.fromEntries(new FormData(form).entries());
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cadastrando...';
    
    const res = await registerUser(fd);
    
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    
    if(res.token){ 
      localStorage.setItem('infpro_token', res.token); 
      showToast('Cadastro realizado com sucesso!');
      setTimeout(() => location.href = 'index.html', 1500);
    }
    else alert(res.error || 'Erro no cadastro');
  }
  if(form.id === 'loginForm'){
    ev.preventDefault();
    const fd = Object.fromEntries(new FormData(form).entries());
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Entrando...';
    
    const res = await loginUser(fd);
    
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    
    if(res.token){ 
      localStorage.setItem('infpro_token', res.token); 
      showToast('Login efetuado com sucesso!');
      setTimeout(() => location.href = 'index.html', 1500);
    }
    else alert(res.error || 'Erro no login');
  }
  if(form.id === 'contactForm'){
    ev.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';
    
    // Simular envio
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      
      // Mostrar mensagem de confirmação estilizada
      const confirmationHTML = `
        <div class="confirmation-message">
          <div class="confirmation-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2 class="mb-3">Mensagem Enviada!</h2>
          <p class="mb-4">Obrigado por entrar em contato. Retornaremos em até 24 horas.</p>
          <a href="index.html" class="btn-primary">Voltar para Home</a>
        </div>
      `;
      
      form.style.display = 'none';
      form.parentNode.innerHTML += confirmationHTML;
    }, 1500);
  }
  if(form.id === 'quoteForm'){
    ev.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';
    
    // Simular envio
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      
      showToast('Pedido de orçamento enviado! Verificaremos e retornaremos por e-mail.');
      form.reset();
    }, 1500);
  }
});

// ------------------- THEME (dark mode) -------------------
function setTheme(theme){
  if(theme === 'dark') document.documentElement.setAttribute('data-theme','dark');
  else document.documentElement.removeAttribute('data-theme');
  localStorage.setItem('infpro_theme', theme);
  
  // Atualizar texto do botão
  const themeToggles = document.querySelectorAll('.btn-theme');
  themeToggles.forEach(btn => {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  const saved = localStorage.getItem('infpro_theme') || 'light';
  setTheme(saved);
  
  // render products if on loja
  renderProductsGrid();
  renderReviews();
  updateCartUI(); // ALTERADO: Usar updateCartUI em vez de renderCartItems

  // theme toggle buttons
  ['themeToggle','themeToggle2'].forEach(id => {
    const btn = document.getElementById(id);
    if(!btn) return;
    btn.addEventListener('click', ()=>{
      const cur = localStorage.getItem('infpro_theme') || 'light';
      setTheme(cur === 'light' ? 'dark' : 'light');
    });
  });

  // ADICIONADO: Event listener para o botão de finalizar compra
  const checkoutBtn = document.getElementById('btnCheckout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', checkout);
  }

  // ADICIONADO: Configurar search e filter
  setupSearchAndFilter();
  
  // Inicializar carousel
  const carousel = document.querySelector('#heroCarousel');
  if (carousel) {
    new bootstrap.Carousel(carousel, {
      interval: 4000,
      wrap: true
    });
  }
});