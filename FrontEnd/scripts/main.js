const APIURL = "http://localhost:5678/api";

const DEDITBANNER = document.getElementById('edit-banner');
const DHEADER = document.querySelector('header');
const DLOGIN = document.getElementById('login');
const DFILTERS = document.querySelector("#portfolio > .filters-container");
const DGALLERY = document.querySelector("#portfolio > .gallery");

let token = null;

let works = [];

async function getJson(url) {
    const response = await fetch(url);
    return await response.json();
}

async function postData(relativeUrl, data = {}) {
    const url = APIURL + relativeUrl;
    const method = data.method || "POST";
    const token = data.token || null;

    const response = await fetch(url, {
        method: method,
        headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json'
        },
    });

    return response
}

async function displayCategories(){
    let categories = await getJson(APIURL + "/categories");

    categories.forEach((category) => {
        let filterButton = document.createElement("button");
        filterButton.setAttribute('data-id', category.id);
        filterButton.innerText = category.name;

        DFILTERS.appendChild(filterButton);
    })
}

async function displayWorks(element, categoryId = 0, options = {}){

    let currentWorks = [];

    if (categoryId !== 0) {
        currentWorks = works.filter((work) => work.categoryId === categoryId);
    } else {
        currentWorks = works;
    }

    element.innerHTML = '';
    currentWorks.forEach((work) => {
        let figure = document.createElement("figure");
        figure.setAttribute('data-id', work.id)

        let img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        let caption = document.createElement("figcaption");
        caption.innerText = work.title;

        figure.appendChild(img);
        figure.appendChild(caption)

        if (options['displayTrash'] === true) {
            let trash = document.createElement("i");
            trash.classList.add("fa-solid");
            trash.classList.add("fa-trash-can");
            trash.classList.add("action-delete-work");
            figure.appendChild(trash);
        }

        element.appendChild(figure);
    })
}

function initFilters(){
    DFILTERS.addEventListener('click', function (e){
        let categoryId = e.target.dataset.id;
        if (categoryId === undefined) return;

        let activeFilter = document.getElementById('active-filter');
        activeFilter.removeAttribute('id');

        e.target.id = 'active-filter';
        displayWorks(DGALLERY, parseInt(categoryId));
    })
}

function initEditMode(){
    DEDITBANNER.classList.remove('d-none');
    DHEADER.style.marginTop = '80px';
    DLOGIN.innerText = 'logout';
    DLOGIN.addEventListener('click', function (e){
        e.preventDefault();
        localStorage.clear();
        document.location.reload();
    })
}

function switchToAddPicturePageModal() {
    const dModal = document.querySelector('.modal');

    const dGalleryModal = document.getElementById('gallery-modal');
    dGalleryModal.classList.add('d-none');

    const dAddPictureModal = document.getElementById('add-picture-modal');
    dAddPictureModal.classList.remove('d-none');

    const dBackBtn = document.getElementById('add-picture-back-btn');
    dBackBtn.addEventListener('click', function (e){
        dAddPictureModal.classList.add('d-none');
        dGalleryModal.classList.remove('d-none');
    })

    const dModalCloseBtn = document.getElementById('add-picture-modal-close-btn');
    dModalCloseBtn.addEventListener('click', function (e){
        dAddPictureModal.classList.add('d-none');
        dModal.classList.add('d-none');
        dGalleryModal.classList.remove('d-none');
    })
}

function initModal(){

    const dModal = document.querySelector('.modal');
    const dWorksContainer = document.querySelector('.works-container');

    const dModalStartBtn = document.getElementById('modal-open-btn');
    dModalStartBtn.classList.remove('d-none');
    dModalStartBtn.addEventListener('click', function (e){
        dModal.classList.remove('d-none');
        displayWorks(dWorksContainer, 0, {'displayTrash' : true});
    })

    const dModalCloseBtn = document.getElementById('gallery-modal-close-btn');
    dModalCloseBtn.addEventListener('click', function (e){
        dModal.classList.add('d-none');
    })

    const dModalAddPictureBtn = document.getElementById('add-picture-btn');
    dModalAddPictureBtn.addEventListener('click', function (e){
        switchToAddPicturePageModal();
    })

    dWorksContainer.addEventListener('click', async function (e) {
        if (e.target.classList.contains('action-delete-work')) {
            let workId = e.target.parentElement.dataset.id;

             let response = await postData('/works/' + workId, {
                 method: 'DELETE',
                 token: token,
             });

            works = await getJson(APIURL + "/works");
            displayWorks(dWorksContainer, 0, {'displayTrash' : true});
            displayWorks(DGALLERY);
        }
    })
}

async function initPage(){

    works = await getJson(APIURL + "/works");

    displayWorks(DGALLERY);
    displayCategories();

    initFilters();

    token = localStorage.getItem('token')
    if (token){
        initEditMode();
        initModal();
    }
}

initPage()