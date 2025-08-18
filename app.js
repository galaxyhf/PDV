/* ==== Catálogo com persistência (localStorage) ==== */
const CATALOG_KEY = 'pdv_catalog_v1';

const defaultCatalog = [
  { code: '7896004000015', name: 'Arroz Branco Tipo 1 5kg', unit: 'PC', price: 27.99 },
  { code: '7891910001118', name: 'Feijão Preto 1kg', unit: 'PC', price: 8.49 },
  { code: '7891000300106', name: 'Açúcar Cristal 1kg', unit: 'PC', price: 4.29 },
  { code: '7894900017120', name: 'Café Tradicional 500g', unit: 'PC', price: 18.90 },
  { code: '7891150022340', name: 'Leite Integral Piracanjuba 1L', unit: 'UN', price: 5.49 },
  { code: '7891025100105', name: 'Farinha de Trigo 1kg', unit: 'PC', price: 6.19 },
  { code: '7896543100456', name: 'Macarrão Parafuso 500g', unit: 'PC', price: 4.59 },
  { code: '7891234500457', name: 'Molho de Tomate Sachê 340g', unit: 'PC', price: 3.29 },
  { code: '7894900011197', name: 'Óleo de Soja 900ml', unit: 'UN', price: 6.59 },
  { code: '7897779300021', name: 'Sal Refinado 1kg', unit: 'PC', price: 2.79 },
  { code: '7896004710250', name: 'Biscoito Recheado Chocolate 140g', unit: 'PC', price: 3.99 },
  { code: '7891132000121', name: 'Refrigerante Cola 2L', unit: 'UN', price: 10.99 },
  { code: '7894900034125', name: 'Suco Laranja Caixa 1L', unit: 'UN', price: 6.49 },
  { code: '7896543200789', name: 'Detergente Líquido 500ml', unit: 'UN', price: 2.39 },
  { code: '7891150098112', name: 'Sabão em Pó 1kg', unit: 'PC', price: 12.90 },
  { code: '7894321987654', name: 'Papel Higiênico 12x30m', unit: 'FD', price: 15.99 },
  { code: '7897418529630', name: 'Shampoo 400ml', unit: 'UN', price: 14.50 },
  { code: '7899632587412', name: 'Creme Dental 90g', unit: 'UN', price: 4.79 },
  { code: '7898521479635', name: 'Sabonete 85g', unit: 'UN', price: 2.29 },
  { code: '7899513574862', name: 'Margarina 500g', unit: 'PC', price: 7.49 }
];

function loadCatalog(){
  try{
    const raw = localStorage.getItem(CATALOG_KEY);
    if(!raw) return [...defaultCatalog];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [...defaultCatalog];
  }catch{
    return [...defaultCatalog];
  }
}

function saveCatalog(arr){
  try{
    localStorage.setItem(CATALOG_KEY, JSON.stringify(arr));
  }catch(e){
    console.error('[PDV] Falha ao salvar catálogo:', e);
  }
}

/* catálogo mutável em memória */
let catalog = loadCatalog();

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

  // Cadastro de produto
  openAddProductBtn: document.getElementById('open-add-product'),
  addProductDlg: document.getElementById('add-product-dialog'),
  addProductForm: document.getElementById('add-product-form'),
  prodCode: document.getElementById('prod-code'),
  prodName: document.getElementById('prod-name'),
  prodUnit: document.getElementById('prod-unit'),
  prodPrice: document.getElementById('prod-price'),

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

/* ==== Cadastro de Produto (F6) ==== */
function openAddProduct(){
  const dlg  = refs.addProductDlg;
  const form = refs.addProductForm;
  const code = refs.prodCode;

  if(!dlg || !form || !code){
    console.error('[PDV] Modal de cadastro não encontrado. Confirme os IDs:', {
      dlg: !!dlg, form: !!form, code: !!code
    });
    return;
  }
  try { form.reset(); } catch {}
  openDialog(dlg);
  code.focus();
}

// Botão "Cadastrar produto"
if(refs.openAddProductBtn){
  refs.openAddProductBtn.addEventListener('click', openAddProduct);
} else {
  console.error('[PDV] Botão #open-add-product não encontrado no DOM.');
}

// Atalho F6 (só quando o modal de pagamento NÃO está aberto)
document.addEventListener('keydown', (e)=>{
  if(!refs.paymentDlg?.open && e.key === 'F6'){
    e.preventDefault();
    openAddProduct();
  }
});

