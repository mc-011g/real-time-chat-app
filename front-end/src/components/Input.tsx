export default function Input({ placeholder, value, type, extraClasses, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { placeholder?: string, value?: string, type: string, extraClasses?: string }) {

  return (
    <div className="bg-gray-200 rounded-xl flex flex-row place-items-center w-full">
      <input {...props} className={`${extraClasses ? extraClasses : ""} rounded-xl px-4 py-2 text-gray-900 w-full focus:outline-2 outline-blue-400`} placeholder={placeholder} value={value} type={type} />
    </div>
  )
}
