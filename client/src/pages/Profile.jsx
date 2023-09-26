import { HiUserCircle } from 'react-icons/hi';
import { createClassesFromArray } from 'src/lib/utils';

const Profile = () => {
    const styles = {
        container: `w-[350px] px-8 py-4 rounded-2xl flex flex-col justify-center items-center `,
        userIcon: `text-5xl text-highlight`,
        title: `capitalize text-white font-semibold text-2xl tracking-wider`,
        glassEffect: `bg-clip-padding backdrop-filter backdrop-blur-2xl bg-opacity-5 bg-gray-300 `,
        textArea: `text-white my-2 bg-transparent outline-none tracking-wider resize-none indent-2 p-2 rounded-xl h-28 w-full placeholder:tracking-widest`,
        saveBtn: `border w-[350px] p-2 text-md rounded-xl my-4 border-green text-green hover:bg-green hover:text-white`,
        deleteBtn: `border w-[350px] p-2 text-md rounded-xl my-4 border-red text-red hover:bg-red hover:text-white`,
        inputSection: `flex justify-between tracking-wide`,
        label: `text-white`,
        input: `outline-none bg-transparent text-right`,
    };

    return (
        <div
            className={createClassesFromArray(
                'bg-primary',
                'md:min-w-[calc(100%-120px)]',
                'flex items-center',
                'justify-center',
                'flex-col',
                'md:min-h-screen',
                'min-h-[calc(100vh-70px)]',
                'text-white'
            )}
        >
            <section className={[styles.container, styles.glassEffect]}>
                <HiUserCircle className={styles.userIcon} />
                <h2 className={styles.title}>Username</h2>
                <div>
                    <textarea
                        className={[styles.textArea, styles.glassEffect]}
                        placeholder="Write something about you..."
                        name=""
                        id=""
                    ></textarea>
                    <section className="text-[1.2em]">
                        <div
                            className={`${styles.inputSection} border-b-2 border-gray-700`}
                        >
                            <label className={styles.label} htmlFor="gender">
                                Gender
                            </label>
                            <input
                                type="text"
                                placeholder="Male"
                                className={styles.input}
                            />
                        </div>{' '}
                        <div className={styles.inputSection}>
                            <label className={styles.label} htmlFor="age">
                                Age
                            </label>
                            <input
                                type="text"
                                placeholder="19"
                                className={styles.input}
                            />
                        </div>
                    </section>
                </div>
            </section>
            <button className={styles.saveBtn}>Save changes</button>
            <button className={styles.deleteBtn}>Delete My Account</button>
        </div>
    );
};

export default Profile;