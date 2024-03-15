const APIURL = "http://localhost:5678/api";

const DFORM = document.querySelector('form');
const DLOGINSECTION = document.getElementById('login');


// Exemple d'implémentation pour une requête POST
async function postData(url = "", data = {}) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}

DFORM.addEventListener('submit', async function(e) {
    e.preventDefault();

    const urlLogin = APIURL + '/users/login'

    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    let response = await postData(urlLogin, {
        email: email,
        password: password
    })

    console.log(response)
    if (response['userId'] && response['token']) {
        let token = response['token'];

        localStorage.setItem('user', response['user'])
        localStorage.setItem('token', response['token']);

        document.location.href = "./index.html";
    } else {
        let errorMessage = document.createElement('span');
        errorMessage.setAttribute('class', 'error-message')
        errorMessage.innerText = "Informations incorectes veuillez réessayer";

        DLOGINSECTION.insertBefore(errorMessage, DFORM);
    }
})