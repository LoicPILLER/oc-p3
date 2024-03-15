const APIURL = "http://localhost:5678/api";

const DEDITBANNER = document.getElementById('edit-banner');
const DHEADER = document.querySelector('header');
const DLOGIN = document.getElementById('login');
const DFILTERS = document.querySelector("#portfolio > .filters-container");
const DGALLERY = document.querySelector("#portfolio > .gallery");

async function getJson(url) {
    const response = await fetch(url);
    return await response.json();
}

async function displayCategories(){
    let categories = await getJson(APIURL + "/categories");

    let n = 1;
    categories.forEach((category) => {
        let filterButton = document.createElement("button");
        filterButton.setAttribute('data-id', n);
        filterButton.innerText = categories[n-1].name;

        DFILTERS.appendChild(filterButton);

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
        let figure = document.createElement("figure");

        let img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        let caption = document.createElement("figcaption");
        caption.innerText = work.title;

        figure.appendChild(img);
        figure.appendChild(caption)

        DGALLERY.appendChild(figure);
    })
}

function initPage(){
    displayWorks();
    displayCategories();

    DFILTERS.addEventListener('click', function (e){
        let categoryId = e.target.dataset.id;
        if (categoryId === undefined) return;

        let activeFilter = document.getElementById('active-filter');
        activeFilter.removeAttribute('id');

        e.target.id = 'active-filter';
        displayWorks(parseInt(categoryId));
    })

    if (localStorage.getItem('token')){
        DEDITBANNER.classList.remove('d-none');
        DHEADER.style.marginTop = '80px';
        DLOGIN.innerText = 'logout';
        DLOGIN.addEventListener('click', function (e){
            e.preventDefault();
            localStorage.clear();
            document.location.reload();
        })

        const dModal = document.querySelector('.modal');

        const dModalStartBtn = document.getElementById('modal-open-btn');
        dModalStartBtn.addEventListener('click', function (e){
            dModal.classList.remove('d-none');
        })

        const dModalCloseBtn = document.getElementById('modal-close-btn');
        dModalCloseBtn.addEventListener('click', function (e){
            dModal.classList.add('d-none');
        })
    }
}

initPage()