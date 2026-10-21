/*
 * script.js - Lógica principal del Delivery Analytics Dashboard
 *
 * Este archivo se carga al final del <body> de index.html. Por eso, cuando
 * se ejecuta, todo el HTML ya existe y getElementById / querySelector
 * pueden encontrar sus elementos.
 *
 * Orden de ejecución (de arriba hacia abajo, una sola vez al cargar):
 *   1. Navegación entre vistas (Día / Semana / Mes).
 *   2. Cambio de tema claro / oscuro.
 *   3. Datos de ejemplo del día (arreglo "pedidos").
 *   4. Dibujo de la tabla del día.
 *   5. Cálculo de métricas y escritura de sus valores en las tarjetas.
 *   6. Ciclo de perspectivas de las tarjetas (se activa al hacer clic).
 *
 * Los bloques 1, 2 y 6 solo "programan" eventos: su código interno corre
 * después, cuando el usuario hace clic. Los bloques 3, 4 y 5 corren de
 * inmediato al cargar la página.
 */

/* ============================================================
 * 1. NAVEGACIÓN ENTRE VISTAS (SPA)
 * ============================================================ */

// Los tres enlaces del menú (<a> dentro de <nav id="nav">: Día, Semana, Mes).
const links = document.querySelectorAll("#nav a");
// Las tres secciones de contenido (<section class="view-section"> en index.html).
const sections = document.querySelectorAll(".view-section");

// Diccionario que traduce el href de cada enlace (sin el "#") al id de la
// sección que debe mostrarse. Ejemplo: href="#dia" -> "dia" -> "view-day".
const vistas = {
    dia: "view-day", semana: "view-week", mes: "view-month"
};

// Se recorre cada enlace para programar su clic. Todas las vistas ya están
// en el HTML; aquí solo se decide cuál lleva la clase "active" (en
// styles.css, .view-section sin "active" es display: none).
links.forEach(function (link) {
    link.addEventListener("click", function (event) {
        // Evita el comportamiento por defecto de un enlace con ancla (#dia):
        // saltar a esa posición de la página y cambiar la URL.
        event.preventDefault();
        // "#dia" -> "dia": se quita el primer carácter para obtener la clave
        // que existe en el diccionario "vistas".
        const target = link.getAttribute("href").substring(1);
        // Patrón "apagar todo, encender uno": primero se limpia el estado
        // anterior y luego se marca solo el elemento elegido.
        links.forEach(function (item) {
            item.classList.remove("active");
        });
        link.classList.add("active");
        sections.forEach(function (section) {
            section.classList.remove("active");
        });
        // vistas[target] devuelve el id de la sección. Si el href no tuviera
        // una clave en "vistas", getElementById devolvería null y la línea
        // siguiente produciría un error.
        const sectionToShow = document.getElementById(vistas[target]);
        sectionToShow.classList.add("active");
    });
});

/* ============================================================
 * 2. MODO CLARO / OSCURO
 * ============================================================ */

// El avatar "MR" del header (<button id="avatar-display">) funciona como
// botón de cambio de tema.
const avatarButton = document.querySelector("#avatar-display");

avatarButton.addEventListener("click", function () {
    // document.documentElement es la etiqueta <html>, donde vive el atributo
    // data-theme (el HTML lo inicia en "light").
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");
    // Este código solo cambia el atributo. Los colores cambian porque
    // styles.css redefine sus variables bajo [data-theme="dark"].
    // El tema no se guarda en ningún lugar: al recargar vuelve a "light".
    if (currentTheme === "light") {
        html.setAttribute("data-theme", "dark");
    } else {
        html.setAttribute("data-theme", "light");
    }
});

/* ============================================================
 * 3. DATOS DEL DÍA
 * ============================================================ */

// Aporte fijo del restaurante por cada pedido. Se escribe en mayúsculas por
// convención: es una constante que no debe cambiar mientras corre la app.
const PAGO_RESTAURANTE = 1;
// Usuario que está usando la app. Se compara con pedido.repartidor para
// decidir cuáles pedidos son "míos" y cuáles de "compañeros". Hoy es un
// valor fijo; el código actual no lo obtiene de ninguna sesión o login.
const USUARIO_ACTUAL = "Miguel";

