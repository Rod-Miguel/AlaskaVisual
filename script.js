// SCRIPT PRINCIPAL DEL DELIVERY ANALYTICS DASHBOARD
// CONTIENE: NAVEGACION ENTRE VISTAS, MODO CLARO/OSCURO, TABLA DEL DIA Y TARJETAS DE METRICAS

// ELEMENTOS DEL DOM QUE USA LA NAVEGACION
// LISTA CON LOS 3 ENLACES DEL MENU (DIA, SEMANA, MES)
const links = document.querySelectorAll("#nav a");
// LISTA CON LAS 3 SECCIONES DE CONTENIDO (view-day, view-week, view-month)
const sections = document.querySelectorAll(".view-section");

// DICCIONARIO QUE TRADUCE EL href DE CADA ENLACE (SIN EL #) AL id DE SU SECCION
// CLAVE = TEXTO DEL href, VALOR = id DE LA SECCION QUE SE DEBE MOSTRAR
const vistas = {
    dia: "view-day", semana: "view-week", mes: "view-month"
};

// NAVEGACION ENTRE VISTAS (SPA): CAMBIA LA SECCION VISIBLE SIN RECARGAR LA PAGINA
// SE RECORRE CADA ENLACE DEL MENU PARA PROGRAMAR SU CLIC
links.forEach(function (link) {
    // DEJA PROGRAMADO EL CLIC: LA FUNCION INTERNA SOLO SE EJECUTA CUANDO ALGUIEN PULSA EL ENLACE
    link.addEventListener("click", function (event) {
        // CANCELA EL SALTO AL ANCLA (#dia, #semana, #mes) QUE HARIA EL NAVEGADOR POR DEFECTO
        event.preventDefault();
        // LEE EL href DEL ENLACE PULSADO Y LE QUITA EL # ("#dia" PASA A "dia")
        const target = link.getAttribute("href").substring(1);
        // PASO 1: APAGA LAS PILDORAS, QUITANDO LA CLASE active A TODOS LOS ENLACES DEL MENU
        links.forEach(function (item) {
            item.classList.remove("active");
        });
        // PASO 2: ENCIENDE SOLO LA PILDORA PULSADA
        link.classList.add("active");
        // PASO 3: APAGA TODAS LAS SECCIONES, QUITANDO LA CLASE active
        sections.forEach(function (section) {
            section.classList.remove("active");
        });
        // PASO 4: ENCIENDE LA SECCION QUE CORRESPONDE
        // vistas[target] DEVUELVE EL id DE LA SECCION Y getElementById LA BUSCA (SIN #)
        const sectionToShow = document.getElementById(vistas[target]);
        sectionToShow.classList.add("active");
    });
});

// MODO CLARO / OSCURO: EL AVATAR DEL HEADER ES EL BOTON QUE ALTERNA EL TEMA
const avatarButton = document.querySelector("#avatar-display");

avatarButton.addEventListener("click", function () {
    // ETIQUETA <html>: AHI VIVE EL ATRIBUTO data-theme QUE LEE EL CSS
    const html = document.documentElement;
    // LEE EL TEMA ACTUAL ("light" O "dark")
    const currentTheme = html.getAttribute("data-theme");
    // SI EL TEMA ES CLARO PASA A OSCURO; EN CUALQUIER OTRO CASO VUELVE A CLARO
    // EL CSS REACCIONA SOLO PORQUE [data-theme="dark"] REDEFINE LAS VARIABLES DE COLOR
    if (currentTheme === "light") {
        html.setAttribute("data-theme", "dark");
    } else {
        html.setAttribute("data-theme", "light");
    }
});

// DATOS DEL DIA
// APORTE FIJO DEL RESTAURANTE POR PEDIDO (EN MAYUSCULAS: CONSTANTE QUE NO CAMBIA)
const PAGO_RESTAURANTE = 1;
// USUARIO QUE USA LA APP: SE COMPARA CON pedido.repartidor PARA SABER CUALES SON "MIS" PEDIDOS
// CUANDO EXISTA EL LOGIN, SU VALOR VENDRA DE LA SESION DEL USUARIO (FASES 3 Y 4 DEL ROADMAP)
const USUARIO_ACTUAL = "Miguel";

