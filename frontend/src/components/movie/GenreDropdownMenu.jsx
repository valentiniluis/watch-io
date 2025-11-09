import { useQuery } from "@tanstack/react-query";
import { loadGenres } from "../../util/movie-query";
import DropdownMenu from "../UI/DropdownMenu";
import Spinner from "../UI/Spinner";
import ErrorSection from "../UI/ErrorSection";


let isFirstRender = true;
export default function GenreDropdownMenu({ currentGenre, setGenre }) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['movie-genres'],
    queryFn: loadGenres
  });

  function handleUpdateGenre(event) {
    const { genreId, genre } = event.currentTarget.dataset;
    setGenre({ genreId, genre });
  }

  let content;
  if (isPending) {
    content = <Spinner text="Loading available genres..." />
  }
  else if (isError) {
    content = <ErrorSection message={error.message || "Failed to load genres"} />
  }
  else if (data) {
    if (isFirstRender) {
      isFirstRender = false;
      const { id, name } = data[0];
      setGenre({ genreId: id, genre: name });
    }
    const genres = data.map(item => ({ ...item, 'data-genre-id': item.id, 'data-genre': item.name }));
    content = <DropdownMenu label="Genre" text={!currentGenre.genre ? "Any" : currentGenre.genre} options={genres} onUpdate={handleUpdateGenre} className="bg-blue-600 text-white font-semibold rounded-lg text-md hover:bg-blue-700 focus:ring-blue-800" />
  }

  return (
    <>
      {content}
    </>
  );
}