// Arreglo de objetos: cada objeto es un pedido. Son datos de ejemplo escritos
// a mano; el código actual no los lee de ningún servidor ni los guarda.
// Solo se almacena lo que no se puede calcular: el total de cada carrera
// se calcula cuando hace falta (aporteCliente + PAGO_RESTAURANTE).
const pedidos = [
    { hora: "11:30", aporteCliente: 3, repartidor: "Miguel" },
    { hora: "12:45", aporteCliente: 5, repartidor: "Oliver" },
    { hora: "14:10", aporteCliente: 2, repartidor: "Miguel" },
    { hora: "15:25", aporteCliente: 4, repartidor: "Oliver" },
    { hora: "18:00", aporteCliente: 6, repartidor: "Miguel" },
    { hora: "19:50", aporteCliente: 3, repartidor: "Oliver" },
    { hora: "21:15", aporteCliente: 4, repartidor: "Miguel" },
    { hora: "14:40", aporteCliente: 2, repartidor: "Oliver" },
    { hora: "19:05", aporteCliente: 4, repartidor: "Miguel" },
];

/* ============================================================
 * 4. TABLA DEL DÍA
 * ============================================================ */

// <tbody id="deliveries-table-body"> está vacío en el HTML; aquí se le
// agrega una fila por cada pedido.
const tbodyDia = document.getElementById("deliveries-table-body");

// forEach entrega en cada vuelta el pedido y su posición (empieza en 0).
// Las filas salen en el mismo orden del arreglo, sin ordenar por hora.
pedidos.forEach(function (pedido, posicion) {
    const total = pedido.aporteCliente + PAGO_RESTAURANTE;
    // Etiqueta del repartidor: texto y color. Los valores iniciales se
    // reemplazan en ambas ramas del if/else de abajo.
    let quienEs = pedido.repartidor;
    let quienEsColor = "green";
    // Si el pedido es del usuario actual se muestra "Yo" (verde); si no,
    // "Compañero" (azul). Las clases tag-green y tag-blue están en styles.css.
    if (quienEs === USUARIO_ACTUAL) {
        quienEs = "Yo";
        quienEsColor = "green";
    } else {
        quienEs = "Compañero";
        quienEsColor = "blue";
    }
    // La fila <tr> se crea solo en memoria: no se ve hasta que se inserta
    // en el documento (última línea de esta función).
    const fila = document.createElement("tr");
    // Una celda <td> por cada <th> de la tabla, en el mismo orden:
    // #, Hora, Aporte Cliente, Aporte Restaurante, Total Carrera, Repartidor.
    // ${...} inserta el valor de una expresión dentro del texto.
    // toFixed(2) deja 2 decimales pero devuelve texto, por eso solo se usa
    // para mostrar, nunca para calcular.
    // "cell-key-figure" resalta en negrita la cifra clave (el total).
    fila.innerHTML = `
    <td>${posicion + 1}</td>
    <td>${pedido.hora}</td>
    <td>${pedido.aporteCliente.toFixed(2) + "$"}</td>
    <td>${PAGO_RESTAURANTE.toFixed(2) + "$"}</td>
    <td class="cell-key-figure">${total.toFixed(2) + "$"}</td>
    <td><span class="tag tag-${quienEsColor}">${quienEs}</span></td>
    `;
    // appendChild hace visible la fila: la agrega como último hijo del <tbody>.
    tbodyDia.appendChild(fila);
});

/* ============================================================
 * 5. MÉTRICAS DEL DÍA
 * ============================================================
 * Cada métrica se calcula para tres "perspectivas":
 *   - user      -> pedidos de USUARIO_ACTUAL ("mine...")
 *   - coworkers -> pedidos de los demás repartidores ("them...")
 *   - team      -> todos los pedidos juntos ("team...")
 * Los cálculos se hacen UNA vez al cargar la página. Los clics sobre las
 * tarjetas (bloque 6) no recalculan: solo leen estas variables.
 */

// Elementos del HTML donde se escriben las tres métricas de las tarjetas
// superiores (<p class="metric-value"> dentro de cada .metric-card).
const deliveriesAmount = document.getElementById("metric-orders");

const totalIncome = document.getElementById("metric-income");

// --- Ingreso total del equipo ---
// Acumulador: se inicia en 0 fuera del bucle para que no se reinicie en
// cada vuelta. Cada pedido le suma su total.
let finalIncome = 0;

