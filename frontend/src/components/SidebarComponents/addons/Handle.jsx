import React from 'react'
import { Link } from 'react-router-dom'

const Handle = ({handle, extra_className}) => {
  return (
    <Link to={`/handles/@${handle}`} className={'no-underline text-text-secondary/80 text-sm hover:text-accent-100 font-semibold '+extra_className}>
        @{handle}
    </Link>
  )
}

export default Handle