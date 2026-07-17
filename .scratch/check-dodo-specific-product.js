const apiKey = "YMXW3NrIJnTnbUQA.s9FNIXI7J9iSI0aEcuJHFh-OQHEUL3Oi0kt37Xby6mym-31w";
async function check() {
  const response = await fetch('https://test.dodopayments.com/products/pdt_0NjMRKjzhrnsk52FRl3PP', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  const data = await response.text();
  console.log("Specific product fetch response:", response.status, data);
}
check();
