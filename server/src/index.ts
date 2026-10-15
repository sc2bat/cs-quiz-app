import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

const app = createApp();
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
