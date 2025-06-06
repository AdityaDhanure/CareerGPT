export function ButtonField({ type, text }) {
    return <div>
        <button
            type={type}
            className="w-full bg-blue-500 text-white  p-1.5 md:p-2  rounded hover:bg-blue-600 hover:cursor-pointer transition-colors duration-200">
            {text}
        </button>
    </div> 
}