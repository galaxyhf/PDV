/* ==== Catálogo (mock) ==== */
const catalog = [
  { code: '7891000367263', name: 'Arroz Premium 5kg', unit: 'PC', price: 22.90 },
  { code: '7894900011517', name: 'Feijão Carioca 1kg', unit: 'PC', price: 7.49 },
  { code: '7891000100105', name: 'Açúcar Refinado 1kg', unit: 'PC', price: 4.39 },
  { code: '7891910000197', name: 'Café Torrado 500g', unit: 'PC', price: 13.99 },
  { code: '7892840810052', name: 'Leite Integral 1L', unit: 'UN', price: 4.89 },
  { code: '7891910000234', name: 'Biscoito Maizena 400g', unit: 'PC', price: 5.59 },
  { code: '7891000012348', name: 'Óleo de Soja 900ml', unit: 'UN', price: 6.29 },
  { code: '7891234512345', name: 'Chocolate 90g', unit: 'PC', price: 4.99 },
  { code: '7899876500012', name: 'Refrigerante 2L', unit: 'UN', price: 8.49 },
  { code: '7896543210007', name: 'Detergente 500ml', unit: 'UN', price: 2.59 }
];
const findByCode   = code  => catalog.find(p => p.code === String(code).trim());
const searchByName = query => {
  const q = String(query).trim().toLowerCase();
  if(!q) return [];
  return catalog.filter(p => p.name.toLowerCase().includes(q)).slice(0, 50);
};

/* ==== Utilidades de UI ==== */
const currency = new Intl.NumberFormat('pt-BR',{ style:'currency', currency:'BRL' });
function setClock(el){ function tick(){ el.textContent = new Date().toLocaleString('pt-BR'); } tick(); setInterval(tick, 1000); }
function openDialog(dlg){ if(typeof dlg.showModal==='function') dlg.showModal(); else dlg.setAttribute('open',''); }
function closeDialog(dlg){ if(typeof dlg.close==='function') dlg.close(); else dlg.removeAttribute('open'); }
function el(tag, props = {}, children = []){ const node = document.createElement(tag); Object.assign(node, props); children.forEach(c=>node.appendChild(c)); return node; }

/* ==== Referências ==== */
const refs = {
  barcode: document.getElementById('barcode'),
  itemsBody: document.getElementById('items-body'),
  rowTpl: document.getElementById('row-template'),
  lastItem: document.getElementById('last-item-info'),
  grandTotal: document.getElementById('grand-total'),
  tableTotal: document.getElementById('table-total'),
  searchDlg: document.getElementById('search-dialog'),
  searchInput: document.getElementById('search-input'),
  searchResults: document.getElementById('search-results'),
  openSearch: document.getElementById('open-search'),
  cancelSale: document.getElementById('cancel-sale'),
  openPaymentBtn: document.getElementById('open-payment'),

  // Pagamento
  paymentDlg: document.getElementById('payment-dialog'),
  methodButtons: document.querySelectorAll('.method-grid .method'),
  methodLabel: document.getElementById('method-label'),
  installmentsWrap: document.getElementById('installments-wrap'),
  installments: document.getElementById('installments'),
  amountReceived: document.getElementById('amount-received'),
  change: document.getElementById('change'),
  confirmPayment: document.getElementById('confirm-payment'),

  clock: document.getElementById('clock'),
};
setClock(refs.clock);

/* ==== Estado da venda ==== */
const sale = { items: [] }; // { code, name, unit, price, qty }
let selectedIndex = -1;     // índice do item selecionado para ↑/↓/DEL

