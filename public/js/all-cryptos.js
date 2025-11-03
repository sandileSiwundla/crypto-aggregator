async function populateTable() {
  try {
    const res = await fetch('/api/all/data');
    const { coins, usdToZar } = await res.json();

    const table = document.getElementById('crypto-table');

    coins.forEach(coin => {
      const row = document.createElement('tr');
      const priceUSD = coin.quote.USD.price;
      const priceZAR = usdToZar ? priceUSD * usdToZar : 'N/A';

      row.innerHTML = `
        <td>${coin.cmc_rank}</td>
        <td>${coin.name}</td>
        <td>${coin.symbol}</td>
        <td>$${priceUSD.toFixed(2)}</td>
        <td>${priceZAR === 'N/A' ? 'N/A' : 'R' + priceZAR.toFixed(2)}</td>
      `;
      table.appendChild(row);
    });
  } catch (err) {
    console.error('Error populating table:', err);
  }
}

populateTable();
