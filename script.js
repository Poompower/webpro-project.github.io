// 1. Fetch menu data
fetch('menu.json')
    .then(response => response.json())
    .then(data => {
        // 2. Initialize containers and variables
        const foodContainer = document.getElementById('food-container');
        const beverageContainer = document.getElementById('beverage-container');
        const cartContainer = document.querySelector('#cart .cart-container');
        const promotionButtons = document.querySelectorAll('#promotion button');

        let cart = []; // Array to store cart items
        let selectedPromotion = null; // Store selected promotion

        // 3. Initialize promotions
        const promotions = [
            { id: 1, discount: 0.1, minOrder: 300 }, // 10% off for orders over 300
            { id: 2, discount: 0.15, minOrder: 500 }, // 15% off for orders over 500
            { id: 3, discount: 0.2, minOrder: 1000 }, // 20% off for orders over 1000
        ];

        // 4. Function to generate category menus
        const generateCategoryMenu = (categoryData, categoryType, container, subTabId) => {
            const subNav = document.getElementById(subTabId);

            // Create Sub Nav Tabs dynamically
            categoryData.forEach((category, index) => {
                const li = document.createElement('li');
                li.classList.add('nav-item');
                const a = document.createElement('a');
                a.classList.add('nav-link');
                if (index === 0) a.classList.add('active'); // Set first item as active by default
                a.href = `#category-${category.category}`;
                a.innerText = category.category;

                // Handle click event
                a.onclick = function (event) {
                    event.preventDefault();  // Prevent the default page scroll
                    handleCategoryTabClick(subNav, a, category.category, container);
                };

                li.appendChild(a);
                subNav.appendChild(li);
            });

            // Loop through each category to generate content
            categoryData.forEach(category => {
                const categorySection = document.createElement('div');
                categorySection.classList.add('category-section');
                categorySection.id = `category-${category.category}`;

                const categoryTitle = document.createElement('h4');
                categoryTitle.innerText = category.category;
                categorySection.appendChild(categoryTitle);

                const row = document.createElement('div');
                row.classList.add('row');

                // Loop through the items in each category
                category.items.forEach(item => {
                    createItemCard(item, row);
                });

                categorySection.appendChild(row);
                container.appendChild(categorySection);
            });
        };

        // 5. Handle category tab click
        const handleCategoryTabClick = (subNav, clickedTab, categoryId, container) => {
            // Remove active class from all sub-tabs
            const allLinks = subNav.querySelectorAll('.nav-link');
            allLinks.forEach(link => link.classList.remove('active'));

            // Add active class to the clicked tab
            clickedTab.classList.add('active');

            // Scroll to the selected category
            scrollToCategory(`category-${categoryId}`, container);
        };

        // 6. Create item card for each menu item with quantity input
        const createItemCard = (item, row) => {
            const col = document.createElement('div');
            col.classList.add('col-sm-12', 'col-md-6', 'col-lg-4');

            const card = document.createElement('div');
            card.classList.add('card', 'mb-3');

            const img = document.createElement('img');
            img.src = item.image;
            img.classList.add('card-img-top');
            img.alt = item.name;

            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body');

            const cardTitle = document.createElement('h5');
            cardTitle.classList.add('card-title');
            cardTitle.innerText = item.name;

            const cardText = document.createElement('p');
            cardText.classList.add('card-text');
            cardText.innerText = `ราคา: ${item.price} บาท`;

            // Create quantity box with increment/decrement buttons
            const quantityBox = document.createElement('div');
            quantityBox.classList.add('quantity-box');
            quantityBox.style.display = 'flex';
            quantityBox.style.alignItems = 'center';
            quantityBox.style.gap = '5px'


            const minusButton = document.createElement('button');
            minusButton.classList.add('btn', 'btn-danger', 'btn-sm');
            minusButton.innerText = '-';
            minusButton.style.width = '50px';
            const quantityInput = document.createElement('input');
            quantityInput.type = 'text';
            quantityInput.value = '0';
            quantityInput.min = '0';
            quantityInput.classList.add('form-control', 'form-control-sm', 'quantity-input');
            quantityInput.style.width = minusButton.style.width;
            quantityInput.style.textAlign = 'center';

            const plusButton = document.createElement('button');
            plusButton.classList.add('btn', 'btn-success', 'btn-sm');
            plusButton.innerText = '+';
            plusButton.style.width = minusButton.style.width;

            // Decrease quantity
            minusButton.onclick = () => {
                if (quantityInput.value > 0) {
                    quantityInput.value = parseInt(quantityInput.value) - 1;
                }
            };

            // Increase quantity
            plusButton.onclick = () => {
                quantityInput.value = parseInt(quantityInput.value) + 1;
            };

            // Append buttons and input to the quantity box
            quantityBox.appendChild(minusButton);
            quantityBox.appendChild(quantityInput);
            quantityBox.appendChild(plusButton);

            // Create Add to Cart button
            const addToCartButton = document.createElement('button');
            addToCartButton.classList.add('btn', 'btn-primary', 'mt-2');
            addToCartButton.innerText = 'Add to Cart';
            addToCartButton.onclick = () => addToCart(item, quantityInput);

            // Append elements to the card
            cardBody.appendChild(cardTitle);
            cardBody.appendChild(cardText);
            cardBody.appendChild(quantityBox); // Append quantity box before the button
            cardBody.appendChild(addToCartButton);

            card.appendChild(img);
            card.appendChild(cardBody);

            col.appendChild(card);
            row.appendChild(col);
        };

        // 7. Add item to cart
        const addToCart = (item, quantityInput) => {
            const quantity = parseInt(quantityInput.value); // Get the current quantity
            if (quantity > 0) {
                const existingItem = cart.find(cartItem => cartItem.name === item.name);
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    cart.push({ ...item, quantity });
                }
                updateCartSummary();

                // Clear the quantity input after adding to cart
                quantityInput.value = '0';

                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Added to Cart',
                    text: `${item.name} x ${quantity} added to your cart!`,
                });
            } else {
                // Show an error message if quantity is 0
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Quantity',
                    text: 'Please select a valid quantity before adding to the cart.',
                });
            }
        };


        // 8. Update cart summary with discount info if promotion is applied
        const updateCartSummary = () => {
            cartContainer.innerHTML = '';
            let totalItems = 0;
            let totalPrice = 0;

            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.classList.add('cart-item');

                // Create a cart item with image, name, and quantity
                const itemImage = document.createElement('img');
                itemImage.src = item.image;
                itemImage.alt = item.name;
                itemImage.style.width = '50px';  // Adjust the size of the image
                itemImage.style.height = '50px'; // Adjust the size of the image
                itemImage.style.marginRight = '10px'; // Add some space between image and text

                // Add image, name, quantity, and price to cart item
                const itemDetails = document.createElement('div');
                itemDetails.innerHTML = `<span>${item.name} x ${item.quantity}</span>
                                 <span>${item.quantity * item.price} บาท</span>`;

                cartItem.appendChild(itemImage);  // Add image to cart item
                cartItem.appendChild(itemDetails); // Add name and price info to cart item

                cartContainer.insertBefore(cartItem, cartContainer.querySelector('.btn'));
                totalItems += item.quantity;
                totalPrice += item.quantity * item.price;
            });

            // Apply promotion if selected and valid
            if (selectedPromotion && selectedPromotion.applied) {
                const discountAmount = selectedPromotion.discountAmount;
                totalPrice -= discountAmount;

                const promotionInfo = document.createElement('div');
                promotionInfo.classList.add('promotion-info');
                promotionInfo.innerText = `Promotion Applied: -${discountAmount.toFixed(2)} บาท`;
                cartContainer.insertBefore(promotionInfo, cartContainer.querySelector('.btn'));
            }

            // Add total price to the cart
            if (totalItems > 0) {
                const totalPriceElement = document.createElement('div');
                totalPriceElement.classList.add('cart-total');
                totalPriceElement.innerText = `Total: ${totalPrice.toFixed(2)} บาท`;
                cartContainer.insertBefore(totalPriceElement, cartContainer.querySelector('.btn'));

                // Only show the checkout button if there are items in the cart
                const checkoutButtonContainer = document.createElement('div');
                const checkoutButton = document.createElement('button');
                checkoutButton.classList.add('btn', 'btn-primary');
                checkoutButton.innerText = 'Checkout';
                checkoutButton.onclick = () => proceedToCheckout(totalPrice);

                checkoutButtonContainer.appendChild(checkoutButton);
                cartContainer.appendChild(checkoutButtonContainer);
            } else {
                // If the cart is empty, remove checkout button
                const checkoutButtonContainer = cartContainer.querySelector('.btn');
                if (checkoutButtonContainer) {
                    checkoutButtonContainer.remove();
                }
            }
        };

        // 9. Proceed to checkout
        const proceedToCheckout = (totalPrice) => {
            if (cart.length === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Cart is Empty',
                    text: 'Please add items to your cart before checking out.',
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Checkout Successful',
                    text: `Your total is ${totalPrice.toFixed(2)} บาท. Thank you for your purchase!`,
                }).then(() => {
                    // Clear cart after checkout
                    cart = [];
                    selectedPromotion = null;
                    updateCartSummary(); // Refresh cart view
                });
            }
        };

        // 10. Apply promotion with check for minimum order value
        promotionButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                if (cart.length === 0) {
                    // If the cart is empty, show alert
                    Swal.fire({
                        icon: 'error',
                        title: 'Cart is Empty',
                        text: 'Please fill the cart first before applying a promotion.',
                    });
                    return;
                }

                // Get the total price of the cart
                let totalPrice = 0;
                cart.forEach(item => {
                    totalPrice += item.quantity * item.price;
                });

                const promotion = promotions[index];

                // Check if the total price meets the minimum order for the promotion
                if (totalPrice >= promotion.minOrder) {
                    // Apply the promotion
                    const discountAmount = totalPrice * promotion.discount;
                    totalPrice -= discountAmount;

                    // Update the cart and apply discount
                    promotion.discountAmount = discountAmount; // Store the discount amount
                    promotion.applied = true; // Mark the promotion as applied
                    selectedPromotion = promotion; // Set the selected promotion

                    // Update the cart
                    updateCartSummary();

                    // Show success alert with discount information
                    Swal.fire({
                        icon: 'success',
                        title: `Promotion Applied`,
                        text: `You selected ${promotion.discount * 100}% off for orders over ${promotion.minOrder} บาท. Your discount is ${discountAmount.toFixed(2)} บาท.`,
                    });
                } else {
                    // Show error if total price is less than the minimum order for the promotion
                    Swal.fire({
                        icon: 'error',
                        title: 'Promotion Not Applicable',
                        text: `Your total price is ${totalPrice.toFixed(2)} บาท. Please add more items to reach ${promotion.minOrder} บาท for this promotion.`,
                    });
                }
            });
        });


        // 11. Generate categories
        generateCategoryMenu(data.food, 'food', foodContainer, 'food-subtab');
        generateCategoryMenu(data.Beverage, 'beverage', beverageContainer, 'beverage-subtab');
    })
    .catch(error => console.log('Error loading the menu:', error));

// 12. Set styles for scrollable containers
document.addEventListener('DOMContentLoaded', () => {
    const foodContainer = document.querySelector('#food-container');
    const otherContainers = document.querySelectorAll('.scroll-container:not(#food-container)');

    // Set styles for food-container
    if (foodContainer) {
        foodContainer.style.maxHeight = '7000px';  // Adjust the height as needed
        foodContainer.style.overflowY = 'auto';    // Enable vertical scroll
    }

    // Set styles for other containers (set to auto)
    otherContainers.forEach(container => {
        container.style.overflowY = 'auto';        // Enable vertical scroll (auto)
        container.style.maxHeight = '900px';        // Remove the max height restriction
    });
});
// Function to scroll to the desired category inside the given container
function scrollToCategory(categoryId, container) {
    const category = document.getElementById(categoryId);
    if (category) {
        container.scrollTop = category.offsetTop - container.offsetTop;
        container.style.scrollbehavior = 'smooth';
    }
}