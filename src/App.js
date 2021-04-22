import React, { useReducer } from 'react'
import axios from 'axios'
import { sortBy } from 'lodash'

const useSemiPersistentState = (key, initialState) => {
  const isMounted = React.useRef(false)
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  )

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
    } else {
      console.log('useSemiPersistentState')
      localStorage.setItem(key, value)
    }
  }, [key, value])

  return [value, setValue]
}

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      }
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      }
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      }
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      }
    default:
      throw new Error()
  }
}

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query='

const App = () => {
  console.log('App renders')

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React')
  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`)
  const [stories, dispatchStories] = useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
  })

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' })

    try {
      const result = await axios.get(url)

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits,
      })
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
    }
  }, [url])

  React.useEffect(() => {
    handleFetchStories()
  }, [handleFetchStories])

  const handleRemoveStory = React.useCallback((item) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    })
  }, [])

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`)

    event.preventDefault()
  }

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <hr />

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  )
}

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }) => (
  <form onSubmit={onSearchSubmit}>
    <InputWithLabel
      id="search"
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
    >
      <strong>Search:</strong>
    </InputWithLabel>
    <button type="submit" disabled={!searchTerm}>
      Submit
    </button>
  </form>
)

const InputWithLabel = ({
  id,
  children,
  value,
  type = 'text',
  onInputChange,
  isFocused,
}) => {
  console.log('InputWithLabel renders')

  const inputRef = React.useRef()

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isFocused])
  return (
    <>
      <label htmlFor={id}>{children}</label>
      <input
        type={type}
        id={id}
        onChange={onInputChange}
        value={value}
        ref={inputRef}
      />
    </>
  )
}

const SORTS = {
  NONE: (list) => list,
  TITLE: (list) => sortBy(list, 'title'),
  AUTHOR: (list) => sortBy(list, 'author'),
  COMMENT: (list) => sortBy(list, 'num_comments').reverse(),
  POINT: (list) => sortBy(list, 'points').reverse(),
}

const List = React.memo(({ list, onRemoveItem }) => {
  console.log('List renders')
  const [sort, setSort] = React.useState({ sortKey: 'NONE', isReverse: false })

  const handleSort = (sortKey) => {
    const isReverse = sort.sortKey === sortKey && !sort.isReverse
    setSort({ sortKey, isReverse })
  }

  const sortFunction = SORTS[sort.sortKey]
  const sortedList = sort.isReverse
    ? sortFunction(list).reverse()
    : sortFunction(list)

  return (
    <table>
      <thead>
        <tr>
          <th>
            <span>
              <button
                type="button"
                onClick={() => handleSort('TITLE')}
                style={{ background: `${sort === 'TITLE' ? 'green' : 'none'}` }}
              >
                Title
              </button>
            </span>
          </th>
          <th>
            <span>
              <button
                type="button"
                onClick={() => handleSort('AUTHOR')}
                style={{
                  background: `${sort === 'AUTHOR' ? 'green' : 'none'}`,
                }}
              >
                Author
              </button>
            </span>
          </th>
          <th>
            <span>
              <button
                type="button"
                onClick={() => handleSort('COMMENT')}
                style={{
                  background: `${sort === 'COMMENT' ? 'green' : 'none'}`,
                }}
              >
                Comments
              </button>
            </span>
          </th>
          <th>
            <span>
              <button
                type="button"
                onClick={() => handleSort('POINT')}
                style={{
                  background: `${sort === 'POINT' ? 'green' : 'none'}`,
                }}
              >
                Points
              </button>
            </span>
          </th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {sortedList.map(function (item) {
          return (
            <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
          )
        })}
      </tbody>
    </table>
  )
})

const Item = ({ item, onRemoveItem }) => {
  console.log('Item renders')
  return (
    <tr>
      <td>
        <span>
          <a href={item.url}>{item.title}</a>
        </span>
      </td>
      <td>
        <span>{item.author}</span>
      </td>
      <td>
        <span>{item.num_comments}</span>
      </td>
      <td>
        <span>{item.points}</span>
      </td>
      <td>
        <span>
          <button type="button" onClick={() => onRemoveItem(item)}>
            Dismiss
          </button>
        </span>
      </td>
    </tr>
  )
}

export default App
