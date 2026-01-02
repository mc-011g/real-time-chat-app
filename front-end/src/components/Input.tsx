export default function Input({ placeholder, value, type, extraClasses, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { placeholder?: string, value?: string, type: string, extraClasses?: string }) {

  return (
    <div className={`${extraClasses ? extraClasses : ''} bg-white border border-1 border-gray-300 rounded-lg flex flex-row place-items-center w-full`}>
      <input {...props} className={`rounded-lg px-4 py-2 text-gray-950 w-full focus:outline-2 outline-blue-400`} placeholder={placeholder} value={value} type={type} />
    </div>
  )
}