// Fechar modal de cadastro
const cancelProductBtn = document.getElementById("cancel-product");
cancelProductBtn.addEventListener("click", (e) => {
  e.preventDefault();
  addProductDialog.close(); 
});

// Submit do formulário -> salva no catálogo e persiste
if(refs.addProductForm){
  refs.addProductForm.addEventListener('submit', (e)=>{
    e.preventDefault();

    const code  = refs.prodCode?.value?.trim();
    const name  = refs.prodName?.value?.trim();
    const unit  = refs.prodUnit?.value?.trim();
    const price = parseFloat(refs.prodPrice?.value);

    if(!code || !name || !unit || isNaN(price)){
      alert('Preencha todos os campos corretamente.');
      return;
    }

    // Upsert no catálogo
    const idx = catalog.findIndex(p => p.code === code);
    if(idx >= 0){
      if(!confirm('Esse código já existe. Deseja sobrescrever o produto?')) return;
      catalog[idx] = { code, name, unit, price };
    }else{
      catalog.push({ code, name, unit, price });
    }

    // PERSISTE no localStorage
    saveCatalog(catalog);

    alert(`Produto "${name}" cadastrado no catálogo!`);
    try { closeDialog(refs.addProductDlg); } catch { refs.addProductDlg?.close?.(); }

    // Qualquer tela de busca aberta deve refletir o novo catálogo
    if(refs.searchDlg?.open){
      refs.searchInput.dispatchEvent(new Event('input'));
    }
  });
} else {
  console.error('[PDV] Formulário #add-product-form não encontrado no DOM.');
}

/* ==== Estado da venda ==== */
const sale = { items: [] }; // { code, name, unit, price, qty }
let selectedIndex = -1;     // índice do item selecionado para ↑/↓/DEL

