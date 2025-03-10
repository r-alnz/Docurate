import bcrypt from 'bcrypt';

const hashPassword = async () => {
    const newPassword = 'QWEasd123'; // Change this
    const hashed = await bcrypt.hash(newPassword, 12);
    console.log('Hashed Password:', hashed);
};

hashPassword();