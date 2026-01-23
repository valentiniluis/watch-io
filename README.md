## Acesso

A aplicação está em funcionamento e acessível publicamente pelo link:

https://react-frontend-production-8fb7.up.railway.app/home

Confira detalhes e mais informações nas seções abaixo.

## Sobre

Watch.IO é um projeto simples e que tem como objetivo o aprendizado e prática do desenvolvimento full-stack, começando do zero. A principal ideia era realizar um sistema de recomendações de filmes e séries de acordo com os gostos do usuário. O usuário pode interagir com as mídias, realizar avaliações e ver informações detalhadas. O diferencial é que apenas os filmes e séries melhor avaliados da API foram armazenados no banco de dados local, visando um catálogo de qualidade. Confira a aplicação em funcionamento a seguir:

![Primeira Gravação de Tela](./docs/media/recording-one.gif)

## Stack

Foram usadas as seguintes tecnologias no desenvolvimento do projeto:

### Front-End

* React.js: Fundamental para a criação de componentes reutilizáveis no front-end. Também usei bibliotecas como react-router, redux e react-query.

* Tailwindcss: Facilita e agiliza a estilização e responsividade de componentes e layouts.

### Back-End

* Node.js & Express.js: Usados para a criação de uma API REST no back-end, que se comunica com o front-end por meio de requisições HTTP e dados no formato JSON.

### Banco de Dados

* PostgreSQL: banco de dados relacional escolhido para representar dados bastante relacionados entre si (usuários, avaliações, mídias, gêneros, elenco etc).

### Ingestão de dados

* Python: é utilizado para fazer cerca de 650 requisições consecutivas à API do TMDb, ingerindo os dados retornados. Com as mídias e suas respectivas informações armazenadas localmente, torna-se muito mais fácil gerar recomendações customizadas, interagir e avaliar mídias (mesmo que essas funcionalidades existam no TMDb, o objetivo era construí-las novamente).

### Composição

* Docker e docker-compose (em desenvolvimento) foram usados para executar e sincronizar os serviços de back-end, front-end e banco de dados. Com o docker-compose, as imagens e containers são configurados num arquivo só, além de suas variáveis de ambiente.

* Para tornar a aplicação pública e acessível, usei a plataforma Railway, que permite a execução de containers de forma fácil e configurável. Com os serviços configurados, o Railway cuida da criptografia (HTTPS) e permite a escolha de um domínio.

## Funcionalidades

Visando uma interface simples mas agradável e responsiva e um back-end rápido e consistente, a aplicação contempla as seguintes funcionalidades:

* Pesquisar mídias: com cerca de 10 mil filmes e 1.5 mil séries contidos no banco de dados (somente os melhor avaliados do TMDb), a pesquisa no catálogo é otimizada por meio de índice estratégicos no postgreSQL. Isso torna muito mais rápida a obtenção e ordenação de filmes e séries. No front-end, a pesquisa usa um 'debounce', que basicamente aguarda um tempo X de digitação antes da disparar requisições, diminuindo o tráfego de rede e o número de requisições desnecessárias. A seguir está um vídeo de demonstração da pesquisa de filmes por título e outros parâmetros:

![Segunda Gravação de Tela](./docs/media/recording-two.gif)

A pesquisa considera o título da mídia traduzido para inglês e o título original. Portanto, é possível pesquisar mídias brasileiras em português, por exemplo.

* Interagir com filmes e séries: há a opção de 'Curtir', 'Adicionar à Minha Lista' (Watchlist) e marcar como 'Não Interessado'. Mídias marcadas como 'Não Interessado' não serão mostradas ao usuário em recomendações ou pesquisas. Mídias na Watchlist são armazenadas para que o usuário possa vê-las mais tarde. Já as mídias curtidas são usadas para fornecer novas recomedações ao usuário. Os filmes e séries interagidos (de cada tipo de interação) podem ser vistos na página 'My Area' (Minha Área), de forma separada e as interações podem ser feitas/desfeitas com um clique.

* Avaliações: o usuário pode avaliar, de 1 a 10, todos os filmes e séries do catálogo. É permitida uma avaliação de um usuário por mídia, além de um título e descrição para a avaliação. As avaliações podem ser editadas/excluídas na página _My Area_.

* Recomendações: há duas formas de recomendações de mídias obtidas por meio de consultas SQL - recomendação baseada numa mídia específica e baseada no perfil de um usuário (considera todas suas curtidas e avaliações positivas). As recomendações levam em conta elenco, diretor, equipe, média de avaliação, palavras-chave, gênero e linguagem original da obra.

As recomendações são geradas de acordo com uma pontuação implícita de cada mídia. Quanto mais atores, membros de equipe, diretores, gêneros e palavras-chave em comum, mais pontos são somados. Ao final, todos os valores são normalizados, estando entre 0 e 1 e então são multiplicados por pesos arbitrários. Por exemplo, o elenco pode ter peso 3, o diretor peso 4 e as palavras-chave peso 1. Isso significa que as recomendações vão favorecer mídias do mesmo diretor e com eleco parecido.

Os pesos utilizados de fato estão no arquivo [/backend/util/constants.js](./backend/util/constants.js) e podem ser mudados substituindo os valores no objeto _RECOMMENDATION_WEIGHTS_.

## Principais Características

* Uso de pooling no postgreSQL (back-end) para reaproveitar conexões de clientes e maximizar o uso do banco de dados.

* Uso de transações no back-end para garantir a consistência dos dados.

* Banco de dados postgreSQL otimizado com índices estratégicos, gerando maior velocidade em consultas.

* Utilização de react-query no front-end para otimização de performance por meio de cache de dados e redução de utilização de rede.

* Utilização de react-redux no front-end para gerenciamento de estados globais de forma rápida e eficiente.

* Uso de Node-cron para executar script a cada 2 semanas, atualizando o catálogo de filmes da aplicação com os mais novos lançamentos.

* Experiência personalizada, visualização de interações (Like, Watchlist e Not Interested) de forma fácil e centralizada, como mostrado a seguir:

![Terceira Gravação de Tela](./docs/media/recording-three.gif)

## Referências

Ícones - [SVG Repo](https://www.svgrepo.com/)

Estilos e componentes React - https://github.com/adrianhajdin/react-movies

Estilos e componentes React - [Flowbite](https://flowbite.com/)

API Principal - [The Movie Database (TMDb) API](https://developer.themoviedb.org)

API Complementar - [JustWatch API](https://www.justwatch.com/br/JustWatch-Streaming-API)

API Complementar - [API do Open Movie Database (OMDb)](https://www.omdbapi.com)

Plataforma de deploy - [Railway](https://railway.com/)