/* ==== Itens ==== */
function addItem(product, qty = 1){
  const existing = sale.items.find(i => i.code === product.code);
  if(existing){
    existing.qty += qty;
    redraw();
    selectedIndex = sale.items.findIndex(i => i.code === product.code);
    updateSelectionHighlight();
    announceLast(existing);
    return;
  }
  sale.items.push({ ...product, qty });
  redraw();
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
      updateSelectionHighlight();
    });
    qtyInput.addEventListener('focus', () => {
      selectedIndex = idx;
      updateSelectionHighlight();
    });

    row.querySelector('.btn.icon.danger').addEventListener('click', () => {
      removeSelected(idx);
    });

    row.addEventListener('click', () => {
      selectedIndex = idx;
      updateSelectionHighlight();
    });

    refs.itemsBody.appendChild(row);
  });
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
  [...refs.itemsBody.children].forEach(tr => tr.classList.remove('selected'));
  if(selectedIndex >= 0 && refs.itemsBody.children[selectedIndex]){
    const tr = refs.itemsBody.children[selectedIndex];
    tr.classList.add('selected');
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

  // Foco automático em crédito
  if(method === 'credit'){
    setTimeout(()=> refs.installments?.focus(), 0);
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

/* ==== Helpers de parcelas (Crédito) ==== */
function getInstallmentValues(){
  return [...refs.installments.options].map(op => parseInt(op.value, 10));
}
function setInstallmentsByNumber(n){
  const values = getInstallmentValues();
  if(values.includes(n)){
    refs.installments.value = String(n);
    return true;
  }
  return false;
}
function bumpInstallments(delta){
  const values = getInstallmentValues();
  const cur = parseInt(refs.installments.value || values[0], 10);
  const idx = Math.max(0, Math.min(values.length - 1, values.indexOf(cur) + delta));
  refs.installments.value = String(values[idx]);
}

/* ==== Atalhos de teclado ==== */
document.addEventListener('keydown', (e)=>{
  const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
  const isTypingField = tag === 'input' || tag === 'select' || tag === 'textarea';

  // Globais do PDV (quando modal de pagamento NÃO está aberto)
  if(!refs.paymentDlg.open){
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

    // Teclado para parcelas quando em crédito
    if(currentMethod === 'credit'){
      const isDigitTopRow = e.key >= '1' && e.key <= '9';
      const isNumpadDigit  = e.code?.startsWith('Numpad') && /\d/.test(e.key);
      if(isDigitTopRow || isNumpadDigit){
        const n = parseInt(e.key, 10);
        if(!Number.isNaN(n)){
          const ok = setInstallmentsByNumber(n);
          if(ok){ e.preventDefault(); refs.installments.focus(); }
        }
      }
      if(e.key === 'ArrowUp'){ e.preventDefault(); bumpInstallments(+1); refs.installments.focus(); }
      if(e.key === 'ArrowDown'){ e.preventDefault(); bumpInstallments(-1); refs.installments.focus(); }
    }

    // Esc fecha o modal de pagamento
    if(e.key === 'Escape'){
      e.preventDefault();
      try { refs.paymentDlg.close(); } catch { closeDialog(refs.paymentDlg); }
    }
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

/* ==== Confirmar pagamento ==== */
refs.confirmPayment.addEventListener('click', (e)=>{
  const total = updateTotals();

  // PIX -> abre janela com QR e copia/cola
  if(currentMethod === 'pix'){
    e.preventDefault();
    const pix = generatePixData(total);
    closeDialog(refs.paymentDlg);
    openPixWindow(pix, sale); // recibo e limpeza acontecem na janela PIX
    return;
  }

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

/* ==== PIX dinâmico (BR Code EMV com valor + CRC) ==== */

// sua chave PIX (telefone E.164)
const PIX_KEY = '+5521975335931';
const PIX_MERCHANT = 'Caio Goncalves da Silva';
const PIX_CITY = 'SAO PAULO'; // EMV pede maiúsculas (máx. 15 chars)

/* TLV helpers */
function tlv(id, value){
  const v = String(value ?? '');
  const len = String(v.length).padStart(2, '0');
  return id + len + v;
}

/* CRC16-CCITT (polinômio 0x1021, init 0xFFFF) */
function crc16(payload){
  let crc = 0xFFFF;
  for(let i=0;i<payload.length;i++){
    crc ^= payload.charCodeAt(i) << 8;
    for(let j=0;j<8;j++){
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4,'0');
}

/* Constrói o BR Code PIX com valor */
function buildPixPayload({ key, merchant, city, txid, amount }){
  // Merchant Account Information (ID 26)
  const gui = tlv('00','br.gov.bcb.pix');
  const keyTLV = tlv('01', key); // chave
  const mai = tlv('26', gui + keyTLV);

  // Campos obrigatórios e recomendados
  const payloadFormat = tlv('00','01');        // 000201
  const merchantCat   = tlv('52','0000');      // 52040000 (sem MCC)
  const currencyBRL   = tlv('53','986');       // 5303986
  const amountTLV     = tlv('54', Number(amount).toFixed(2)); // 54xxVALOR
  const countryBR     = tlv('58','BR');        // 5802BR
  const nameTLV       = tlv('59', merchant.substring(0,25)); // 59
  const cityTLV       = tlv('60', city.substring(0,15));     // 60

  // Additional Data Field (ID 62) -> TXID (ID 05)
  const txidTLV       = tlv('05', txid.substring(0,25));
  const addDataField  = tlv('62', txidTLV);

  // Monta sem CRC e adiciona o "6304" para calcular
  const noCRC = payloadFormat + mai + merchantCat + currencyBRL +
                amountTLV + countryBR + nameTLV + cityTLV + addDataField + '6304';
  const crc = crc16(noCRC);
  return noCRC + crc;
}

/* Gera dados do PIX para a venda atual */
function generatePixData(total){
  const amount = (Math.round(total * 100) / 100).toFixed(2);
  const txid = ('PDV' + Date.now().toString(36).toUpperCase()).slice(-25);

  const payload = buildPixPayload({
    key: PIX_KEY,
    merchant: PIX_MERCHANT,
    city: PIX_CITY,
    txid,
    amount
  });

  return {
    amount,
    payload,
    show: {
      key: '+55 21 97533-5931',
      name: PIX_MERCHANT,
      cpf: '***.789.347-**',       // opcional/visual
      institution: 'Mercado Pago', // opcional/visual
      city: 'Teresópolis'
    }
  };
}

/* Abre janela com QR + copia e cola, central grande */
function openPixWindow(pixData, saleData){
  const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(pixData.payload)}`;

  const grandTotal = saleData.items.reduce((s,i)=> s + i.qty * i.price, 0);
  const w = window.open('', 'pix');

  const itemsHTML = saleData.items.map(i =>
    `<tr><td>${i.name}</td><td class="right">${i.qty} ${i.unit}</td><td class="right">${currency.format(i.price*i.qty)}</td></tr>`
  ).join('');

  w.document.write(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Pagamento PIX</title>
<style>
  body{font:15px/1.5 -apple-system,Segoe UI,Roboto,Arial;padding:20px;margin:0;color:#111;background:#fafafa;text-align:center}
  h1{font-size:22px;margin:0 0 10px}
  .muted{color:#666;font-size:13px;margin-bottom:15px}
  .card{display:inline-block;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;box-shadow:0 2px 4px rgba(0,0,0,.06)}
  img{display:block;margin:0 auto 15px}
  table{width:100%;border-collapse:collapse;margin-top:15px;text-align:left}
  td{padding:6px 0;vertical-align:top}
  .right{text-align:right;white-space:nowrap}
  .total{font-weight:700}
  .row{display:flex;gap:8px;align-items:center;margin:12px 0}
  input.copy{flex:1;padding:10px;border:1px solid #d1d5db;border-radius:8px}
  button{padding:10px 14px;border:0;border-radius:8px;background:#16a34a;color:#fff;cursor:pointer}
  button.secondary{background:#e5e7eb;color:#111}
  .actions{display:flex;gap:10px;justify-content:center;margin-top:18px}
  .info{text-align:left;margin:0 auto;max-width:400px}
  .label{font-size:12px;color:#6b7280;margin-top:6px;text-align:center}
</style>
</head>
<body>
  <h1>Escaneie o QR Code para pagar</h1>
  <div class="muted">Esc fecha • Enter confirma pagamento</div>

  <div class="card">
    <img src="${qrURL}" alt="QR Code PIX" width="400" height="400" />
    <div class="label">Valor: R$ ${pixData.amount}</div>

    <div class="info">
      <p><strong>Chave Pix:</strong> ${pixData.show.key}</p>
      <p><strong>Nome:</strong> ${pixData.show.name}</p>
      <p><strong>CPF:</strong> ${pixData.show.cpf}</p>
      <p><strong>Instituição:</strong> ${pixData.show.institution}</p>
      <p><strong>Cidade:</strong> ${pixData.show.city}</p>
    </div>

    <div class="row">
      <input class="copy" id="copiacola" readonly value="${pixData.payload}">
      <button class="secondary" id="btnCopy">Copiar</button>
    </div>

    <table>
      ${itemsHTML}
      <tr><td class="total">TOTAL</td><td class="right total">${currency.format(grandTotal)}</td></tr>
    </table>

    <div class="actions">
      <button class="secondary" id="btnClose">Cancelar (Esc)</button>
      <button id="btnOk">Pagamento recebido (Enter)</button>
    </div>
  </div>

  <script>
    const $ = sel => document.querySelector(sel);
    $('#btnCopy').addEventListener('click', async ()=>{
      const v = $('#copiacola').value;
      try{
        await navigator.clipboard.writeText(v);
        $('#btnCopy').textContent='Copiado!';
        setTimeout(()=>$('#btnCopy').textContent='Copiar',1200);
      }catch{
        $('#copiacola').select(); document.execCommand('copy');
      }
    });
    $('#btnClose').addEventListener('click', ()=> window.close());
    $('#btnOk').addEventListener('click', ()=> window.dispatchEvent(new Event('pix-ok')));
    window.addEventListener('keydown', (e)=>{
      if(e.key==='Escape'){ e.preventDefault(); window.close(); }
      if(e.key==='Enter'){ e.preventDefault(); window.dispatchEvent(new Event('pix-ok')); }
    });
  </script>
</body>
</html>`);
  w.document.close();

  // Confirmação -> recibo PIX e limpa venda
  w.addEventListener('pix-ok', ()=>{
    if(window.buildReceiptHTML){
      const total = saleData.items.reduce((s,i)=>s+i.qty*i.price,0);
      const html = buildReceiptHTML({
        store:'PDV Web',
        cnpj:'32.190.092/0001-06',
        address:'Estr. Venceslau José de Medeiros, 1045 - Prata, Teresópolis - RJ',
        datetime:new Date(),
        items:saleData.items.map(i=>({code:i.code,name:i.name,qty:i.qty,unit:i.unit,price:i.price,total:i.qty*i.price})),
        total,
        method:'pix',
        received:0,
        change:0,
        installments:'—'
      });
      const pr = window.open('', 'print');
      pr.document.write(html); pr.document.close();
      try{ pr.print(); }catch{}
      saleData.items.length = 0;
      selectedIndex = -1;
      redraw();
      refs.lastItem.textContent = '—';
    }
    try{ w.close(); }catch{}
  });
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

// Enter confirma pagamento no modal
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