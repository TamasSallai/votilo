type Props = {
  children: React.ReactNode
}

const Container = ({ children }: Props) => {
  return (
    <div className="h-screen max-w-md w-full mx-auto p-4 flex flex-col items-center justify-center">
      {children}
    </div>
  )
}

export default Container
