import { Link } from 'react-router-dom'
import Container from '../components/Container'
import Header from '../components/Header'
import InputGroup from '../components/InputGroup'

const JoinPoll = () => {
  return (
    <Container>
      <Header />

      <form className="w-full flex flex-col gap-4">
        <InputGroup
          id="pollID"
          type="text"
          name="pollID"
          label="Enter poll ID"
          required
          minLength={8}
          maxLength={8}
        />

        <InputGroup
          id="name"
          type="text"
          name="name"
          label="Enter your name"
          required
          minLength={2}
          maxLength={25}
        />

        <div className="mt-4 w-full flex flex-col gap-4">
          <button className="btn-primary bg-amber-300">Join</button>
          <Link to="/" className="btn-primary bg-white">
            {'<<'} Back
          </Link>
        </div>
      </form>
    </Container>
  )
}

export default JoinPoll
