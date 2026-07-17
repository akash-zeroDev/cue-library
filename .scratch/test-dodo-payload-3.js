const apiKey = "YMXW3NrIJnTnbUQA.s9FNIXI7J9iSI0aEcuJHFh-OQHEUL3Oi0kt37Xby6mym-31w";
const productId = "pdt_0NjKRf5DR1GiZrBaoLxPr"; // working single prompt product

async function testDodo() {
  const url = 'https://test.dodopayments.com';
  
  const requestBody = {
    customer: {
      email: 'test@example.com',
      name: 'Test User'
    },
    product_cart: [
      {
        product_id: productId,
        quantity: 1,
        amount: 200
      }
    ],
    return_url: 'http://localhost:5173',
    billing_currency: 'USD',
    metadata: {
      user_id: '123',
      prompt_id: '456'
    }
  };

  const response = await fetch(`${url}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  const text = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(`Response: ${text}`);
}

testDodo();