/* ==== Itens ==== */
function addItem(product, qty = 1){
  const existing = sale.items.find(i => i.code === product.code);
  if(existing){
    existing.qty += qty;
    redraw();
    // ao somar em item existente, selecionar ele
    selectedIndex = sale.items.findIndex(i => i.code === product.code);
    updateSelectionHighlight();
    announceLast(existing);
    return;
  }
  sale.items.push({ ...product, qty });
  redraw();
  // selecionar o último lançado
  selectedIndex = sale.items.length - 1;
  updateSelectionHighlight();
  announceLast(product, qty);
}
function announceLast(prod, qty = 1){
  refs.lastItem.textContent =
    `${prod.name} — ${qty} ${prod.unit} × ${currency.format(prod.price)} = ${currency.format(prod.price * qty)}`;
}
function redraw(){
  refs.itemsBody.innerHTML = '';
  sale.items.forEach((item, idx) => {
    const row = refs.rowTpl.content.firstElementChild.cloneNode(true);
    row.dataset.index = String(idx);
    row.querySelector('.code').textContent = item.code;
    row.querySelector('.name').textContent = item.name;
    row.querySelector('.unit').textContent = item.unit;
    row.querySelector('.price').textContent = currency.format(item.price);
    row.querySelector('.total').textContent = currency.format(item.price * item.qty);

    const qtyInput = row.querySelector('input[type="number"]');
    qtyInput.value = String(item.qty);
    qtyInput.addEventListener('change', () => {
      item.qty = Math.max(1, parseInt(qtyInput.value || '1', 10));
      redraw();
      // manter seleção no mesmo índice após redraw
      updateSelectionHighlight();
    });
    // focar no input => selecionar a linha
    qtyInput.addEventListener('focus', () => {
      selectedIndex = idx;
      updateSelectionHighlight();
    });

    // remover item via botão
    row.querySelector('.btn.icon.danger').addEventListener('click', () => {
      removeSelected(idx);
    });

    // clicar na linha => seleciona
    row.addEventListener('click', () => {
      selectedIndex = idx;
      updateSelectionHighlight();
    });

    refs.itemsBody.appendChild(row);
  });
  // corrigir selectedIndex se saiu do range
  if(selectedIndex >= sale.items.length) selectedIndex = sale.items.length - 1;
  if(sale.items.length === 0) selectedIndex = -1;

  updateSelectionHighlight();
  updateTotals();
}

function updateTotals(){
  const total = sale.items.reduce((s,i)=> s + i.price * i.qty, 0);
  refs.grandTotal.textContent = currency.format(total);
  refs.tableTotal.textContent = currency.format(total);
  return total;
}

/* ==== Seleção visual e navegação ↑/↓ ==== */
function updateSelectionHighlight(){
  // limpa
  [...refs.itemsBody.children].forEach(tr => tr.classList.remove('selected'));
  // aplica
  if(selectedIndex >= 0 && refs.itemsBody.children[selectedIndex]){
    const tr = refs.itemsBody.children[selectedIndex];
    tr.classList.add('selected');
    // garantir visível ao navegar
    tr.scrollIntoView({ block: 'nearest' });
  }
}
function selectNext(delta){
  if(sale.items.length === 0) return;
  if(selectedIndex === -1) selectedIndex = 0;
  else selectedIndex = Math.min(Math.max(0, selectedIndex + delta), sale.items.length - 1);
  updateSelectionHighlight();
}
function removeSelected(idx = selectedIndex){
  if(idx < 0 || idx >= sale.items.length) return;
  sale.items.splice(idx, 1);
  // ajustar índice após remoção
  if(idx >= sale.items.length) selectedIndex = sale.items.length - 1;
  else selectedIndex = idx;
  redraw();
}

/* ==== Scanner ==== */
document.getElementById('scanner-form').addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const code = refs.barcode.value.trim();
  if(!code) return;
  const prod = findByCode(code);
  if(!prod){
    alert('Produto não encontrado para o código informado.');
    refs.barcode.select();
    return;
  }
  addItem(prod, 1);
  refs.barcode.value = '';
});

/* ==== Busca (F2) ==== */
function handleOpenSearch(){
  refs.searchInput.value = '';
  refs.searchResults.innerHTML = '';
  openDialog(refs.searchDlg);
  refs.searchInput.focus();
}
refs.openSearch.addEventListener('click', handleOpenSearch);

/* ==== Cancelar venda (F4) ==== */
function cancelSale(){
  if(sale.items.length === 0) return;
  if(confirm('Cancelar a venda atual?')){
    sale.items = [];
    selectedIndex = -1;
    redraw();
    refs.lastItem.textContent = '—';
  }
}
refs.cancelSale.addEventListener('click', cancelSale);

/* ==== Pagamento (F8 / F1..F4 dentro do modal) ==== */
let currentMethod = 'cash';

function setMethod(method){
  currentMethod = method;

  refs.methodLabel.textContent =
    ({ cash:'Dinheiro', debit:'Cartão Débito', credit:'Cartão Crédito', pix:'PIX' })[method];

  // Estado visual dos botões
  refs.methodButtons.forEach(b => b.classList.toggle('active', b.dataset.method === method));

  // Parcelas só no crédito
  refs.installmentsWrap.classList.toggle('hidden', method !== 'credit');

  // Valor recebido e troco só no dinheiro
  const cashWrap = document.getElementById('cash-wrap');
  if(cashWrap){
    cashWrap.classList.toggle('hidden', method !== 'cash');
  }

  // Reseta/atualiza troco conforme o método
  if(method !== 'cash'){
    refs.amountReceived.value = '';
    refs.change.textContent = currency.format(0);
  }else{
    updateChange();
  }
}

