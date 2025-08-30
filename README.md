# ESTE PROJETO ESTÁ EM ANDAMENTO

## Execução

Até o momento, a execução é local para desenvolvimento.

Se quiser executar o projeto mesmo assim (não finalizado), clone o repositório localmente e execute os seguintes comandos nas pastas */backend* e */frontend*:

```
npm install
npm start
```

Para carregar os filmes corretamente, você também precisará de um token da API do TMDb, o que pode ser adquirido rapidamente criando uma conta na plataforma. O link para a API está nas referências deste README. O token deve ser armazenado num arquivo *.env*, na raiz da pasta */backend*, com a chave *TMDB_API_ACCESS_TOKEN*.

Também será necessário um token de acesso do OMDb, cujo link para cadastro também se encontra nas referências. Armazene o token no mesmo arquivo *.env* sob a chave *OMDB_API_ACCESS_TOKEN*.

Você também pode informar a porta em que o servidor Node.js executará no arquivo *.env* por meio da chave *PORT*. Se você não informar nenhuma porta, a aplicação usará a de número 3000 por padrão.

## Sobre

O projeto consiste num website recomendador de filmes. Responsivo para telas de dispositivos móveis e desktops, o Watch.io tem como objetivo apresentar diversas opções de filmes com base no gosto pessoal do usuário. Todo o site está em inglês por questões de conveniência e prática da linguagem.

## Stack

Estão sendo usadas as seguintes tecnologias no desenvolvimento do projeto:

### Front-End

* React.js: Fundamental para a criação de componentes reutilizáveis no front-end.

* Tailwindcss: Facilita e agiliza a estilização e responsividade de componentes e layouts.

### Back-End

* Node.js & Express.js: Usados para a criação de uma API REST no back-end, que se comunica com o front-end por meio do formato JSON.

### Banco de Dados

* Pretendo usar MongoDB por meio da biblioteca Mongoose

## Referências

Usei alguns dos estilos do tailwindcss presentes no repositório a seguir:

https://github.com/adrianhajdin/react-movies

[API do The Movie Database (TMDb)](https://developer.themoviedb.org)

[API do Open Movie Database (OMDb)](https://www.omdbapi.com)

Ícones usados do SVG Repo:

[SVG Repo](https://www.svgrepo.com/)