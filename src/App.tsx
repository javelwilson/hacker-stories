import React, { useReducer } from 'react'
import axios from 'axios'

const useSemiPersistentState = (
  key: string,
  initialState: string
): [string, (newValue: string) => void] => {
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

type StoriesState = {
  data: Stories
  isLoading: boolean
  isError: boolean
}

interface StoriesFetchInitAction {
  type: 'STORIES_FETCH_INIT'
}
interface StoriesFetchSuccessAction {
  type: 'STORIES_FETCH_SUCCESS'
  payload: Stories
}
interface StoriesFetchFailureAction {
  type: 'STORIES_FETCH_FAILURE'
}
interface StoriesRemoveAction {
  type: 'REMOVE_STORY'
  payload: Story
}
type StoriesAction =
  | StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction

const storiesReducer = (state: StoriesState, action: StoriesAction) => {
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

type Story = {
  objectID: string
  url: string
  title: string
  author: string
  num_comments: number
  points: number
}

type Stories = Array<Story>

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

  const handleRemoveStory = React.useCallback((item: Story) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    })
  }, [])

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`)

    event.preventDefault()
  }

  return (
    <div>
      <h1>My Hacker Stories with comments.</h1>

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

type SearchFormProps = {
  searchTerm: string
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit,
}: SearchFormProps) => (
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

type InputWithLabelProps = {
  id: string
  value: string
  type?: string
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  isFocused?: boolean
  children: React.ReactNode
}

const InputWithLabel = ({
  id,
  children,
  value,
  type = 'text',
  onInputChange,
  isFocused,
}: InputWithLabelProps) => {
  console.log('InputWithLabel renders')

  const inputRef = React.useRef<HTMLInputElement>(null!)

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

type ListProps = {
  list: Stories
  onRemoveItem: (item: Story) => void
}

const List = React.memo(({ list, onRemoveItem }: ListProps) => {
  console.log('List renders')
  return (
    <ul>
      {list.map(function (item) {
        return (
          <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
        )
      })}
    </ul>
  )
})

type ItemProps = {
  item: Story
  onRemoveItem: (item: Story) => void
}

const Item = ({ item, onRemoveItem }: ItemProps) => {
  console.log('Item renders')
  return (
    <li>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button type="button" onClick={() => onRemoveItem(item)}>
          Dismiss
        </button>
      </span>
    </li>
  )
}

export default App