function openPayment(){
  if(sale.items.length === 0){ alert('Nenhum item na venda.'); return; }
  refs.amountReceived.value = '';
  refs.change.textContent = currency.format(0);
  openDialog(refs.paymentDlg);
  setMethod('cash'); // inicia em dinheiro
  refs.amountReceived.focus();
}
refs.openPaymentBtn.addEventListener('click', openPayment);

// Clique nos botões de forma
refs.methodButtons.forEach(btn => btn.addEventListener('click', ()=> setMethod(btn.dataset.method)));

/* ==== Atalhos de teclado ==== */
document.addEventListener('keydown', (e)=>{
  const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
  const isTypingField = tag === 'input' || tag === 'select' || tag === 'textarea';

  // Globais do PDV (quando modal de pagamento NÃO está aberto)
  if(!refs.paymentDlg.open){
    // não roubar setas/DEL quando estiver digitando em inputs
    if(!isTypingField){
      if(e.key === 'ArrowDown'){ e.preventDefault(); selectNext(+1); }
      if(e.key === 'ArrowUp'){ e.preventDefault(); selectNext(-1); }
      if(e.key === 'Delete'){ e.preventDefault(); removeSelected(); }
    }
    if(e.key === 'F2'){ e.preventDefault(); handleOpenSearch(); }
    if(e.key === 'F4'){ e.preventDefault(); cancelSale(); }
    if(e.key === 'F8'){ e.preventDefault(); openPayment(); }
    return;
  }

  // Dentro do modal de pagamento
  if(refs.paymentDlg.open){
    if(e.key === 'F1'){ e.preventDefault(); setMethod('cash'); }
    if(e.key === 'F2'){ e.preventDefault(); setMethod('debit'); }
    if(e.key === 'F3'){ e.preventDefault(); setMethod('credit'); }
    if(e.key === 'F4'){ e.preventDefault(); setMethod('pix'); }
  }
});

/* ==== Troco (só no dinheiro) ==== */
function updateChange(){
  if(currentMethod !== 'cash'){
    refs.change.textContent = currency.format(0);
    return;
  }
  const total = updateTotals();
  const received = parseFloat((refs.amountReceived.value || '0').replace(',', '.')) || 0;
  const change = Math.max(0, received - total);
  refs.change.textContent = currency.format(change);
}
refs.amountReceived.addEventListener('input', updateChange);

/* ==== Confirmar pagamento -> recibo tipo NFC-e (não fiscal) ==== */
refs.confirmPayment.addEventListener('click', (e)=>{
  const total = updateTotals();
  const received = parseFloat((refs.amountReceived.value || '0').replace(',', '.')) || 0;

  if(currentMethod === 'cash' && received < total){
    e.preventDefault();
    alert('Valor recebido insuficiente para pagamento em dinheiro.');
    return;
  }

  const installmentStr = currentMethod === 'credit' ? `${refs.installments.value}x` : '—';
  const changeValue = currentMethod === 'cash' ? Math.max(0, received - total) : 0;

  const html = buildReceiptHTML({
    store: 'PDV Web',
    cnpj: '32.190.092/0001-06',
    address: 'Estr. Venceslau José de Medeiros, 1045 - Prata, Teresópolis - RJ',
    datetime: new Date(),
    items: sale.items.map(i => ({
      code: i.code, name: i.name, qty: i.qty, unit: i.unit, price: i.price, total: i.qty * i.price
    })),
    total,
    method: currentMethod,
    received: currentMethod === 'cash' ? received : 0,
    change: changeValue,
    installments: installmentStr
  });

  const w = window.open('', 'print');
  w.document.write(html);
  w.document.close();
  try { w.focus(); w.print(); } catch {}

  closeDialog(refs.paymentDlg);

  // Reset da venda
  sale.items = [];
  selectedIndex = -1;
  redraw();
  refs.lastItem.textContent = '—';
});

