import React, { useRef } from 'react';
import './App.scss';
import { peopleFromServer } from './data/people';
import classNames from 'classnames';
import debounce from 'debounce';

type Person = {
  name: string;
  sex: string;
  born: number;
  died: number;
  fatherName: string | null;
  motherName: string | null;
  slug: string;
};

type AppProps = {
  debounceDelay?: number; // customizable via props
};

export const App: React.FC<AppProps> = ({ debounceDelay = 300 }) => {
  const [filteredPeople, setFilteredPeople] = React.useState(peopleFromServer);
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [selectedPerson, setSelectedPerson] = React.useState<Person | null>(
    null,
  );

  // Debounced filter function
  const lastFiltered = useRef('');
  const debouncedFilter = React.useMemo(
    () =>
      debounce((value: string) => {
        if (value !== lastFiltered.current && value.trim() !== '') {
          lastFiltered.current = value;
          const filtered = peopleFromServer.filter(person =>
            person.name.toLowerCase().includes(value.toLowerCase()),
          );
          setFilteredPeople(filtered);
        }
      }, debounceDelay),
    [debounceDelay],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setOpenDropdown(true);
    debouncedFilter(value);
    setSelectedPerson(null);
  };

  const choosePerson = (person: Person) => {
    setInputValue(person.name);
    setOpenDropdown(false);
    setSelectedPerson(person);
  };

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {selectedPerson
            ? `${selectedPerson.name} (${selectedPerson.born} - ${selectedPerson.died})`
            : 'No selected person'}
        </h1>

        <div
          className={classNames('dropdown', { 'is-active': openDropdown })}
          data-cy="search-dropdown"
        >
          <div className="dropdown-trigger">
            <input
              type="text"
              placeholder="Enter a part of the name"
              className="input"
              data-cy="search-input"
              value={inputValue}
              onFocus={() => setOpenDropdown(true)}
              onChange={handleChange}
            />
          </div>
          <div className="dropdown-menu" id="dropdown-menu" role="menu">
            <div className="dropdown-content">
              {filteredPeople.map(person => (
                <a
                  className="dropdown-item"
                  key={person.slug}
                  onMouseDown={() => choosePerson(person)}
                >
                  {person.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {filteredPeople.length === 0 && (
          <div
            className="
              notification
              is-danger
              is-light
              mt-3
              is-align-self-flex-start
            "
            role="alert"
            data-cy="no-suggestions-message"
          >
            <p className="has-text-danger">No matching suggestions</p>
          </div>
        )}
      </main>
    </div>
  );
};
