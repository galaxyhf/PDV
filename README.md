# PDV Web

Um sistema simples de **Ponto de Venda (PDV)** desenvolvido em **HTML, CSS e JavaScript**.  
Permite simular operações de caixa com leitura de código de barras, busca de produtos, controle de itens, cálculo de totais, seleção de forma de pagamento e geração de recibos em formato NFC-e (não fiscal).

---

## 🌐 Acesso Online

Você pode acessar o sistema diretamente pelo link: [https://pdvweb.netlify.app/](https://pdvweb.netlify.app/)

---

## Funcionalidades

- Catálogo de produtos (mock) com código de barras, nome, unidade e preço.
- Busca de produtos por código ou parte do nome (atalho **F2**).
- Adição de itens por scanner manual ou busca.
- Navegação pelos itens com setas do teclado e remoção com **Delete**.
- Cancelar venda (atalho **F4**).
- Cálculo automático de totais.
- Formas de pagamento:
  - Dinheiro (**F1**) → calcula troco.
  - Cartão Débito (**F2**).
  - Cartão Crédito (**F3**) → permite selecionar parcelas.
  - PIX (**F4**).
- Geração de recibo não fiscal em formato pronto para impressão (80mm).
- Relógio em tempo real no cabeçalho.

---

## Interface

A interface é dividida em dois painéis:

- Painel esquerdo:  
  Scanner de código de barras, busca de produto, último item lançado, total acumulado e botão para iniciar pagamento.

- Painel direito:  
  Lista de itens da venda em tabela interativa com edição de quantidade e remoção.

---

## Atalhos de Teclado

- **F2** → Abrir busca de produto  
- **F4** → Cancelar venda  
- **F8** → Abrir tela de pagamento  
- **F1–F4** (dentro do pagamento) → Selecionar forma  
- **Enter** (dentro do pagamento) → Confirmar pagamento  
- **Setas ↑/↓** → Navegar entre itens  
- **Delete** → Remover item selecionado  


