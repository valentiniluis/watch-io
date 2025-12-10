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

Foram usadas as seguintes tecnologias no desenvolvimento do projeto:

### Front-End

* React.js: Fundamental para a criação de componentes reutilizáveis no front-end.

* Tailwindcss: Facilita e agiliza a estilização e responsividade de componentes e layouts.

### Back-End

* Node.js & Express.js: Usados para a criação de uma API REST no back-end, que se comunica com o front-end por meio de requisições HTTP e dados no formato JSON.

### Banco de Dados

* PostgreSQL: banco de dados relacional escolhido para representar dados bastante relacionados entre si (usuários, avaliações, filmes, gêneros, elenco etc).

## Principais Características

* Uso de pooling no postgreSQL (back-end) para reaproveitar conexões de clientes e maximizar o uso do banco de dados.

* Uso de transações no back-end para garantir a consistência dos dados.

* Banco de dados postgreSQL otimizado com índices estratégicos, gerando maior velocidade em consultas.

* Utilização de react-query no front-end para otimização de performance por meio de cache de dados e redução de utilização de rede.

* Utilização de react-redux no front-end para gerenciamento de estados globais de forma rápida e eficiente.


## Execução

* Docker e Docker Compose para organizar e executar de forma centralizada a inicialização do banco de dados e a conexão do back-end e front-end. Atualmente no processo de configurar os containers.

## Referências

Ícones - [SVG Repo](https://www.svgrepo.com/)

Estilos e componentes React - https://github.com/adrianhajdin/react-movies

Estilos e componentes React - [Flowbite](https://flowbite.com/)

API Principal - [The Movie Database (TMDb) API](https://developer.themoviedb.org)

API Complementar - [JustWatch API](https://www.justwatch.com/br/JustWatch-Streaming-API)

API Complementar - [API do Open Movie Database (OMDb)](https://www.omdbapi.com)