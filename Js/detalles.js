// Obtener el ID de la URL (ejemplo: detalles.html?id=25)
const urlParams = new URLSearchParams(window.location.search);
const pokemonId = urlParams.get('id');

const nombrePokemon = document.getElementById('nombrePokemon');
const contenedorDetalles = document.getElementById('contenedorDetalles');
const btnVolver = document.getElementById('btnVolver');

btnVolver.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Consumir la API para ese Pokémon específico (Funcionará offline gracias al SW)
const cargarDetalles = async () => {
    if (!pokemonId) {
        contenedorDetalles.innerHTML = "<p>Pokémon no encontrado.</p>";
        return;
    }

    try {
        const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`);
        const pokemon = await respuesta.json();

        nombrePokemon.innerText = pokemon.name;
        const imgUrl = pokemon.sprites.other['official-artwork'].front_default;
        
        let tiposHtml = '';
        pokemon.types.forEach(t => {
            tiposHtml += `<span class="tipo-badge">${t.type.name}</span>`;
        });

        contenedorDetalles.innerHTML = `
            <img src="${imgUrl}" alt="${pokemon.name}">
            <h2>N° ${pokemon.id}</h2>
            <div class="tipos-container">${tiposHtml}</div>
            <div class="estadisticas">
                <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
                <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
                <p><strong>Habilidad principal:</strong> ${pokemon.abilities[0].ability.name}</p>
                <p><strong>Experiencia Base:</strong> ${pokemon.base_experience}</p>
            </div>
        `;
    } catch (error) {
        console.error("Error al cargar detalles:", error);
        contenedorDetalles.innerHTML = "<p>Error al cargar la información.</p>";
    }
};

cargarDetalles();