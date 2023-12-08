import {Ai, generateTgTemplate, tgTemplates} from '@cloudflare/ai';

const ApiPath = "/api";

const corsHeaders = {
	'Access-Control-Allow-Headers': '*', // What headers are allowed. * is wildcard. Instead of using '*', you can specify a list of specific headers that are allowed, such as: Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Authorization.
	'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allowed methods. Others could be GET, PUT, DELETE etc.
	'Access-Control-Allow-Origin': '*', // This is URLs that are allowed to access the server. * is the wildcard character meaning any URL can.
};

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		if (url.pathname !== ApiPath) {
			return new Response(null, {
				status: 404,
			});
		}
		if (request.method === 'OPTIONS') {
			return new Response('OK', {
				headers: corsHeaders,
			});
		}

		if (request.method !== 'POST') {
			return new Response('Only POST requests are allowed', { status: 405 });
		}
		let messages;
		try {
			messages = await request.json();

			if (!messages || !Array.isArray(messages)) {
				return new Response('Body has to be an array', {
					status: 400,
				});
			}
		} catch (error) {
			return new Response('Invalid JSON data', { status: 400 });
		}

		const ai = new Ai(env.AI);


//		const prompt = generateTgTemplate(messages, "llama2");
//		let response = await ai.run('@cf/meta/llama-2-7b-chat-int8', { messages });
		const prompt = generateTgTemplate(messages, "mistral-instruct");
 		let response = await ai.run('@cf/mistral/mistral-7b-instruct-v0.1', { prompt });

		const res = JSON.stringify({
			messages,
			response: response.response
		});

		console.log(res);

		return new Response(res, {
			headers: { ...corsHeaders, 'content-type': 'application/json;charset=UTF-8' },
			status: 200,
		});

	}
};
