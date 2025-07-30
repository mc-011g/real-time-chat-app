import { UsersIcon } from "@heroicons/react/24/solid";

export default function GroupImageContainer() {

  return (
    <div className={`rounded-[100%] bg-gray-800 w-12 h-12 min-w-12 min-h-12 flex place-items-center justify-center align-center`}>
      <UsersIcon className="w-6 h-6 text-gray-50" />
    </div>
  )
}
