import { Link } from 'react-router-dom'
import Container from '../components/Container'
import Header from '../components/Header'
import InputGroup from '../components/InputGroup'

const CreatePoll = () => {
  return (
    <Container>
      <Header />

      <form className="w-full flex flex-col gap-4">
        <InputGroup
          id="topic"
          type="text"
          name="topic"
          label="Enter a poll topic"
          required
          minLength={8}
          maxLength={8}
        />

        <InputGroup
          id="votes"
          type="number"
          name="votesPerVoter"
          label="Votes per voter"
          required
          min={1}
          max={10}
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
        <div className="mt-4 flex flex-col gap-4">
          <button className="btn-primary bg-amber-300">Create</button>
          <Link to="/" className="btn-primary bg-white">
            {'<<'} Back
          </Link>
        </div>
      </form>
    </Container>
  )
}

export default CreatePoll