/* ==== Recibo (tipo NFC-e, 80mm) ==== */
function buildReceiptHTML(data){
  const methodLabel = ({
    cash: 'Dinheiro',
    debit: 'Cartão Débito',
    credit: 'Cartão Crédito',
    pix: 'PIX'
  })[data.method];

  const rows = data.items.map(i =>
    `<tr>
      <td>${i.name}<div class="muted">${i.code} • ${i.qty} ${i.unit} × ${currency.format(i.price)}</div></td>
      <td class="right">${currency.format(i.total)}</td>
    </tr>`
  ).join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Recibo</title>
<style>
  @page { size: 80mm auto; margin: 6mm; }
  body { font: 12px/1.35 -apple-system, Segoe UI, Roboto, Arial; color: #111; }
  .h { text-align:center; }
  .h h1 { font-size: 16px; margin: 0; }
  .h .muted { color:#666; font-size:11px; }
  hr { border:0; border-top:1px dashed #bbb; margin:6px 0; }
  table { width:100%; border-collapse:collapse; }
  td { padding:4px 0; vertical-align:top; }
  .right { text-align:right; white-space:nowrap; }
  .muted { color:#666; font-size:11px; }
  .total { font-weight:bold; font-size:14px; }
  .footer { text-align:center; margin-top:8px; }
</style>
</head>
<body>
  <div class="h">
    <h1>${data.store}</h1>
    <div class="muted">UNIFESO</div>
    <div class="muted">CNPJ: ${data.cnpj}</div>
    <div class="muted">${data.address}</div>
    <div class="muted">${data.datetime.toLocaleString('pt-BR')}</div>
  </div>
  <hr>
  <table>
    ${rows}
    <tr><td class="total">TOTAL</td><td class="total right">${currency.format(data.total)}</td></tr>
  </table>
  <hr>
  <table>
    <tr><td>Forma de pagamento</td><td class="right">${methodLabel}</td></tr>
    <tr><td>Parcelas</td><td class="right">${data.installments}</td></tr>
    <tr><td>Valor recebido</td><td class="right">${currency.format(data.received || 0)}</td></tr>
    <tr><td>Troco</td><td class="right">${currency.format(data.change || 0)}</td></tr>
  </table>
  <hr>
  <div class="footer">
    <div class="muted">Documento não fiscal</div>
    <div class="muted">Obrigado pela preferência!</div>
  </div>
</body>
</html>`;
}

/* ==== Busca dinâmica (modal de pesquisa) ==== */
document.getElementById('search-input').addEventListener('input', ()=>{
  const list = searchByName(document.getElementById('search-input').value);
  const ul = document.getElementById('search-results');
  ul.innerHTML = '';
  for(const p of list){
    const li = el('li', {}, [
      el('div', { innerHTML: `<strong>${p.name}</strong><div class="meta">${p.code} • ${p.unit} • ${currency.format(p.price)}</div>` }),
      el('button', { className:'btn success', textContent:'Adicionar' })
    ]);
    li.querySelector('button').addEventListener('click', ()=>{
      addItem(p, 1);
      document.getElementById('search-input').focus();
    });
    ul.appendChild(li);
  }
});

/* ==== Navegação com setas na tela de busca ==== */
let searchSelectedIndex = -1;

function updateSearchHighlight() {
  const items = [...refs.searchResults.querySelectorAll('li')];
  items.forEach(li => li.classList.remove('selected'));
  if (searchSelectedIndex >= 0 && items[searchSelectedIndex]) {
    items[searchSelectedIndex].classList.add('selected');
    items[searchSelectedIndex].scrollIntoView({ block: 'nearest' });
  }
}

refs.searchInput.addEventListener('keydown', (e) => {
  const items = [...refs.searchResults.querySelectorAll('li')];
  if (items.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    searchSelectedIndex = (searchSelectedIndex + 1) % items.length;
    updateSearchHighlight();
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    searchSelectedIndex = (searchSelectedIndex - 1 + items.length) % items.length;
    updateSearchHighlight();
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    if (searchSelectedIndex >= 0 && items[searchSelectedIndex]) {
      const btn = items[searchSelectedIndex].querySelector('button');
      if (btn) btn.click();
    }
  }
});

/* Atualizar índice ao fazer nova busca */
document.getElementById('search-input').addEventListener('input', () => {
  searchSelectedIndex = -1;
  updateSearchHighlight();
});

// Enter confirma pagamento
document.addEventListener('keydown', (e) => {
  if (refs.paymentDlg.open && e.key === 'Enter') {
    e.preventDefault();
    refs.confirmPayment.click();
  }
});

/* CSS para destacar item selecionado na busca */
const style = document.createElement('style');
style.textContent = `
#search-results li.selected {
  background: rgba(59,130,246,0.1);
  outline: 2px solid #3b82f6;
}
`;
document.head.appendChild(style);