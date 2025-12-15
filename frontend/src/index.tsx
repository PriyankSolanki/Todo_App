import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {ApolloProvider} from "@apollo/client/react";
import {ApolloClient, HttpLink, InMemoryCache} from "@apollo/client";
import {BrowserRouter} from "react-router-dom";


const client = new ApolloClient({
    link: new HttpLink({ uri: process.env.REACT_APP_GRAPHQL_URL ?? "http://localhost:3001/graphql" }),
    cache: new InMemoryCache()
});


ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <BrowserRouter>
            <App />
            </BrowserRouter>
        </ApolloProvider>

    </React.StrictMode>
);
