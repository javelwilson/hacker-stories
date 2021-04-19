import React, { useEffect, useState } from 'react'

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

  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem('search') || 'React'
  )

  useEffect(() => {
    localStorage.setItem('search', searchTerm)
  }, [searchTerm])

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
  }

  const searchedStories = stories.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <Search onSearch={handleSearch} search={searchTerm} />

      <hr />

      <List list={searchedStories} />
    </div>
  )
}

const Search = ({ search, onSearch }) => {
  console.log('Search renders')
  const [searchTerm, setSearchTerm] = useState('')
  const handleChange = (event) => {
    setSearchTerm(event.target.value)
    onSearch(event)
  }

  return (
    <div>
      <label htmlFor="search">Search:</label>
      <input type="text" id="search" onChange={handleChange} value={search} />

      <p>
        Searching for <strong>{searchTerm}</strong>
      </p>
    </div>
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
