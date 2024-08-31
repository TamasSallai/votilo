import { Link } from 'react-router-dom'
import Container from '../components/Container'
import Header from '../components/Header'

const Welcome = () => {
  return (
    <Container>
      <Header />

      <div className="w-full flex flex-col gap-4">
        <Link to="/create" className="btn-primary bg-amber-300">
          Create Poll
        </Link>

        <Link to="/join" className="btn-primary bg-white">
          Join Poll
        </Link>
      </div>
    </Container>
  )
}

export default Welcome
