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

const App = () => {
  console.log('App renders')
  const stories = [
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

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React')

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

      <List list={searchedStories} />
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

const List = ({ list }) => {
  console.log('List renders')
  return (
    <ul>
      {list.map(function ({ objectID, ...item }) {
        return <Item key={objectID} {...item} />
      })}
    </ul>
  )
}

const Item = ({ title, url, author, num_comments, points }) => {
  console.log('Item renders')
  return (
    <li>
      <span>
        <a href={url}>{title}</a>
      </span>
      <span>{author}</span>
      <span>{num_comments}</span>
      <span>{points}</span>
    </li>
  )
}

export default App
