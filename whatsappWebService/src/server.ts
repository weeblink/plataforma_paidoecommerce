import app from "./app";
import dotenv from 'dotenv';

dotenv.config();

const server = app.listen(process.env.PORT, async () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})