// ARREGLO DE OBJETOS: CADA OBJETO ES UN PEDIDO
// SOLO SE GUARDA LO QUE NO SE PUEDE CALCULAR: EL TOTAL SE CALCULA CUANDO SE NECESITA
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

// TABLA DEL DIA: DIBUJA UNA FILA POR CADA PEDIDO DEL ARREGLO
// <tbody> DONDE SE AGREGAN LAS FILAS (EN EL HTML EXISTE VACIO)
const tbodyDia = document.getElementById("deliveries-table-body");

// forEach ENTREGA EL PEDIDO DE CADA VUELTA Y SU POSICION EN LA LISTA (LA POSICION EMPIEZA EN 0)
pedidos.forEach(function (pedido, posicion) {
    // TOTAL DE LA CARRERA = APORTE DEL CLIENTE + APORTE DEL RESTAURANTE
    const total = pedido.aporteCliente + PAGO_RESTAURANTE;
    // TEXTO Y COLOR DE LA ETIQUETA DEL REPARTIDOR (COLOR VERDE POR DEFECTO)
    let quienEs = pedido.repartidor;
    let quienEsColor = "green";
    // SI EL REPARTIDOR ES USUARIO_ACTUAL SE MUESTRA COMO "Yo" EN VERDE
    // SI ES CUALQUIER OTRO SE MUESTRA COMO COMPANERO EN AZUL
    if (quienEs === USUARIO_ACTUAL) {
        quienEs = "Yo";
        quienEsColor = "green";
    } else {
        quienEs = "Compañero";
        quienEsColor = "blue";
    }
    // CREA LA FILA <tr> SOLO EN MEMORIA: TODAVIA NO SE VE EN LA PAGINA
    const fila = document.createElement("tr");
    // DEFINE EL CONTENIDO DE LA FILA: UNA CELDA <td> POR COLUMNA, EN EL MISMO ORDEN QUE LOS <th>
    // posicion + 1 PARA QUE LA NUMERACION EMPIECE EN 1
    // toFixed(2) DEJA 2 DECIMALES Y DEVUELVE TEXTO, POR ESO SE USA SOLO PARA MOSTRAR
    // LA CLASE DEL COLOR SE ARMA UNIENDO "tag-" CON "green" O "blue"
    fila.innerHTML = `
    <td>${posicion + 1}</td>
    <td>${pedido.hora}</td>
    <td>${pedido.aporteCliente.toFixed(2) + "$"}</td>
    <td>${PAGO_RESTAURANTE.toFixed(2) + "$"}</td>
    <td class="cell-key-figure">${total.toFixed(2) + "$"}</td>
    <td><span class="tag tag-${quienEsColor}">${quienEs}</span></td>
    `;
    // ENGANCHA LA FILA COMO ULTIMO HIJO DEL <tbody>: ESTE PASO ES EL QUE LA HACE VISIBLE
    tbodyDia.appendChild(fila);
});

// TARJETAS DE METRICAS DEL DIA: ESCRIBEN VALORES CALCULADOS DENTRO DEL HTML
// TARJETA PEDIDOS: LA CANTIDAD DE PEDIDOS ES EL LARGO DEL ARREGLO
const deliveriesAmount = document.getElementById("metric-orders");
// textContent REEMPLAZA EL TEXTO QUE TENIA ESE ELEMENTO
deliveriesAmount.textContent = pedidos.length;

// TARJETA INGRESOS: SUMA EL TOTAL DE TODOS LOS PEDIDOS
const totalIncome = document.getElementById("metric-income");

// ACUMULADOR: ARRANCA EN 0 FUERA DEL BUCLE PARA QUE NO SE REINICIE EN CADA VUELTA
let finalIncome = 0;

