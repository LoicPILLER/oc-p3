const APIURL = "http://localhost:5678/api";

const DGALLERY = document.querySelector("#portfolio > .gallery")
const FILTERS = document.querySelector("#portfolio > .filters-container")
async function getJson(url) {
    const response = await fetch(url);
    return await response.json();
}

async function initCategories(){
    let categories = await getJson(APIURL + "/categories");

    let n = 1;
    categories.forEach((category) => {
        const filterButton = document.createElement("button");
        filterButton.setAttribute('data-id', n);
        filterButton.innerText = categories[n-1].name;

        FILTERS.appendChild(filterButton);

        n += 1;
    })
}

async function displayWorks(categoryId = 0){
    let works = await getJson(APIURL + "/works");

    if (categoryId !== 0) {
        works = works.filter((work) => work.categoryId === categoryId);
    }

    DGALLERY.innerHTML = '';
    works.forEach((work) => {
        const figure = document.createElement("figure");

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const caption = document.createElement("figcaption");
        caption.innerText = work.title;

        figure.appendChild(img);
        figure.appendChild(caption)

        DGALLERY.appendChild(figure);
    })
}

function initPage(){
    FILTERS.addEventListener('click', function (e){
        let categoryId = e.target.dataset.id;
        if (categoryId === undefined) return;

        let activeFilter = document.getElementById('active-filter');
        activeFilter.removeAttribute('id');

        e.target.id = 'active-filter';
        displayWorks(parseInt(categoryId));
    })
}

displayWorks();
initCategories();
initPage()