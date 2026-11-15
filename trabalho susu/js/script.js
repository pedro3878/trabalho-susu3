const CHAVE_CARRINHO = "realeza_carrinho";
const IMAGEM_PADRAO = "unnamed.png";

const produtos = {
    "DUPLO CHEDDAR BACON": { preco: 49.90, imagem: "HAMBURGUER OPÇAO 1.avif" },
    "REALEZA MOLHO ESPECIAL": { preco: 49.90, imagem: "HAMBURGUER OPÇAO 2.avif" },
    "AMERICAN BURGUER": { preco: 55.00, imagem: "HAMBURGUER OPÇAO 3.avif" },
    "REI DA CASA": { preco: 55.00, imagem: "HAMBUGER MEIO.avif" }
};

function imagemDoProduto(nome, alternativa) {
    return produtos[chaveProduto(nome)]?.imagem || alternativa || IMAGEM_PADRAO;
}

let carrinho = carregarCarrinho();
let timerAviso = null;

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function chaveProduto(nome) {
    return String(nome).trim().toUpperCase();
}

function carregarCarrinho() {
    try {
        const salvo = JSON.parse(localStorage.getItem(CHAVE_CARRINHO));
        return Array.isArray(salvo) ? salvo : [];
    } catch (erro) {
        return [];
    }
}

function salvarCarrinho() {
    try {
        localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
    } catch (erro) {}
}

function adicionarAoCarrinho(nome, preco, imagem) {
    const chave = chaveProduto(nome);
    const catalogo = produtos[chave];

    const precoFinal = Number(preco ?? catalogo?.preco ?? 0);
    const imagemFinal = imagemDoProduto(chave, imagem);

    const item = carrinho.find(p => chaveProduto(p.nome) === chave);

    if (item) {
        item.quantidade += 1;
    } else {
        carrinho.push({
            nome: chave,
            preco: precoFinal,
            imagem: imagemFinal,
            quantidade: 1
        });
    }

    atualizarCarrinho();
    mostrarAviso(`${chave} adicionado ao carrinho!`);
}

function comprarAgora(nome, preco, imagem) {
    adicionarAoCarrinho(nome, preco, imagem);
    abrirCarrinho();
}

function alterarQuantidade(indice, variacao) {
    if (!carrinho[indice]) return;

    carrinho[indice].quantidade += variacao;

    if (carrinho[indice].quantidade <= 0) {
        carrinho.splice(indice, 1);
    }

    atualizarCarrinho();
}

function removerDoCarrinho(indice) {
    carrinho.splice(indice, 1);
    atualizarCarrinho();
}

function atualizarCarrinho() {
    salvarCarrinho();

    const lista = document.getElementById("lista-itens-carrinho");
    const totalEl = document.getElementById("valor-total-carrinho");
    const contador = document.getElementById("contador-carrinho");

    const total = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
    const quantidade = carrinho.reduce((soma, item) => soma + item.quantidade, 0);

    if (totalEl) totalEl.textContent = formatarMoeda(total);
    if (contador) contador.textContent = quantidade;
    if (!lista) return;

    if (carrinho.length === 0) {
        lista.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
        return;
    }

    lista.innerHTML = "";

    carrinho.forEach((item, indice) => {
        const elemento = document.createElement("article");
        elemento.className = "item-carrinho";

        const imagem = document.createElement("img");

        imagem.src = imagemDoProduto(item.nome, item.imagem);
        imagem.alt = item.nome;
        imagem.onerror = () => {
            imagem.onerror = null;
            imagem.src = IMAGEM_PADRAO;
        };

        const informacoes = document.createElement("div");

        const nome = document.createElement("p");
        nome.className = "item-carrinho-nome";
        nome.textContent = item.nome;

        const preco = document.createElement("p");
        preco.className = "item-carrinho-preco";
        preco.textContent = formatarMoeda(item.preco * item.quantidade);

        const controles = document.createElement("div");
        controles.className = "controles-quantidade";

        const diminuir = document.createElement("button");
        diminuir.type = "button";
        diminuir.textContent = "−";
        diminuir.setAttribute("aria-label", "Diminuir quantidade");
        diminuir.onclick = () => alterarQuantidade(indice, -1);

        const qtd = document.createElement("span");
        qtd.textContent = item.quantidade;

        const aumentar = document.createElement("button");
        aumentar.type = "button";
        aumentar.textContent = "+";
        aumentar.setAttribute("aria-label", "Aumentar quantidade");
        aumentar.onclick = () => alterarQuantidade(indice, 1);

        controles.append(diminuir, qtd, aumentar);
        informacoes.append(nome, preco, controles);

        const remover = document.createElement("button");
        remover.type = "button";
        remover.className = "remover-item";
        remover.textContent = "×";
        remover.setAttribute("aria-label", "Remover item");
        remover.onclick = () => removerDoCarrinho(indice);

        elemento.append(imagem, informacoes, remover);
        lista.appendChild(elemento);
    });
}