pedidos.forEach(function (pedido) {
    // El "total" de la tabla vive solo dentro de aquel bucle, por eso aquí
    // se vuelve a calcular.
    const total = pedido.aporteCliente + PAGO_RESTAURANTE;
    finalIncome = finalIncome + total;
});

// --- Cantidad de pedidos por grupo (tarjeta "Desempeño del turno") ---
// <p id="mine-orders"> y <p id="them-orders"> muestran la cantidad de
// pedidos del usuario y de sus compañeros.
const currentUserCard = document.getElementById("mine-orders");

const otherUserCard = document.getElementById("them-orders");

// Un contador por grupo, iniciados en 0 fuera del bucle.
let mineOrders = 0;
let themOrders = 0;

pedidos.forEach(function (pedido) {
    // Cada pedido suma 1 al contador del grupo al que pertenece.
    if (pedido.repartidor === USUARIO_ACTUAL) {
        mineOrders = mineOrders + 1;
    } else {
        themOrders = themOrders + 1;
    }
});

// Valor inicial de la tarjeta "Pedidos": se muestra la perspectiva "user"
// porque así empieza data-perspectiva en el HTML. Va después del conteo
// porque necesita que mineOrders ya tenga su valor final.
deliveriesAmount.textContent = mineOrders;

currentUserCard.textContent = mineOrders;
otherUserCard.textContent = themOrders;

// --- Ingresos por grupo ---
// <span id="mine-income"> y <span id="them-income"> muestran el dinero
// acumulado de cada grupo en la tarjeta "Desempeño del turno".
const currentUserCardIncome = document.getElementById("mine-income");
const otherUserCardIncome = document.getElementById("them-income");

let mineIncome = 0;
let themIncome = 0;

pedidos.forEach(function (pedido) {
    // Esta fórmula (aporteCliente + PAGO_RESTAURANTE) aparece en tres
    // bucles del archivo.
    const totalOrder = pedido.aporteCliente + PAGO_RESTAURANTE;
    // El total de la carrera se suma al acumulador del grupo del repartidor.
    if (pedido.repartidor === USUARIO_ACTUAL) {
        mineIncome = mineIncome + totalOrder;
    } else {
        themIncome = themIncome + totalOrder;
    }
});

// Valor inicial de la tarjeta "Ingresos" (perspectiva "user"). El formato
// (2 decimales y "$") se aplica solo al final, cuando la suma ya terminó.
totalIncome.textContent = mineIncome.toFixed(2) + "$";

currentUserCardIncome.textContent = mineIncome.toFixed(2) + "$ acumulados";
otherUserCardIncome.textContent = themIncome.toFixed(2) + "$ acumulados";

// --- Promedio por pedido ---
// Promedio = ingreso total / cantidad de pedidos, calculado por perspectiva.
const deliveriesAverage = document.getElementById("metric-average");

// Los totales del equipo ya se conocen: la cantidad es el largo del arreglo
// y el ingreso es el acumulador finalIncome.
const teamOrders = pedidos.length
const teamIncome = finalIncome
let mineAverage;
let themAverage;
let teamAverage;

// Caso sin pedidos: dividir entre 0 daría Infinity o NaN, así que cada
// perspectiva revisa primero si tiene pedidos y, si no, deja el promedio en 0.
// (El texto "Sin pedidos" que ve el usuario se decide más abajo, al mostrarlo.)
if (mineOrders === 0) {
    mineAverage = 0;
} else {
    mineAverage = mineIncome / mineOrders;
}

if (themOrders === 0) {
    themAverage = 0;
} else {
    themAverage = themIncome / themOrders;
}

if (teamOrders === 0) {
    teamAverage = 0;
} else {
    teamAverage = teamIncome / teamOrders;
}

// Valor inicial de la tarjeta "Promedio Dia" (perspectiva "user"). Usa el mismo
// criterio que el manejador de clic: si el usuario no tiene pedidos se muestra
// "Sin pedidos"; si los tiene, su promedio.
if (mineOrders === 0) {
    deliveriesAverage.textContent = "Sin pedidos";
} else {
    deliveriesAverage.textContent = mineAverage.toFixed(2) + "$";
}

