// Lê referencias.md (editado à mão, pelo celular) e monta um cartão por
// story: "## [data ·] título", linhas de texto e "- " fontes ([texto](url)
// ou só a url). A ordem é a do arquivo: o mais recente vai no topo.

const lista = document.getElementById("lista");
const busca = document.getElementById("busca");

// Nome amigável dos veículos mais comuns; o resto mostra o domínio.
const VEICULOS = {
  "folha.uol.com.br": "Folha de S.Paulo", "g1.globo.com": "g1", "oglobo.globo.com": "O Globo", "extra.globo.com": "Extra",
  "estadao.com.br": "Estadão", "uol.com.br": "UOL", "cnnbrasil.com.br": "CNN Brasil",
  "bbc.com": "BBC", "poder360.com.br": "Poder360", "metropoles.com": "Metrópoles",
  "valor.globo.com": "Valor Econômico", "agenciabrasil.ebc.com.br": "Agência Brasil",
  "tse.jus.br": "TSE", "camara.leg.br": "Câmara dos Deputados", "senado.leg.br": "Senado",
  "gov.br": "gov.br", "ibge.gov.br": "IBGE", "aosfatos.org": "Aos Fatos", "lupa.uol.com.br": "Lupa", "midianinja.org": "Mídia NINJA", "terra.com.br": "Terra", "conjur.com.br": "Conjur", "gazetadopovo.com.br": "Gazeta do Povo", "congressoemfoco.com.br": "Congresso em Foco", "istoe.com.br": "IstoÉ", "cartacapital.com.br": "CartaCapital", "em.com.br": "Estado de Minas", "correiobraziliense.com.br": "Correio Braziliense",
  "piaui.folha.uol.com.br": "piauí", "exame.com": "Exame", "infomoney.com.br": "InfoMoney",
  "youtube.com": "YouTube", "youtu.be": "YouTube", "x.com": "X", "twitter.com": "X", "instagram.com": "Instagram",
};

function veiculo(url) {
  let host;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
  // o mais específico primeiro: piaui.folha.uol.com.br antes de folha.uol.com.br
  const conhecido = Object.keys(VEICULOS)
    .filter((d) => host === d || host.endsWith("." + d))
    .sort((a, b) => b.length - a.length)[0];
  return conhecido ? VEICULOS[conhecido] : host;
}

function parse(texto) {
  const semComentarios = texto.replace(/<!--[\s\S]*?-->/g, "");
  const stories = [];
  let atual = null;
  for (const bruta of semComentarios.split(/\r?\n/)) {
    const linha = bruta.trim();
    if (!linha || /^#\s/.test(linha)) continue; // título do arquivo
    const titulo = linha.match(/^##\s+(.*)$/);
    if (titulo) {
      const m = titulo[1].match(/^(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s*[·•|—–-]\s*(.*)$/);
      atual = { data: m ? m[1] : "", titulo: (m ? m[2] : titulo[1]).trim(), texto: [], fontes: [] };
      stories.push(atual);
      continue;
    }
    if (!atual) continue;
    const item = linha.match(/^[-*]\s+(.*)$/);
    if (item) {
      const link = item[1].match(/^\[(.+?)\]\((\S+?)\)\s*(.*)$/);
      const url = link ? link[2] : (item[1].match(/https?:\/\/\S+/) || [""])[0];
      if (!url) {
        atual.texto.push(item[1]);
        continue;
      }
      const resto = link ? link[3] : item[1].replace(url, "").trim();
      atual.fontes.push({ url, texto: link ? link[1] : "", nota: resto });
    } else {
      atual.texto.push(linha);
    }
  }
  return stories;
}

function el(tag, attrs = {}, ...filhos) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else e.setAttribute(k, v);
  }
  for (const f of filhos) if (f !== null && f !== "") e.append(f);
  return e;
}

function cartao(story) {
  const fontes = el("ul", { class: "fontes" });
  for (const f of story.fontes) {
    const nome = veiculo(f.url);
    fontes.append(
      el("li", {},
        el("a", { href: f.url, target: "_blank", rel: "noopener noreferrer" },
          el("span", { class: "veiculo" }, nome),
          el("span", { class: "titulo-fonte" }, f.texto || f.url),
        ),
        f.nota ? el("span", { class: "nota" }, f.nota) : "",
      ),
    );
  }
  return el("article", { class: "story" },
    story.data ? el("time", { class: "data" }, story.data) : "",
    el("h2", {}, story.titulo),
    ...story.texto.map((t) => el("p", { class: "contexto" }, t)),
    story.fontes.length ? fontes : el("p", { class: "aviso" }, "Fontes em breve."),
  );
}

let todos = [];

function render() {
  const termo = busca.value.trim().toLocaleLowerCase("pt-BR");
  const filtrados = !termo ? todos : todos.filter((s) =>
    [s.data, s.titulo, ...s.texto, ...s.fontes.flatMap((f) => [f.texto, f.url, f.nota, veiculo(f.url)])]
      .join(" ").toLocaleLowerCase("pt-BR").includes(termo));
  lista.replaceChildren(
    ...(filtrados.length
      ? filtrados.map(cartao)
      : [el("p", { class: "aviso" }, todos.length ? "Nada encontrado com essa busca." : "Nenhuma referência publicada ainda.")]),
  );
}

busca.addEventListener("input", render);

fetch("referencias.md", { cache: "no-store" })
  .then((r) => {
    if (!r.ok) throw new Error(r.status);
    return r.text();
  })
  .then((texto) => {
    todos = parse(texto);
    render();
  })
  .catch(() => {
    lista.replaceChildren(el("p", { class: "aviso" }, "Não consegui carregar as referências. Tente de novo em instantes."));
  });
