# Referências pro 2º turno

Site com as fontes das notícias dos meus stories:
**https://thalespupo.github.io/referencias-pro-2-turno/**

## Como adicionar um story (pelo celular)

1. No app do GitHub, abra este repositório e o arquivo **`referencias.md`**.
2. Toque no lápis (editar).
3. Cole um bloco novo **logo abaixo da caixa de instruções** (o mais recente fica no topo do site):

   ```
   ## 05/10/2026 · Título do story
   Uma frase opcional de contexto.
   - [Folha: título da matéria](https://www.folha.uol.com.br/...)
   - https://g1.globo.com/...
   ```

4. Toque em **Commit changes**. Em cerca de 1 minuto o site atualiza.

Regras: cada story começa com `## ` (data opcional no começo, `dd/mm` ou `dd/mm/aaaa`);
cada fonte é uma linha começando com `- ` (pode ser `[texto](link)` ou só o link, e um
comentário curto depois do link); as outras linhas viram o texto do story. O nome do
veículo (Folha, g1, TSE...) aparece sozinho, pelo endereço do link.

## Como funciona

Página estática (`index.html`, `app.js`, `style.css`) servida pelo GitHub Pages: o
`app.js` lê o `referencias.md` e monta um cartão por story, com busca. Sem etapa de
build — editar o arquivo já basta. Pra testar no computador:
`python3 -m http.server` nesta pasta e abrir http://localhost:8000.
