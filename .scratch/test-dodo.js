const apiKey = "YMXW3NrIJnTnbUQA.s9FNIXI7J9iSI0aEcuJHFh-OQHEUL3Oi0kt37Xby6mym-31w";
const productId = "pdt_0NjKRf5DR1GiZrBaoLxPr";

async function testDodo(env) {
  const url = env === 'live' ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';
  console.log(`\nTesting against ${env.toUpperCase()} Environment...`);
  
  const response = await fetch(`${url}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      product_cart: [{ product_id: productId, quantity: 1 }],
      return_url: 'http://localhost:5173'
    })
  });
  
  const text = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(`Response: ${text}`);
}

await testDodo('test');
await testDodo('live');
