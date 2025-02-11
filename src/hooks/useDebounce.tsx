import { useEffect, useState } from "react";

function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

/*
Veja como usar use-debounce-hook , parece ser bem melhor 

Referencias 
https://geekyants.com/blog/introducing-the-usedebounce-hook


Exemplo de uso

import { useEffect, useState } from 'react';
import './App.css';
import useDebounce from './hooks/useDebounce';

type Character = {
  id: number;
  name: string;
  image: string;
};

function App() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [data, setData] = useState<Character[] | undefined>([]);
  const [apiCount, setApiCount] = useState<number>(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetch(
      `https://rickandmortyapi.com/api/character/?name=${debouncedSearchTerm}`
    )
      .then((res) => res.json())
      .then((data: { results: Character[] }) => {
        setData(data.results);
        setApiCount(apiCount + 1);
      })
      .catch((error) => console.error('Error fetching characters:', error));
  }, [debouncedSearchTerm]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="container">
      <input
        type="text"
        placeholder="Search character..."
        value={searchTerm}
        onChange={handleChange}
      />
      <div className="api-count">API hit: {apiCount} times</div>
      <div className="character-list">
        {data === undefined && 'Nothing Found.'}
        {data &&
          data.map((character) => (
            <div key={character.id} className="character">
              <img src={character.image} alt={character.name} />
              <div>{character.name}</div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;



















*/
