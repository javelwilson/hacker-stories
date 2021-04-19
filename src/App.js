import React from 'react'

function getTitle(title) {
  return title
}

const App = () => {
  return (
    <div>
      <h1>Hello {getTitle('React')}</h1>

      <label htmlFor="search">Search:</label>
      <input type="text" id="search" />
    </div>
  )
}

export default App
