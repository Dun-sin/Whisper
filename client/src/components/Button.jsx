/* eslint-disable */
const Button = ({value, onClick}) => {
    return (
        <>

            <button 
             onClick={onClick}
             className={
                    'font-medium text-black text-[1.5em] bg-[#FF9F1C] w-[8em] h-[2em] mt-5 rounded-[30px]' 
                    }>
                    {value}
            </button>

        </>
    )
}

export default Button;