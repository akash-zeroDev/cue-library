const apiKey = "YMXW3NrIJnTnbUQA.s9FNIXI7J9iSI0aEcuJHFh-OQHEUL3Oi0kt37Xby6mym-31w";

async function check() {
  const response = await fetch('https://test.dodopayments.com/products', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  const data = await response.json();
  console.log("Test mode products:", data.items.map(p => ({ id: p.product_id, name: p.name })));
}
check();
