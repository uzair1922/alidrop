export const generateRandomEmail = () => {
  const timestamp = Date.now();
  return `qa+auto${timestamp}@spocket.com`;
};

/**
 * Utility function to add multiple products to the import list
 * @param {number} count - Number of products to add
 */
export function addProductsToImportList(count = 1) {
  function addOne(index, max) {
    if (index >= max) return;
    cy.get('[data-testid^="product-card"]')
      .should('have.length.greaterThan', 0)
      .then($cards => {
        if (index >= $cards.length) return;
        cy.wrap($cards)
          .eq(index)
          .as('productCard');
        cy.get('@productCard').trigger('mouseover');
        cy.get('@productCard').within(() => {
          // Try to find either "Add to Import List" or "Added to import list"
          cy.contains(/Add(ed)? to import list/i).then($el => {
            const text = $el.text().trim();

            if (text === 'Add to Import List') {
              cy.wrap($el).click({ force: true });
              // cy.contains('Added to import list').should('be.visible');
            } else if (text === 'Added to import list') {
              cy.log('ℹ️ Product is already in import list');
            }
          });
        })
      })
      .then(() => {
        // Wait for DOM update, then add next
        addOne(index + 1, max);
      });
  }
  cy.get('[data-testid^="product-card"]')
    .should('have.length.greaterThan', 0)
    .then($cards => {
      const numToAdd = Math.min(count, $cards.length);
      addOne(0, numToAdd);
    });
}

export function searchProducts(url) {
  cy.viewport('macbook-16')
  cy.get('input[type="string"]').type(url)
  cy.contains('button', 'Search').click()
}