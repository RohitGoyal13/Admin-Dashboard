import { message } from "antd";
import { GraphQLFormattedError } from "graphql";

type Error = {
    message: string;
    statuscode: string;
}

const customFetch = async (url: string, options: RequestInit) => {

    const accessToken = localStorage.getItem('accessToken');

    const headers = options.headers as Record<string, string>;

    return await fetch(url, {
        ...options,
        headers: {
            ...headers,
            Authorization: headers?.Authorization || `Bearer ${accessToken}`,
            "ContentType": "application/json",
            "Appolo-Require-Preflight": "true",
        }
    })
};

const getGraphQLErrors = (body: Record<"errors" , GraphQLFormattedError[] | undefined>) :
Error | null => {
    if(!body) {
        return {
            message: 'Unknown Errors',
            statuscode: "INTERNAL_SERVER_ERROR",
        }
    }

    if("errors" in body) {
        const errors = body?.errors;

        const messages = errors?.map((error) => error?.message).join("");
        const code = errors?.[0]?.extensions?.code;
        return {
            message: messages  || JSON.stringify(errors),
            statuscode: code || "INTERNAL_SERVER_ERROR",
        }
    }

    return null;
}

export const fetchWrapper = async (url: string, options: RequestInit) => {
    const response = await customFetch(url, options);

    const responseClone = response.clone();
    const body = await responseClone.json();

    const error = getGraphQLErrors(body);

    if(error){
        throw error;
    }

    return response;
}
