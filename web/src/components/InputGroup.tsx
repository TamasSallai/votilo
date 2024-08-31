type InputProps = React.InputHTMLAttributes<HTMLInputElement>

type Props = {
  label: string
  id: string
} & Omit<InputProps, 'id'>

const InputGroup = ({ id, label, ...rest }: Props) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <label className="text-md text-center font-medium " htmlFor={id}>
        {label}
      </label>

      <input
        className="px-4 py-2 bg-white outline outline-2 outline-black focus:outline-amber-700 rounded-sm"
        id={id}
        {...rest}
      />
    </div>
  )
}

export default InputGroup
