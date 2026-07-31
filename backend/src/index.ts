import express from "express";
import linkRouter from "./routers/link";
import { API_PREFIX } from "./config";

const app = express();

app.use(express.json()); // Parse incoming JSON requests 
app.use(express.urlencoded({ extended: true })); // Accept URL-encoded data from traditional HTML forms


app.get('/health', (req, res) => {
  // Todo: check db
  res.json({ message: 'API is working!' });
});

app.use( linkRouter);
// app.use(`${API_PREFIX}/expense`, expenseRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
}); 