// Fetch the menu JSON file
fetch('menu.json')
.then(response => response.json())
.then(data => {
    const foodContainer = document.getElementById('food-container');
    const beverageContainer = document.getElementById('beverage-container');
    const dessertContainer = document.getElementById('dessert-container');
    
    // Function to generate navigation and content for each category
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
        
                // Remove active class from all sub-tabs
                const allLinks = subNav.querySelectorAll('.nav-link');
                allLinks.forEach(link => link.classList.remove('active'));
        
                // Add active class to the clicked tab
                a.classList.add('active');
        
                // Scroll to the selected category
                scrollToCategory(`category-${category.category}`, container);
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

                cardBody.appendChild(cardTitle);
                cardBody.appendChild(cardText);

                card.appendChild(img);
                card.appendChild(cardBody);
                
                col.appendChild(card);
                row.appendChild(col);
            });

            categorySection.appendChild(row);
            container.appendChild(categorySection)
        });
    };

    // Generate the food, beverage, and dessert categories
    generateCategoryMenu(data.food, 'food', foodContainer, 'food-subtab');
    generateCategoryMenu(data.Beverage, 'beverage', beverageContainer, 'beverage-subtab');
    generateCategoryMenu(data.Dessert, 'dessert', dessertContainer, 'dessert-subtab');
})
.catch(error => console.log('Error loading the menu:', error));

// Function to scroll to the desired category inside the given container
function scrollToCategory(categoryId, container) {
    const category = document.getElementById(categoryId);
    if (category) {
        container.scrollTop = category.offsetTop - container.offsetTop;
        container.style.scrollbehavior = 'smooth';
    }
}

// Add styles for scrollable containers
document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.scroll-container');
    containers.forEach(container => {
        container.style.maxHeight = '5600px';  // Adjust the height as needed
        container.style.overflowY = 'auto';   // Enable vertical scroll
        container.style.paddingBottom = '4200px';
    });
});
