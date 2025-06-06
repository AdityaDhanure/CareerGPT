export function InputField({ type, placeholder, onChange }) {
    return <div>
        <input
            type={type}
            placeholder={placeholder}
            required
            className=" w-full  p-1.5 md:p-2  mb-2 md:mb-3 lg::mb-4  border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            onChange={onChange}
        />
    </div>
}