const container = document.getElementById('pokemonContainer');
const buscador = document.getElementById('buscador');
const selectOrdenar = document.getElementById('ordenar');

let pokemonesArray = [];

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./serviceworker.js");
    });
}

const fetchPokemones = async () => {
    try {
        const respuesta = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        const datos = await respuesta.json();

        const promesas = datos.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));
        pokemonesArray = await Promise.all(promesas);
        
        mostrarPokemones(pokemonesArray);
    } catch (error) {
        console.error("Error obteniendo Pokémon:", error);
    }
};

const mostrarPokemones = (pokemones) => {
    let html = '';
    pokemones.forEach(pokemon => {
        const imgUrl = pokemon.sprites.other['official-artwork'].front_default;
        const tipoPrincipal = pokemon.types[0].type.name;

        // Aquí cambiamos el onclick para que te lleve a la nueva página pasando el ID
        html += `
            <div class="card" onclick="verDetalles(${pokemon.id})">
                <img src="${imgUrl}" alt="${pokemon.name}" loading="lazy">
                <h2>${pokemon.name}</h2>
                <p>N° ${pokemon.id} | Tipo: ${tipoPrincipal}</p>
            </div>
        `;
    });
    container.innerHTML = html;
};

// Función para cambiar de página
const verDetalles = (id) => {
    window.location.href = `detalles.html?id=${id}`;
};

buscador.addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase();
    const filtrados = pokemonesArray.filter(pokemon => 
        pokemon.name.toLowerCase().includes(texto)
    );
    aplicarOrden(filtrados, selectOrdenar.value);
});

selectOrdenar.addEventListener('change', (e) => {
    const texto = buscador.value.toLowerCase();
    const filtrados = pokemonesArray.filter(pokemon => 
        pokemon.name.toLowerCase().includes(texto)
    );
    aplicarOrden(filtrados, e.target.value);
});

const aplicarOrden = (arreglo, criterio) => {
    let arregloOrdenado = [...arreglo];
    if (criterio === 'numero') {
        arregloOrdenado.sort((a, b) => a.id - b.id);
    } else if (criterio === 'alfabetico') {
        arregloOrdenado.sort((a, b) => a.name.localeCompare(b.name));
    } else if (criterio === 'tipo') {
        arregloOrdenado.sort((a, b) => a.types[0].type.name.localeCompare(b.types[0].type.name));
    }
    mostrarPokemones(arregloOrdenado);
};

fetchPokemones();