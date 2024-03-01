const gallery = document.querySelector("#portfolio > .gallery")
async function getJson(url) {
    const response = await fetch(url);
    return await response.json();
}

async function displayWorks(){
    let works = await getJson("http://localhost:5678/api/works");

    works.forEach((e) => {
            const figure = document.createElement("figure");

            const img = document.createElement("img");
            img.src = e.imageUrl;
            img.alt = e.title;

            const caption = document.createElement("figcaption");
            caption.innerText = e.title;

            figure.appendChild(img);
            figure.appendChild(caption)

            gallery.appendChild(figure);
        }
    )
}

displayWorks().catch((error) => console.log(error));