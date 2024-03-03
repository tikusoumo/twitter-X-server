import {startApolloServer} from "./app";



async function init() {
    const app = await startApolloServer();
    app.listen(5000, () => console.log("Server is running on port http://localhost:5000"));
}

init();