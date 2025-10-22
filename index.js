const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Webhook e ID da mensagem existente
const webhookURL = 'https://discord.com/api/webhooks/1430367755839868938/tM2Vrs_oi4_Ed4V_bOfEJQmpZPngVcYmvodDaGXWva4aIlkehnoiORkN7KITE6_A5jqM';
const messageId = '1430373050779697288';

// Estoque inicial
let stock = [
  { name: "TOMATRIO", price: 0.50, quantity: 202 },
  { name: "MANGO", price: 0.70, quantity: 260 },
  { name: "MR CARROT", price: 0.40, quantity: 99 },
  { name: "PLANTA (100k ~ 500k DPS)", price: 5.00, quantity: 12 }
];

// Função para gerar o embed atualizado
function generateEmbed() {
  return {
    username: "DOLLYA VS BRAINROTS [PREÇOS]",
    avatar_url: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/fd/c8/4a/fdc84a19-2df7-4205-a233-7e3d794688d6/1963623074713_cover.png/600x600bf-60.jpg",
    embeds: [
      {
        title: "🧠 DOLLYA STORE | TABELA DE VENDAS — PLANTS VS BRAINROTS 🧃",
        color: 16753920,
        thumbnail: {
          url: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/fd/c8/4a/fdc84a19-2df7-4205-a233-7e3d794688d6/1963623074713_cover.png/600x600bf-60.jpg"
        },
        fields: stock.map(item => ({
          name: `🍎 ${item.name}`,
          value: `**Preço:** R$${item.price.toFixed(2)}\n**Estoque:** ${item.quantity > 0 ? item.quantity : 'ESGOTADO'}`,
          inline: true
        })),
        footer: {
          text: "🛒 DOLLYA STORE — Domine o PLANTS VS BRAINROTS!"
        }
      }
    ]
  };
}

// Rota API para atualizar stock e preço via POST
app.post('/update-stock', async (req, res) => {
  const newStock = req.body;

  stock = stock.map(item => {
    // Gera chaves compatíveis com o HTML
    const key = item.name.replace(/\s|\(|\)|~/g, "_"); 
    const quantityKey = `${key}_quantity`;
    const priceKey = `${key}_price`;

    return {
      ...item,
      quantity: newStock[quantityKey] !== undefined ? Number(newStock[quantityKey]) : item.quantity,
      price: newStock[priceKey] !== undefined ? Number(newStock[priceKey]) : item.price
    };
  });

  // Edita o embed existente
  try {
    await fetch(`${webhookURL}/messages/${messageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(generateEmbed())
    });
    res.json({ status: 'success', stock });
    console.log('Embed atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar embed:', error);
    res.json({ status: 'error', error });
  }
});

// Rota para abrir o painel
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
