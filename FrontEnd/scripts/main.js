const APIURL = "http://localhost:5678/api";

const DEDITBANNER = document.getElementById('edit-banner');
const DHEADER = document.querySelector('header');
const DLOGIN = document.getElementById('login');
const DFILTERS = document.querySelector("#portfolio > .filters-container");
const DGALLERY = document.querySelector("#portfolio > .gallery");

let token = null;

let works = [];
let categories = [];
let selectedFile = null;

async function getJson(url) {
    const response = await fetch(url);
    return await response.json();
}

async function postData(relativeUrl, data = {}) {
    const url = APIURL + relativeUrl;
    const method = data.method || "POST";
    const token = data.token || null;
    const contentType = data.contentType || "application/json";
    const body = data.body || null;

    const response = await fetch(url, {
        method: method,
        headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            //'Content-Type': contentType
        },
        body: body
    });

    return response
}

async function displayCategories(categoryInput = null){
    if (categoryInput) {
        categoryInput.innerHTML = "";
    }

    categories.forEach((category) => {
        if (categoryInput) {

            let newOption = document.createElement('option')
            newOption.value = category.id;
            newOption.innerText = category.name;

            categoryInput.appendChild(newOption);
            return;
        }

        let filterButton = document.createElement("button");
        filterButton.setAttribute('data-id', category.id);
        filterButton.innerText = category.name;

        DFILTERS.appendChild(filterButton);
    })
}

async function displayWorks(element, categoryId = 0, options = {}){

    let currentWorks = [];

    // Verifie si une categorie est spécifié si oui filtre les travaux
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

    const dGalleryModal = document.getElementById('gallery-modal');
    dGalleryModal.classList.add('d-none');

    const dAddPictureModal = document.getElementById('add-picture-modal');
    dAddPictureModal.classList.remove('d-none');

}

function resetAddPicturePageModal(dErrorMessage, dAddPictureModal, dPictureNotSelected, dSelectedPicture) {
    selectedFile = null;
    document.getElementById('title-input').value = null;
    dErrorMessage.classList.add('d-none');
    dAddPictureModal.classList.add('d-none');
    dPictureNotSelected.classList.remove('d-none');
    dSelectedPicture.classList.add('d-none');
}

function initModals(){

    const dModal = document.querySelector('.modal');
    const dModalWorksContainer = document.querySelector('.works-container');

    const dGalleryModal = document.getElementById('gallery-modal');

    const dModalStartBtn = document.getElementById('modal-open-btn');
    dModalStartBtn.classList.remove('d-none');
    dModalStartBtn.addEventListener('click', function (e){
        dModal.classList.remove('d-none');
        displayWorks(dModalWorksContainer, 0, {'displayTrash' : true});
    })

    let dModalCloseBtn = document.getElementById('gallery-modal-close-btn');
    dModalCloseBtn.addEventListener('click', function (e){
        dModal.classList.add('d-none');
    })

    const dModalAddPictureBtn = document.getElementById('add-picture-btn');
    dModalAddPictureBtn.addEventListener('click', function (e){
        switchToAddPicturePageModal();
    })

    dModalWorksContainer.addEventListener('click', async function (e) {
        if (e.target.classList.contains('action-delete-work')) {
            let workId = e.target.parentElement.dataset.id;

             let response = await postData('/works/' + workId, {
                 method: 'DELETE',
                 token: token,
             });

            works = await getJson(APIURL + "/works");
            displayWorks(dModalWorksContainer, 0, {'displayTrash' : true});
            displayWorks(DGALLERY);
        }
    })


    // Init add picture modal

    const dAddPictureModal = document.getElementById('add-picture-modal');

    const dErrorMessage = document.querySelector('#add-picture-modal .error-message');

    const dPictureNotSelected = document.querySelector('.picture-not-selected');
    const dSelectedPicture = document.querySelector('.select-picture img');

    displayCategories(document.getElementById('category-input'));

    const dFileInput = document.getElementById('fileInput');
    dFileInput.addEventListener('change', function (e) {

        if (this.files[0].size > 4000000) {
            console.log('file to large');
            return;
        }

        selectedFile = this.files[0];
        dFileInput.value = '';

        const dPictureNotSelected = document.querySelector('.picture-not-selected');
        dPictureNotSelected.classList.add('d-none');

        const reader = new FileReader();
        reader.onload = function (e) {
            dSelectedPicture.src = e.target.result;
        }
        reader.readAsDataURL(selectedFile);

        dSelectedPicture.classList.remove('d-none');
    })

    const dSelectPictureBtn = document.getElementById('select-picture-btn');
    dSelectPictureBtn.addEventListener('click', function (e){
        e.preventDefault();
        dFileInput.click();
    })

    document.getElementById('add-picture-submit-btn').addEventListener('click', async function (e){

       const formData = new FormData;
        formData.append('title', document.getElementById('title-input').value);
        formData.append('category', document.getElementById('category-input').value);
        formData.append('image', selectedFile);

        if (selectedFile == null || formData.get('title') === '') {
            dErrorMessage.innerText = 'Erreur : Formulaire invalide';
            dErrorMessage.classList.remove('d-none');
            return false;
        }

        console.log(await postData('/works', {
            token: token,
            contentType: 'multipart/form-data',
            body: formData
        }));

        dPictureNotSelected.classList.remove('d-none');
        dSelectedPicture.classList.add('d-none');

        works = await getJson(APIURL + "/works");

        displayWorks(DGALLERY);
        displayWorks(dModalWorksContainer, 0, {'displayTrash' : true});

        resetAddPicturePageModal(dErrorMessage, dAddPictureModal, dPictureNotSelected, dSelectedPicture);
        dGalleryModal.classList.remove('d-none');
    })

    const dBackBtn = document.getElementById('add-picture-back-btn');
    dBackBtn.addEventListener('click', function (e){
        dAddPictureModal.classList.add('d-none');
        dGalleryModal.classList.remove('d-none');
        dErrorMessage.classList.add('d-none');
    })

    dModalCloseBtn = document.getElementById('add-picture-modal-close-btn');
    dModalCloseBtn.addEventListener('click', function (e){
        resetAddPicturePageModal(dErrorMessage, dAddPictureModal, dPictureNotSelected, dSelectedPicture);
        dModal.classList.add('d-none');
        dGalleryModal.classList.remove('d-none');
        dErrorMessage.classList.add('d-none');
    })
}

async function initPage(){

    works = await getJson(APIURL + "/works");
    categories = await getJson(APIURL + "/categories");

    displayWorks(DGALLERY);
    displayCategories();

    initFilters();

    token = localStorage.getItem('token')
    if (token){
        initEditMode();
        initModals();
    }
}

initPage()