/* ============================================================
 * 6. PERSPECTIVAS INDEPENDIENTES DE LAS TARJETAS
 * ============================================================
 * Cada clic en una tarjeta .metric-card avanza su perspectiva en el ciclo
 * user -> coworkers -> team -> user ...
 *
 * Por qué son independientes: la perspectiva actual de cada tarjeta se
 * guarda en su propio atributo data-perspectiva (en el HTML, cada tarjeta
 * empieza en "user"). No existe una variable global compartida, así que
 * cambiar una tarjeta no afecta a las otras.
 */

// Orden del ciclo. Los textos deben coincidir con los valores que usa
// data-perspectiva y con las comparaciones del manejador de clic.
const perspectivas = ["user", "coworkers", "team"];
// Las 4 tarjetas de la vista Día (clase "metric-card" en index.html).
const metricCards = document.querySelectorAll(".metric-card");

metricCards.forEach(function (card) {
    // Un listener por tarjeta. "change" recibe el evento del clic; el código
    // actual no lo usa.
    card.addEventListener("click", function (change) {
        // card.dataset.perspectiva lee el atributo data-perspectiva del HTML.
        // indexOf devuelve su posición en el ciclo (0, 1 o 2; -1 si no existe).
        const posicionActual = perspectivas.indexOf(card.dataset.perspectiva);
        // El operador % (resto) hace que después de la última posición se
        // vuelva a la primera: (2 + 1) % 3 = 0.
        const siguientePosicion = (posicionActual + 1) % perspectivas.length;
        const siguientePerspectiva = perspectivas[siguientePosicion];
        // Se guarda la nueva perspectiva en la tarjeta: ese es su "estado".
        card.dataset.perspectiva = siguientePerspectiva;
        // Valores a mostrar, iniciados en 0; se reemplazan según la
        // perspectiva y la tarjeta pulsada.
        let ordersToShow = 0;
        let incomeToShow = 0;
        let averageToShow = 0;

        // Se identifica qué tarjeta fue pulsada por su id y se elige el valor
        // ya calculado en el bloque 5 que corresponde a su nueva perspectiva.
        if (card.id === "card-order") {
            if (card.dataset.perspectiva === "user") {
                ordersToShow = mineOrders
            } else if (card.dataset.perspectiva === "coworkers") {
                ordersToShow = themOrders
            } else if (card.dataset.perspectiva === "team") {
                ordersToShow = teamOrders
            }
            deliveriesAmount.textContent = ordersToShow;
        } else if (card.id === "card-income") {
            // Aquí el valor ya se guarda formateado (texto con 2 decimales y "$").
            if (card.dataset.perspectiva === "user") {
                incomeToShow = mineIncome.toFixed(2) + "$"
            } else if (card.dataset.perspectiva === "coworkers") {
                incomeToShow = themIncome.toFixed(2) + "$"
            } else if (card.dataset.perspectiva === "team") {
                incomeToShow = teamIncome.toFixed(2) + "$"
            }
            totalIncome.textContent = incomeToShow
        }
        else if (card.id === "card-average") {
            // Caso sin pedidos: el operador ternario (condición ? A : B)
            // muestra "Sin pedidos" si el grupo tiene 0 pedidos y, si no,
            // el promedio formateado. Así se evita mostrar un 0.00$ engañoso.
            if (card.dataset.perspectiva === "user") {
                averageToShow = mineOrders === 0
                    ? "Sin pedidos"
                    : mineAverage.toFixed(2) + "$";

            } else if (card.dataset.perspectiva === "coworkers") {
                averageToShow = themOrders === 0
                    ? "Sin pedidos"
                    : themAverage.toFixed(2) + "$";

            } else if (card.dataset.perspectiva === "team") {
                averageToShow = teamOrders === 0
                    ? "Sin pedidos"
                    : teamAverage.toFixed(2) + "$";
            }
            deliveriesAverage.textContent = averageToShow;
        }
        // La tarjeta "card-average-week" también recibe este listener, pero
        // no tiene una rama arriba: al pulsarla solo cambia su
        // data-perspectiva y se registra en la consola; su contenido no cambia.

        // Registro de depuración: id de la tarjeta, perspectiva nueva y las
        // posiciones del ciclo antes y después del clic.
        console.log(card.id, card.dataset.perspectiva, posicionActual, siguientePosicion);;
    })
});