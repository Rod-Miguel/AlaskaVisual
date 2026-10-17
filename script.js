const links = document.querySelectorAll("#nav a");
const sections = document.querySelectorAll(".view-section");

const vistas = {
    dia: "view-day", semana: "view-week", mes: "view-month"
};

// FUNCION PARA NAVEGACION EN EL #NAV

links.forEach(function (link) {
    link.addEventListener("click", function (event) {
        event.preventDefault();
        const target = link.getAttribute("href").substring(1);

        // 1. Apagar todas las píldoras
        links.forEach(function (item) {
            item.classList.remove("active");
        });

        // 2. Encender la píldora que pulsé
        link.classList.add("active");

        // 3. Apagar todas las secciones
        sections.forEach(function (section) {
            section.classList.remove("active");
        });

        // 4. Encender la sección que corresponde
        const sectionToShow = document.getElementById(vistas[target]);
        sectionToShow.classList.add("active");
    });
});

// FUNCION PARA ACTIVAR DESACTIVA MODO OSCURO

const avatarButton = document.querySelector("#avatar-display");

avatarButton.addEventListener("click", function () {
    console.log("Click en avatar");

    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");

    if (currentTheme === "light") {
        html.setAttribute("data-theme", "dark");
    } else {
        html.setAttribute("data-theme", "light");
    }
});


const PAGO_RESTAURANTE = 1;

const pedidos = [
    { hora: "14:40", aporteCliente: 2.75, repartidor: "Carlos" },
    { hora: "12:15", aporteCliente: 3.50, repartidor: "Miguel" },
    { hora: "19:05", aporteCliente: 4.00, repartidor: "Miguel" },
];

const tbodyDia = document.getElementById("deliveries-table-body");

pedidos.forEach(function (pedido, posicion) {
    const total = pedido.aporteCliente + PAGO_RESTAURANTE;

    let quienEs = pedido.repartidor
    let quienEscolor = "green"

    if (quienEs === "Miguel") {
        quienEs = "Yo";
        quienEscolor = "green";
    } else {
        quienEs = "Compañero";
        quienEscolor = "blue";
    }

    const fila = document.createElement("tr");
    fila.innerHTML = `
    <td>${posicion + 1}</td>
    <td>${pedido.hora}</td>
    <td>${pedido.aporteCliente.toFixed(2) + "$"}</td>
    <td>${PAGO_RESTAURANTE.toFixed(2) + "$"}</td>
    <td>${total.toFixed(2) + "$"}</td>
    <td><span class="tag tag-${quienEscolor}">${quienEs}</span></td>
    `;
    tbodyDia.appendChild(fila);


});

