import React, { useEffect, useState } from 'react'

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  )

  React.useEffect(() => {
    localStorage.setItem(key, value)
  }, [key, value])

  return [value, setValue]
}

const initialStories = [
  {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
]

const getAsyncStories = () =>
  new Promise((resolve) =>
    setTimeout(() => resolve({ data: { stories: initialStories } }), 2000)
  )

const App = () => {
  console.log('App renders')

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React')
  const [stories, setStories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  React.useEffect(() => {
    setIsLoading(true)
    getAsyncStories()
      .then((result) => {
        setStories(result.data.stories)
        setIsLoading(false)
      })
      .catch(() => setIsError(true))
  }, [])

  const handleRemoveStory = (item) => {
    const newStories = stories.filter(
      (story) => item.objectID !== story.objectID
    )
    setStories(newStories)
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
  }

  const searchedStories = stories.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <InputWithLabel
        id="search"
        children
        onInputChange={handleSearch}
        value={searchTerm}
        isFocused
      >
        <strong>Search: </strong>
      </InputWithLabel>

      <hr />

      {isError && <p>Something went wrong ...</p>}

      {isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={searchedStories} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  )
}

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

const List = ({ list, onRemoveItem }) => {
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
}

const Item = ({ item, onRemoveItem }) => {
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
