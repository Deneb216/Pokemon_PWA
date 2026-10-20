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

// ==========================================
// LÓGICA DE INSTALACIÓN DE LA PWA
// ==========================================
let eventoInstalacion;
const btnInstalar = document.getElementById('btnInstalar');

// 1. Escuchar si el navegador permite instalar la app
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir que el navegador muestre su propio cuadro de diálogo automático
    e.preventDefault();
    // Guardar el evento para usarlo cuando el usuario presione nuestro botón
    eventoInstalacion = e;
    
    // Como ya confirmamos que se puede instalar, mostramos nuestro botón
    btnInstalar.style.display = 'block';
});

// 2. ¿Qué pasa cuando el usuario hace clic en nuestro botón?
btnInstalar.addEventListener('click', async () => {
    if (!eventoInstalacion) return;

    // Mostrar el cuadro de diálogo nativo de instalación
    eventoInstalacion.prompt();

    // Esperar a ver qué decide el usuario (Aceptar o Cancelar)
    const { outcome } = await eventoInstalacion.userChoice;
    console.log(`El usuario decidió: ${outcome}`);

    // Limpiamos la variable porque el prompt solo se puede usar una vez
    eventoInstalacion = null;
    
    // Ocultamos el botón para que ya no estorbe
    btnInstalar.style.display = 'none';
});

// 3. Escuchar cuando la app se instale exitosamente (por si la instalan desde los 3 puntitos)
window.addEventListener('appinstalled', () => {
    console.log('¡La PWA fue instalada correctamente!');
    // Nos aseguramos de que el botón desaparezca permanentemente
    btnInstalar.style.display = 'none';
});