pedidos.forEach(function (pedido) {
    // SE RECALCULA EL TOTAL PORQUE EL total DE LA TABLA SOLO EXISTE DENTRO DE ESE BUCLE
    const total = pedido.aporteCliente + PAGO_RESTAURANTE;
    // LA CAJA SE VALE A SI MISMA MAS EL TOTAL DE ESTE PEDIDO
    finalIncome = finalIncome + total;
});

// EL FORMATO (2 DECIMALES Y $) SE APLICA UNA SOLA VEZ AL FINAL, CUANDO LA SUMA YA TERMINO
totalIncome.textContent = finalIncome.toFixed(2) + "$";

// TARJETA PROMEDIO DIA: PROMEDIO POR PEDIDO = INGRESO TOTAL / CANTIDAD DE PEDIDOS
const deliveriesAverage = document.getElementById("metric-average");

// TODO: SI NO HAY PEDIDOS (pedidos.length === 0) ESTA DIVISION DA NaN, FALTA PROTEGER ESE CASO
const theAverage = finalIncome / pedidos.length;

deliveriesAverage.textContent = theAverage.toFixed(2) + "$";

// TARJETA DESEMPENO DEL TURNO: CANTIDAD DE PEDIDOS Y DINERO ACUMULADO POR REPARTIDOR
// "MIS PEDIDOS" = pedido.repartidor IGUAL A USUARIO_ACTUAL; "COMPANEROS" = TODOS LOS DEMAS
// ELEMENTOS <p> DONDE SE ESCRIBE LA CANTIDAD DE PEDIDOS DE CADA GRUPO
const currentUserCard = document.getElementById("mine-orders");
// TODO: BORRAR LOS console.log DE PRUEBA (EL SEGUNDO IMPRIME currentUserCard EN VEZ DE otherUserCard)
console.log(currentUserCard.textContent);

const otherUserCard = document.getElementById("them-orders");
console.log(currentUserCard.textContent);

// DOS CONTADORES, UNO POR GRUPO: ARRANCAN EN 0 FUERA DEL BUCLE
let mineOrders = 0;
let themOrders = 0;

// CADA PEDIDO SUMA 1 AL CONTADOR DEL GRUPO AL QUE PERTENECE
pedidos.forEach(function (pedido) {
    if (pedido.repartidor === USUARIO_ACTUAL) {
        mineOrders = mineOrders + 1;
    } else {
        themOrders = themOrders + 1;
    }
});

// ESCRIBE LOS CONTADORES EN SUS TARJETAS
currentUserCard.textContent = mineOrders;
otherUserCard.textContent = themOrders;

// ELEMENTOS <span> DONDE SE ESCRIBE EL DINERO ACUMULADO DE CADA GRUPO
const currentUserCardIncome = document.getElementById("mine-income");
const otherUserCardIncome = document.getElementById("them-income");

// DOS ACUMULADORES DE DINERO, UNO POR GRUPO
let mineIncome = 0;
let otherIncome = 0;

pedidos.forEach(function (pedido) {
    // TODO: ESTA FORMULA (aporteCliente + PAGO_RESTAURANTE) YA ESTA EN 3 SITIOS: CANDIDATA A UNA FUNCION
    const totalOrder = pedido.aporteCliente + PAGO_RESTAURANTE;
    // EL TOTAL DE LA CARRERA SE SUMA AL ACUMULADOR DEL GRUPO DEL REPARTIDOR
    if (pedido.repartidor === USUARIO_ACTUAL) {
        mineIncome = mineIncome + totalOrder;
    } else {
        otherIncome = otherIncome + totalOrder;
    }
});

// FORMATO FINAL: 2 DECIMALES Y TEXTO "acumulados"
currentUserCardIncome.textContent = mineIncome.toFixed(2) + "$ acumulados";
otherUserCardIncome.textContent = otherIncome.toFixed(2) + "$ acumulados";