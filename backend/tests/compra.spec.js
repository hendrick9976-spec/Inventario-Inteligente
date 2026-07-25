const { test, expect } = require('@playwright/test');

test('Flujo de compra completo: Desde el catálogo hasta el mensaje de éxito', async ({ page }) => {
  // 1. El robot entra a la URL de tu e-commerce local
  await page.goto('http://localhost:3000'); 

  // 2. Verifica que el catálogo cargó y el producto existe (el que probamos en el backend)
  await expect(page.locator('text=Laptop')).toBeVisible();

  // 3. Hace clic en el botón para agregar al carrito
  await page.click('button:has-text("Agregar al carrito")');

  // 4. Navega a la vista del carrito y llena el formulario del cliente
  await page.fill('input[name="nombreCliente"]', 'Cliente Prueba');
  
  // Nota: Aquí luego agregaremos el campo de teléfono cuando integremos WhatsApp
  // await page.fill('input[name="telefono"]', '+123456789'); 

  // 5. Hace clic en el botón final de comprar
  await page.click('button:has-text("Finalizar Compra")');

  // 6. Verifica que la pantalla muestre el mensaje de confirmación
  await expect(page.locator('text=Compra procesada correctamente')).toBeVisible();
});