function abrirCarrinho() {
    document.getElementById("fundo-carrinho")?.classList.add("aberto");
    document.getElementById("gaveta-carrinho")?.classList.add("aberto");
}

function fecharCarrinho() {
    document.getElementById("fundo-carrinho")?.classList.remove("aberto");
    document.getElementById("gaveta-carrinho")?.classList.remove("aberto");
}

function finalizarPedido() {
    if (carrinho.length === 0) {
        mostrarAviso("Adicione pelo menos um lanche antes de finalizar.");
        return;
    }

    mostrarAviso("Pedido demonstrativo concluído! Esta versão ainda não envia pedidos para uma cozinha.");

    carrinho = [];
    atualizarCarrinho();
    fecharCarrinho();
}

function mostrarAviso(texto) {
    const aviso = document.getElementById("aviso-flutuante");
    if (!aviso) return;

    aviso.textContent = texto;
    aviso.classList.add("visivel");

    clearTimeout(timerAviso);
    timerAviso = setTimeout(() => aviso.classList.remove("visivel"), 3000);
}

function iniciarPaginaProduto() {
    const nomeEl = document.getElementById("detalhe-nome");
    if (!nomeEl) return;

    const params = new URLSearchParams(window.location.search);
    const chave = chaveProduto(params.get("nome") || "AMERICAN BURGUER");
    const catalogo = produtos[chave];

    const precoParam = parseFloat(params.get("preco"));
    const preco = !isNaN(precoParam) ? precoParam : (catalogo?.preco ?? 55.00);
    const imagem = params.get("img") || imagemDoProduto(chave);

    nomeEl.textContent = chave;
    document.title = `Burger Realeza - ${chave}`;

    const precoEl = document.getElementById("detalhe-preco");
    if (precoEl) precoEl.textContent = formatarMoeda(preco);

    const imgEl = document.getElementById("detalhe-img");
    if (imgEl) {
        imgEl.src = imagem;
        imgEl.alt = chave;
    }

    const btnCarrinho = document.getElementById("btn-detalhe-carrinho");
    if (btnCarrinho) btnCarrinho.onclick = () => adicionarAoCarrinho(chave, preco, imagem);

    const btnComprar = document.getElementById("btn-detalhe-comprar");
    if (btnComprar) btnComprar.onclick = () => comprarAgora(chave, preco, imagem);
}

function aplicarMascaraCPF(valor) {
    return valor.replace(/\D/g, "").slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function aplicarMascaraCEP(valor) {
    return valor.replace(/\D/g, "").slice(0, 8)
        .replace(/^(\d{5})(\d)/, "$1-$2");
}

function salvarCadastro(event) {
    event.preventDefault();

    const nome = document.getElementById("input-nome").value.trim();
    const email = document.getElementById("input-email").value.trim();
    const cpf = document.getElementById("input-cpf").value.trim();
    const cep = document.getElementById("input-cep").value.trim();

    if (
        !nome ||
        !email ||
        cpf.replace(/\D/g, "").length !== 11 ||
        cep.replace(/\D/g, "").length !== 8
    ) {
        mostrarAviso("Confira o nome, e-mail, CPF e CEP informados.");
        return;
    }

    mostrarAviso(`Cadastro demonstrativo concluído. Bem-vindo à Realeza, ${nome}!`);
    document.getElementById("form-cadastro").reset();

    setTimeout(() => {
        window.location.href = "index.html";
    }, 1800);
}

function iniciarCadastro() {
    const cpf = document.getElementById("input-cpf");
    const cep = document.getElementById("input-cep");

    cpf?.addEventListener("input", e => {
        e.target.value = aplicarMascaraCPF(e.target.value);
    });

    cep?.addEventListener("input", e => {
        e.target.value = aplicarMascaraCEP(e.target.value);
    });
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape") fecharCarrinho();
});

document.addEventListener("DOMContentLoaded", () => {
    iniciarPaginaProduto();
    iniciarCadastro();
    atualizarCarrinho();
});