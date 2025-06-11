import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class GoogleApi implements ICredentialType {
	name = 'googleApi';
	displayName = 'Google Gemini API';
	documentationUrl = 'https://ai.google.dev/gemini-api/docs/api-key';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Google AI Studio API key',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://generativelanguage.googleapis.com/v1beta',
			description: 'Base URL for Google Gemini API',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				key: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl || "https://generativelanguage.googleapis.com/v1beta"}}',
			url: '/models/gemini-pro:generateContent',
			method: 'POST',
			qs: {
				key: '={{$credentials.apiKey}}',
			},
			body: {
				contents: [{
					parts: [{ text: 'Hello' }]
				}],
				generationConfig: {
					maxOutputTokens: 10,
				}
			},
		},
	};
}